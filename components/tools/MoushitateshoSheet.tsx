/* 様式1枚を描く。画面のプレビューと印刷で同じ DOM を使う(設計書 §3-3)。
   数値は data/moushitatesho/layout.ts(=設計書 §4 の寸法表)だけから採る。
   ここに座標を直書きしない。自動縮小もしない(§3-3・§6-3)。 */
import {
  CONT_BACK, CONT_FRONT, MAIN_BACK, MAIN_FRONT, PAPER, TEXT_DEFAULT_PT,
  type CircleSlot, type DateRow, type DigitsSlot, type MoushitateBlock, type PeriodRow, type TelSlot, type TextSlot,
} from "@/data/moushitatesho/layout";
import { DAILY_ITEMS, REASON_OTHER_INDEX, type BackSide, type MoushitateshoState, type Waku } from "@/data/moushitatesho/types";
import { backSidesFor, type ContSheet } from "@/lib/moushitatesho-sheets";
import { toWareki, type Gengou } from "@/lib/wareki";
import { splitTel } from "@/lib/moushitatesho-tel";

export type SheetKind = "main-front" | "main-back" | "cont-front" | "cont-back";

const mm = (v: number) => `${v}mm`;

/* ---- 3種類のスロット ---- */

function Text({ slot, value, fontPt }: { slot: TextSlot; value: string; fontPt: number }) {
  if (!value) return null;                     // 空の欄は何も描かない(§4-3)
  const pt = Math.min(slot.pt ?? TEXT_DEFAULT_PT, fontPt);
  return (
    <div
      className="mt-slot-text"
      data-slot="text"
      style={{
        left: mm(slot.x), top: mm(slot.y), width: mm(slot.w), height: mm(slot.h),
        fontSize: `${pt}pt`,
        textAlign: slot.align ?? "left",
        display: slot.valign === "middle" ? "flex" : undefined,
        alignItems: slot.valign === "middle" ? "center" : undefined,
      }}
    >
      {slot.valign === "middle" ? <span>{value}</span> : value}
    </div>
  );
}

function Digits({ slot, value }: { slot: DigitsSlot; value: string | number | null | undefined }) {
  const v = value === null || value === undefined || value === "" ? "" : String(value);
  if (!v) return null;
  return (
    <div className="mt-slot-digits" data-slot="digits"
      style={{ left: mm(slot.cx), top: mm(slot.cy), width: mm(slot.w), fontSize: `${slot.pt}pt` }}>
      {v}
    </div>
  );
}

/* 印字された文字を楕円で囲む。線1本(0.35mm)、塗らない(§3-2)。 */
function Circle({ slot, on }: { slot: CircleSlot; on: boolean }) {
  if (!on) return null;
  const pad = 0.4;   // 線の太さぶんの余白。楕円が切れないように
  const w = slot.rx * 2 + pad * 2, h = slot.ry * 2 + pad * 2;
  return (
    <svg className="mt-slot-circle" data-slot="circle" aria-hidden="true"
      style={{ left: mm(slot.cx - w / 2), top: mm(slot.cy - h / 2), width: mm(w), height: mm(h) }}
      viewBox={`0 0 ${w} ${h}`}>
      <ellipse cx={w / 2} cy={h / 2} rx={slot.rx} ry={slot.ry} fill="none" stroke="#000" strokeWidth={0.35} />
    </svg>
  );
}

/* 電話番号。印字された「― ―」の間の3区画に、中央揃えで置く(指示書 §3-2)。
   区切れない番号は紙に書かない(左詰めにすると ― に重なる)。 */
function Tel({ slot, value, fontPt }: { slot: TelSlot; value: string; fontPt: number }) {
  const r = splitTel(value);
  if (!r.ok) return null;
  return (
    <>
      {slot.segments.map((seg, i) => <Text key={i} slot={seg} value={r.segments[i]} fontPt={fontPt} />)}
    </>
  );
}

/* 元号を○で囲み、年月日の空欄に数字を置く。日が無ければ空欄のまま(§5)。 */
function DateLine({ row, value, showDay = true }: { row: DateRow; value: string; showDay?: boolean }) {
  const w = toWareki(value);
  const on = (g: Gengou) => !!w && w.gengou === g;
  return (
    <>
      <Circle slot={row.gengou.showa} on={on("showa")} />
      <Circle slot={row.gengou.heisei} on={on("heisei")} />
      <Circle slot={row.gengou.reiwa} on={on("reiwa")} />
      <Digits slot={row.year} value={w?.year} />
      <Digits slot={row.month} value={w?.month} />
      <Digits slot={row.day} value={showDay ? w?.day : null} />
    </>
  );
}

/* 期間1つぶん。本紙も続紙も同じ形(スロットの値だけ違う)。 */
function Period({ row, waku, fontPt }: { row: PeriodRow; waku: Waku | undefined; fontPt: number }) {
  if (!waku) return null;
  return (
    <>
      {row.num && waku && <Digits slot={row.num} value={(row.seq ?? 0) + 1} />}
      {/* from/to は YYYY-MM なので「日」は空欄のまま(§5) */}
      <DateLine row={row.from} value={waku.from} showDay={false} />
      <DateLine row={row.to} value={waku.to} showDay={false} />
      <Circle slot={row.jushinAri} on={waku.jushin === true} />
      <Circle slot={row.jushinNashi} on={waku.jushin === false} />
      <Text slot={row.hospital} value={waku.jushin ? waku.kikan : ""} fontPt={fontPt} />
      <Text slot={row.body} value={waku.text} fontPt={fontPt} />
    </>
  );
}

/* 申立・請求者。本紙の裏と続紙の裏で同じ値を書く(§7-2)。 */
function Moushitate({ block, state, fontPt }: { block: MoushitateBlock; state: MoushitateshoState; fontPt: number }) {
  const w = toWareki(state.moushitateDate);   // 様式は「令和」だけ印字。数字だけ置く
  return (
    <>
      <Digits slot={block.year} value={w?.year} />
      <Digits slot={block.month} value={w?.month} />
      <Digits slot={block.day} value={w?.day} />
      <Text slot={block.address} value={state.seikyuusha.address} fontPt={fontPt} />
      <Text slot={block.name} value={state.seikyuusha.name} fontPt={fontPt} />
      <Tel slot={block.tel} value={state.seikyuusha.tel} fontPt={fontPt} />
      <Text slot={block.daihitsuName} value={state.daihitsu?.name ?? ""} fontPt={fontPt} />
      <Text slot={block.daihitsuZokugara} value={state.daihitsu?.zokugara ?? ""} fontPt={fontPt} />
      <Tel slot={block.daihitsuTel} value={state.daihitsu?.tel ?? ""} fontPt={fontPt} />
    </>
  );
}

/* 裏面の就労・日常生活の1区画。 */
function BackBlock({ s, side, sonota, fontPt }: { s: 0 | 1; side: BackSide; sonota: string; fontPt: number }) {
  const L = MAIN_BACK.sections[s];
  return (
    <>
      <Text slot={L.job} value={side.job} fontPt={fontPt} />
      <Text slot={L.commuteMethod} value={side.commuteMethod} fontPt={fontPt} />
      <Digits slot={L.commuteHours} value={side.commuteHours} />
      <Digits slot={L.commuteMinutes} value={side.commuteMinutes} />
      <Digits slot={L.daysPrev} value={side.daysPrev} />
      <Digits slot={L.daysPrevPrev} value={side.daysPrevPrev} />
      <Text slot={L.cond} value={side.cond} fontPt={fontPt} />
      {L.reasons.map((c, i) => <Circle key={i} slot={c} on={side.reasons.includes(i)} />)}
      <Text slot={L.reasonOther}
        value={side.reasons.includes(REASON_OTHER_INDEX) ? side.reasonsOther : ""} fontPt={fontPt} />
      {DAILY_ITEMS.map((_, i) => {
        const level = side.daily[i];
        if (!level) return null;
        const row = Math.floor(i / 2), col = (i % 2) * 4 + (level - 1);
        return <Circle key={i} slot={L.daily[row][col]} on />;
      })}
      {/* 「その他」の欄は区画ごとにある。埋める区画に同じ内容を書く */}
      <Text slot={L.sonota} value={sonota} fontPt={fontPt} />
    </>
  );
}

export type SheetProps = { kind: SheetKind; state: MoushitateshoState; cont?: ContSheet; no: number; total: number };

/* 記載要領「複数枚記入した場合は、順番と記入した枚数を数字で記入してください」。
   1枚だけのときは No. も 枚中も書かない(2026-09-04 指示書 §2)。 */
const sheetNo = (v: number, total: number) => (total >= 2 ? v : null);

/* 1枚ぶんの紙。背景は公式PDFから作ったSVG(§3-1)。 */
export function Sheet({ kind, state, cont, no, total }: SheetProps) {
  const isMain = kind.startsWith("main");
  const paper = isMain ? PAPER.main : PAPER.cont;
  const bg = { "main-front": "main-1", "main-back": "main-2", "cont-front": "cont-1", "cont-back": "cont-2" }[kind];
  const fontPt = state.fontPt;
  const sides = backSidesFor(state.seikyuuType);
  return (
    <div className={`mt-paper mt-${kind}`} data-sheet={kind}
      style={{
        width: mm(paper.width), height: mm(paper.height),
        backgroundImage: `url(/forms/moushitatesho/${bg}.svg)`,
        backgroundSize: `${paper.width}mm ${paper.height}mm`,
      }}>
      {kind === "main-front" && (
        <>
          <Digits slot={MAIN_FRONT.no} value={sheetNo(no, total)} />
          <Digits slot={MAIN_FRONT.total} value={sheetNo(total, total)} />
          <Text slot={MAIN_FRONT.byoumei} value={state.byoumei} fontPt={fontPt} />
          <DateLine row={MAIN_FRONT.hatsubyou} value={state.hatsubyou} />
          <DateLine row={MAIN_FRONT.shoshin} value={state.shoshin} />
          {MAIN_FRONT.rows.map((row, i) => <Period key={i} row={row} waku={state.waku[i]} fontPt={fontPt} />)}
        </>
      )}

      {kind === "main-back" && (
        <>
          {/* 「1．障害認定日（ 年 月 日）頃」は、その区画を埋めるときだけ書く(§4-3) */}
          {sides.nintei && <DateLine row={MAIN_BACK.ninteibi} value={state.ninteibi} />}
          {sides.nintei && <BackBlock s={0} side={state.back.nintei} sonota={state.sonota} fontPt={fontPt} />}
          {sides.genzai && <BackBlock s={1} side={state.back.genzai} sonota={state.sonota} fontPt={fontPt} />}
          {/* 手帳。1(受けている)のときだけ①②を書く(§5) */}
          {MAIN_BACK.techouKofu.map((c, i) => (
            <Circle key={i} slot={c} on={state.techou === (["ari", "nashi", "shinsei"] as const)[i]} />
          ))}
          {state.techou === "ari" && state.techouList.map((t, i) => {
            const L = MAIN_BACK.techou[i];
            if (!L) return null;
            return (
              <div key={i} style={{ display: "contents" }}>
                {L.kinds.map((c, k) => <Circle key={k} slot={c} on={t.shurui === (["shin", "sei", "ryou", "ta"] as const)[k]} />)}
                <Text slot={L.otherName} value={t.shurui === "ta" ? t.taName : ""} fontPt={fontPt} />
                <DateLine row={L.date} value={t.kofu} />
                <Digits slot={L.grade} value={t.tokyu} />
                <Text slot={L.shougaimei} value={t.shougaimei} fontPt={fontPt} />
              </div>
            );
          })}
          <Moushitate block={MAIN_BACK.moushitate} state={state} fontPt={fontPt} />
        </>
      )}

      {kind === "cont-front" && cont && (
        <>
          <Digits slot={CONT_FRONT.no} value={sheetNo(no, total)} />
          <Digits slot={CONT_FRONT.total} value={sheetNo(total, total)} />
          <Text slot={CONT_FRONT.byoumei} value={state.byoumei} fontPt={fontPt} />
          {CONT_FRONT.rows.map((row, i) => (
            <Period key={i} row={{ ...row, seq: cont.firstSeq + i - 1 }} waku={cont.front[i]} fontPt={fontPt} />
          ))}
        </>
      )}

      {kind === "cont-back" && cont && (
        <>
          {CONT_BACK.rows.map((row, i) => (
            <Period key={i} row={{ ...row, seq: cont.firstSeq + CONT_FRONT.rows.length + i - 1 }}
              waku={cont.back[i]} fontPt={fontPt} />
          ))}
          <Moushitate block={CONT_BACK.moushitate} state={state} fontPt={fontPt} />
        </>
      )}
    </div>
  );
}

export default Sheet;
