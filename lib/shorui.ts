/* /dougu/shorui の選別と保存。固定ロジックのみ。
   分岐は data/shorui.ts の when(モックのまま)。ここで条件を足さない。
   入力はサーバーへ送らない(fetch / XMLHttpRequest / sendBeacon / WebSocket を書かない)。 */
import {
  SHINDANSHO_FORMS, SHINDANSHO_NAIBU, SHORUI_DOCS, SHORUI_STORAGE_KEY, SHORUI_URLS,
  type ShoruiAnswers, type ShoruiDoc,
} from "@/data/shorui";

/* 表示する書類。always か、when が真のものだけ。 */
export function shoruiDocs(s: ShoruiAnswers): ShoruiDoc[] {
  return SHORUI_DOCS.filter((d) => d.always || (d.when ? d.when(s) : false));
}

/* もらう場所ごとの並び。モックと同じく、最初に出てきた順で節を作る。 */
export function shoruiSections(docs: ShoruiDoc[]): { sec: string; docs: ShoruiDoc[] }[] {
  const order: string[] = [];
  for (const d of docs) if (!order.includes(d.sec)) order.push(d.sec);
  return order.map((sec) => ({ sec, docs: docs.filter((d) => d.sec === sec) }));
}

/* 金額は書かない(§2-2)。かかるかどうかだけ。 */
export function feeText(fee: ShoruiDoc["fee"]): string {
  if (fee === "byouin") return "文書料がかかります(病院ごとに決まっています)";
  if (fee === "yakusho") return "役所の手数料がかかります";
  return "";
}

/* 待ち日数も断定しない(§2-3)。 */
export function waitText(wait: ShoruiDoc["wait"]): string {
  return wait === "byouin" ? "すぐには出ません。経験として、依頼から1か月近くかかることもあると語られています" : "";
}

/* §4「Q4 → 診断書の様式が決まる」。障害の種類を選んだときだけ、公式の様式名とページを出す。
   様式番号は機構の公式ページに記載が無いので持たない(§6の照合結果)。 */
export function shindanshoForms(s: ShoruiAnswers): { name: string; url: string }[] {
  if (s.shurui === "naibu") return SHINDANSHO_NAIBU;
  const hit = SHINDANSHO_FORMS.find((f) => f.key === s.shurui);
  if (hit) return [{ name: hit.name, url: hit.url }];
  if (s.shurui === "sonota") return [{ name: "診断書(血液・造血器・その他の障害用)", url: SHINDANSHO_FORMS[4].url }];
  return [];
}

/* 年金請求書の様式。制度を選んでいなければ両方を出す(どちらか一方に決めつけない)。 */
export function seikyuushoForms(s: ShoruiAnswers): { name: string; url: string }[] {
  const kiso = { name: "年金請求書(国民年金障害基礎年金) 様式第107号", url: SHORUI_URLS.kisoSeikyuu };
  const kousei = { name: "年金請求書(国民年金・厚生年金保険障害給付) 様式第104号", url: SHORUI_URLS.kouseiSeikyuu };
  if (s.seido === "kokumin") return [kiso];
  if (s.seido === "kousei") return [kousei];
  return [kiso, kousei];
}

/* 障害基礎年金には配偶者の加算が無い(§4の注記)。 */
export const showKokuminHaiguNote = (s: ShoruiAnswers) => s.kazoku.includes("haigu") && s.seido === "kokumin";
/* 遡及は診断書が2通。 */
export const showSokyuuNote = (s: ShoruiAnswers) => s.kata === "sokyuu";

/* ===== チェック状態の保存。localStorage だけ。使えなくても表示は動く。 ===== */
export function loadShoruiChecks(): Record<string, boolean> {
  try {
    const raw = localStorage.getItem(SHORUI_STORAGE_KEY);
    if (!raw) return {};
    const value = JSON.parse(raw);
    if (value === null || typeof value !== "object") return {};
    const out: Record<string, boolean> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) if (v === true) out[k] = true;
    return out;
  } catch { return {}; }
}

export function saveShoruiChecks(checks: Record<string, boolean>): boolean {
  try { localStorage.setItem(SHORUI_STORAGE_KEY, JSON.stringify(checks)); return true; }
  catch { return false; }
}

export function clearShoruiChecks(): boolean {
  try { localStorage.removeItem(SHORUI_STORAGE_KEY); return true; }
  catch { return false; }
}
