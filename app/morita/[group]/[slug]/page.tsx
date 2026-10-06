import type { Metadata } from "next";
import { notFound } from "next/navigation";
import MoritaArticle from "@/components/morita/MoritaArticle";
import { MORITA_ARTICLES, moritaMetadata, type MoritaArticleMeta } from "@/lib/morita";

/* 森田療法の記事(/morita/<group>/<slug>)。content/morita/<slug> は slug 固定の switch で読む(変数パスの動的 import を避ける)。 */
type Content = { default: string; lead: string[]; faqs: { question: string; answer: string }[]; dateModified: string };

async function loadContent(slug: string): Promise<Content> {
  switch (slug) {
    case "ayashii": return import("@/content/morita/ayashii");
    case "kouka": return import("@/content/morita/kouka");
    case "shakou-fuan": return import("@/content/morita/shakou-fuan");
    case "kyouhaku": return import("@/content/morita/kyouhaku");
    case "panic": return import("@/content/morita/panic");
    case "dokode": return import("@/content/morita/dokode");
    case "nikki": return import("@/content/morita/nikki");
    default: notFound();
  }
}

function findArticle(group: string, slug: string): MoritaArticleMeta | null {
  return MORITA_ARTICLES.find((a) => a.group !== "hub" && a.group === group && a.slug === slug) ?? null;
}

export const dynamicParams = false;

export function generateStaticParams() {
  return MORITA_ARTICLES.filter((a) => a.group !== "hub").map((a) => ({ group: a.group, slug: a.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ group: string; slug: string }> }): Promise<Metadata> {
  const { group, slug } = await params;
  const article = findArticle(group, slug);
  if (!article) notFound();
  return moritaMetadata(article);
}

export default async function MoritaArticlePage({ params }: { params: Promise<{ group: string; slug: string }> }) {
  const { group, slug } = await params;
  const article = findArticle(group, slug);
  if (!article) notFound();
  const content = await loadContent(slug);
  return <MoritaArticle article={article} source={content.default} lead={content.lead} faqs={content.faqs} />;
}
