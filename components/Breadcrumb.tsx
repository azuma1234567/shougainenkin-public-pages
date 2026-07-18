import Link from "next/link";

// 記事ページ上部のパンくず(トップ > コラム > 記事名)。
export default function Breadcrumb({ current }: { current: string }) {
  return (
    <nav className="breadcrumb" aria-label="パンくずリスト">
      <ol>
        <li>
          <Link href="/">トップ</Link>
        </li>
        <li>
          <Link href="/columns">コラム</Link>
        </li>
        <li aria-current="page">{current}</li>
      </ol>
    </nav>
  );
}
