// /dougu/kingaku の補足の計算(docs/kingaku-madoguchi-sasshin-2026-09-06-instructions.md A-2)。
// lib/kingaku.ts は触らず、その外側で使う小さな関数だけを置く。数字を直書きしない(月数の決まりを除く)。
import { monthly } from "@/lib/kingaku";

/* 「年収から」: 厚生年金に入っていた頃の年収(ボーナス込み)÷12 を平均標準報酬額の目安にする。
   標準報酬月額・賞与に上限があるため目安(画面で明記)。 */
export const hyoujunFromNenshu = (nenshu: number | null): number | null =>
  nenshu === null || !Number.isFinite(nenshu) || nenshu <= 0 ? null : Math.floor(nenshu / 12);

/* 表示用: 月額・偶数月の振込は百円で丸めて「約」を付ける。 */
export const approx100 = (n: number): number => Math.round(n / 100) * 100;

/* ===== さかのぼって受け取れる分の目安 =====
   障害認定日 = 初診日から1年6か月(原則)。年金は認定日の翌月分から。
   時効で受け取れるのは直近5年分(60か月)まで(国民年金法 第102条・厚生年金保険法 第92条)。 */
export const NINTEI_MONTHS_AFTER_SHOSHIN = 18;
export const SAKANOBORI_MAX_MONTHS = 60;

const parseYm = (ym: string): [number, number] | null => {
  const m = /^(\d{4})-(\d{2})$/.exec(ym);
  if (!m) return null;
  const y = Number(m[1]), mo = Number(m[2]);
  return mo >= 1 && mo <= 12 ? [y, mo] : null;
};
const pad = (n: number) => String(n).padStart(2, "0");

/* y年m月 に months か月足した YYYY-MM */
export function addMonths(ym: string, months: number): string | null {
  const p = parseYm(ym);
  if (!p) return null;
  const idx = p[0] * 12 + (p[1] - 1) + months;
  return `${Math.floor(idx / 12)}-${pad((idx % 12 + 12) % 12 + 1)}`;
}

export const ninteiFromShoshin = (shoshin: string): string | null => addMonths(shoshin, NINTEI_MONTHS_AFTER_SHOSHIN);

/* 障害認定日の翌月から、今日の属する月まで(両端含む)の月数。認定日が今月以降なら 0。 */
export function sakanoboriMonths(nintei: string, today: string): number {
  const a = parseYm(nintei), b = parseYm(today.slice(0, 7));
  if (!a || !b) return 0;
  const n = (b[0] * 12 + b[1]) - (a[0] * 12 + a[1]);
  return Math.max(0, n);
}

export type Sakanobori = { months: number; counted: number; capped: boolean; amount: number };

/* 額 = 月額(百円で丸めた「約」の値)× min(n, 60)。年ごとの改定は反映しない。 */
export function sakanobori(total: number, nintei: string, today: string): Sakanobori | null {
  const months = sakanoboriMonths(nintei, today);
  if (months === 0) return null;
  const counted = Math.min(months, SAKANOBORI_MAX_MONTHS);
  return { months, counted, capped: months > SAKANOBORI_MAX_MONTHS, amount: approx100(monthly(total)) * counted };
}

export const todayYm = (): string => { const t = new Date(); return `${t.getFullYear()}-${pad(t.getMonth() + 1)}`; };
