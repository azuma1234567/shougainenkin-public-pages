import ArticleToc from "@/components/ArticleToc";
import Breadcrumb from "@/components/Breadcrumb";
import ColumnFooter, { type Reference } from "@/components/ColumnFooter";
import MarkdownArticle from "@/components/MarkdownArticle";
import ColumnThemeBlock from "@/components/ColumnThemeBlock";
import {
  columnBreadcrumbParents,
  columnJsonLd,
  formatDate,
  type Column,
} from "@/lib/columns";
import { faqJsonLd } from "@/lib/seo";
import { DouguCards } from "@/components/platform/DouguCard";
import { PLACEMENTS } from "@/data/dougu";
import AdLabel from "@/components/AdLabel";
import Link from "next/link";

type Faq = { question: string; answer: string };

export default function ColumnArticle({
  column,
  source,
  faqs,
  relatedSlugs,
  references,
  extraJsonLd = [],
}: {
  column: Column;
  source: string;
  faqs: Faq[];
  relatedSlugs: string[];
  references?: Reference[];
  // 記事固有の構造化データ(ItemList / HowTo など)。FAQPage は faqs から自動で出す。
  extraJsonLd?: Record<string, unknown>[];
}) {
  return (
    <article>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(columnJsonLd(column)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(faqs)) }}
      />
      {extraJsonLd.map((item, index) => (
        <script
          key={`jsonld-${index}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(item).replace(/</g, "\\u003c") }}
        />
      ))}

      <Breadcrumb
        current={column.title}
        parents={columnBreadcrumbParents(column)}
      />
      <h1>{column.title}</h1>
      <p className="meta-line">
        公開日: {" "}
        <time dateTime={column.datePublished}>
          {formatDate(column.datePublished)}
        </time>{" "}
        / 最終更新日: {" "}
        <time dateTime={column.dateModified}>
          {formatDate(column.dateModified)}
        </time>
      </p>

      <ArticleToc />
      <ColumnThemeBlock column={column} />
      <DouguCards placements={PLACEMENTS.columns[column.slug]} position="before" />
      <MarkdownArticle
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
      />
      <DouguCards placements={PLACEMENTS.columns[column.slug]} position="after" />
      <ColumnFooter
        currentSlug={column.slug}
        relatedSlugs={relatedSlugs}
        references={references}
      />
    </article>
  );
}
