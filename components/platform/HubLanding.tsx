import MarkdownArticle from "@/components/MarkdownArticle";
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
};
const siblingLabels: Record<string, string> = {
  "/byoki/tounyou": "糖尿病", "/byoki/jinzou-touseki": "腎臓病・人工透析",
  "/byoki/shinzou": "心臓病", "/byoki/shitai": "肢体の障害",
  "/byoki/chiteki": "知的障害", "/byoki/hattatsu": "発達障害",
};

export default function HubLanding({ hub }: { hub: HubDefinition }) {
  const content = getHubContent(hub.path);
  if (!content) return null;
  const crumbs = content.breadcrumb.map((label, index) => ({ label, href: index === 0 ? "/" : undefined }));
  return <div className="platform hub-landing">
    <header className="p-page-hero"><div className="p-container hub-reading-width"><Breadcrumb items={crumbs} /><h1>{content.title}</h1></div></header>
    <article className="p-container hub-reading-width hub-content">
      <MarkdownArticle source={content.source} appCtaSlug={`hub-${hub.path.split("/").filter(Boolean).join("-")}`} faqAccordion />
      {siblingLinks[hub.path]?.length ? <nav className="hub-sibling-links" aria-label="関連する病名ハブ">
        {siblingLinks[hub.path].map((path) => <Link key={path} href={path}>{siblingLabels[path]} →</Link>)}
      </nav> : null}
    </article>
  </div>;
}
