import type { Metadata } from "next";
import Link from "next/link";
import { CATEGORY_ORDER, COLUMNS_BY_DATE, formatDate } from "@/lib/columns";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";

const DESCRIPTION =
  "障害年金の申請準備に役立つ情報をまとめたコラムです。病歴・就労状況等申立書の書き方、用紙の印刷方法、診察での伝え方などを解説します。";

export const metadata: Metadata = pageMetadata({
  title: "障害年金の申請準備コラム",
  description: DESCRIPTION,
  path: "/columns",
});

const breadcrumb = breadcrumbJsonLd([
  { name: "トップ", path: "/" },
  { name: "障害年金の申請準備コラム", path: "/columns" },
]);

const LATEST_COUNT = 3;
const LATEST_SLUGS = new Set(
  COLUMNS_BY_DATE.slice(0, LATEST_COUNT).map((c) => c.slug),
);

function ColumnCard({ column }: { column: (typeof COLUMNS_BY_DATE)[number] }) {
  return (
    <li className="column-card">
      <p className="meta-line">
        <time dateTime={column.datePublished}>
          {formatDate(column.datePublished)}
        </time>
      </p>
      <p className="column-card-title">
        <Link href={`/columns/${column.slug}`}>{column.title}</Link>
      </p>
      <p className="small-note">{column.description}</p>
    </li>
  );
}

export default function ColumnsPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />

      <h1>コラム</h1>

      <p className="lead">
        障害年金の申請準備に役立つ情報を、テーマ別にまとめています(全
        {COLUMNS_BY_DATE.length}本)。
      </p>

      <section aria-labelledby="columns-latest-heading">
        <h2 id="columns-latest-heading">最新の記事</h2>
        <ul className="column-list">
          {COLUMNS_BY_DATE.slice(0, LATEST_COUNT).map((c) => (
            <ColumnCard key={c.slug} column={c} />
          ))}
        </ul>
      </section>

      {CATEGORY_ORDER.map((category) => {
        const items = COLUMNS_BY_DATE.filter(
          (c) => c.category === category && !LATEST_SLUGS.has(c.slug),
        );
        if (items.length === 0) return null;
        const headingId = `columns-cat-${category}`;
        return (
          <section key={category} aria-labelledby={headingId}>
            <h2 id={headingId}>{category}</h2>
            <ul className="column-list">
              {items.map((c) => (
                <ColumnCard key={c.slug} column={c} />
              ))}
            </ul>
          </section>
        );
      })}
    </>
  );
}
