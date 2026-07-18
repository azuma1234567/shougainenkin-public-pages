import Link from "next/link";
import { COLUMNS, type Column } from "@/lib/columns";

// 記事末尾に置く「あわせて読みたい」(他記事への内部リンク)。
export default function ColumnFooter({
  currentSlug,
  relatedSlugs,
}: {
  currentSlug: string;
  relatedSlugs?: string[];
}) {
  const others = relatedSlugs
    ? relatedSlugs
        .map((slug) => COLUMNS.find((column) => column.slug === slug))
        .filter((column): column is Column => Boolean(column))
    : COLUMNS.filter((column) => column.slug !== currentSlug);
  return (
    <>
      <section className="related-columns">
        <h2>あわせて読みたい</h2>
        <ul>
          {others.map((c) => (
            <li key={c.slug}>
              <Link href={`/columns/${c.slug}`}>{c.title}</Link>
            </li>
          ))}
        </ul>
      </section>
      <p className="page-links">
        <Link href="/columns">コラム一覧へ戻る</Link> ・{" "}
        <Link href="/">トップへ戻る</Link>
      </p>
    </>
  );
}
