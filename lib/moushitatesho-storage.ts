/* 申立書の保存と、v1 → v2 → v3 の移行(設計書 §6-1、docs/moushitatesho-kinyuu-ran-2026-09-06-instructions.md §1-2)。
   保存はこの端末の localStorage だけ。サーバーへは送らない。 */
import {
  emptyBack, emptyState, emptyTechou, newWaku, ninteibiFrom, today,
  type BackSide, type MoushitateshoState, type Techou, type TechouKind, type Waku,
} from "@/data/moushitatesho/types";

export const STORAGE_KEY_V1 = "shougainenkin-note:moushitatesho:v1";
export const STORAGE_KEY_V2 = "shougainenkin-note:moushitatesho:v2";
export const STORAGE_KEY = "shougainenkin-note:moushitatesho:v3";

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
export function migrateV1(v1: Record<string, unknown>): Record<string, unknown> {
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
    sonota: String(v1.sonota ?? ""),   // v2 の形。v3 では migrateV2 が back.*.sonota に写す
    techou: (v1.techou ?? null) as MoushitateshoState["techou"],
    techouList,
    moushitateDate: today(),
    seikyuuType: (v1.seikyuuType ?? null) as MoushitateshoState["seikyuuType"],
    updatedAt: String(v1.updatedAt ?? new Date().toISOString()),
  };
}

/* v2 の発病日・初診日は「年月」しか入力できず、保存値は必ず "-01" だった。
   その "01" は本当の日ではないので、v3 では YYYY-MM(日不明)に直す。"-15" など 01 以外はそのまま。 */
export function dateFromV2(value: unknown): string {
  const v = String(value ?? "").trim();
  const m = /^(\d{4}-\d{2})-01$/.exec(v);
  return m ? m[1] : v;
}

/* v2 → v3。トップレベルの sonota を裏面の1・2の両方へ、各期間に work: null を足す。
   ninteibi は本人が直している可能性があるので v2 の値をそのまま残す。 */
export function migrateV2(v2: Record<string, unknown>): MoushitateshoState {
  const base = emptyState();
  const back = (v2.back ?? {}) as Record<string, unknown>;
  const sonota = String(v2.sonota ?? "");
  const side = (v: unknown): BackSide => {
    const raw = { ...emptyBack(), ...((v as object) ?? {}) } as BackSide;
    /* 区画に sonota があればそれ、無ければ(v2 はトップレベルにしか無い)両区画に同じ文を写す */
    return { ...raw, sonota: raw.sonota || sonota };
  };
  const waku = Array.isArray(v2.waku) && v2.waku.length
    ? (v2.waku as Record<string, unknown>[]).map((w) => ({ ...newWaku(), ...w, work: typeof w.work === "boolean" ? w.work : null } as Waku))
    : base.waku;
  const { sonota: _dropped, ...rest } = v2;
  void _dropped;
  return {
    ...base, ...(rest as Partial<MoushitateshoState>),
    version: 3,
    hatsubyou: dateFromV2(v2.hatsubyou),
    shoshin: dateFromV2(v2.shoshin),
    ninteibi: String(v2.ninteibi ?? ""),
    waku,
    back: { nintei: side(back.nintei), genzai: side(back.genzai) },
    seikyuusha: { ...base.seikyuusha, ...((v2.seikyuusha as object) ?? {}) },
    techouList: Array.isArray(v2.techouList) ? (v2.techouList as Techou[]).slice(0, 2) : [],
    fontPt: v2.fontPt === 9 ? 9 : 10.5,
  };
}

/* JSON の読み込みは v1/v2/v3 に対応(§6-1)。v3 → そのまま、v2 → v3、v1 → v2 → v3。 */
export function normalize(value: unknown): MoushitateshoState | null {
  if (!value || typeof value !== "object") return null;
  const v = value as Record<string, unknown>;
  if (v.version === 3) {
    const base = emptyState();
    const side = (x: unknown): BackSide => ({ ...emptyBack(), ...((x as object) ?? {}) });
    const backV = (v.back ?? {}) as Record<string, unknown>;
    return {
      ...base, ...(v as unknown as MoushitateshoState),
      waku: Array.isArray(v.waku) && v.waku.length ? (v.waku as Record<string, unknown>[]).map((w) => ({ ...newWaku(), ...w } as Waku)) : base.waku,
      back: { nintei: side(backV.nintei), genzai: side(backV.genzai) },
      seikyuusha: { ...base.seikyuusha, ...((v.seikyuusha as object) ?? {}) },
      techouList: Array.isArray(v.techouList) ? (v.techouList as Techou[]).slice(0, 2) : [],
      fontPt: v.fontPt === 9 ? 9 : 10.5,
    };
  }
  if (v.version === 2) return migrateV2(v);
  if (v.version === 1) return migrateV2(migrateV1(v));
  return null;
}

/* v3 があればそれ。無ければ v2、v1 の順に読んで移行する。v2・v1 は消さない(戻せるように)。 */
export function loadMoushitatesho(): MoushitateshoState | null {
  for (const key of [STORAGE_KEY, STORAGE_KEY_V2, STORAGE_KEY_V1]) {
    try {
      const raw = localStorage.getItem(key);
      if (raw) { const v = normalize(JSON.parse(raw)); if (v) return v; }
    } catch { /* 壊れていたら次の版を見る */ }
  }
  return null;
}

export function saveMoushitatesho(value: MoushitateshoState) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(value)); return true; } catch { return false; }
}

/* v3 を消す。v2・v1 は移行元なので一緒に消す(利用者から見れば「下書きを消す」1つの操作)。 */
export function clearMoushitatesho() {
  try { localStorage.removeItem(STORAGE_KEY); localStorage.removeItem(STORAGE_KEY_V2); localStorage.removeItem(STORAGE_KEY_V1); return true; } catch { return false; }
}
