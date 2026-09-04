/* 西暦の日付(YYYY-MM-DD / YYYY-MM)を元号に直す。設計書 §3-3。
   様式は元号を○で囲む作りなので、西暦は紙に出さない。
   令和元年は「1」(パソコン記入の慣例。§5)。 */

export type Gengou = "showa" | "heisei" | "reiwa";

/* 改元日。この日を含めてその元号。 */
const ERAS: { key: Gengou; from: string; base: number }[] = [
  { key: "reiwa", from: "2019-05-01", base: 2018 },   // 令和元年 = 2019
  { key: "heisei", from: "1989-01-08", base: 1988 },  // 平成元年 = 1989
  { key: "showa", from: "1926-12-25", base: 1925 },   // 昭和元年 = 1926
];

export type Wareki = { gengou: Gengou; year: number; month: number; day: number | null };

/* YYYY-MM-DD または YYYY-MM。日が無ければ day は null(様式では空欄のまま)。 */
export function toWareki(value: string): Wareki | null {
  const m = /^(\d{4})-(\d{2})(?:-(\d{2}))?$/.exec((value ?? "").trim());
  if (!m) return null;
  const [y, mo, d] = [Number(m[1]), Number(m[2]), m[3] ? Number(m[3]) : null];
  if (mo < 1 || mo > 12) return null;
  if (d !== null && (d < 1 || d > 31)) return null;
  /* 日が無いときは、その月のうちで元号が変わらないかを見る。
     月の1日と末日で元号が違う月(1989-01 と 2019-05)は、遅いほうに寄せない。
     どちらとも決められないので、月初の元号を採る。 */
  const probe = `${m[1]}-${m[2]}-${m[3] ?? "01"}`;
  const era = ERAS.find((e) => probe >= e.from);
  if (!era) return null;   // 大正以前は様式に無い
  return { gengou: era.key, year: Number(m[1]) - era.base, month: mo, day: d };
}

export const GENGOU_LABEL: Record<Gengou, string> = { showa: "昭和", heisei: "平成", reiwa: "令和" };
