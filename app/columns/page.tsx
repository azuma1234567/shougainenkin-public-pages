import type { Metadata } from "next";
import Link from "next/link";
import { COLUMNS_BY_DATE, formatDate } from "@/lib/columns";
import { pageMetadata } from "@/lib/seo";

const DESCRIPTION =
  "障害年金の申請準備に役立つ情報をまとめたコラムです。病歴・就労状況等申立書の書き方、用紙の印刷方法、診察での伝え方などを解説します。";

export const metadata: Metadata = pageMetadata({
  title: "障害年金の申請準備コラム",
  description: DESCRIPTION,
  path: "/columns",
});

export default function ColumnsPage() {
  return (
    <>
      <h1>コラム</h1>

      <p className="lead">
        障害年金の申請準備に役立つ情報をまとめています。
      </p>

      <ul className="column-list">
        {COLUMNS_BY_DATE.map((c) => (
          <li key={c.slug} className="column-card">
            <p className="meta-line">
              <time dateTime={c.datePublished}>
                {formatDate(c.datePublished)}
              </time>
            </p>
            <p className="column-card-title">
              <Link href={`/columns/${c.slug}`}>{c.title}</Link>
            </p>
            <p className="small-note">{c.description}</p>
          </li>
        ))}
      </ul>

      <p className="page-links">
        <Link href="/">トップへ戻る</Link>
      </p>
    </>
  );
}
