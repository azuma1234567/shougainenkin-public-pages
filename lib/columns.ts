import type { Metadata } from "next";
import { AUTHOR_NAME, SITE_NAME, SITE_URL } from "@/lib/constants";

// コラム記事のメタデータ。一覧・sitemap・JSON-LDで共通利用する。
// slugは計測用キャンペーンリンクのctにも使うため変更しないこと。

export type Column = {
  slug: string;
  title: string;
  // 検索結果用の短いtitle(全角32文字前後)。未指定ならtitleを使う。
  // h1・一覧・パンくずの表示はtitleのまま変えない。
  metaTitle?: string;
  // 原稿でtitle全体が明示されている場合、layoutのサイト名テンプレートを重ねない。
  absoluteMetaTitle?: boolean;
  description: string;
  datePublished: string; // YYYY-MM-DD
  dateModified: string; // YYYY-MM-DD
};

// 第3弾の記事は一覧で分散表示できるよう、公開日を1本ずつ管理する。
const NEW_COLUMN_DATES = {
  "ninteibi-jigojusho": "2026-07-18",
  "shindansho-kakunin": "2026-07-17",
  "techou-to-nenkin": "2026-07-16",
  "shoubyou-teatekin": "2026-07-15",
  "hattatsu-shougai": "2026-07-14",
  "hatachi-mae": "2026-07-13",
  "fushikyuu-shinsa-seikyu": "2026-07-12",
} as const;

export const COLUMNS: Column[] = [
  {
    slug: "ninteibi-jigojusho",
    title:
      "障害認定日とは?事後重症との違いと、さかのぼり請求(遡及請求)の基本",
    metaTitle: "障害認定日とは?事後重症との違いと遡及請求の基本",
    description:
      "障害年金の「障害認定日」は原則、初診日から1年6か月後。認定日請求と事後重症請求の違い、最大5年さかのぼれる遡及請求のしくみ、請求を先延ばしにしないほうがよい理由を解説します。",
    datePublished: NEW_COLUMN_DATES["ninteibi-jigojusho"],
    dateModified: NEW_COLUMN_DATES["ninteibi-jigojusho"],
  },
  {
    slug: "shindansho-kakunin",
    title: "障害年金の診断書を受け取ったら — 提出前に確認したいポイント",
    description:
      "医師に書いてもらった障害年金の診断書は、提出前に内容を確認できます。記入漏れや事実と異なる記載がないかを確認するポイントと、修正をお願いするときの伝え方を解説します。",
    datePublished: NEW_COLUMN_DATES["shindansho-kakunin"],
    dateModified: NEW_COLUMN_DATES["shindansho-kakunin"],
  },
  {
    slug: "techou-to-nenkin",
    title: "障害者手帳と障害年金の違い — 手帳の等級と年金の等級は別物です",
    description:
      "精神障害者保健福祉手帳と障害年金は、別の制度・別の審査です。手帳3級でも年金を受給できる場合があること、手帳がなくても年金申請できること、年金証書で手帳を取得できる制度を解説します。",
    datePublished: NEW_COLUMN_DATES["techou-to-nenkin"],
    dateModified: NEW_COLUMN_DATES["techou-to-nenkin"],
  },
  {
    slug: "shoubyou-teatekin",
    title: "傷病手当金と障害年金は両方もらえる?関係と切り替えのタイミング",
    description:
      "休職中に受け取る傷病手当金(最長1年6か月)と障害年金の関係を解説。同じ傷病では併給調整があること、傷病手当金の支給期間の終わりが障害年金を検討するタイミングになる理由を説明します。",
    datePublished: NEW_COLUMN_DATES["shoubyou-teatekin"],
    dateModified: NEW_COLUMN_DATES["shoubyou-teatekin"],
  },
  {
    slug: "hattatsu-shougai",
    title:
      "発達障害(ADHD・ASD)で障害年金は受給できる?初診日の考え方と申請のポイント",
    metaTitle: "発達障害(ADHD・ASD)の障害年金 — 初診日と申請のポイント",
    description:
      "発達障害(ADHD・自閉スペクトラム症)は障害年金の対象です。大人になってから診断された場合の初診日の考え方、二次障害(うつ病など)がある場合、日常生活の実態の伝え方を解説します。",
    datePublished: NEW_COLUMN_DATES["hattatsu-shougai"],
    dateModified: NEW_COLUMN_DATES["hattatsu-shougai"],
  },
  {
    slug: "hatachi-mae",
    title: "20歳前傷病の障害基礎年金とは — 納付要件なし・所得制限ありのしくみ",
    description:
      "20歳前に初診日がある場合の障害基礎年金を解説。保険料納付要件が問われない理由、20歳になったときの請求(障害認定日の特例)、所得制限があること、請求の進め方を説明します。",
    datePublished: NEW_COLUMN_DATES["hatachi-mae"],
    dateModified: NEW_COLUMN_DATES["hatachi-mae"],
  },
  {
    slug: "fushikyuu-shinsa-seikyu",
    title:
      "障害年金が不支給・想定より低い等級だったとき — 審査請求と再請求という選択肢",
    metaTitle: "障害年金が不支給・低い等級だったときの審査請求と再請求",
    description:
      "障害年金の結果に納得できないときの対処法を解説。3か月以内という審査請求の期限、再審査請求、あらためて請求し直す方法、まず不支給の理由を確認することの大切さを説明します。",
    datePublished: NEW_COLUMN_DATES["fushikyuu-shinsa-seikyu"],
    dateModified: NEW_COLUMN_DATES["fushikyuu-shinsa-seikyu"],
  },
  {
    slug: "jibun-de-shinsei",
    title:
      "障害年金は自分で申請できる?社労士に依頼する場合との違いと判断のポイント",
    metaTitle: "障害年金は自分で申請できる?社労士に依頼する場合との違い",
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
    metaTitle: "障害年金の保険料納付要件とは — 3分の2要件と直近1年の特例",
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
      "【うつ病などの精神疾患】病歴・就労状況等申立書の書き方 — 期間の区切り方から文例・フル記入例まで",
    metaTitle:
      "病歴・就労状況等申立書の書き方【精神疾患】期間の区切り方・文例・フル記入例｜障害年金申請サポート",
    absoluteMetaTitle: true,
    description:
      "障害年金の病歴・就労状況等申立書の書き方を精神疾患(うつ病・双極性障害・発達障害など)向けに解説。期間の区切り方、書くべき4要素、NG例と書き直し例6組、発病から現在までのフル記入例、よくある質問まで。",
    datePublished: "2026-07-17",
    dateModified: "2026-07-18",
  },
  {
    slug: "moushitatesho-a4-insatsu",
    title:
      "病歴・就労状況等申立書はA4印刷で提出できる? — 用紙の入手方法とコンビニ印刷の手順",
    metaTitle:
      "病歴・就労状況等申立書はA4で印刷できる?用紙のダウンロードとコンビニA3印刷の手順",
    absoluteMetaTitle: true,
    description:
      "病歴・就労状況等申立書の原本はA3サイズ。自宅のA4プリンタでどう印刷するか、用紙のダウンロード方法、コンビニのマルチコピー機でA3原寸印刷する手順、拡大縮小の注意点、提出前の確認ポイントまで解説します。",
    datePublished: "2026-07-17",
    dateModified: "2026-07-18",
  },
  {
    slug: "shinsatsu-mae-memo",
    title:
      "主治医に日常の大変さが伝わらないと感じたら — 診察前メモで生活の実態を伝える方法",
    metaTitle:
      "主治医に生活の大変さが伝わらない時の対処法 — 診察前メモの作り方・渡し方・文例【障害年金】",
    absoluteMetaTitle: true,
    description:
      "「診察では『変わりないです』と言ってしまう」を解決する診察前メモの作り方。診断書の日常生活7項目に沿ったメモの整理法、1週間分の記入例、渡し方3パターンと添え書き文例、渡せない場合の使い方まで解説。",
    datePublished: "2026-07-17",
    dateModified: "2026-07-18",
  },
];

export const COLUMNS_BY_DATE = [...COLUMNS].sort(
  (a, b) =>
    b.datePublished.localeCompare(a.datePublished) ||
    b.dateModified.localeCompare(a.dateModified),
);

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
// og:imageは各記事フォルダの opengraph-image.tsx(タイトル入り)が使われる。
export function columnMetadata(column: Column): Metadata {
  const path = `/columns/${column.slug}`;
  const metaTitle = column.metaTitle ?? column.title;
  const fullTitle = column.absoluteMetaTitle
    ? metaTitle
    : `${metaTitle}｜${SITE_NAME}`;

  return {
    title: column.absoluteMetaTitle ? { absolute: metaTitle } : metaTitle,
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
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description: column.description,
    },
    robots: { index: true, follow: true },
  };
}

export function formatDate(date: string): string {
  const [y, m, d] = date.split("-");
  return `${y}年${Number(m)}月${Number(d)}日`;
}
