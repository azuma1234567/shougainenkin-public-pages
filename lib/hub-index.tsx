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
  tail?: { text: string; href: string; label: string };
};

/** 一覧ページの文言。ここが「入口」の正。 */
export const HUB_INDEX: Record<Kind, IndexSpec> = {
  byoki: {
    title: "病気から探す",
    h1: "病気から探す",
    lead:
      "障害年金は、病名で決まる制度ではありません。ただし、審査で見られるところは病気ごとに違います。あなたの病気で、どこが見られるのかから確認してください。",
    description:
      "障害年金で、その病気のどこが審査で見られるのか。病名ごとに、審査のポイントと結論を分けた実例をまとめています。",
    groups: [
      { label: "精神・発達", paths: ["/byoki/utsu-soukyoku", "/byoki/tekiou-fuan", "/byoki/hattatsu", "/byoki/tougou", "/byoki/chiteki", "/byoki/tenkan"] },
      { label: "内部の病気", paths: ["/byoki/jinzou-touseki", "/byoki/shinzou", "/byoki/tounyou", "/byoki/gan"] },
      { label: "体の障害", paths: ["/byoki/shitai"] },
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
  },
  joukyou: {
    title: "状況から探す",
    h1: "状況から探す",
    lead: "同じ病気でも、いまの暮らし方によって、見られるところと必要な準備が変わります。",
    description: "働きながら、20歳前、ひとり暮らし。いまの状況ごとに、障害年金の審査で見られるところをまとめています。",
  },
  okane: {
    title: "お金の話",
    h1: "お金の話",
    lead: "いくら受け取れるのか。税金はどうなるのか。ほかの制度との関係はどうか。お金まわりの疑問をここにまとめています。",
    description: "障害年金はいくら受け取れるのか。令和8年度の金額、税金、ほかの制度との調整を、公的資料の出典つきでまとめています。",
  },
  erabu: {
    title: "自分でやるか、頼むか",
    h1: "自分でやるか、頼むか",
    lead:
      "申請は自分でもできます。専門家に頼むこともできます。どちらが向いているかは、状況によって変わります。ここでは判断材料だけを置きます。特定の事務所へは誘導しません。",
    description: "障害年金の申請を自分で進めるか、社会保険労務士に頼むか。費用の考え方と選び方の判断材料を、中立にまとめています。",
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
