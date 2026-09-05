import Link from "next/link";
import type { Metadata } from "next";
import { Breadcrumb, PageDate } from "@/components/platform/Platform";
import HubIndexList, { type HubCard, type HubGroup } from "@/components/platform/HubIndexList";
import { HubIndexSearch } from "@/components/platform/HubIndexSearch";
import { hubColumnSlugs } from "@/lib/hubs";
import { SAIKETSU_CASES } from "@/lib/saiketsu";
import { SITE_URL } from "@/lib/constants";
import { latestHubCheckedDate } from "@/lib/hub-content";
import { PUBLISHED_CONTENT_HUBS } from "@/lib/hubs";
import { pageMetadata } from "@/lib/seo";

type Kind = "byoki" | "nayami" | "joukyou" | "okane" | "erabu";

type IndexSpec = {
  title: string;
  h1: string;
  lead: string;
  description: string;
  groups?: { label: string; paths: string[] }[];
  /** 群ごとの1行メモ(群ラベル → 文)。もとは body にあった統計段落 */
  groupNotes?: Record<string, string>;
  /** hero の後・カード一覧の前に出す本文(段落の配列)。[ラベル](/path) はリンクになる */
  body?: string[];
  tail?: { text: string; href: string; label: string };
};

// 段落内の [ラベル](/path) を Link に変換する(HubLanding の MarkdownArticle と同じ表記)
function inlineLinks(text: string) {
  const parts = text.split(/(\[[^\]]+\]\(\/[^)]+\))/g);
  return parts.map((part, index) => {
    const match = part.match(/^\[([^\]]+)\]\((\/[^)]+)\)$/);
    return match ? <Link href={match[2]} key={index}>{match[1]}</Link> : <span key={index}>{part}</span>;
  });
}

/* カードの「一言」。各ハブ本文の「リード(直答)」に書いてあることだけで書いたもの。
   docs/hub-index-sasshin-2026-09-05-instructions.md §3 の表をそのまま写している。**書き換えない。** */
export const HUB_HINTS: Record<string, string> = {
  "/byoki/utsu-soukyoku": "うつ病でも双極性障害でも請求できます。病名ではなく、診断書の「日常生活能力の判定」と「程度」の2欄で目安が決まります。",
  "/byoki/tekiou-fuan": "適応障害・パニック障害・PTSDでも、精神病の病態を示していれば気分障害に準じて認定されます。門は病名で閉まっていません。",
  "/byoki/hattatsu": "ADHDもASDも対象です。IQや学歴は関係なく、対人関係・意思疎通の困難で見られます。初診日は大人になってからで構いません。",
  "/byoki/tougou": "認定基準に名前で書かれている病気です。悩みどころは、初診日をどこに置くかと、発病からの経過の伝え方の2つです。",
  "/byoki/chiteki": "初診日を探す必要がなく、納付要件も問われません。20歳の誕生日の前日が障害認定日で、19歳9か月から準備できます。",
  "/byoki/tenkan": "認定基準に名前で書かれている病気です。発作が続いているなら、その記録がそのまま評価の材料になります。見られるのは発作の型と頻度。",
  "/byoki/ninchishou": "認知症は対象です。65歳前の発症なら、老齢年金までの空白を障害年金が埋めます。家族が進めることを前提に書いています。",
  "/byoki/koujinou": "高次脳機能障害は「器質性精神障害」として対象です。歩けて話せるぶん困難が伝わりにくいので、伝え方が結果を分けます。",
  "/byoki/izon": "幻覚や妄想など精神病性の症状が出ていれば対象になりえます。うつ病や肝臓の病気との併存も含め、全体で見ると道が見えます。",
  "/byoki/jinzou-touseki": "人工透析を受けている方は、原則2級です。",
  "/byoki/shinzou": "ペースメーカー・ICD・人工弁を入れた方は、原則3級です。心不全は検査値と生活の制限度で見られます。",
  "/byoki/tounyou": "合併症があるか、インスリンを使っても血糖が安定しないなら対象です。糖尿病そのものだけでは、原則、等級に該当しません。",
  "/byoki/gan": "がんは対象です。病期や腫瘍の大きさではなく、局所の障害・全身の衰弱・治療の副作用を総合して判断されます。",
  "/byoki/kanzou": "肝硬変などの肝疾患は対象です。検査の数値と「一般状態区分」の組み合わせで見られ、強い倦怠感も伝えるべき実態です。",
  "/byoki/kokyuuki": "在宅酸素療法をしている方は、原則3級です。",
  "/byoki/ketsueki": "白血病や悪性リンパ腫、再生不良性貧血、血友病なども対象です。検査所見と生活の制限度、治療のつらさで見られます。",
  "/byoki/shitai": "人工関節、脳卒中の後遺症、脊髄損傷、リウマチ。見られるのは診断名ではなく、歩ける距離や手の動作です。",
  "/byoki/shikaku": "視力だけでなく視野も対象です。緑内障や網膜色素変性症で見える範囲が狭いなら、視力が保たれていても該当しえます。",
  "/byoki/choukaku": "両耳の平均純音聴力レベルと語音明瞭度で判断されます。",
  "/byoki/gengo": "話す機能と、そしゃく・嚥下(飲み込む)の機能の障害も対象です。",
  "/byoki/nanbyou": "どの節にもあてはまらない傷病は「その他の疾患」として総合的に判断されます。線維筋痛症や慢性疲労症候群には、医師向けの留意事項も公表されています。",
  "/joukyou/hatarakinagara": "働きながらでも請求できます。ガイドラインは「労働に従事していることをもって直ちに日常生活能力が向上したとは捉えない」としています。",
  "/joukyou/hatachi-mae": "納付要件が問われず、初診日の証明も緩和されています。受け取れるのは障害基礎年金で、本人の所得による調整があります。",
  "/joukyou/hitorigurashi": "一人暮らしでも請求できます。見られるのは一人で暮らしている事実ではなく、その暮らしがどう成り立っているかです。",
  "/joukyou/shoubyou-teatekin-kara": "傷病手当金が通算1年6か月で終わるころに、障害年金を請求できる時期(初診日から1年6か月)が来ます。手当金があるうちに準備を始めます。",
  "/joukyou/65sai-ijou": "受給に年齢の上限はありません。ただし事後重症請求は65歳の誕生日の前々日まで。老齢年金の繰上げの前に確認してください。",
  "/joukyou/shufu-mushoku": "収入がなくても請求できます。第3号被保険者の期間は、自分で払っていなくても「納付済期間」です。",
  "/joukyou/gakusei": "学生でも請求できます。20歳になったら学生納付特例の手続きを。手続きをした期間は未納になりません。",
  "/joukyou/kazoku-ga-tetsudau": "委任状があれば家族が相談や手続きを代理でき、申立書は代筆できます。家族にしかできないのは「本人が言わない事実」を診察に持ち込むことです。",
  "/joukyou/seikatsu-hogo": "生活保護を受けていても請求できます。福祉事務所から勧められるのは、生活保護の補足性の原則(生活保護法第4条)のためです。",
};

/* 絞り込みの別名(/byoki のみ)。ハブの title に既に出ている語だけ(同 §3)。 */
export const HUB_ALIASES: Record<string, string[]> = {
  "/byoki/hattatsu": ["ADHD", "ASD", "自閉スペクトラム"],
  "/byoki/tekiou-fuan": ["パニック障害", "PTSD", "不安障害", "神経症"],
  "/byoki/utsu-soukyoku": ["うつ", "双極", "躁うつ"],
  "/byoki/shinzou": ["ペースメーカー", "人工弁", "心不全", "ICD"],
  "/byoki/jinzou-touseki": ["透析", "腎"],
  "/byoki/shitai": ["人工関節", "脊髄", "リウマチ", "麻痺"],
  "/byoki/ninchishou": ["若年性"],
  "/byoki/koujinou": ["高次脳"],
  "/byoki/izon": ["アルコール", "薬物"],
  "/byoki/nanbyou": ["難病", "線維筋痛症", "慢性疲労"],
};

/* 群の1行メモ(/byoki)。もとは body の統計段落(同 §4)。 */
const BYOKI_GROUP_NOTES: Record<string, string> = {
  "精神・発達": "新しく決まった障害年金の70.3%が精神の障害によるものです(令和6年度)。病名ではなく、診断書の2つの欄の組み合わせで目安が決まります。",
  "内部の病気": "不支給の割合が20.6%と、精神(12.1%)・外部障害(10.8%)より高い分野です。検査の数値と、生活の制限度の組み合わせで見られます。",
  "体・感覚の障害": "診断名ではなく、動作や検査の数値で見られます。認定基準がいちばん細かく決まっている分野です。",
};

/** 一覧ページの文言。ここが「入口」の正。 */
export const HUB_INDEX: Record<Kind, IndexSpec> = {
  byoki: {
    title: "病気から探す",
    h1: "病気から探す",
    lead:
      "障害年金は、病名で決まる制度ではありません。ただし、審査で見られるところは病気ごとに違います。自分の病気で、どこが見られるのかから確認してください。",
    description:
      "障害年金で、その病気のどこが審査で見られるのか。病名ごとに、審査のポイントと結論を分けた実例をまとめています。",
    body: [
      "病名で探すページです。同じ「うつ病」でも、初診日にどの制度に入っていたか、いまの生活にどれだけ支障があるかで結果は変わります。だから各ページは、病名の説明ではなく、「その病気で審査に見られるところ」「診断書の様式」「つまずきやすい場所」の順に並べています。",
      "病名が2つ以上ある人は、生活の支障がいちばん大きい病気のページから読んでください。精神と身体の両方がある場合は、診断書が2枚になることがあります。",
      "病名が一覧にないときは、[悩みから探す](/nayami)か、[はじめての方へ](/hajimete)へ。",
    ],
    groupNotes: BYOKI_GROUP_NOTES,
    groups: [
      { label: "精神・発達", paths: ["/byoki/utsu-soukyoku", "/byoki/tekiou-fuan", "/byoki/hattatsu", "/byoki/tougou", "/byoki/chiteki", "/byoki/tenkan", "/byoki/ninchishou", "/byoki/koujinou", "/byoki/izon"] },
      { label: "内部の病気", paths: ["/byoki/jinzou-touseki", "/byoki/shinzou", "/byoki/tounyou", "/byoki/gan", "/byoki/kanzou", "/byoki/kokyuuki", "/byoki/ketsueki"] },
      { label: "体・感覚の障害", paths: ["/byoki/shitai", "/byoki/shikaku", "/byoki/choukaku", "/byoki/gengo"] },
      { label: "その他の疾患", paths: ["/byoki/nanbyou"] },
    ],
    tail: {
      text: "ここに無い病気でも、障害年金の対象になることがあります。決まるのは病名ではなく、生活や仕事にどれだけ支障があるかです。",
      href: "/nayami",
      label: "悩みから探す",
    },
  },
  nayami: {
    title: "悩みから探す",
    h1: "悩みから探す",
    lead: "いま止まっているところから選んでください。手続きの順番ではなく、困っている場所で並べています。",
    description: "不支給、診断書、初診日、更新、支給停止、遡及。障害年金でつまずきやすい場面ごとに、次の一手をまとめています。",
    body: [
      "手続きの順番ではなく、「いま止まっているところ」で並べたページです。初診日が分からない、診断書で困っている、不支給と言われた、更新が不安、さかのぼって請求したい。どれも、同じ場所で同じようにつまずく人が多い悩みです。",
      "各ページは、まず「いまの状況を確かめる質問」から始まります。読む前に、手元に年金証書や診断書の控えがあれば出しておいてください。",
      "当サイトが整理した裁決事例91件では、争点は障害の程度が57件、初診日が35件、診断書が15件、納付要件が10件でした。悩みの多くは、この4つのどれかに入ります。",
      "どれに当てはまるか分からないときは、[はじめての方へ](/hajimete)から。",
      "不支給の通知が届いた人は、通知を受けた翌日から3か月以内に審査請求ができます。期限があるのは、この悩みだけです。先に[不支給と言われた](/nayami/fushikyu)を読んでください。",
    ],
  },
  joukyou: {
    title: "状況から探す",
    h1: "状況から探す",
    lead: "同じ病気でも、いまの暮らし方によって、見られるところと必要な準備が変わります。",
    description: "働きながら、20歳前、ひとり暮らし。いまの状況ごとに、障害年金の審査で見られるところをまとめています。",
    body: [
      "病名が同じでも、働いているか、一人暮らしか、20歳前に初診があるか、で見られるところが変わります。このページは、いまの暮らし方から入る入口です。",
      "働いている人は、働けている「条件」が審査の材料になります。一人暮らしの人は、支援の有無と、できていない実態が材料です。20歳前に初診がある人は、納付要件が問われない代わりに、本人の所得制限があります。",
      "国のガイドラインは、労働に従事していることだけで日常生活能力が向上したとは捉えない、と書いています。一人暮らしについても、その理由や時期を考慮するとしています。状況は不利の理由ではなく、書き方が変わるだけです。",
      "自分の状況が2つ以上重なる人は、両方のページを読んでください。矛盾はしません。",
    ],
  },
  okane: {
    title: "お金の話",
    h1: "お金の話",
    lead: "いくら受け取れるのか。税金はどうなるのか。ほかの制度との関係はどうか。お金まわりの疑問をここにまとめています。",
    description: "障害年金はいくら受け取れるのか。令和8年度の金額、税金、ほかの制度との調整を、公的資料の出典つきでまとめています。",
    body: [
      "いくら受け取れるのか、税金はどうなるのか、他の制度とどう重なるのか。お金まわりの疑問をここにまとめています。",
      "先に骨組みだけ。障害基礎年金は2級で年847,300円、1級で年1,059,125円(令和8年度)。障害厚生年金は給与と加入期間で変わりますが、3級でも最低保障が年635,500円あります。子がいれば1人目・2人目は各243,800円が上乗せ。年金生活者支援給付金は1級で月7,025円、2級で月5,620円です。",
      "税金はかかりません。貯金があっても関係ありません。差押えもされません。ただし健康保険の扶養では収入として数えます。ここが、いちばん驚かれるところです。",
      "金額は毎年4月に改定されます。このページの数字は令和8年度のもので、各ページに確認日を書いています。",
      "初回の振込は、請求から年金証書が届くまで約3か月、そこから約1〜2か月後です。おおむね4〜5か月を見ておいてください。その後は偶数月の15日に、前月までの2か月分が振り込まれます。",
    ],
  },
  erabu: {
    title: "自分でやるか、頼むか",
    h1: "自分でやるか、頼むか",
    lead:
      "申請は自分でもできます。専門家に頼むこともできます。どちらが向いているかは、状況によって変わります。ここでは判断材料だけを置きます。特定の事務所へは誘導しません。",
    description: "障害年金の申請を自分で進めるか、社会保険労務士に頼むか。費用の考え方と選び方の判断材料を、中立にまとめています。",
    body: [
      "自分で申請するか、アプリを使うか、社会保険労務士に頼むか。ここは、その比べ方のページです。",
      "先に事実を3つ。請求に国へ払う手数料はありません。報酬を得て代行できるのは、法律上、社会保険労務士だけです。「年金機構公認」の代行はありません。",
      "自分でやる人がいちばん困るのは、申立書と診断書の整合です。頼む人がいちばん困るのは、費用の相場と、依頼先の見分け方です。どちらの困りごとも、それぞれのページに具体的に書いています。",
      "書類集めの体力がないこと自体が、依頼を検討する十分な理由になります。逆に、体力があって時間もあるなら、自分で出して不支給でも審査請求の道は残ります。決めるのは本人ですが、材料はここに揃えました。",
    ],
  },
};

export function hubIndexMetadata(kind: Kind): Metadata {
  const spec = HUB_INDEX[kind];
  return pageMetadata({ title: spec.title, description: spec.description, path: `/${kind}` });
}

/* 実例の件数。hub の jitsureiFilter("傷病=うつ・双極" の形)を SAIKETSU_CASES に当てる。
   「・」は「または」。当てはまるものが無ければ 0 で、0 のときはカードに出さない。 */
function caseCount(filter?: string): number {
  if (!filter) return 0;
  const terms = filter.replace(/^傷病=/, "").split("・").map((s) => s.trim()).filter(Boolean);
  if (terms.length === 0) return 0;
  return SAIKETSU_CASES.filter((item) => terms.some((term) => item.shobyo.includes(term))).length;
}

const anchorOf = (label: string, index: number) => `group-${index + 1}`;

export function renderHubIndex(kind: Kind) {
  const spec = HUB_INDEX[kind];
  const hubs = PUBLISHED_CONTENT_HUBS.filter((item) => item.kind === kind);
  const byPath = new Map(hubs.map((item) => [item.path, item]));

  const toCard = (path: string): HubCard | null => {
    const hub = byPath.get(path);
    if (!hub) return null;
    const aliases = HUB_ALIASES[path] ?? [];
    return {
      path,
      label: hub.label,
      hint: HUB_HINTS[path],
      columns: hubColumnSlugs(path).length,
      cases: caseCount(hub.jitsureiFilter),
      terms: [hub.label, hub.shortLabel, ...aliases].join(" ").toLowerCase(),
    };
  };

  const groups: HubGroup[] = (
    spec.groups
      ? spec.groups.map((group, index) => ({
          label: group.label,
          note: spec.groupNotes?.[group.label],
          anchor: anchorOf(group.label, index),
          items: group.paths.map(toCard).filter((card): card is HubCard => card !== null),
        }))
      : [{ label: "", note: undefined, anchor: "group-1", items: hubs.map((hub) => toCard(hub.path)).filter((card): card is HubCard => card !== null) }]
  ).filter((group) => group.items.length > 0);

  const total = groups.reduce((n, group) => n + group.items.length, 0);
  /* 病名が多い /byoki だけ絞り込みを出す。9件以下のページには出さない。 */
  const filterable = kind === "byoki";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: spec.title,
    description: spec.description,
    url: `${SITE_URL}/${kind}`,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: total,
      itemListElement: groups.flatMap((group) => group.items).map((card, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: card.label,
        url: `${SITE_URL}${card.path}`,
      })),
    },
  };

  return (
    <div className="platform hub-index">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />

      <header className="p-page-hero">
        <div className="p-container">
          <Breadcrumb items={[{ href: "/", label: "トップ" }, { label: spec.title }]} currentPath={`/${kind}`} />
          <h1>{spec.h1}</h1>
          <p className="p-hero-copy hub-index-lead">{spec.lead}</p>
          <p className="hub-index-count">
            <PageDate updated={latestHubCheckedDate(kind)} />
            <span>{total}{kind === "byoki" ? "の病気" : "ページ"}</span>
          </p>
          {/* 分類のチップと、病名の絞り込みを1行に。モックの /byoki の板と同じ並び。 */}
          {(groups.length > 1 && groups[0].label) || filterable ? (
            <div className="hub-index-controls">
              {groups.length > 1 && groups[0].label ? (
                <nav className="hub-index-chips" aria-label="分類へ移動">
                  {groups.map((group) => (
                    <a className="hub-index-chip" href={`#${group.anchor}`} key={group.anchor}>
                      {group.label} {group.items.length}
                    </a>
                  ))}
                </nav>
              ) : null}
              {filterable ? <HubIndexSearch /> : null}
            </div>
          ) : null}
        </div>
      </header>

      <section className="p-section">
        <div className="p-container">
          <HubIndexList groups={groups} />

          {spec.body ? (
            <div className="hub-index-how">
              <b>このページの使い方</b>
              {spec.body.map((paragraph, index) => <p key={index}>{inlineLinks(paragraph)}</p>)}
            </div>
          ) : null}

          {spec.tail ? (
            <p className="p-note hub-index-tail">
              {spec.tail.text} <Link href={spec.tail.href}>{spec.tail.label} →</Link>
            </p>
          ) : null}
        </div>
      </section>
    </div>
  );
}
