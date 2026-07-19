import Link from "next/link";
import { COLUMNS, type Column } from "@/lib/columns";

export type Reference = { label: string; href: string };

// 全記事共通で案内できる、実在確認済みの日本年金機構ページ。
export const NENKIN_REFERENCES = {
  seido: {
    label: "日本年金機構「障害年金の制度」",
    href: "https://www.nenkin.go.jp/service/jukyu/seido/shougainenkin/index.html",
  },
  jukyuYoken: {
    label: "日本年金機構「障害基礎年金の受給要件・請求時期・年金額」",
    href: "https://www.nenkin.go.jp/service/jukyu/seido/shougainenkin/jukyu-yoken/20150514.html",
  },
  moushitatesho: {
    label: "日本年金機構「病歴・就労状況等申立書を提出するとき」",
    href: "https://www.nenkin.go.jp/shinsei/jukyu/shougai/shindansho/20140516.html",
  },
} as const satisfies Record<string, Reference>;

export const MHLW_REFERENCES = {
  seishinGuideline: {
    label: "厚生労働省「精神の障害に係る等級判定ガイドライン」",
    href: "https://www.mhlw.go.jp/stf/houdou/0000130041.html",
  },
} as const satisfies Record<string, Reference>;

// 記事末尾に置く「参考リンク」と「あわせて読みたい」。
export default function ColumnFooter({
  currentSlug,
  relatedSlugs,
  references = [NENKIN_REFERENCES.seido],
}: {
  currentSlug: string;
  relatedSlugs?: string[];
  references?: Reference[];
}) {
  const others = relatedSlugs
    ? relatedSlugs
        .map((slug) => COLUMNS.find((column) => column.slug === slug))
        .filter((column): column is Column => Boolean(column))
    : COLUMNS.filter((column) => column.slug !== currentSlug);
  return (
    <>
      {references.length > 0 && (
        <section className="references">
          <h2>参考リンク</h2>
          <ul>
            {references.map((reference) => (
              <li key={reference.href}>
                <a href={reference.href} target="_blank" rel="noopener">
                  {reference.label}
                </a>
              </li>
            ))}
          </ul>
          <p className="small-note">
            制度の正式な情報・最新の様式は、日本年金機構のホームページおよび
            年金事務所でご確認ください。
          </p>
        </section>
      )}
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
