import type { Metadata } from "next";
import Link from "next/link";
import {
  CATEGORY_ANCHORS,
  CATEGORY_LEADS,
  CATEGORY_ORDER,
  COLUMNS_BY_DATE,
  WORRY_SHORTCUTS,
  clusterColumns,
  columnsInCategory,
  formatDate,
  isPillarAvailable,
} from "@/lib/columns";
import { CLUSTERS } from "@/lib/clusters";
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

// テーマ別の一覧。柱ページが公開されればその記事へ、未公開のうちは
// このページ内の記事群へ案内する(行き止まりを作らない)。
const THEMES = CLUSTERS.map((cluster) => ({
  cluster,
  columns: clusterColumns(cluster.id),
  pillarHref: isPillarAvailable(cluster) ? cluster.pillarPath : null,
})).filter((theme) => theme.columns.length > 0 || theme.pillarHref);

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
        障害年金について、知りたいことから探せます(全
        {COLUMNS_BY_DATE.length}本)。
      </p>

      <section aria-labelledby="columns-worries-heading">
        <h2 id="columns-worries-heading">よくある悩みから探す</h2>
        <p className="small-note">申請の途中でつまずいたときは、ここから。</p>
        <nav className="worry-nav" aria-label="よくある悩み">
          {WORRY_SHORTCUTS.map((worry) => (
            <Link key={worry.slug} href={`/columns/${worry.slug}`}>
              {worry.label}
            </Link>
          ))}
        </nav>
      </section>

      <section aria-labelledby="columns-stages-heading">
        <h2 id="columns-stages-heading">申請の段階から探す</h2>
        <nav className="stage-nav" aria-label="申請の段階">
          {CATEGORY_ORDER.map((category) => (
            <a key={category} href={`#${CATEGORY_ANCHORS[category]}`}>
              {category}
            </a>
          ))}
        </nav>
      </section>

      <section aria-labelledby="columns-themes-heading">
        <h2 id="columns-themes-heading">テーマから探す</h2>
        <p className="small-note">
          気になるテーマを開くと、その話題の記事がまとまって出てきます。
        </p>
        <div className="guide-index">
          {THEMES.map(({ cluster, columns, pillarHref }) => (
            <details
              key={cluster.id}
              id={`cluster-${cluster.id}`}
              className="guide-index-group"
            >
              <summary>
                <span>{cluster.label}</span>
                <span className="guide-index-count">{columns.length}本</span>
              </summary>
              <p className="small-note cluster-lead">{cluster.lead}</p>
              {pillarHref && (
                <p className="cluster-pillar-link">
                  <Link href={pillarHref}>{cluster.label}の全体像を読む</Link>
                </p>
              )}
              <ul className="guide-index-list">
                {columns.map((c) => (
                  <li key={c.slug}>
                    <Link href={`/columns/${c.slug}`}>{c.title}</Link>
                  </li>
                ))}
              </ul>
            </details>
          ))}
        </div>
      </section>

      <section aria-labelledby="columns-latest-heading">
        <h2 id="columns-latest-heading">最新の記事</h2>
        <ul className="column-list">
          {COLUMNS_BY_DATE.slice(0, LATEST_COUNT).map((c) => (
            <ColumnCard key={c.slug} column={c} />
          ))}
        </ul>
      </section>

      {/* 段階から探す人が取りこぼさないよう、最新の記事もカテゴリ節に重ねて出す。 */}
      {CATEGORY_ORDER.map((category) => {
        const items = columnsInCategory(category);
        if (items.length === 0) return null;
        const headingId = CATEGORY_ANCHORS[category];
        return (
          <section key={category} aria-labelledby={headingId}>
            <h2 id={headingId}>{category}</h2>
            <p className="small-note">{CATEGORY_LEADS[category]}</p>
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
