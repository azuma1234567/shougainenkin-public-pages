import type { Reference } from "@/components/ColumnFooter";
import ArticleToc from "@/components/ArticleToc";
import Breadcrumb from "@/components/Breadcrumb";
import ColumnFooter from "@/components/ColumnFooter";
import ColumnMarkdown from "@/components/ColumnMarkdown";
import type { Column } from "@/lib/columns";
import { columnJsonLd, formatDate } from "@/lib/columns";
import { extractFaqs, extractHeadings } from "@/lib/column-content";
import { faqJsonLd } from "@/lib/seo";

export default function ColumnArticlePage({
  column,
  markdown,
  ctaHeading,
  ctaBody,
  relatedSlugs,
  references,
}: {
  column: Column;
  markdown: string;
  ctaHeading: string;
  ctaBody: string;
  relatedSlugs: string[];
  references?: Reference[];
}) {
  const faqs = extractFaqs(markdown);
  const headings = extractHeadings(markdown);

  return (
    <article>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(columnJsonLd(column)) }}
      />
      {faqs.length > 0 ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(faqs)) }}
        />
      ) : null}

      <Breadcrumb current={column.title} />
      <h1>{column.title}</h1>
      <p className="meta-line">
        公開日: <time dateTime={column.datePublished}>{formatDate(column.datePublished)}</time>{" "}
        / 最終更新日: <time dateTime={column.dateModified}>{formatDate(column.dateModified)}</time>
      </p>

      <ArticleToc headings={headings} />
      <ColumnMarkdown
        markdown={markdown}
        slug={column.slug}
        ctaHeading={ctaHeading}
        ctaBody={ctaBody}
      />
      <ColumnFooter
        currentSlug={column.slug}
        relatedSlugs={relatedSlugs}
        references={references}
      />
    </article>
  );
}
