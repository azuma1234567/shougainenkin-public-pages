import Link from "next/link";
import type { Metadata } from "next";
import { Breadcrumb, PageDate, SectionHeader } from "@/components/platform/Platform";
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

/** 一覧ページの文言。ここが「入口」の正。 */
export const HUB_INDEX: Record<Kind, IndexSpec> = {
  byoki: {
    title: "病気から探す",
    h1: "病気から探す",
    lead:
      "障害年金は、病名で決まる制度ではありません。ただし、審査で見られるところは病気ごとに違います。あなたの病気で、どこが見られるのかから確認してください。",
    description:
      "障害年金で、その病気のどこが審査で見られるのか。病名ごとに、審査のポイントと結論を分けた実例をまとめています。",
    body: [
      "病名で探すページです。同じ「うつ病」でも、初診日にどの制度に入っていたか、いまの生活にどれだけ支障があるかで結果は変わります。だから各ページは、病名の説明ではなく、「その病気で審査に見られるところ」「診断書の様式」「つまずきやすい場所」の順に並べています。",
      "病名が2つ以上ある人は、生活の支障がいちばん大きい病気のページから読んでください。精神と身体の両方がある場合は、診断書が2枚になることがあります。",
      "令和6年度に新しく決まった障害年金のうち、精神の障害の診断書によるものは70.3%でした。不支給の割合は、内部疾患(心臓・腎臓・糖尿病など)が20.6%と高く、外部障害は10.8%、精神は12.1%です。病気によって、気をつける場所が違います。",
      "病名が一覧にないときは、[悩みから探す](/nayami)か、[はじめての方へ](/hajimete)へ。",
    ],
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
      "各ページは、まず「あなたの状況を確かめる質問」から始まります。読む前に、手元に年金証書や診断書の控えがあれば出しておいてください。",
      "当サイトが整理した裁決事例91件では、争点は障害の程度が57件、初診日が35件、診断書が15件、納付要件が10件でした。悩みの多くは、この4つのどれかに入ります。",
      "どれに当てはまるか分からないときは、[はじめての方へ](/hajimete)から。",
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
      "書類集めの体力がないこと自体が、依頼を検討する十分な理由になります。逆に、体力があって時間もあるなら、自分で出して不支給でも審査請求の道は残ります。決めるのはあなたですが、材料はここに揃えました。",
    ],
  },
};

export function hubIndexMetadata(kind: Kind): Metadata {
  const spec = HUB_INDEX[kind];
  return pageMetadata({ title: spec.title, description: spec.description, path: `/${kind}` });
}

export function renderHubIndex(kind: Kind) {
  const spec = HUB_INDEX[kind];
  const hubs = PUBLISHED_CONTENT_HUBS.filter((item) => item.kind === kind);
  const byPath = new Map(hubs.map((item) => [item.path, item]));

  const groups =
    spec.groups
      ? spec.groups
          .map((group) => ({ label: group.label, items: group.paths.map((path) => byPath.get(path)).filter(Boolean) }))
          .filter((group) => group.items.length > 0)
      : [{ label: "", items: hubs }];

  return (
    <div className="platform">
      <header className="p-page-hero">
        <div className="p-container hub-reading-width">
          <Breadcrumb items={[{ href: "/", label: "トップ" }, { label: spec.title }]} currentPath={`/${kind}`} />
          <h1>{spec.h1}</h1>
          <p className="p-hero-copy">{spec.lead}</p>
          <PageDate updated={latestHubCheckedDate(kind)} />
        </div>
      </header>

      {spec.body ? (
        <section className="p-section hub-index-body">
          <div className="p-container hub-reading-width">
            {spec.body.map((paragraph, index) => <p key={index}>{inlineLinks(paragraph)}</p>)}
          </div>
        </section>
      ) : null}

      <section className="p-section">
        <div className="p-container">
          {groups.map((group) => (
            <div key={group.label || "all"} style={{ marginBottom: 28 }}>
              {group.label ? <SectionHeader title={group.label} /> : null}
              <div className="p-grid">
                {group.items.map((item) => (
                  <Link className="p-card" href={item!.path} key={item!.path}>
                    <h3 className="p-card-title">{item!.label}</h3>
                    <span className="p-card-link">読む →</span>
                  </Link>
                ))}
              </div>
            </div>
          ))}

          {spec.tail ? (
            <p className="p-note">
              {spec.tail.text} <Link href={spec.tail.href}>{spec.tail.label} →</Link>
            </p>
          ) : null}
        </div>
      </section>
    </div>
  );
}
