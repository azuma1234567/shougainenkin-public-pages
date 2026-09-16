/* ハブ49本の構造化データ(docs/seo-aio-2026-09-16-instructions.md §1)。
   1ページに <script type="application/ld+json"> を1つだけ出し、@graph に
   Article ＋ BreadcrumbList ＋(FAQ があれば)FAQPage ＋ 著者の Person を入れる。
   Person は lib/seo.ts の定義(/about と同じ @id)を共有し、名前・URL をここで書かない。
   「道具」は JSON-LD に書かない。 */
import { SITE_URL } from "@/lib/constants";
import { extractHubFaqs, getHubContent, type HubContent } from "@/lib/hub-content";
import type { HubDefinition } from "@/lib/hubs";
import { ABOUT_PERSON_ID, ABOUT_PUBLISHER_ID, authorPersonJsonLd, breadcrumbJsonLd, faqJsonLd } from "@/lib/seo";

/* meta description。lib/hub-pages.tsx の hubMetadata と同じ文(Article.description にも使う)。 */
export function hubDescription(hub: HubDefinition, content: HubContent | null = getHubContent(hub.path)): string {
  return content?.source.split("\n").find((line) => line && !line.startsWith("#")) ?? hub.label;
}

/* パンくずの経路。表示の <Breadcrumb>(components/platform/Platform.tsx)と同じ規則:
   先頭はトップ、途中は区分の入口(/byoki など)、末尾はこのハブ。 */
export function hubBreadcrumbTrail(hub: HubDefinition, content: HubContent): { name: string; path: string }[] {
  const sectionPath = `/${hub.path.split("/")[1]}`;
  return content.breadcrumb.map((label, index, all) => ({
    name: label,
    path: index === 0 ? "/" : index === all.length - 1 ? hub.path : sectionPath,
  }));
}

export function hubJsonLd(hub: HubDefinition, content: HubContent) {
  const url = `${SITE_URL}${hub.path}`;
  const faqs = extractHubFaqs(content.source);
  const { "@context": _context, ...breadcrumb } = breadcrumbJsonLd(hubBreadcrumbTrail(hub, content));
  const { "@context": _faqContext, ...faq } = faqJsonLd(faqs);
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        "@id": `${url}#article`,
        url,
        headline: content.title,
        description: hubDescription(hub, content),
        /* data/hubs/*.json は dateModified しか持たないので、初出の日付として同じ値を使う。 */
        datePublished: content.dateModified,
        dateModified: content.dateModified,
        inLanguage: "ja",
        author: { "@id": ABOUT_PERSON_ID },
        publisher: { "@id": ABOUT_PUBLISHER_ID },
        mainEntityOfPage: url,
      },
      breadcrumb,
      /* FAQ が無いハブでは出さない(§1-3)。 */
      ...(faqs.length > 0 ? [faq] : []),
      authorPersonJsonLd,
    ],
  };
}
