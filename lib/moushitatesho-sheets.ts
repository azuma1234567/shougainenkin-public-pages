/* 何枚の紙になるか、どの期間がどの紙のどの行に入るか(設計書 §7-1)。
   本紙 表に 1〜5、続紙 k は表に5行・裏に6行(1枚で11期間)。 */
import { CONT_BACK_ROWS, CONT_FRONT_ROWS, CONT_ROWS_PER_SHEET, MAIN_FRONT_ROWS } from "@/data/moushitatesho/layout";
import type { MoushitateshoState, Waku } from "@/data/moushitatesho/types";

export type ContSheet = { index: number; front: Waku[]; back: Waku[]; firstSeq: number };
export type SheetPlan = { main: Waku[]; conts: ContSheet[]; total: number };

export function planSheets(waku: Waku[]): SheetPlan {
  const main = waku.slice(0, MAIN_FRONT_ROWS);
  const rest = waku.slice(MAIN_FRONT_ROWS);
  const conts: ContSheet[] = [];
  for (let i = 0; i * CONT_ROWS_PER_SHEET < rest.length; i += 1) {
    const chunk = rest.slice(i * CONT_ROWS_PER_SHEET, (i + 1) * CONT_ROWS_PER_SHEET);
    conts.push({
      index: i + 1,
      front: chunk.slice(0, CONT_FRONT_ROWS),
      back: chunk.slice(CONT_FRONT_ROWS, CONT_FRONT_ROWS + CONT_BACK_ROWS),
      firstSeq: MAIN_FRONT_ROWS + i * CONT_ROWS_PER_SHEET + 1,
    });
  }
  return { main, conts, total: 1 + conts.length };
}

/* 裏面の2区画のどちらを埋めるか(§4-3、記載要領 p2)。
   本来請求(障害認定日請求) → 障害認定日頃だけ / 事後重症 → 現在だけ / 遡及 → 両方。 */
export function backSidesFor(t: MoushitateshoState["seikyuuType"]): { nintei: boolean; genzai: boolean } {
  if (t === "honrai") return { nintei: true, genzai: false };
  if (t === "jigojuushou") return { nintei: false, genzai: true };
  if (t === "sokyuu") return { nintei: true, genzai: true };
  return { nintei: false, genzai: false };
}
