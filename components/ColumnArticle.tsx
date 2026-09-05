import ArticleToc from "@/components/ArticleToc";
import Breadcrumb from "@/components/Breadcrumb";
import ColumnFooter, { NENKIN_REFERENCES, type Reference } from "@/components/ColumnFooter";
import MarkdownArticle from "@/components/MarkdownArticle";
import ColumnThemeBlock from "@/components/ColumnThemeBlock";
import {
  columnBreadcrumbParents,
  columnJsonLd,
  columnParentIsHub,
  type Column,
} from "@/lib/columns";
import { faqJsonLd } from "@/lib/seo";
import { DouguCards } from "@/components/platform/DouguCard";
import { PLACEMENTS } from "@/data/dougu";
import AdLabel from "@/components/AdLabel";
import { PageDate } from "@/components/platform/Platform";
import CHECKPOINTS from "@/data/columns/checkpoints.json";
import ColumnNext from "@/components/ColumnNext";
import "@/app/columns/columns.css";

type Faq = { question: string; answer: string };

export default function ColumnArticle({
  column,
  source,
  faqs,
  relatedSlugs,
  references = [NENKIN_REFERENCES.seido],
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
  /* ここまでの要約。文章はリード(column.lead)の再掲で、新しい文は書かない。
     data/columns/checkpoints.json に無い記事や、リードが無い記事には出さない。 */
  const entry = (CHECKPOINTS as Record<string, { tool?: string; readMinutes: number; checkpoints: { lead: number; h2: number }[] }>)[column.slug];
  const lead = column.lead ?? [];
  const checkpoints = entry?.checkpoints
    .filter((item) => typeof lead[item.lead] === "string")
    .map((item, index) => ({ h2: item.h2, text: lead[item.lead] as string, first: index === 0 }));

  return (
    <article className="column-article">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(columnJsonLd(column, references)).replace(/</g, "\\u003c") }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(faqs)).replace(/</g, "\\u003c") }}
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
        showColumns={!columnParentIsHub(column)}
      />
      <h1>{column.title}</h1>
      <PageDate published={column.datePublished} readMinutes={entry?.readMinutes} updated={column.dateModified} />

      {column.lead && <section className="column-conclusion" aria-labelledby="column-conclusion-heading">
        <h2 id="column-conclusion-heading">この記事の結論</h2>
        {column.lead.map((line, index) => <p key={index}>{line}</p>)}
      </section>}
      <ArticleToc bodyOnly />
      <ColumnThemeBlock column={column} />
      <DouguCards placements={PLACEMENTS.columns[column.slug]} position="before" />
      <div className="column-body"><MarkdownArticle
        checkpoints={checkpoints}
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
      <ColumnNext relatedSlugs={relatedSlugs} slug={column.slug} tool={entry?.tool} />
      <ColumnFooter
        currentSlug={column.slug}
        relatedSlugs={relatedSlugs}
        references={references}
      />
    </article>
  );
}
