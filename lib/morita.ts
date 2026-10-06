import type { Metadata } from "next";
import { SITE_NAME, SITE_URL } from "@/lib/constants";
import { ABOUT_PERSON_ID, ABOUT_PUBLISHER_ID, OG_IMAGE } from "@/lib/seo";

/* 森田療法の区画 /morita/(docs/claude-code-morita-2026-10-06-instructions.md §2)。
   columns(lib/columns.ts)とは独立。cluster・hubs・COLUMNS には入れない。
   原稿は docs/morita-2026-10-06/articles/*.md、生成物は content/morita/<slug>.ts(scripts/import-morita.mjs)。
   この区画には広告・アプリ CTA・道具カード・年金の参考リンクを出さない。 */

export type MoritaGroup = "kangaekata" | "shoujou" | "jissen" | "qa" | "kiroku" | "kotoba";

export type MoritaArticleMeta = {
  slug: string;
  group: MoritaGroup | "hub";      // hub は /morita/ そのもの
  title: string;                   // h1・一覧・パンくず
  metaTitle?: string;              // <title> 用(全角32文字前後)。未指定なら title
  description: string;
  datePublished: string;           // YYYY-MM-DD
  dateModified: string;            // YYYY-MM-DD(原稿 frontmatter と一致させる)
  related: string[];               // 「次に読む」。公開済み slug のみ
};

export const MORITA_GROUP_LABELS: Record<MoritaGroup, string> = {
  kangaekata: "考え方", shoujou: "症状別", jissen: "実践", qa: "疑問とQ&A", kiroku: "当事者の記録", kotoba: "森田正馬の言葉",
};

export function moritaPath(a: MoritaArticleMeta): string {
  return a.group === "hub" ? "/morita" : `/morita/${a.group}/${a.slug}`;
}

export const MORITA_ARTICLES: MoritaArticleMeta[] = [
  {
    slug: "morita", group: "hub",
    title: "森田療法とは — 不安を消さずに、生活を取り戻す考え方",
    metaTitle: "森田療法とは｜不安を消さずに生活を取り戻す日本発の精神療法を当事者が解説",
    description: "森田療法は、不安や症状を消すのではなく、不安を抱えたまま、なすべきことから行動して生活を立て直す日本発の精神療法です。向いている症状、向かない人、入院しなくてもできる今の形、自分で始められる範囲を、不安障害の当事者である運営者が一次資料をもとに書きました。",
    datePublished: "2026-10-06", dateModified: "2026-10-06",
    related: ["ayashii", "kouka", "shakou-fuan"],
  },
  {
    slug: "ayashii", group: "qa",
    title: "森田療法は怪しい? — 怪しく見える3つの理由と、見分ける5つの線",
    metaTitle: "森田療法は怪しい？｜怪しく見える理由と、本物を見分ける5つの線",
    description: "森田療法そのものは、大学病院・学会・公益財団・50年続く自助グループが関わる100年の臨床がある精神療法です。怪しく見えるのは、言葉が精神論に聞こえること、研究がまだ弱いこと、便乗する高額業者がいること。「必ず治る」「薬をやめられる」「一瞬で」を言う相手は森田療法ではありません。",
    datePublished: "2026-10-06", dateModified: "2026-10-06",
    related: ["kouka", "morita"],
  },
  {
    slug: "kouka", group: "qa",
    title: "森田療法は効く? — エビデンスの現状と、「効く」が指すもの",
    metaTitle: "森田療法は効く？｜コクランと英国試験が示すこと、「効く」の本当の意味",
    description: "森田療法は「効いた人がいる」ことは確かで、「誰にでも効く」とは言えない療法です。コクランの系統的レビュー(2015年)は結論を出せず、英国のパイロット試験(2018年)は有望。森田療法の「効く」は症状の消失ではなく、不安があっても生活が回ること。期待の置き場所を先に直すための記事です。",
    datePublished: "2026-10-06", dateModified: "2026-10-06",
    related: ["ayashii", "morita"],
  },
  {
    slug: "shakou-fuan", group: "shoujou",
    title: "社交不安症(対人恐怖)と森田療法 — 緊張したまま、人前でやるべきことをやる",
    metaTitle: "社交不安症・対人恐怖と森田療法｜緊張や赤面を消さずに人前に立つ考え方",
    description: "人前での緊張・赤面・視線の怖さに森田療法を当てると、目標は「緊張しなくなる」ではなく「緊張したまま、やるべきことをやる」になります。隠そうとするほど強くなる仕組み、不安の裏にある「よく思われたい」欲望、会議・会食・電話の場面での動き方を、当事者が一次資料をもとに書きました。",
    datePublished: "2026-10-06", dateModified: "2026-10-06",
    related: ["kyouhaku", "panic", "morita"],
  },
  {
    slug: "kyouhaku", group: "shoujou",
    title: "強迫症と森田療法 — 不安を打ち消さず、不安なまま次の行動へ",
    metaTitle: "強迫症(確認・手洗い・嫌な考え)と森田療法｜回数を減らすより生活全体を立て直す",
    description: "鍵の確認、手洗い、頭から離れない嫌な考え。強迫症に森田療法を当てると、目標は「回数を減らす」ではなく「不安を抱えたまま生活全体を立て直す」になります。「本当の納得」はどこにもないこと、向いている人と先に医療機関へ行くべき人、鍵・手洗い・嫌な考えの場面での動き方。",
    datePublished: "2026-10-06", dateModified: "2026-10-06",
    related: ["shakou-fuan", "panic", "morita"],
  },
  {
    slug: "panic", group: "shoujou",
    title: "パニック症・広場恐怖と森田療法 — 発作を止めようとせず、不安を持ったままその場に居る",
    metaTitle: "パニック症・広場恐怖と森田療法｜発作から逃げずに付き合い方を変える",
    description: "突然の動悸と息苦しさ、「また起きたら」という不安で電車や人混みを避ける。パニック症・広場恐怖に森田療法を当てると、焦点は「発作を止める」ではなく「恐怖から逃げずに体験し、付き合い方を変える」になります。避けることが恐怖を育てる仕組みと、電車・人混み・夜の場面での動き方。",
    datePublished: "2026-10-06", dateModified: "2026-10-06",
    related: ["shakou-fuan", "kyouhaku", "morita"],
  },
];

export function getMoritaArticle(slug: string): MoritaArticleMeta {
  const article = MORITA_ARTICLES.find((a) => a.slug === slug);
  if (!article) throw new Error(`森田療法の記事が見つかりません: ${slug}`);
  return article;
}

export function moritaArticlesInGroup(group: MoritaGroup): MoritaArticleMeta[] {
  return MORITA_ARTICLES.filter((a) => a.group === group);
}

/* 全記事の path 集合。取り込みスクリプトのリンク検査(未公開 path の置換)とハブの導線に使う。 */
export const MORITA_PUBLISHED_PATHS: ReadonlySet<string> = new Set(MORITA_ARTICLES.map(moritaPath));

export const MORITA_HUB = getMoritaArticle("morita");

/* title の「 — 」より前(一覧・カード・次に読む用) */
export function moritaShortTitle(a: MoritaArticleMeta): string {
  return a.title.split(/\s*—\s*/)[0];
}

/* パンくず。ハブは トップ > 森田療法、記事は トップ > 森田療法 > 記事名(区画名は出さない)。 */
export function moritaBreadcrumbTrail(a: MoritaArticleMeta): { name: string; path: string }[] {
  const trail = [{ name: "トップ", path: "/" }, { name: "森田療法", path: "/morita" }];
  if (a.group !== "hub") trail.push({ name: a.title, path: moritaPath(a) });
  return trail;
}

/* 構造化データ(script 1 つ): Article + BreadcrumbList + FAQPage。citation は出さない(参照資料は内部記録のみ)。
   columnJsonLd は cluster 前提なので使わない。 */
export function moritaJsonLd(a: MoritaArticleMeta, faqs: { question: string; answer: string }[]) {
  const url = `${SITE_URL}${moritaPath(a)}`;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        "@id": `${url}#article`,
        url,
        headline: a.title,
        description: a.description,
        datePublished: a.datePublished,
        dateModified: a.dateModified,
        inLanguage: "ja-JP",
        author: { "@id": ABOUT_PERSON_ID },
        publisher: { "@type": "Organization", "@id": ABOUT_PUBLISHER_ID, name: SITE_NAME, url: SITE_URL },
        mainEntityOfPage: url,
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: moritaBreadcrumbTrail(a).map((item, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: item.name,
          item: `${SITE_URL}${item.path === "/" ? "/" : item.path}`,
        })),
      },
      ...(faqs.length > 0 ? [{
        "@type": "FAQPage",
        mainEntity: faqs.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: { "@type": "Answer", text: faq.answer },
        })),
      }] : []),
    ],
  };
}

/* 記事の metadata(columnMetadata と同じ形。og:image は区画専用の画像が無いのでサイト共通)。 */
export function moritaMetadata(a: MoritaArticleMeta): Metadata {
  const path = moritaPath(a);
  const metaTitle = a.metaTitle ?? a.title;
  const fullTitle = `${metaTitle}｜${SITE_NAME}`;
  return {
    title: metaTitle,
    description: a.description,
    alternates: { canonical: `${SITE_URL}${path}` },
    openGraph: {
      title: fullTitle,
      description: a.description,
      type: "article",
      siteName: SITE_NAME,
      url: `${SITE_URL}${path}`,
      locale: "ja_JP",
      publishedTime: a.datePublished,
      modifiedTime: a.dateModified,
      images: [OG_IMAGE],
    },
    twitter: { card: "summary_large_image", title: fullTitle, description: a.description, images: [OG_IMAGE] },
    robots: { index: true, follow: true },
  };
}
