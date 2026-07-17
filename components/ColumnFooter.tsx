import Link from "next/link";
import { COLUMNS } from "@/lib/columns";

// 記事末尾に置く「あわせて読みたい」(他記事への内部リンク)。
export default function ColumnFooter({ currentSlug }: { currentSlug: string }) {
  const others = COLUMNS.filter((c) => c.slug !== currentSlug);
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
