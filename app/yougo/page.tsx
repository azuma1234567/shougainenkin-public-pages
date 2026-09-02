import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumb } from "@/components/platform/Platform";
import YougoAnchorLanding from "@/components/YougoAnchorLanding";
import YougoCopyLink from "@/components/YougoCopyLink";
import { YOUGO, YOUGO_CATEGORIES, type YougoCategory, type YougoEntry } from "@/data/yougo";
import { SITE_URL } from "@/lib/constants";
import { isPublishedRelatedPath, kanaGroup, YOUGO_KANA_GROUPS } from "@/lib/yougo";
import { pageMetadata } from "@/lib/seo";

// 用語辞典は1ページに40語(docs/codex-phase2-yougo-revision-2026-09-02.md)。
// 各語は <section id="<slug>"> で、/yougo#<slug> で直接飛べる。

const META_TITLE = "障害年金の用語辞典";
const DESCRIPTION = "障害年金の手続きや審査で使われる40の用語を、やさしい言葉で確認できます。";
export const metadata: Metadata = pageMetadata({ title: META_TITLE, description: DESCRIPTION, path: "/yougo" });

const CATEGORY_IDS: Record<YougoCategory, string> = {
  "初診日まわり": "cat-shoshinbi",
  "書類": "cat-shorui",
  "審査": "cat-shinsa",
  "お金・要件": "cat-okane",
  "受給後": "cat-jukyugo",
};

// 五十音の各行から、ページ順で最初に出てくる語へ飛ぶ
function firstSlugOfKana(group: (typeof YOUGO_KANA_GROUPS)[number]): string | null {
  return YOUGO.find((item) => kanaGroup(item.slug, item.yomi) === group)?.slug ?? null;
}

function definedTermSetJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "DefinedTermSet",
    "@id": `${SITE_URL}/yougo`,
    name: META_TITLE,
    description: DESCRIPTION,
    url: `${SITE_URL}/yougo`,
    hasDefinedTerm: YOUGO.map((item) => ({
      "@type": "DefinedTerm",
      "@id": `${SITE_URL}/yougo#${item.slug}`,
      url: `${SITE_URL}/yougo#${item.slug}`,
      name: item.term,
      ...(item.yomi ? { alternateName: item.yomi } : {}),
      description: `${item.paraphrase}${item.body.replace(/\n/g, "")}`,
      inDefinedTermSet: `${SITE_URL}/yougo`,
    })),
  };
}

function TermCard({ item }: { item: YougoEntry }) {
  const related = item.related.filter(({ href }) => isPublishedRelatedPath(href));
  return (
    <section className="yougo-term" id={item.slug} data-yougo-slug={item.slug} aria-labelledby={`${item.slug}-title`}>
      <div className="yougo-term-head">
        <h2 id={`${item.slug}-title`}>
          {item.term}
          {item.yomi && <span className="yougo-yomi">({item.yomi})</span>}
        </h2>
        <YougoCopyLink slug={item.slug} term={item.term} />
      </div>
      <p className="yougo-paraphrase"><strong>{item.paraphrase}</strong></p>
      {item.body.split("\n").map((paragraph, index) => <p className="yougo-body" key={index}>{paragraph}</p>)}
      {item.note && <p className="yougo-note">{item.note}</p>}
      {related.length > 0 && (
        <p className="yougo-related">
          関連: {related.map((link, index) => (
            <span key={link.href}>
              {index > 0 && " / "}
              <Link href={link.href}>{link.label}</Link>
            </span>
          ))}
        </p>
      )}
    </section>
  );
}

export default function YougoPage() {
  return (
    <div className="platform yougo-page">
      <YougoAnchorLanding />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(definedTermSetJsonLd()).replace(/</g, "\\u003c") }} />
      <header className="p-page-hero yougo-hero">
        <div className="p-container yougo-reading-width">
          <Breadcrumb items={[{ href: "/", label: "トップ" }, { label: "用語辞典" }]} currentPath="/yougo" />
          <h1>用語辞典</h1>
          <p className="p-page-intro">障害年金でよく出てくる言葉を、むずかしくない言い方から説明します(40語)。</p>
        </div>
      </header>

      <div className="p-container yougo-reading-width yougo-content">
        <nav className="yougo-index" aria-label="用語の目次" data-yougo-skip>
          <div className="yougo-index-group" role="group" aria-labelledby="yougo-category-heading">
            <p className="yougo-index-label" id="yougo-category-heading">カテゴリから探す</p>
            <ul className="yougo-tabs">
              {YOUGO_CATEGORIES.map((category) => (
                <li key={category}>
                  <a href={`#${CATEGORY_IDS[category]}`} data-yougo-tab={CATEGORY_IDS[category]}>
                    {category}<span className="yougo-tab-count">{YOUGO.filter((item) => item.category === category).length}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div className="yougo-index-group" role="group" aria-labelledby="yougo-kana-heading">
            <p className="yougo-index-label" id="yougo-kana-heading">五十音から探す</p>
            <ul className="yougo-kana">
              {YOUGO_KANA_GROUPS.map((group) => {
                const slug = firstSlugOfKana(group);
                return (
                  <li key={group}>
                    {slug
                      ? <a href={`#${slug}`} data-yougo-kana={group}>{group}</a>
                      : <span aria-disabled="true" data-yougo-kana={group}>{group}</span>}
                  </li>
                );
              })}
            </ul>
          </div>
        </nav>

        {YOUGO_CATEGORIES.map((category) => (
          <div className="yougo-group" id={CATEGORY_IDS[category]} key={category} data-yougo-category={category}>
            <p className="yougo-group-label"><span>{category}</span><small>{YOUGO.filter((item) => item.category === category).length}語</small></p>
            {YOUGO.filter((item) => item.category === category).map((item) => <TermCard item={item} key={item.slug} />)}
          </div>
        ))}

        <aside className="yougo-sources" data-yougo-skip>
          <p>出典: 厚生労働省・日本年金機構の公表資料(確認日: 2026年9月2日)</p>
        </aside>

        <div className="yougo-search-cta" data-yougo-skip>
          <p>ここに無い言葉は、サイト内検索でも探せます。</p>
          <Link className="p-button" href="/#site-search-input">サイト内検索へ →</Link>
        </div>
      </div>
    </div>
  );
}
