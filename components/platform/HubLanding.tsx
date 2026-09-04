import MarkdownArticle from "@/components/MarkdownArticle";
import { DouguCards } from "@/components/platform/DouguCard";
import { PLACEMENTS, visiblePlacements } from "@/data/dougu";
import HubGokai from "@/components/platform/HubGokai";
import Link from "next/link";
import { Breadcrumb, PageDate } from "@/components/platform/Platform";
import { extractHubFaqs, getHubContent } from "@/lib/hub-content";
import { faqJsonLd } from "@/lib/seo";
import { hubColumnSlugs, type HubDefinition } from "@/lib/hubs";
import { getColumn } from "@/lib/columns";

const siblingLinks: Record<string, string[]> = {
  "/byoki/tounyou": ["/byoki/jinzou-touseki"],
  "/byoki/jinzou-touseki": ["/byoki/tounyou"],
  "/byoki/shinzou": ["/byoki/shitai"],
  "/byoki/chiteki": ["/byoki/hattatsu"],
  "/byoki/hattatsu": ["/byoki/chiteki"],
  "/byoki/ninchishou": ["/byoki/koujinou"],
  "/byoki/koujinou": ["/byoki/ninchishou", "/byoki/gengo", "/byoki/shitai"],
  "/byoki/gengo": ["/byoki/koujinou"],
  "/byoki/kanzou": ["/byoki/gan"],
  "/byoki/gan": ["/byoki/kanzou", "/byoki/ketsueki"],
  "/byoki/ketsueki": ["/byoki/gan"],
  "/byoki/kokyuuki": ["/byoki/shinzou"],
  "/byoki/shikaku": ["/byoki/tounyou"],
  "/byoki/choukaku": ["/byoki/gengo"],
  "/byoki/nanbyou": ["/byoki/shitai"],
};
const siblingLabels: Record<string, string> = {
  "/byoki/tounyou": "糖尿病", "/byoki/jinzou-touseki": "腎臓病・人工透析",
  "/byoki/shinzou": "心臓病", "/byoki/shitai": "肢体の障害",
  "/byoki/chiteki": "知的障害", "/byoki/hattatsu": "発達障害",
  "/byoki/ninchishou": "認知症(若年性を含む)", "/byoki/koujinou": "高次脳機能障害", "/byoki/izon": "依存症",
  "/byoki/kanzou": "肝臓の病気", "/byoki/kokyuuki": "呼吸器の病気", "/byoki/ketsueki": "血液・造血器の病気",
  "/byoki/shikaku": "目の障害", "/byoki/choukaku": "耳の障害・めまい", "/byoki/gengo": "話す・食べる機能の障害", "/byoki/nanbyou": "難病・その他の病気",
};

export default function HubLanding({ hub }: { hub: HubDefinition }) {
  const content = getHubContent(hub.path);
  if (!content) return null;
  const crumbs = content.breadcrumb.map((label, index) => ({ label, href: index === 0 ? "/" : undefined }));
  /* FAQ の構造化データ(監査 §4-2)。本文から取り出したものだけ。画面に無い Q/A は入れない。
     パンくずは <Breadcrumb> が BreadcrumbList を出しているので、ここでは出さない(二重になる)。
     Article も出さない(ハブはまとめページ。無理に付けると列記事と競合する)。 */
  const faqs = extractHubFaqs(content.source);
  /* ハブ → 記事 の導線(指示書 2026-09-04 その2 §2 T8)。
     手書きの siblingLinks は増やさず、記事側の棚割りを逆引きして出す。 */
  const themeColumns = hubColumnSlugs(hub.path).map(getColumn);
  return <div className={`platform hub-landing${hub.kind === "erabu" ? " hub-erabu" : ""}`}>
    {faqs.length > 0 && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(faqs)).replace(/</g, "\\u003c") }} />}
    <header className="p-page-hero"><div className="p-container hub-reading-width"><Breadcrumb items={crumbs} currentPath={hub.path} /><h1>{content.title}</h1><PageDate updated={content.dateModified} /></div></header>
    <article className="p-container hub-reading-width hub-content" {...(hub.kind === "erabu" ? { "data-yougo-skip": "" } : {})}>
      <MarkdownArticle
        source={content.source}
        appCtaSlug={`hub-${hub.path.split("/").filter(Boolean).join("-")}`}
        faqAccordion
        /* 道具カードはリードの直後に差し込む。ハブ本文(data/hubs/*.json)は触らない。 */
        leadNotice={visiblePlacements(PLACEMENTS.hubs[hub.path]).length
          ? <DouguCards key="dougu" placements={PLACEMENTS.hubs[hub.path]} variant="hub" />
          : undefined}
      />
      {hub.kind !== "erabu" ? <HubGokai hubPath={hub.path} /> : null}
      {siblingLinks[hub.path]?.length ? <nav className="hub-sibling-links" aria-label="関連する病名ハブ">
        {siblingLinks[hub.path].map((path) => <Link key={path} href={path}>{siblingLabels[path]} →</Link>)}
      </nav> : null}
      {themeColumns.length > 0 ? <section className="related-columns hub-theme-columns">
        <h2>このテーマの記事</h2>
        <ul>{themeColumns.map((column) => <li key={column.slug}><Link href={`/columns/${column.slug}`}>{column.title}</Link></li>)}</ul>
      </section> : null}
    </article>
  </div>;
}
