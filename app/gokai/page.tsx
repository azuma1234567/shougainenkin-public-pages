import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumb } from "@/components/platform/Platform";
import { GOKAI, GOKAI_CATEGORIES, type GokaiCategory } from "@/data/gokai";
import { pageMetadata } from "@/lib/seo";

const TITLE = "障害年金のよくある誤解";
const DESCRIPTION = "「手帳がないともらえない」「働いていたら無理」など、障害年金でよく信じられている48の誤解を、本当はどうなのかと合わせて確認できます。";
export const metadata: Metadata = pageMetadata({ title: TITLE, description: DESCRIPTION, path: "/gokai" });

type Props = { searchParams: Promise<{ category?: string }> };

export default async function GokaiPage({ searchParams }: Props) {
  const query = await searchParams;
  const category = GOKAI_CATEGORIES.includes(query.category as GokaiCategory) ? query.category as GokaiCategory : undefined;
  const items = GOKAI.filter((card) => !category || card.category === category);

  return (
    <div className="platform gokai-page">
      <header className="p-page-hero gokai-hero">
        <div className="p-container hub-reading-width">
          <Breadcrumb items={[{ href: "/", label: "トップ" }, { label: TITLE }]} />
          <h1>{TITLE}</h1>
          <p className="p-page-intro">よく信じられている誤解を48枚に分けました。1枚ずつ「本当は」まで読めます。</p>
        </div>
      </header>
      <div className="p-container hub-reading-width gokai-content">
        <nav className="gokai-filters" aria-label="誤解の絞り込み" data-yougo-skip>
          <Link className={!category ? "is-active" : ""} href="/gokai">すべて</Link>
          {GOKAI_CATEGORIES.map((name) => (
            <Link className={category === name ? "is-active" : ""} href={`/gokai?category=${encodeURIComponent(name)}`} key={name}>{name}</Link>
          ))}
        </nav>
        <div className="gokai-results-head"><h2>{category ?? "全48枚"}</h2><span>{items.length}枚</span></div>
        <div className="gokai-grid">
          {items.map((card) => (
            <Link className="gokai-card" href={`/gokai/${card.slug}`} key={card.slug} data-gokai-slug={card.slug}>
              <span className="gokai-card-category">{card.category}</span>
              <h3>{card.misconception}</h3>
              <p><b>本当は</b>{card.truth}</p>
            </Link>
          ))}
        </div>
        {items.length === 0 && <p className="gokai-empty">このカテゴリの誤解はまだありません。</p>}
      </div>
    </div>
  );
}
