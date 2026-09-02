import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/platform/Platform";
import { YOUGO } from "@/data/yougo";
import { isPublishedRelatedPath, searchableYomi } from "@/lib/yougo";
import { pageMetadata } from "@/lib/seo";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() { return YOUGO.map(({ slug }) => ({ slug })); }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const item = YOUGO.find((entry) => entry.slug === slug);
  if (!item) return {};
  return pageMetadata({ title: `${item.term}とは`, description: item.paraphrase, path: `/yougo/${slug}` });
}

export default async function YougoDetailPage({ params }: Props) {
  const { slug } = await params;
  const item = YOUGO.find((entry) => entry.slug === slug);
  if (!item) notFound();
  const related = item.related.filter(({ href }) => isPublishedRelatedPath(href));
  return (
    <div className="platform yougo-detail-page">
      <header className="p-page-hero yougo-detail-hero">
        <div className="p-container yougo-reading-width">
          <Breadcrumb items={[{ href: "/", label: "トップ" }, { href: "/yougo", label: "用語辞典" }, { label: item.term }]} />
          <span className="p-label">{item.category}</span>
          <h1>{item.term}</h1>
          <p className="yougo-yomi">{searchableYomi(item.slug, item.yomi)}</p>
        </div>
      </header>
      <article className="p-container yougo-reading-width yougo-detail">
        <strong className="yougo-paraphrase">{item.paraphrase}</strong>
        <p>{item.body}</p>
        {item.note && <aside className="yougo-note">{item.note}</aside>}
        {related.length > 0 && <section className="yougo-related"><h2>関連ページ</h2>{related.map((link) => <Link key={link.href} href={link.href}>{link.label} →</Link>)}</section>}
        <aside className="yougo-sources"><h2>出典</h2><p>厚生労働省・日本年金機構の公表資料(確認日: 2026年9月2日)</p></aside>
        <Link className="yougo-back" href="/yougo">用語辞典の一覧へ戻る</Link>
      </article>
    </div>
  );
}
