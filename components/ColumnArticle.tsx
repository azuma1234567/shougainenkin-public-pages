import ArticleToc from "@/components/ArticleToc";
import Breadcrumb from "@/components/Breadcrumb";
import ColumnFooter, { type Reference } from "@/components/ColumnFooter";
import MarkdownArticle from "@/components/MarkdownArticle";
import {
  columnJsonLd,
  formatDate,
  type Column,
} from "@/lib/columns";
import { faqJsonLd } from "@/lib/seo";

type Faq = { question: string; answer: string };

export default function ColumnArticle({
  column,
  source,
  faqs,
  relatedSlugs,
  references,
}: {
  column: Column;
  source: string;
  faqs: Faq[];
  relatedSlugs: string[];
  references?: Reference[];
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

      <Breadcrumb current={column.title} />
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
      <MarkdownArticle source={source} appCtaSlug={column.slug} />
      <ColumnFooter
        currentSlug={column.slug}
        relatedSlugs={relatedSlugs}
        references={references}
      />
    </article>
  );
}
