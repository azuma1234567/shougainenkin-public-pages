export type HubRole = "promote" | "core" | "leaf";

export type ColumnHubAssignment = {
  primary: string;
  secondary: string[];
  role: HubRole;
  mergeCandidate: string | null;
};

export type HubDefinition = {
  path: string;
  label: string;
  shortLabel: string;
  kind: "byoki" | "joukyou" | "nayami" | "okane" | "erabu" | "existing" | "reserved";
  published: boolean;
  relatedSlugs: string[];
  jitsureiFilter?: string;
};

const hub = (
  path: string,
  label: string,
  shortLabel: string,
  kind: HubDefinition["kind"],
  published: boolean,
  relatedSlugs: string[] = [],
  jitsureiFilter?: string,
): HubDefinition => ({ path, label, shortLabel, kind, published, relatedSlugs, jitsureiFilter });

export const HUBS: HubDefinition[] = [
  hub("/", "障害年金ノート", "トップ", "existing", true),
  hub("/hajimete", "はじめての方へ", "はじめて", "existing", true, ["techou-to-nenkin"]),
  hub("/shinsei", "障害年金の申請の流れ", "申請の流れ", "existing", true),
  hub("/shinsei#step-1", "申請ステップ1 制度を確認する", "ステップ1", "existing", true, ["ninteibi-jigojusho", "kiso-kousei-chigai"]),
  hub("/shinsei#step-2", "申請ステップ2 初診日を確認する", "ステップ2", "existing", true, ["shakaiteki-chiyu", "shoshinbi-wakaranai", "jushinjokyo-shomeisho"]),
  hub("/shinsei#step-3", "申請ステップ3 納付要件を確認する", "ステップ3", "existing", true, ["hatachi-mae", "nofu-yoken"]),
  hub("/shinsei#step-4", "申請ステップ4 年金事務所で相談する", "ステップ4", "existing", true, ["nenkin-jimusho-soudan"]),
  hub("/shinsei#step-5", "申請ステップ5 診断書を依頼する", "ステップ5", "existing", true, ["hitsuyou-shorui-seishin", "shindansho-irai-timing", "shindansho-tanomikata", "shindansho-ishi-ni-tsutaeru", "nichijo-seikatsu-7koumoku", "shindansho-kakunin", "tokyu-hantei-guideline"]),
  hub("/shinsei#step-6", "申請ステップ6 申立書を作成する", "ステップ6", "existing", true, ["moushitatesho-kakikata", "moushitatesho-kikan-kugiri", "moushitatesho-mijushin-kikan", "kazoku-enjo-kakikata", "moushitatesho-a4-insatsu"]),
  hub("/shinsei#step-7", "申請ステップ7 書類を提出する", "ステップ7", "existing", true, ["teishutsusaki-yuusou", "shinsa-shikumi-nintei-i", "shinsei-kikan"]),
  hub("/shinsei#step-8", "申請ステップ8 結果を確認する", "ステップ8", "existing", true, ["jukyuugo-tetsuduki", "koushin-kakuninhodo"]),
  hub("/byoki/utsu-soukyoku", "うつ病・双極性障害", "うつ病・双極性障害", "byoki", true, ["hitsuyou-shorui-seishin", "shindansho-ishi-ni-tsutaeru", "nichijo-seikatsu-7koumoku", "tokyu-hantei-guideline", "moushitatesho-kakikata", "hatarakinagara", "shindansho-kakunin"], "傷病=うつ・双極"),
  hub("/byoki/tekiou-fuan", "適応障害・不安障害・神経症・PTSD", "適応障害・不安障害", "byoki", true, ["taishou-shoubyou-kyoukai", "tekio-shogai-shogai-nenkin", "hitsuyou-shorui-seishin"], "傷病=神経症・PTSD"),
  hub("/byoki/hattatsu", "発達障害", "発達障害", "byoki", true, ["hattatsu-shougai", "hitsuyou-shorui-seishin"], "傷病=発達"),
  hub("/joukyou/hatarakinagara", "働きながら申請するとき", "働きながら", "joukyou", true, ["hatarakinagara", "shougaisha-koyou-nenkin", "tokyu-hantei-guideline"], "争点=就労"),
  hub("/joukyou/hatachi-mae", "20歳前に初診日があるとき", "20歳前", "joukyou", true, ["hatachi-mae", "nofu-yoken"], "争点=20歳前"),
  hub("/joukyou/shoubyou-teatekin-kara", "傷病手当金から障害年金を考えるとき", "傷病手当金から", "joukyou", true, ["shoubyou-teatekin", "kiso-kousei-chigai"]),
  hub("/joukyou/hitorigurashi", "一人暮らしで申請するとき", "一人暮らし", "joukyou", true, ["hitorigurashi-furi", "nichijo-seikatsu-7koumoku"]),
  hub("/nayami/fushikyu", "不支給と言われたとき", "不支給", "nayami", true, ["fushikyuu-shinsa-seikyu", "shinsa-shikumi-nintei-i", "shinsei-kikan", "shindansho-jittai-chigau"], "結論=棄却・一部容認"),
  hub("/nayami/shindansho-komatta", "診断書で困ったとき", "診断書で困った", "nayami", true, ["shindansho-irai-timing", "shindansho-tanomikata", "shindansho-kaitekurenai", "shindansho-ishi-ni-tsutaeru", "nichijo-seikatsu-7koumoku", "shinsatsu-mae-memo", "shindansho-kakunin", "shindansho-jittai-chigau"], "争点=診断書"),
  hub("/nayami/shoshinbi-karute", "初診日のカルテがないとき", "初診日・カルテ", "nayami", true, ["shakaiteki-chiyu", "shoshinbi-wakaranai", "shoshinbi-karute-nashi", "shoshinbi-haiin", "daisansha-shomei", "jushinjokyo-shomeisho", "moushitatesho-mijushin-kikan"], "争点=初診日"),
  hub("/nayami/koushin", "更新や額改定で困ったとき", "更新・額改定", "nayami", true, ["jukyuugo-tetsuduki", "koushin-kakuninhodo", "gaku-kaitei-seikyuu", "shikyuu-teishi-fukkatsu"], "争点=更新・額改定"),
  hub("/nayami/shikyuu-teishi", "障害年金が止まったとき", "支給停止", "nayami", true, ["shikyuu-teishi-fukkatsu", "koushin-kakuninhodo"], "争点=支給停止"),
  hub("/nayami/sokyuu", "障害認定日までさかのぼって請求するとき", "遡及請求", "nayami", true, ["ninteibi-jigojusho", "sokyuu-seikyuu", "ikura-moraeru"], "争点=認定日・遡及"),
  hub("/okane/ikura", "障害年金はいくら受け取れるか", "年金額", "okane", true, ["hikazei-shuunyuu", "ikura-moraeru", "sokyuu-seikyuu", "kiso-kousei-chigai", "gaku-kaitei-seikyuu", "jukyuugo-tetsuduki"]),
  hub("/erabu/jibun-ka-irai", "自分で申請するか、依頼するか", "自分で・依頼", "erabu", true, ["jibun-de-shinsei", "nenkin-jimusho-soudan", "shinsei-shindoi"]),
  ...[
    "/byoki/tougou", "/byoki/chiteki", "/byoki/tenkan", "/byoki/ninchishou", "/byoki/izon", "/byoki/jinzou-touseki", "/byoki/tounyou", "/byoki/shinzou", "/byoki/gan", "/byoki/kanzou", "/byoki/kokyuuki", "/byoki/ketsueki", "/byoki/shitai", "/byoki/shikaku", "/byoki/choukaku-heikou", "/byoki/soshaku-gengo", "/byoki/nanbyou-sonota",
    "/joukyou/65sai-ijou", "/joukyou/shufu-mushoku", "/joukyou/gakusei", "/joukyou/kazoku-ga-tetsudau", "/joukyou/seikatsu-hogo",
    "/suuji", "/gokai", "/okane/zeikin", "/okane/chousei", "/erabu/irai-subeki-case", "/erabu/hiyou-souba", "/erabu/erabikata", "/erabu/fushikyu-no-ato", "/senmonka",
  ].map((path) => hub(path, path, path, "reserved", false)),
];

export const HUB_BY_PATH = new Map(HUBS.map((item) => [item.path, item]));

const assignment = (primary: string, role: HubRole, secondary: string[] = [], mergeCandidate: string | null = null): ColumnHubAssignment => ({ primary, secondary, role, mergeCandidate });

export const COLUMN_HUB_ASSIGNMENTS: Record<string, ColumnHubAssignment> = {
  "shakaiteki-chiyu": assignment("/nayami/shoshinbi-karute", "leaf", ["/shinsei#step-2"]),
  "hikazei-shuunyuu": assignment("/okane/ikura", "core", ["/gokai"]),
  "jukyuugo-tetsuduki": assignment("/nayami/koushin", "leaf", ["/shinsei#step-8"]),
  "taishou-shoubyou-kyoukai": assignment("/byoki/tekiou-fuan", "promote", ["/gokai"], "tekio-shogai-shogai-nenkin"),
  "tekio-shogai-shogai-nenkin": assignment("/byoki/tekiou-fuan", "core", [], "taishou-shoubyou-kyoukai"),
  "hattatsu-shougai": assignment("/byoki/hattatsu", "promote", ["/shinsei"]),
  "ninteibi-jigojusho": assignment("/nayami/sokyuu", "core", ["/shinsei#step-1"], "sokyuu-seikyuu"),
  "ikura-moraeru": assignment("/okane/ikura", "promote", ["/shinsei"]),
  "sokyuu-seikyuu": assignment("/nayami/sokyuu", "promote", ["/okane/ikura"], "ninteibi-jigojusho"),
  "kiso-kousei-chigai": assignment("/shinsei#step-1", "core", ["/okane/ikura"]),
  "hatachi-mae": assignment("/joukyou/hatachi-mae", "promote", ["/shinsei#step-3"]),
  "shoubyou-teatekin": assignment("/joukyou/shoubyou-teatekin-kara", "promote", ["/okane/chousei"]),
  "techou-to-nenkin": assignment("/gokai", "core", ["/hajimete"]),
  "shougaisha-koyou-nenkin": assignment("/joukyou/hatarakinagara", "core", ["/jitsurei"]),
  "shoshinbi-wakaranai": assignment("/nayami/shoshinbi-karute", "promote", ["/shinsei#step-2"], "shoshinbi-karute-nashi"),
  "shoshinbi-karute-nashi": assignment("/nayami/shoshinbi-karute", "core", [], "shoshinbi-wakaranai"),
  "shoshinbi-haiin": assignment("/nayami/shoshinbi-karute", "leaf"),
  "daisansha-shomei": assignment("/nayami/shoshinbi-karute", "leaf"),
  "nofu-yoken": assignment("/shinsei#step-3", "core", ["/joukyou/hatachi-mae"]),
  "shinsei-shindoi": assignment("/shinsei", "core", ["/hajimete"]),
  "nenkin-jimusho-soudan": assignment("/shinsei#step-4", "core", ["/erabu/jibun-ka-irai"]),
  "jibun-de-shinsei": assignment("/erabu/jibun-ka-irai", "promote", ["/shinsei"]),
  "teishutsusaki-yuusou": assignment("/shinsei#step-7", "core"),
  "jushinjokyo-shomeisho": assignment("/shinsei#step-2", "core", ["/nayami/shoshinbi-karute"]),
  "hitsuyou-shorui-seishin": assignment("/shinsei#step-5", "core", ["/byoki/utsu-soukyoku", "/byoki/tekiou-fuan"]),
  "shindansho-irai-timing": assignment("/shinsei#step-5", "leaf", ["/nayami/shindansho-komatta"]),
  "shindansho-tanomikata": assignment("/shinsei#step-5", "core", ["/nayami/shindansho-komatta"]),
  "shindansho-kaitekurenai": assignment("/nayami/shindansho-komatta", "promote", ["/shinsei#step-5"]),
  "shindansho-ishi-ni-tsutaeru": assignment("/shinsei#step-5", "core", ["/byoki/utsu-soukyoku"], "shinsatsu-mae-memo"),
  "nichijo-seikatsu-7koumoku": assignment("/shinsei#step-5", "core", ["/byoki/utsu-soukyoku"]),
  "shinsatsu-mae-memo": assignment("/shinsei#step-5", "leaf", ["/nayami/shindansho-komatta"], "shindansho-ishi-ni-tsutaeru"),
  "hitorigurashi-furi": assignment("/joukyou/hitorigurashi", "promote", ["/gokai"]),
  "shindansho-kakunin": assignment("/nayami/shindansho-komatta", "core", ["/shinsei#step-5"]),
  "tokyu-hantei-guideline": assignment("/byoki/utsu-soukyoku", "core", ["/shinsei#step-5"]),
  "shindansho-jittai-chigau": assignment("/nayami/shindansho-komatta", "core"),
  "moushitatesho-kakikata": assignment("/shinsei#step-6", "core", ["/byoki/utsu-soukyoku"]),
  "moushitatesho-kikan-kugiri": assignment("/shinsei#step-6", "leaf"),
  "moushitatesho-mijushin-kikan": assignment("/shinsei#step-6", "leaf", ["/nayami/shoshinbi-karute"]),
  "hatarakinagara": assignment("/joukyou/hatarakinagara", "promote", ["/gokai"]),
  "kazoku-enjo-kakikata": assignment("/shinsei#step-6", "core", ["/joukyou/kazoku-ga-tetsudau"]),
  "moushitatesho-a4-insatsu": assignment("/shinsei#step-6", "leaf"),
  "shinsa-shikumi-nintei-i": assignment("/nayami/fushikyu", "core", ["/shinsei#step-7"]),
  "shinsei-kikan": assignment("/shinsei#step-7", "core", ["/nayami/fushikyu"]),
  "fushikyuu-shinsa-seikyu": assignment("/nayami/fushikyu", "promote", ["/erabu/fushikyu-no-ato"]),
  "koushin-kakuninhodo": assignment("/nayami/koushin", "promote", ["/shinsei#step-8"]),
  "gaku-kaitei-seikyuu": assignment("/nayami/koushin", "core", ["/okane/ikura"]),
  "shikyuu-teishi-fukkatsu": assignment("/nayami/shikyuu-teishi", "promote", ["/nayami/koushin"]),
};

export function getHub(path: string): HubDefinition | null {
  return HUB_BY_PATH.get(path) ?? null;
}

export function publishedHubLinks(assignment: ColumnHubAssignment): HubDefinition[] {
  return [assignment.primary, ...assignment.secondary]
    .map(getHub)
    .filter((item): item is HubDefinition => Boolean(item?.published));
}

const EXPLICIT_SIBLINGS: Record<string, string[]> = {
  hatarakinagara: ["shougaisha-koyou-nenkin"],
  "shougaisha-koyou-nenkin": ["hatarakinagara"],
};

export function siblingSlugs(slug: string): string[] {
  const assignment = COLUMN_HUB_ASSIGNMENTS[slug];
  return [...new Set([
    ...(assignment?.mergeCandidate ? [assignment.mergeCandidate] : []),
    ...(EXPLICIT_SIBLINGS[slug] ?? []),
  ])];
}

export const PUBLISHED_CONTENT_HUBS = HUBS.filter((item) => item.published && ["byoki", "joukyou", "nayami", "okane", "erabu"].includes(item.kind));

export const UNIT_PACK_TO_HUBS: Record<string, string[]> = {
  firstVisit: ["/shinsei#step-2", "/nayami/shoshinbi-karute"],
  doctorPrep: ["/shinsei#step-5", "/nayami/shindansho-komatta"],
  statement: ["/shinsei#step-6"],
  payment: ["/okane/ikura", "/joukyou/hatachi-mae", "/nayami/sokyuu"],
  position: ["/byoki/utsu-soukyoku", "/byoki/tekiou-fuan", "/byoki/hattatsu"],
};
