/* 申立書の「どこに何を書くか」。単位はすべて mm、用紙の左上が原点。
   設計書 docs/moushitatesho-youshiki-saigen-2026-09-04-design.md §4 の寸法表を、
   そのまま定数にしたもの。コンポーネントに数値を直書きしない(§3-2)。

   本紙(01.pdf, A3 297×420)  … §4-1 表面 / §4-2 裏面。pdfplumber で実測した値。
   続紙(03.pdf, A4 210×297)  … §4-4。設計書の値は 300dpi 画像からの暫定値だったので、
                                03.pdf から測り直した(docs/verification/moushitatesho-youshiki-2026-09-04/measure-cont.md)。

   スロットは3種類だけ(§3-2):
     text   … 文章を流し込む。x,y は枠の左上
     digits … 半角数字を置く。cx,cy は中央
     circle … 印字された文字を楕円で囲む。cx,cy は中心 */

export type TextSlot = {
  kind: "text"; x: number; y: number; w: number; h: number;
  pt?: number; lines?: number; align?: "left" | "center"; valign?: "top" | "middle";
};
export type DigitsSlot = { kind: "digits"; cx: number; cy: number; w: number; pt: number };
export type CircleSlot = { kind: "circle"; cx: number; cy: number; rx: number; ry: number };
/* 電話番号。印字された「― ―」の間の3区画。各区画は中央揃え(2026-09-04 指示書 §3-2)。 */
export type TelSlot = { kind: "tel"; y: number; h: number; pt?: number; segments: [TextSlot, TextSlot, TextSlot] };
export type Slot = TextSlot | DigitsSlot | CircleSlot | TelSlot;

const text = (x: number, y: number, w: number, h: number, o: Partial<TextSlot> = {}): TextSlot =>
  ({ kind: "text", x, y, w, h, ...o });
const digits = (cx: number, cy: number, w: number, pt: number): DigitsSlot =>
  ({ kind: "digits", cx, cy, w, pt });
const circle = (cx: number, cy: number, rx: number, ry: number): CircleSlot =>
  ({ kind: "circle", cx, cy, rx, ry });
/* left/right は欄の端、d1/d2 は印字された ― の [左端, 右端]。境界は ― の外側で切る。
   3つ目だけは欄の右端まで伸ばさない。本紙の請求者は欄の右端まで 52mm あり、
   中央揃えにすると最後の4桁が ― から離れて右に寄って見えるため、
   真ん中の区画と同じ幅で切る(2026-09-04 指示書3 §4)。 */
const tel = (left: number, right: number, d1: [number, number], d2: [number, number],
             y: number, h: number, pt?: number): TelSlot => {
  const mid = d2[0] - d1[1];
  return {
    kind: "tel", y, h, pt,
    segments: [
      text(left, y, d1[0] - left, h, { pt, lines: 1, align: "center" }),
      text(d1[1], y, mid, h, { pt, lines: 1, align: "center" }),
      text(d2[1], y, Math.min(right - d2[1], mid), h, { pt, lines: 1, align: "center" }),
    ],
  };
};

export const PAPER = {
  main: { width: 297, height: 420 },
  cont: { width: 210, height: 297 },
} as const;

/* 楕円の半径は 2026-09-04 に広げた(指示書2 §1)。
   設計 §4 の値は「字の半幅・半高より大きい」だけで、字を丸ごとは含んでいなかった。
   中心を共有する楕円が長方形を含む条件は (a/rx)²+(b/ry)² ≤ 1(角の1点で決まる)。
   これを満たす最小の倍率に3%の余裕を足した k = 1.03·√((a/rx)²+(b/ry)²) を、
   rx と ry の両方に同じだけ掛けてある(縦横比は変えていない)。実測は
   docs/verification/moushitatesho-youshiki-2026-09-04/circles.md。 */

/* 元号の3択。並びは様式の印字どおり 昭和・平成・令和。 */
export type GengouSlots = { showa: CircleSlot; heisei: CircleSlot; reiwa: CircleSlot };
const gengou = (cxs: [number, number, number], cy: number, rx: number, ry: number): GengouSlots =>
  ({ showa: circle(cxs[0], cy, rx, ry), heisei: circle(cxs[1], cy, rx, ry), reiwa: circle(cxs[2], cy, rx, ry) });

/* 元号 + 年月日の1行。digits は印字された「年」「月」「日」の左の空欄の中央。 */
export type DateRow = { gengou: GengouSlots; year: DigitsSlot; month: DigitsSlot; day: DigitsSlot };
const dateRow = (cxs: [number, number, number], ymd: [number, number, number], cy: number,
                 rx: number, ry: number, w: number, pt: number): DateRow => ({
  gengou: gengou(cxs, cy, rx, ry),
  year: digits(ymd[0], cy, w, pt), month: digits(ymd[1], cy, w, pt), day: digits(ymd[2], cy, w, pt),
});

/* ===== §4-1 本紙 表面 ===== */
const MAIN_ROW_TOP = 123.12, MAIN_ROW_H = 56.09;
export const MAIN_FRONT_ROWS = 5;

export type PeriodRow = {
  from: DateRow; to: DateRow;
  jushinAri: CircleSlot; jushinNashi: CircleSlot;
  hospital: TextSlot; body: TextSlot;
  /* 続紙だけ。左の通番欄に書く数字と、その通し番号(本紙の5に続けて6,7,…) */
  num?: DigitsSlot; seq?: number;
};

const mainRow = (i: number): PeriodRow => {
  const T = MAIN_ROW_TOP + MAIN_ROW_H * i;
  return {
    from: dateRow([33.8, 43.0, 52.4], [60.3, 72.1, 83.8], T + 4.1, 5.4, 3.31, 7, 12),
    to: dateRow([33.8, 43.0, 52.4], [60.3, 72.1, 83.8], T + 11.4, 5.4, 3.31, 7, 12),
    jushinAri: circle(42.4, T + 18.7, 10.56, 3.18),
    jushinNashi: circle(77.8, T + 18.7, 18.31, 3.31),
    hospital: text(51.5, T + 23.2, 50.5, 12.0, { pt: 10, lines: 2 }),
    body: text(104.5, T + 7.4, 173.5, 47.5, { pt: 10.5 }),
  };
};

export const MAIN_FRONT = {
  no: digits(241.0, 21.4, 9, 12),
  total: digits(257.5, 21.4, 9, 12),
  byoumei: text(90.0, 37.5, 187.0, 12.5, { pt: 10.5, lines: 2, valign: "middle" }),
  hatsubyou: dateRow([59.1, 70.1, 81.3], [92.3, 110.6, 130.0], 59.4, 6.6, 3.8, 10, 12),
  shoshin: dateRow([189.9, 200.9, 212.1], [223.0, 241.0, 260.5], 59.4, 6.6, 3.8, 10, 12),
  /* 右端。本文がここを越えていないかを検査する(§9-2 の5) */
  bodyRight: 279.1,
  rows: Array.from({ length: MAIN_FRONT_ROWS }, (_, i) => mainRow(i)),
} as const;

/* ===== §4-2 本紙 裏面 ===== */
/* 就労・日常生活の2区画。S=0 障害認定日頃 / S=1 現在。S=1 は y に D を足す。
   出勤日数だけ見出しが短いので別値(設計書 §4-2)。 */
const BACK_S_SHIFT = 143.23;

export type BackSection = {
  job: TextSlot; commuteMethod: TextSlot;
  commuteHours: DigitsSlot; commuteMinutes: DigitsSlot;
  daysPrev: DigitsSlot; daysPrevPrev: DigitsSlot;
  cond: TextSlot;
  reasons: CircleSlot[];        // ア〜オ
  reasonOther: TextSlot;
  daily: CircleSlot[][];        // [行0..4][列0..3] 左列/右列は DAILY_ITEMS の index で選ぶ
  sonota: TextSlot;
};

const DAILY_LEFT = [170.3, 178.7, 187.0, 195.3];
const DAILY_RIGHT = [228.5, 237.0, 245.3, 253.5];
const DAILY_ROW_CY = [122.9, 129.4, 136.0, 142.5, 149.0];

const backSection = (s: 0 | 1): BackSection => {
  const d = s * BACK_S_SHIFT;
  return {
    job: text(136.0, 42.6 + d, 141.5, 11.3, { lines: 2 }),
    commuteMethod: text(159.0, 55.3 + d, 118.5, 5.6, { lines: 1 }),
    commuteHours: digits(181.5, 63.4 + d, 8, 10.5),
    commuteMinutes: digits(207.5, 63.4 + d, 8, 10.5),
    /* 出勤日数だけは S=1 の見出しが短く、cx も cy も別に測ってある */
    daysPrev: s === 0 ? digits(183.0, 69.9, 8, 10.5) : digits(174.5, 213.1, 8, 10.5),
    daysPrevPrev: s === 0 ? digits(249.5, 69.9, 8, 10.5) : digits(237.2, 213.1, 8, 10.5),
    cond: text(136.0, 73.6 + d, 141.5, 11.4, { lines: 2 }),
    reasons: [89.4, 95.4, 101.4, 107.3, 113.3].map((cy) => circle(142.8, cy + d, 2.6, 2.6)),
    reasonOther: text(175.0, 110.8 + d, 89.0, 5.0, { lines: 1 }),
    daily: DAILY_ROW_CY.map((cy) => [
      ...DAILY_LEFT.map((cx) => circle(cx, cy + d, 2.4, 2.4)),
      ...DAILY_RIGHT.map((cx) => circle(cx, cy + d, 2.4, 2.4)),
    ]),
    sonota: text(136.0, 155.5 + d, 141.5, 17.5, { lines: 3 }),
  };
};

/* 障害者手帳。①の行。②は y に 23.3 を足す。 */
export type TechouRow = {
  kinds: CircleSlot[];      // 身・精・療・他
  otherName: TextSlot;
  date: DateRow;            // 元号 + 年月日
  grade: DigitsSlot;        // 級
  shougaimei: TextSlot;
};
const TECHOU_SHIFT = 23.3;
const techouRow = (n: 0 | 1): TechouRow => {
  const d = n * TECHOU_SHIFT;
  return {
    kinds: [148.0, 156.2, 164.4, 172.6].map((cx) => circle(cx, 329.2 + d, 2.78, 2.78)),
    otherName: text(180.0, 326.5 + d, 73.0, 5.5, { lines: 1 }),
    date: dateRow([149.7, 158.9, 168.3], [179.5, 196.5, 213.0], 335.1 + d, 5.4, 3.31, 8, 12),
    grade: digits(241.0, 335.1 + d, 8, 12),
    shougaimei: text(163.0, 338.6 + d, 90.0, 5.5, { lines: 1 }),
  };
};

/* 申立・請求者のブロック(本紙 裏面)。 */
export type MoushitateBlock = {
  year: DigitsSlot; month: DigitsSlot; day: DigitsSlot;
  address: TextSlot; name: TextSlot; tel: TelSlot;
  daihitsuName: TextSlot; daihitsuZokugara: TextSlot; daihitsuTel: TelSlot;
};

export const MAIN_BACK = {
  ninteibi: dateRow([61.6, 74.0, 86.3], [97.5, 115.7, 134.0], 37.6, 6.79, 3.85, 11, 14),
  sections: [backSection(0), backSection(1)] as [BackSection, BackSection],
  /* 手帳の交付 1/2/3(受けている・受けていない・申請中) */
  techouKofu: [142.9, 180.4, 222.0].map((cx) => circle(cx, 320.5, 2.6, 2.6)),
  techou: [techouRow(0), techouRow(1)] as [TechouRow, TechouRow],
  moushitate: {
    year: digits(40.0, 382.0, 9, 11), month: digits(59.0, 382.0, 9, 11), day: digits(78.0, 382.0, 9, 11),
    address: text(180.0, 378.5, 97.0, 11.0, { pt: 10, lines: 2 }),
    name: text(181.0, 391.5, 96.0, 6.0, { pt: 11, lines: 1 }),
    tel: tel(182.0, 277.0, [198.19, 201.99], [221.05, 224.85], 397.4, 6.0),
    daihitsuName: text(63.0, 391.5, 68.0, 6.0, { lines: 1 }),
    daihitsuZokugara: text(85.0, 397.4, 47.0, 5.5, { lines: 1 }),
    daihitsuTel: tel(63.0, 131.0, [80.33, 84.13], [103.19, 106.99], 403.2, 6.0),
  } as MoushitateBlock,
} as const;

/* ===== §4-4 続紙(03.pdf から実測) ===== */
/* 罫線(実測、mm): 縦 20.17 / 28.68 / 77.68 / 188.87、表の行は上端 79.70 から 36.41 ごとに5行、
   裏は 19.16 から 36.41 ごとに6行。 */
const CONT_ROW_H = 36.41;
export const CONT_FRONT_TOP = 79.70, CONT_BACK_TOP = 19.16;
export const CONT_FRONT_ROWS = 5, CONT_BACK_ROWS = 6;
export const CONT_ROWS_PER_SHEET = CONT_FRONT_ROWS + CONT_BACK_ROWS;   // 11期間

const contRow = (top: number, j: number, seq: number): PeriodRow => {
  const T = top + CONT_ROW_H * j;
  return {
    from: dateRow([33.46, 39.31, 45.16], [49.77, 57.92, 66.47], T + 2.2, 2.58, 1.55, 5, 10),
    to: dateRow([33.46, 39.31, 45.16], [49.77, 57.92, 66.47], T + 6.75, 2.58, 1.55, 5, 10),
    jushinAri: circle(41.34, T + 11.03, 6.76, 2.21),
    jushinNashi: circle(63.65, T + 11.03, 11.65, 2.28),
    hospital: text(43.5, T + 13.7, 33.2, 7.6, { pt: 9, lines: 2 }),
    body: text(78.8, T + 6.0, 109.0, 29.5, { pt: 10.5 }),
    num: digits(24.43, T + 18.2, 7, 10.5),
    seq,
  };
};

export const CONT_FRONT = {
  no: digits(163.17, 23.49, 8, 10.5),
  total: digits(175.85, 23.49, 8, 10.5),
  byoumei: text(62.0, 35.5, 126.0, 7.3, { pt: 10.5, lines: 1 }),
  bodyRight: 188.87,
  rows: Array.from({ length: CONT_FRONT_ROWS }, (_, j) => contRow(CONT_FRONT_TOP, j, j)),
} as const;

export const CONT_BACK = {
  bodyRight: 188.87,
  rows: Array.from({ length: CONT_BACK_ROWS }, (_, j) => contRow(CONT_BACK_TOP, j, CONT_FRONT_ROWS + j)),
  /* 続紙の裏にも申立・請求者欄がある(§7-2)。本紙の裏と同じ値を書く。 */
  moushitate: {
    year: digits(38.15, 245.48, 9, 10), month: digits(52.14, 245.48, 9, 10), day: digits(64.65, 245.48, 9, 10),
    address: text(124.5, 243.4, 63.4, 10.5, { pt: 9, lines: 2 }),
    name: text(124.5, 253.7, 63.4, 5.8, { pt: 10, lines: 1 }),
    tel: tel(124.5, 187.9, [142.9, 145.27], [160.01, 162.38], 258.9, 5.8, 9),
    daihitsuName: text(50.5, 253.7, 45.5, 5.8, { pt: 9, lines: 1 }),
    daihitsuZokugara: text(64.0, 258.9, 26.5, 5.5, { pt: 9, lines: 1 }),
    /* 代筆者の電話は右に空きがあるので、3区画目が入るところまで広げる(請求者の欄は 113.69 から) */
    daihitsuTel: tel(50.5, 112.0, [68.83, 71.2], [85.94, 88.31], 265.2, 5.8, 9),
  } as MoushitateBlock,
} as const;

/* text スロットの既定(§3-2)。行送りは 1.35。 */
export const TEXT_DEFAULT_PT = 10.5;
export const TEXT_LINE_HEIGHT = 1.35;
/* 書類全体で選べる文字の大きさ(§6-3)。これ以外にしない。 */
export const FONT_SIZES = [10.5, 9] as const;
export type FontPt = (typeof FONT_SIZES)[number];
