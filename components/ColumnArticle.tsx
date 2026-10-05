import Link from "next/link";
import ArticleToc from "@/components/ArticleToc";
import Breadcrumb from "@/components/Breadcrumb";
import ColumnFooter, { NENKIN_REFERENCES, type Reference } from "@/components/ColumnFooter";
import MarkdownArticle from "@/components/MarkdownArticle";
import ColumnThemeBlock from "@/components/ColumnThemeBlock";
import {
  columnBreadcrumbParents,
  columnJsonLd,
  columnParentIsHub,
  formatDate,
  getColumn,
  type Column,
} from "@/lib/columns";
import { DouguCards } from "@/components/platform/DouguCard";
import { PLACEMENTS } from "@/data/dougu";
import AdLabel from "@/components/AdLabel";
import "@/app/columns/columns.css";

/* 「次に読む」の表示名。title の「 — 」以降(副題)は落として 1 行に収める(app/columns/page.tsx の shortTitle と同じ規則)。 */
function shortTitle(title: string): string {
  return title.split(/\s*—\s*/)[0];
}

export default function ColumnArticle({
  column,
  source,
  relatedSlugs,
  references = [NENKIN_REFERENCES.seido],
  extraJsonLd = [],
}: {
  column: Column;
  source: string;
  relatedSlugs: string[];
  references?: Reference[];
  // 記事固有の構造化データ(ItemList / HowTo など)。同じ @graph に入る。
  // FAQPage は本文の「よくある質問」から columnJsonLd が自動で出す(docs/seo-aio-2026-09-16-instructions.md §2)。
  extraJsonLd?: Record<string, unknown>[];
}) {
  const nextSlug = column.nextSlug ?? relatedSlugs[0];
  return (
    <article className="column-article">
      {/* 構造化データは1ページに script 1つ(Article ＋ BreadcrumbList ＋ FAQPage ＋ 記事固有 ＋ Person) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(columnJsonLd(column, references, { source, extra: extraJsonLd })).replace(/</g, "\\u003c") }}
      />

      <Breadcrumb
        current={column.title}
        parents={columnBreadcrumbParents(column)}
        showColumns={!columnParentIsHub(column)}
      />
      <h1>{column.title}</h1>
      <p className="meta-line">
        公開日: {" "}
        <time dateTime={column.datePublished}>
          {formatDate(column.datePublished)}
        </time>{" "}
        / 最終確認日: {" "}
        <time dateTime={column.dateModified}>
          {formatDate(column.dateModified)}
        </time>
      </p>

      {column.lead && <section className="column-conclusion" aria-labelledby="column-conclusion-heading">
        <h2 id="column-conclusion-heading">この記事の結論</h2>
        {column.lead.map((line, index) => <p key={index}>{line}</p>)}
      </section>}
      {/* 次に読む 1 本(docs/site-audit-2026-10-05.md §2・§5-2)。読者が次の記事に出会うのが最下部の「あわせて読みたい」だけだったので、
          結論の箱の直後に 1 行で置く。記事ごとに lib/columns.ts の nextSlug で手で選び、無ければ relatedSlugs の先頭。
          .column-body の外に置くので、本文の検査(道具リンク・内部リンク)の対象にはならない。 */}
      {nextSlug && (
        <p className="column-next">
          <span className="column-next-label">次に読む</span>
          <span aria-hidden="true"> → </span>
          <Link href={`/columns/${nextSlug}`}>{shortTitle(getColumn(nextSlug).title)}</Link>
        </p>
      )}
      <ArticleToc bodyOnly />
      <ColumnThemeBlock column={column} />
      <DouguCards placements={PLACEMENTS.columns[column.slug]} position="before" />
      <div className="column-body"><MarkdownArticle
        columnStyle
        source={source}
        appCtaSlug={column.slug}
        leadNotice={
          column.affiliate ? (
            <p className="affiliate-notice" key="affiliate-notice">
              <AdLabel kind="PR" />
              <span>※本記事にはアフィリエイト広告(PR)を含みます</span>
            </p>
          ) : undefined
        }
      /></div>
      <DouguCards placements={PLACEMENTS.columns[column.slug]} position="after" />
      <ColumnFooter
        currentSlug={column.slug}
        relatedSlugs={relatedSlugs}
        references={references}
      />
    </article>
  );
}
