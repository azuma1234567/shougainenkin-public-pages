import MarkdownArticle from "@/components/MarkdownArticle";
import { DouguCards } from "@/components/platform/DouguCard";
import { PLACEMENTS, visiblePlacements } from "@/data/dougu";
import HubGokai from "@/components/platform/HubGokai";
import Link from "next/link";
import { Breadcrumb } from "@/components/platform/Platform";
import { getHubContent } from "@/lib/hub-content";
import type { HubDefinition } from "@/lib/hubs";

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
  return <div className={`platform hub-landing${hub.kind === "erabu" ? " hub-erabu" : ""}`}>
    <header className="p-page-hero"><div className="p-container hub-reading-width"><Breadcrumb items={crumbs} currentPath={hub.path} /><h1>{content.title}</h1></div></header>
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
    </article>
  </div>;
}
