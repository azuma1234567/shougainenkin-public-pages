import { SAIKETSU_CASES, type SaiketsuCase } from "@/lib/saiketsu";

/* /jitsurei の ?争点=<語> と ?傷病=<語> の対応表(2026-09-08)。
   争点: SAIKETSU_CASES の soten の値はそのまま(部分一致)。サイト内で使われている語(更新・支給停止・診断書・
   認定日・就労・20歳前・初診日 …)は、この表で request_type_group / soten / request_type / 要旨(youshi)の
   部分一致に対応させる。「認定日・遡及」のように「・」でつないだ語は、各部分の和集合。
   表に無く soten にも部分一致しない語は絞り込まない(1ページ目をそのまま出す)。
   傷病: shobyo の部分一致。shobyo にその語が無い「神経症」だけ、別名の表で引く。1件も無ければ絞り込まない。 */
type Rule = { group?: string; soten?: string; requestType?: string; youshi?: string };

export const SOTEN_TABLE: Record<string, Rule[]> = {
  // soten の値そのもの
  初診日: [{ soten: "初診日" }],
  "障害の程度・等級該当性": [{ soten: "障害の程度・等級該当性" }],
  "診断書の信頼性・整合性": [{ soten: "診断書の信頼性・整合性" }],
  納付要件: [{ soten: "納付要件" }],
  手続その他: [{ soten: "手続その他" }],
  相当因果関係: [{ soten: "相当因果関係" }],
  社会的治癒: [{ soten: "社会的治癒" }],
  "遡及・時効": [{ soten: "遡及・時効" }],
  // サイト内で使われている語
  更新: [{ group: "更新・支給停止" }],
  支給停止: [{ group: "更新・支給停止" }],
  額改定: [{ group: "額改定" }],
  診断書: [{ soten: "診断書の信頼性・整合性" }],
  認定日: [{ requestType: "認定日" }, { soten: "遡及・時効" }],
  遡及: [{ soten: "遡及・時効" }, { requestType: "認定日" }],
  就労: [{ youshi: "就労" }],
  "20歳前": [{ requestType: "20歳" }, { youshi: "20歳前" }],
  程度: [{ soten: "障害の程度・等級該当性" }],
  等級: [{ soten: "障害の程度・等級該当性" }],
  納付: [{ soten: "納付要件" }],
  // 旧 ?issue=teido
  teido: [{ soten: "障害の程度・等級該当性" }],
};

/* 表示用の言い換え(表のキーが URL 用の英字のとき) */
const SOTEN_LABELS: Record<string, string> = { teido: "障害の程度・等級該当性" };

export const DISEASE_ALIASES: Record<string, string[]> = {
  神経症: ["不安", "適応障害", "強迫", "パニック", "気分変調", "身体表現性"],
};

const SOTEN_VALUES = [...new Set(SAIKETSU_CASES.flatMap((item) => item.soten))];

function matchesRule(item: SaiketsuCase, rule: Rule): boolean {
  if (rule.group && !item.request_type_group.includes(rule.group)) return false;
  if (rule.soten && !item.soten.some((value) => value.includes(rule.soten as string))) return false;
  if (rule.requestType && !item.request_type.includes(rule.requestType)) return false;
  if (rule.youshi && !item.youshi.includes(rule.youshi)) return false;
  return true;
}

/* 語ごとの規則。表 → soten の部分一致 の順。無ければ空。 */
function rulesForWord(word: string): Rule[] {
  if (SOTEN_TABLE[word]) return SOTEN_TABLE[word];
  const partial = SOTEN_VALUES.filter((value) => value.includes(word));
  return partial.map((value) => ({ soten: value }));
}

export type ResolvedFilter = { predicate: (item: SaiketsuCase) => boolean; matched: string[] };

/* ?争点=<語>。「・」「、」で複数語をつなげられる。対応する語が1つも無ければ null(絞り込まない)。 */
export function resolveSotenFilter(query: string | undefined): ResolvedFilter | null {
  const words = (query ?? "").split(/[・、,]/).map((word) => word.trim()).filter(Boolean);
  const rules = words.map((word) => [word, rulesForWord(word)] as const).filter(([, list]) => list.length);
  if (!rules.length) return null;
  const all = rules.flatMap(([, list]) => list);
  return { predicate: (item) => all.some((rule) => matchesRule(item, rule)), matched: rules.map(([word]) => SOTEN_LABELS[word] ?? word) };
}

/* ?傷病=<語>。shobyo の部分一致(別名があれば別名の和集合)。 */
export function resolveDiseaseFilter(query: string | undefined): ResolvedFilter | null {
  const word = (query ?? "").trim();
  if (!word) return null;
  const keys = DISEASE_ALIASES[word] ?? [word];
  return { predicate: (item) => keys.some((key) => item.shobyo.includes(key)), matched: [word] };
}
