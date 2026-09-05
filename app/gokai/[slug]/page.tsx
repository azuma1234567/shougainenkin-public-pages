import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumb, PageDate } from "@/components/platform/Platform";
import GokaiBody from "@/components/platform/GokaiBody";
import { GOKAI, GOKAI_UPDATED } from "@/data/gokai";
import { GOKAI_BODIES, GOKAI_BODIES_UPDATED } from "@/data/gokai-bodies";
import { gokaiCardBySlug } from "@/lib/gokai";
import { SITE_NAME, SITE_URL } from "@/lib/constants";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() { return GOKAI.map(({ slug }) => ({ slug })); }

// og:imageは同じフォルダの opengraph-image.tsx(誤解の一文+「本当は」入り)が使われる。
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const card = gokaiCardBySlug(slug);
  if (!card) return {};
  const body = GOKAI_BODIES[slug];
  if (!body) throw new Error(`誤解カード本文なし: ${slug}`);
  const path = `/gokai/${slug}`;
  const fullTitle = `${body.title}｜${SITE_NAME}`;
  return {
    title: body.title,
    description: body.description,
    alternates: { canonical: `${SITE_URL}${path}` },
    openGraph: { title: fullTitle, description: body.description, type: "article", siteName: SITE_NAME, url: `${SITE_URL}${path}`, locale: "ja_JP" },
    twitter: { card: "summary_large_image", title: fullTitle, description: body.description },
    robots: { index: true, follow: true },
  };
}

export default async function GokaiDetailPage({ params }: Props) {
  const { slug } = await params;
  const card = gokaiCardBySlug(slug);
  if (!card) notFound();
  const body = GOKAI_BODIES[slug];
  if (!body) throw new Error(`誤解カード本文なし: ${slug}`);
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article", headline: body.title, description: body.description,
        datePublished: GOKAI_UPDATED, dateModified: body.checkedOn,
        author: { "@type": "Organization", name: SITE_NAME },
        publisher: { "@type": "Organization", name: SITE_NAME },
        mainEntityOfPage: `${SITE_URL}/gokai/${slug}`,
      },
      {
        "@type": "FAQPage",
        mainEntity: body.sections.flatMap(section => section.blocks).filter(block => block.type === "faq").map(block => ({
          "@type": "Question", name: block.q,
          acceptedAnswer: { "@type": "Answer", text: block.a },
        })),
      },
    ],
  };
  return (
    <div className="platform gokai-detail-page">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <header className="p-page-hero gokai-detail-hero">
        <div className="p-container gokai-reading-width">
          <Breadcrumb items={[{ href: "/", label: "トップ" }, { href: "/gokai", label: "よくある誤解" }, { label: card.category }]} currentPath={`/gokai/${card.slug}`} />
          <span className="p-label">よくある誤解</span>
          <p className="gokai-detail-quote">{card.misconception}</p>
          <h1>{body.title}</h1>
          <PageDate updated={GOKAI_BODIES_UPDATED} checked={body.checkedOn} />
        </div>
      </header>
      <article className="p-container gokai-reading-width gokai-detail">
        <GokaiBody body={body} />
        <Link className="gokai-back" href="/gokai">よくある誤解の一覧へ戻る</Link>
      </article>
    </div>
  );
}
