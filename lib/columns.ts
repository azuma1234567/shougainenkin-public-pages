import type { Metadata } from "next";
import { AUTHOR_NAME, SITE_NAME, SITE_URL } from "@/lib/constants";
import { OG_IMAGE } from "@/lib/seo";

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
    slug: "jibun-de-shinsei",
    title:
      "障害年金は自分で申請できる?社労士に依頼する場合との違いと判断のポイント",
    description:
      "障害年金の申請は自分でできる手続きです。自分で進める場合と社会保険労務士に依頼する場合の違い、費用の考え方、専門家に相談したほうがよいケースの判断基準を解説します。",
    datePublished: "2026-07-17",
    dateModified: "2026-07-17",
  },
  {
    slug: "shinsei-nagare",
    title:
      "障害年金の申請の流れと必要書類 — 何から始めればいいかを順番に解説",
    description:
      "精神疾患で障害年金を申請するときの流れを、初診日の確認から納付要件、診断書の依頼、病歴・就労状況等申立書の作成、提出・審査まで7つのステップで解説。必要書類の一覧つき。",
    datePublished: "2026-07-17",
    dateModified: "2026-07-17",
  },
  {
    slug: "hatarakinagara",
    title: "働きながら障害年金は受け取れる?精神疾患と就労の関係",
    description:
      "就労していると障害年金は受給できないのか。精神疾患の審査で就労状況がどう見られるか、障害者雇用や職場の配慮の扱い、診断書・申立書に働き方の実態を書くポイントを解説します。",
    datePublished: "2026-07-17",
    dateModified: "2026-07-17",
  },
  {
    slug: "nofu-yoken",
    title:
      "障害年金の保険料納付要件とは — 未納があると受け取れない?3分の2要件と直近1年の特例",
    description:
      "障害年金には保険料納付要件があります。3分の2要件と直近1年特例のしくみ、免除・学生納付特例の扱い、初診日より後に納めても間に合わない理由、納付状況の確認方法を解説します。",
    datePublished: "2026-07-17",
    dateModified: "2026-07-17",
  },
  {
    slug: "shoshinbi-wakaranai",
    title: "障害年金の初診日がわからない・カルテがないときの調べ方",
    description:
      "障害年金の申請は初診日の特定から始まります。初診日の考え方(精神疾患では内科受診が初診になることも)、受診状況等証明書、カルテが破棄されていた場合の対処法を解説します。",
    datePublished: "2026-07-17",
    dateModified: "2026-07-17",
  },
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
    "@graph": [
      {
        "@type": "Article",
        headline: column.title,
        description: column.description,
        datePublished: column.datePublished,
        dateModified: column.dateModified,
        inLanguage: "ja-JP",
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
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "トップ",
            item: `${SITE_URL}/`,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "コラム",
            item: `${SITE_URL}/columns`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: column.title,
            item: `${SITE_URL}/columns/${column.slug}`,
          },
        ],
      },
    ],
  };
}

// 記事ページ共通のメタデータ(title / description / OpenGraph)。
export function columnMetadata(column: Column): Metadata {
  const path = `/columns/${column.slug}`;
  const fullTitle = `${column.title}｜${SITE_NAME}`;

  return {
    title: column.title,
    description: column.description,
    alternates: { canonical: `${SITE_URL}${path}` },
    openGraph: {
      title: fullTitle,
      description: column.description,
      type: "article",
      siteName: SITE_NAME,
      url: `${SITE_URL}${path}`,
      locale: "ja_JP",
      publishedTime: column.datePublished,
      modifiedTime: column.dateModified,
      images: [OG_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description: column.description,
      images: [OG_IMAGE],
    },
    robots: { index: true, follow: true },
  };
}

export function formatDate(date: string): string {
  const [y, m, d] = date.split("-");
  return `${y}年${Number(m)}月${Number(d)}日`;
}
