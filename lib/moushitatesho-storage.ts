/* 申立書の保存と、v1 → v2 の移行(設計書 §6-1)。
   保存はこの端末の localStorage だけ。サーバーへは送らない。 */
import {
  emptyBack, emptyState, emptyTechou, ninteibiFrom, today,
  type MoushitateshoState, type Techou, type TechouKind,
} from "@/data/moushitatesho/types";

export const STORAGE_KEY_V1 = "shougainenkin-note:moushitatesho:v1";
export const STORAGE_KEY = "shougainenkin-note:moushitatesho:v2";

/* v1 の techouInfo.shurui は自由文字列だった。身/精/療 に読めれば当て、読めなければ「他」+ 手帳名。 */
function techouKindOf(raw: string): { shurui: TechouKind; taName: string } {
  const v = (raw ?? "").trim();
  if (!v) return { shurui: "ta", taName: "" };
  if (/身体/.test(v)) return { shurui: "shin", taName: "" };
  if (/精神/.test(v)) return { shurui: "sei", taName: "" };
  if (/療育|愛の手帳|みどりの手帳/.test(v)) return { shurui: "ryou", taName: "" };
  return { shurui: "ta", taName: v };
}

/* v1 の形を v2 に移す。捨てるのは seinengappi(様式に無い)だけ。 */
export function migrateV1(v1: Record<string, unknown>): MoushitateshoState {
  const base = emptyState();
  const info = (v1.techouInfo ?? {}) as Record<string, string>;
  const hasTechou = !!(info.shurui || info.kofu || info.tokyu || info.namae);
  const techouList: Techou[] = hasTechou
    ? [{ ...emptyTechou(), ...techouKindOf(info.shurui ?? ""), kofu: info.kofu ?? "", tokyu: info.tokyu ?? "", shougaimei: info.namae ?? "" }]
    : [];
  const back = (v1.back ?? {}) as Record<string, unknown>;
  const side = (v: unknown) => ({ ...emptyBack(), ...(v as object ?? {}) });
  const shoshin = String(v1.shoshin ?? "");
  return {
    ...base,
    version: 2,
    byoumei: String(v1.byoumei ?? ""),
    hatsubyou: String(v1.hatsubyou ?? ""),
    shoshin,
    ninteibi: ninteibiFrom(shoshin),
    waku: Array.isArray(v1.waku) && v1.waku.length ? (v1.waku as MoushitateshoState["waku"]) : base.waku,
    back: { nintei: side(back.nintei), genzai: side(back.genzai) },
    sonota: String(v1.sonota ?? ""),
    techou: (v1.techou ?? null) as MoushitateshoState["techou"],
    techouList,
    moushitateDate: today(),
    seikyuuType: (v1.seikyuuType ?? null) as MoushitateshoState["seikyuuType"],
    updatedAt: String(v1.updatedAt ?? new Date().toISOString()),
  };
}

/* JSON の読み込みも v1/v2 両対応(§6-1)。 */
export function normalize(value: unknown): MoushitateshoState | null {
  if (!value || typeof value !== "object") return null;
  const v = value as Record<string, unknown>;
  if (v.version === 2) {
    const base = emptyState();
    return {
      ...base, ...(v as unknown as MoushitateshoState),
      back: { nintei: { ...emptyBack(), ...(v.back as any)?.nintei }, genzai: { ...emptyBack(), ...(v.back as any)?.genzai } },
      seikyuusha: { ...base.seikyuusha, ...(v.seikyuusha as object ?? {}) },
      techouList: Array.isArray(v.techouList) ? (v.techouList as Techou[]).slice(0, 2) : [],
      fontPt: v.fontPt === 9 ? 9 : 10.5,
    };
  }
  if (v.version === 1) return migrateV1(v);
  return null;
}

/* v2 があればそれ。無ければ v1 を読んで移行する。v1 は消さない(戻せるように)。 */
export function loadMoushitatesho(): MoushitateshoState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return normalize(JSON.parse(raw));
  } catch { /* 壊れていたら v1 を見る */ }
  try {
    const old = localStorage.getItem(STORAGE_KEY_V1);
    if (old) return normalize(JSON.parse(old));
  } catch { /* 使えなくても画面は動く */ }
  return null;
}

export function saveMoushitatesho(value: MoushitateshoState) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(value)); return true; } catch { return false; }
}

/* v2 を消す。v1 は移行元なので一緒に消す(利用者から見れば「下書きを消す」1つの操作)。 */
export function clearMoushitatesho() {
  try { localStorage.removeItem(STORAGE_KEY); localStorage.removeItem(STORAGE_KEY_V1); return true; } catch { return false; }
}
