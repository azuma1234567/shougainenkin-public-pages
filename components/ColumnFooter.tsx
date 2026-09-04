import Link from "next/link";
import { getColumn, parentPillar, relatedColumns } from "@/lib/columns";
import { siblingSlugs } from "@/lib/hubs";
import { SHORUI_URLS } from "@/data/shorui";

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
  diagnosis: {
    label: "日本年金機構「障害年金の診断書を作成する医師の方へ」",
    href: "https://www.nenkin.go.jp/shinsei/jukyu/shougai/shindansho/sakusei.html",
  },
  firstVisit: {
    label: "日本年金機構「初診日」",
    href: "https://www.nenkin.go.jp/service/yougo/sagyo/syosinbi.html",
  },
  thirdParty: {
    label: "日本年金機構「障害年金を請求される皆様へ」",
    href: "https://www.nenkin.go.jp/service/pamphlet/kyufu.files/0326.pdf",
  },
  beforeTwenty: {
    label: "日本年金機構「20歳前の傷病による障害基礎年金にかかる支給制限等」",
    href: "https://www.nenkin.go.jp/service/jukyu/seido/shougainenkin/jukyu-yoken/20200805.html",
  },
  firstVisitProof: {
    label: "日本年金機構「20歳前障害基礎年金」",
    href: "https://www.nenkin.go.jp/service/riyoushabetsu/cooperator/kakehashi/bessatu.files/bessatu02.pdf",
  },
} as const satisfies Record<string, Reference>;

export const MHLW_REFERENCES = {
  seishinGuideline: {
    label: "厚生労働省「精神の障害に係る等級判定ガイドライン」",
    href: "https://www.mhlw.go.jp/stf/houdou/0000130041.html",
  },
} as const satisfies Record<string, Reference>;

// 追加4件は2026-09-04に curl -I -L で最終HTTP 200を確認。
export const COLUMN_ADDITIONAL_REFERENCES = {
  report: { label: "令和6年度の障害年金の認定状況についての調査報告書", href: "https://www.mhlw.go.jp/content/12512000/001502249.pdf" },
  tenken: { label: "障害年金の認定状況について", href: "https://www.nenkin.go.jp/tokusetsu/tenken.html" },
  shien: { label: "障害年金生活者支援給付金の概要", href: "https://www.nenkin.go.jp/service/jukyu/seido/sonota-kyufu/shienkyufukin/syougai.html" },
  amounts: { label: "令和8年度の年金額", href: "https://www.nenkin.go.jp/tokusetsu/nenkingakutou_kaitei.html" },
} satisfies Record<string, Reference>;

// 資料名だけをリンク化し、原稿の発行者・確認日・説明はそのまま残す。
// 一致する資料を確認できない場合は、リンクを推測しない。
export const COLUMN_SOURCE_LINKS: Reference[] = [
  ...Object.values(NENKIN_REFERENCES).map(ref => ({ ...ref, label: ref.label.match(/「(.+)」/)![1] })),
  ...Object.values(MHLW_REFERENCES).map(ref => ({ ...ref, label: ref.label.match(/「(.+)」/)![1] })),
  ...Object.values(COLUMN_ADDITIONAL_REFERENCES),
  { label: "受診状況等証明書が添付できない申立書", href: SHORUI_URLS.jushinjokyo },
  { label: "受診状況等証明書", href: SHORUI_URLS.jushinjokyo },
  { label: "初診日に関する第三者からの申立書", href: SHORUI_URLS.daisansha },
  { label: "障害基礎年金を受けられるとき", href: SHORUI_URLS.kisoSeikyuu },
  { label: "障害厚生年金を受けられるとき", href: SHORUI_URLS.kouseiSeikyuu },
].sort((a, b) => b.label.length - a.label.length);

// 記事末尾に置く「参考リンク」「このテーマの全体像」「あわせて読みたい」。
export default function ColumnFooter({
  currentSlug,
  relatedSlugs,
  references = [NENKIN_REFERENCES.seido],
}: {
  currentSlug: string;
  relatedSlugs?: string[];
  references?: Reference[];
}) {
  // 記事ごとに手で選んだ relatedSlugs を先頭に、足りない分を同じクラスタの記事で補う。
  const others = relatedColumns(currentSlug, relatedSlugs);
  // 親(柱)ページへの導線。柱ページが未公開の間はnullで、何も表示しない。
  const pillar = parentPillar(getColumn(currentSlug));
  const siblings = siblingSlugs(currentSlug).map(getColumn);
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
      {pillar && (
        <p className="cluster-parent">
          このテーマの全体像は「
          <Link href={pillar.pillarPath}>{pillar.label}</Link>
          」にまとめています。
        </p>
      )}
      {siblings.length > 0 && (
        <section className="related-columns column-siblings">
          <h2>特に関係が近い記事</h2>
          <ul>{siblings.map((column) => <li key={column.slug}><Link href={`/columns/${column.slug}`}>{column.title}</Link></li>)}</ul>
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
    </>
  );
}
