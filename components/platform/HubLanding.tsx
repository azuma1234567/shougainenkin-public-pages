import MarkdownArticle from "@/components/MarkdownArticle";
import { Breadcrumb } from "@/components/platform/Platform";
import { getHubContent } from "@/lib/hub-content";
import type { HubDefinition } from "@/lib/hubs";

export default function HubLanding({ hub }: { hub: HubDefinition }) {
  const content = getHubContent(hub.path);
  if (!content) return null;
  const crumbs = content.breadcrumb.map((label, index) => ({ label, href: index === 0 ? "/" : undefined }));
  return <div className="platform hub-landing">
    <header className="p-page-hero"><div className="p-container hub-reading-width"><Breadcrumb items={crumbs} /><h1>{content.title}</h1></div></header>
    <article className="p-container hub-reading-width hub-content">
      <MarkdownArticle source={content.source} appCtaSlug={`hub-${hub.path.split("/").filter(Boolean).join("-")}`} faqAccordion />
    </article>
  </div>;
}
