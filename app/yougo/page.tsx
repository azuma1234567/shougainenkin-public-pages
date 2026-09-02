import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumb } from "@/components/platform/Platform";
import { YOUGO, YOUGO_CATEGORIES, type YougoCategory } from "@/data/yougo";
import { kanaGroup, searchableYomi, YOUGO_KANA_GROUPS } from "@/lib/yougo";
import { pageMetadata } from "@/lib/seo";

const TITLE = "障害年金の用語辞典";
const DESCRIPTION = "障害年金の手続きや審査で使われる40の用語を、やさしい言葉で確認できます。";
export const metadata: Metadata = pageMetadata({ title: TITLE, description: DESCRIPTION, path: "/yougo" });

type Props = { searchParams: Promise<{ category?: string; kana?: string }> };

function filterHref(category?: string, kana?: string) {
  const params = new URLSearchParams();
  if (category) params.set("category", category);
  if (kana) params.set("kana", kana);
  return `/yougo${params.size ? `?${params}` : ""}`;
}

export default async function YougoPage({ searchParams }: Props) {
  const query = await searchParams;
  const category = YOUGO_CATEGORIES.includes(query.category as YougoCategory) ? query.category as YougoCategory : undefined;
  const kana = YOUGO_KANA_GROUPS.includes(query.kana as (typeof YOUGO_KANA_GROUPS)[number]) ? query.kana : undefined;
  const items = YOUGO.filter((item) => (!category || item.category === category) && (!kana || kanaGroup(item.slug, item.yomi) === kana));

  return (
    <div className="platform yougo-page">
      <header className="p-page-hero yougo-hero">
        <div className="p-container hub-reading-width">
          <Breadcrumb items={[{ href: "/", label: "トップ" }, { label: TITLE }]} />
          <h1>{TITLE}</h1>
          <p className="p-page-intro">障害年金の書類や窓口で出てくる言葉を、知りたい入口から探せます。</p>
        </div>
      </header>
      <div className="p-container hub-reading-width yougo-content">
        <nav className="yougo-filters" aria-label="用語の絞り込み" data-yougo-skip>
          <section aria-labelledby="yougo-kana-heading">
            <h2 id="yougo-kana-heading">五十音から探す</h2>
            <div className="yougo-filter-row">
              <Link className={!kana ? "is-active" : ""} href={filterHref(category)}>すべて</Link>
              {YOUGO_KANA_GROUPS.map((group) => <Link key={group} className={kana === group ? "is-active" : ""} href={filterHref(category, group)}>{group}</Link>)}
            </div>
          </section>
          <section aria-labelledby="yougo-category-heading">
            <h2 id="yougo-category-heading">カテゴリから探す</h2>
            <div className="yougo-filter-row">
              <Link className={!category ? "is-active" : ""} href={filterHref(undefined, kana)}>すべて</Link>
              {YOUGO_CATEGORIES.map((group) => <Link key={group} className={category === group ? "is-active" : ""} href={filterHref(group, kana)}>{group}</Link>)}
            </div>
          </section>
        </nav>
        <div className="yougo-results-head"><h2>{category ?? kana ?? "全40語"}</h2><span>{items.length}語</span></div>
        <div className="yougo-grid">
          {items.map((item) => (
            <Link className="yougo-card" href={`/yougo/${item.slug}`} key={item.slug} data-yougo-slug={item.slug}>
              <span>{item.category}</span>
              <h3>{item.term}</h3>
              <small>{searchableYomi(item.slug, item.yomi)}</small>
              <p>{item.paraphrase}</p>
            </Link>
          ))}
        </div>
        {items.length === 0 && <p className="yougo-empty">この組み合わせに当てはまる用語はありません。</p>}
      </div>
    </div>
  );
}
