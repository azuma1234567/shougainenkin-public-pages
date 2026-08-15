import Link from "next/link";

// 記事ページ上部のパンくず(トップ > コラム > 記事名)。
// parents には、公開済みの柱ページだけを差し込む(lib/columns.ts の
// columnBreadcrumbParents)。未公開のページは渡ってこないので、
// アクセスできないリンクが出ることはない。
export default function Breadcrumb({
  current,
  parents = [],
}: {
  current: string;
  parents?: { name: string; path: string }[];
}) {
  return (
    <nav className="breadcrumb" aria-label="パンくずリスト">
      <ol>
        <li>
          <Link href="/">トップ</Link>
        </li>
        <li>
          <Link href="/columns">コラム</Link>
        </li>
        {parents.map((parent) => (
          <li key={parent.path}>
            <Link href={parent.path}>{parent.name}</Link>
          </li>
        ))}
        <li aria-current="page">{current}</li>
      </ol>
    </nav>
  );
}
