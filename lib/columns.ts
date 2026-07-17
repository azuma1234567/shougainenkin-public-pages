import { AUTHOR_NAME, SITE_NAME, SITE_URL } from "@/lib/constants";

// コラム記事のメタデータ。一覧・sitemap・JSON-LDで共通利用する。
// slugは計測用キャンペーンリンクのctにも使うため変更しないこと。

export type Column = {
  slug: string;
  title: string;
  description: string;
  datePublished: string; // YYYY-MM-DD
  dateModified: string; // YYYY-MM-DD
};

export const COLUMNS: Column[] = [
  {
    slug: "moushitatesho-kakikata",
    title:
      "【うつ病などの精神疾患】病歴・就労状況等申立書の書き方 — 期間の区切り方から文例まで",
    description:
      "障害年金の病歴・就労状況等申立書の書き方を、精神疾患(うつ病・双極性障害・発達障害など)の方向けに解説。期間の区切り方、各期間に書くべき4つの要素、伝わる文例と書き直し例を紹介します。",
    datePublished: "2026-07-17",
    dateModified: "2026-07-17",
  },
  {
    slug: "moushitatesho-a4-insatsu",
    title:
      "病歴・就労状況等申立書はA4印刷で提出できる?用紙の入手方法と印刷のコツ",
    description:
      "障害年金の病歴・就労状況等申立書は原本がA3サイズ。自宅のA4プリンタで印刷して提出できるのか、用紙のダウンロード方法、コンビニでA3原寸印刷する手順まで解説します。",
    datePublished: "2026-07-17",
    dateModified: "2026-07-17",
  },
  {
    slug: "shinsatsu-mae-memo",
    title:
      "主治医に日常の大変さが伝わらないと感じたら — 診察前メモで生活の実態を伝える方法",
    description:
      "障害年金の診断書は、診察室で見えた様子をもとに書かれます。診察の短い時間で伝えきれない日常生活の実態を、メモにして主治医に渡す方法と、渡し方の実際、添え書きの文例を紹介します。",
    datePublished: "2026-07-17",
    dateModified: "2026-07-17",
  },
];

export function getColumn(slug: string): Column {
  const column = COLUMNS.find((c) => c.slug === slug);
  if (!column) {
    throw new Error(`コラム記事が見つかりません: ${slug}`);
  }
  return column;
}

export function columnJsonLd(column: Column) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: column.title,
    description: column.description,
    datePublished: column.datePublished,
    dateModified: column.dateModified,
    author: {
      "@type": "Person",
      name: AUTHOR_NAME,
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
    },
    mainEntityOfPage: `${SITE_URL}/columns/${column.slug}`,
  };
}

export function formatDate(date: string): string {
  const [y, m, d] = date.split("-");
  return `${y}年${Number(m)}月${Number(d)}日`;
}
