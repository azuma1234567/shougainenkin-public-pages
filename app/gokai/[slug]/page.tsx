import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/platform/Platform";
import { GOKAI } from "@/data/gokai";
import { gokaiCardBySlug, isPublishedInternalPath } from "@/lib/gokai";
import { SITE_NAME, SITE_URL } from "@/lib/constants";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() { return GOKAI.map(({ slug }) => ({ slug })); }

// og:imageは同じフォルダの opengraph-image.tsx(誤解の一文+「本当は」入り)が使われる。
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const card = gokaiCardBySlug(slug);
  if (!card) return {};
  const path = `/gokai/${slug}`;
  const fullTitle = `${card.misconception}｜${SITE_NAME}`;
  return {
    title: card.misconception,
    description: card.truth,
    alternates: { canonical: `${SITE_URL}${path}` },
    openGraph: { title: fullTitle, description: card.truth, type: "article", siteName: SITE_NAME, url: `${SITE_URL}${path}`, locale: "ja_JP" },
    twitter: { card: "summary_large_image", title: fullTitle, description: card.truth },
    robots: { index: true, follow: true },
  };
}

export default async function GokaiDetailPage({ params }: Props) {
  const { slug } = await params;
  const card = gokaiCardBySlug(slug);
  if (!card) notFound();
  const next = card.next.filter(({ href }) => isPublishedInternalPath(href));
  return (
    <div className="platform gokai-detail-page">
      <header className="p-page-hero gokai-detail-hero">
        <div className="p-container gokai-reading-width">
          <Breadcrumb items={[{ href: "/", label: "トップ" }, { href: "/gokai", label: "よくある誤解" }, { label: card.category }]} currentPath={`/gokai/${card.slug}`} />
          <span className="p-label">よくある誤解</span>
          <h1>{card.misconception}</h1>
        </div>
      </header>
      <article className="p-container gokai-reading-width gokai-detail">
        <section className="gokai-truth">
          <h2>本当は</h2>
          <p>{card.truth}</p>
        </section>
        <section className="gokai-block">
          <h2>なぜ</h2>
          <p>{card.why}</p>
        </section>
        <section className="gokai-block">
          <h2>こんなときに多い</h2>
          <p>{card.when}</p>
        </section>
        {next.length > 0 && (
          <section className="gokai-next">
            <h2>次に読む</h2>
            {next.map((link) => <Link key={link.href} href={link.href}>{link.label} →</Link>)}
          </section>
        )}
        <aside className="gokai-sources" data-yougo-skip>
          <h2>出典</h2>
          <ul>{card.sources.map((source) => <li key={source}>{source}</li>)}</ul>
        </aside>
        <Link className="gokai-back" href="/gokai">よくある誤解の一覧へ戻る</Link>
      </article>
    </div>
  );
}
