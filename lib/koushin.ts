// /dougu/koushin「更新カウントダウン」。docs/dougu-2hon-2026-09-06-instructions.md §B-3。
// 端末の日付だけで計算する。サーバーなし。判定はしない(公表されている決まりで日付を出すだけ)。
// 用紙(障害状態確認届)は提出年月の3か月前の月末に送付、提出期限は提出年月の末日
// (日本年金機構「障害状態確認届(診断書)が届いたとき」)。

export type KoushinInput = {
  /* 次回診断書提出年月。西暦年と月。無期限(永久認定)なら indefinite */
  year: number | null;
  month: number | null;
  indefinite: boolean;
  /* 任意: 今日の日付(YYYY-MM-DD)。既定は端末の今日 */
  today: string | null;
};

export type KoushinStep = { when: string; date: string | null; days: number | null; what: string; href?: string; label?: string; note?: string };

export type KoushinResult =
  | { kind: "empty" }
  | { kind: "indefinite" }
  | {
      kind: "dates";
      past: boolean;
      today: string;
      deadline: string;
      formSent: string;
      genshoStart: string;
      prepStart: string;
      daysToDeadline: number;
      daysToFormSent: number;
      daysToGensho: number;
      daysToPrep: number;
      steps: KoushinStep[];
    };

export const emptyInput = (): KoushinInput => ({ year: null, month: null, indefinite: false, today: null });

export function normalizeKoushin(value: unknown): KoushinInput {
  const v = (value && typeof value === "object" ? value : {}) as Record<string, unknown>;
  const year = typeof v.year === "number" && Number.isInteger(v.year) && v.year >= 1900 && v.year <= 2200 ? v.year : null;
  const month = typeof v.month === "number" && Number.isInteger(v.month) && v.month >= 1 && v.month <= 12 ? v.month : null;
  const today = typeof v.today === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v.today) ? v.today : null;
  return { year, month, indefinite: v.indefinite === true, today };
}

/* 和暦 → 西暦。令和 n 年 = 2018 + n、平成 n 年 = 1988 + n。 */
export const reiwaToYear = (n: number): number => 2018 + n;
export const heiseiToYear = (n: number): number => 1988 + n;
export const yearToWareki = (year: number): string => (year >= 2019 ? `令和${year - 2018}年` : year >= 1989 ? `平成${year - 1988}年` : `${year}年`);

/* 日付は UTC の正午で扱い、時差で日がずれないようにする。 */
const at = (y: number, m: number, d: number): Date => new Date(Date.UTC(y, m - 1, d, 12));
export const lastDayOfMonth = (y: number, m: number): number => new Date(Date.UTC(y, m, 0, 12)).getUTCDate(); // うるう年込み
export const ymd = (date: Date): string => date.toISOString().slice(0, 10);
export const parseYmd = (s: string): Date => { const [y, m, d] = s.split("-").map(Number); return at(y, m, d); };
export const todayYmd = (): string => { const t = new Date(); return ymd(at(t.getFullYear(), t.getMonth() + 1, t.getDate())); };
export const diffDays = (target: Date, base: Date): number => Math.round((target.getTime() - base.getTime()) / 86_400_000);
export const formatJa = (s: string): string => { const [y, m, d] = s.split("-").map(Number); return `${y}年${m}月${d}日`; };

/* y年m月 から months か月ずらした (年, 月) */
function shiftMonth(y: number, m: number, months: number): [number, number] {
  const idx = y * 12 + (m - 1) + months;
  return [Math.floor(idx / 12), (idx % 12 + 12) % 12 + 1];
}

export function calcKoushin(s: KoushinInput): KoushinResult {
  if (s.indefinite) return { kind: "indefinite" };
  if (s.year === null || s.month === null) return { kind: "empty" };
  const today = s.today ?? todayYmd();
  const base = parseYmd(today);
  const y = s.year, m = s.month;

  const deadlineDate = at(y, m, lastDayOfMonth(y, m));                          // 提出期限 = 提出年月の末日
  const [fy, fm] = shiftMonth(y, m, -3);
  const formSentDate = at(fy, fm, lastDayOfMonth(fy, fm));                       // 用紙 = 3か月前の月末
  const genshoDay = Math.min(deadlineDate.getUTCDate(), lastDayOfMonth(fy, fm));
  const genshoStartDate = at(fy, fm, genshoDay);                                 // 現症日の期間 = 提出期限の3か月前の同日〜
  const [py, pm] = shiftMonth(y, m, -12);
  const prepStartDate = at(py, pm, 1);                                           // 準備開始 = 12か月前の1日(目安)

  const deadline = ymd(deadlineDate), formSent = ymd(formSentDate), genshoStart = ymd(genshoStartDate), prepStart = ymd(prepStartDate);
  const daysToDeadline = diffDays(deadlineDate, base);
  const daysToFormSent = diffDays(formSentDate, base);
  const daysToGensho = diffDays(genshoStartDate, base);
  const daysToPrep = diffDays(prepStartDate, base);

  const steps: KoushinStep[] = [
    { when: "提出年月の1年前(目安)", date: prepStart, days: daysToPrep, what: "記録を始める(1日1〜2行)。前回の診断書の控えを探す", href: "/nayami/koushin", label: "更新が不安なとき" },
    { when: "用紙が届いたら、すぐ", date: formSent, days: daysToFormSent, what: "診察の予約。主治医に渡すメモ(A4一枚)を作る", href: "/jukyuugo/hataraku", label: "主治医に渡すメモの型" },
    { when: "現症日の期間に入ったら", date: genshoStart, days: daysToGensho, what: "診断書を依頼する(提出日前3か月以内の状態を書いたもの)" },
    { when: "受け取ったら、提出前に", date: null, days: null, what: "4か所を確認する", href: "/columns/shindansho-kakunin", label: "診断書の提出前確認" },
    { when: "提出期限の末日", date: deadline, days: daysToDeadline, what: "提出する。控えを取る" },
  ];

  return {
    kind: "dates", past: daysToDeadline < 0, today,
    deadline, formSent, genshoStart, prepStart,
    daysToDeadline, daysToFormSent, daysToGensho, daysToPrep, steps,
  };
}

/* カレンダー用 .ics(端末の中で組み立てる。外部へ送らない)。終日の予定3件。 */
export function buildIcs(r: Extract<KoushinResult, { kind: "dates" }>): string {
  const compact = (s: string) => s.replaceAll("-", "");
  const nextDay = (s: string) => ymd(new Date(parseYmd(s).getTime() + 86_400_000));
  const event = (uid: string, date: string, summary: string, description: string) => [
    "BEGIN:VEVENT",
    `UID:${uid}@shougainenkin-note.net`,
    `DTSTAMP:${compact(r.today)}T000000Z`,
    `DTSTART;VALUE=DATE:${compact(date)}`,
    `DTEND;VALUE=DATE:${compact(nextDay(date))}`,
    `SUMMARY:${summary}`,
    `DESCRIPTION:${description}`,
    "END:VEVENT",
  ].join("\r\n");
  return [
    "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//shougainenkin-note.net//koushin//JA", "CALSCALE:GREGORIAN",
    event(`koushin-prep-${compact(r.prepStart)}`, r.prepStart, "障害年金の更新: 準備を始める(目安)", "記録を始める。前回の診断書の控えを探す"),
    event(`koushin-form-${compact(r.formSent)}`, r.formSent, "障害年金の更新: 障害状態確認届が届く時期", "届いたらすぐ診察の予約。主治医に渡すメモを作る"),
    event(`koushin-deadline-${compact(r.deadline)}`, r.deadline, "障害年金の更新: 障害状態確認届の提出期限", "提出する。控えを取る"),
    "END:VCALENDAR", "",
  ].join("\r\n");
}
