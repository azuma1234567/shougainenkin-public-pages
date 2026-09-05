import type { Metadata } from "next";
import { APP_STORE_ID, AUTHOR_NAME, CONTACT_EMAIL, SITE_NAME, SITE_URL } from "@/lib/constants";

export const OG_IMAGE = {
  url: "/opengraph-image",
  width: 1200,
  height: 630,
  alt: `${SITE_NAME} — 障害年金の申請準備を、ひとつずつ。`,
};

// 下層ページ用のOpenGraph設定を組み立てる。
// og:imageはサイト共通の /opengraph-image(記事ページは記事別画像)を使う。
export function pageOpenGraph(
  title: string,
  description: string,
  path = "/",
) {
  const fullTitle = title.includes(SITE_NAME)
    ? title
    : `${title}｜${SITE_NAME}`;

  return {
    title: fullTitle,
    description,
    type: "website" as const,
    siteName: SITE_NAME,
    url: `${SITE_URL}${path === "/" ? "/" : path}`,
    locale: "ja_JP",
    images: [OG_IMAGE],
  };
}

// パンくずの構造化データ(BreadcrumbList)。
export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}${item.path === "/" ? "/" : item.path}`,
    })),
  };
}

// FAQの構造化データ。質問・回答は必ず記事本文にある内容だけを使うこと。
export function faqJsonLd(faqs: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

/* Smart App Banner。全ページに出すと記事の上に常に帯が出るので、
   アプリと機能が対応するページにだけ付ける
   (docs/site-structure-2026-09-05-instructions.md §6)。
   appArgument を渡すと、アプリ側が対応するページを開ける。 */
export function appBanner(appArgument?: string) {
  return { "apple-itunes-app": `app-id=${APP_STORE_ID}${appArgument ? `, app-argument=${appArgument}` : ""}` };
}

export function pageMetadata({
  title,
  description,
  path,
  absoluteTitle = false,
  appBannerArgument,
  showAppBanner = false,
}: {
  title: string;
  description: string;
  path: string;
  absoluteTitle?: boolean;
  /* Smart App Banner を出すページだけ true。道具のページは app-argument も付ける。 */
  showAppBanner?: boolean;
  appBannerArgument?: string;
}): Metadata {
  const fullTitle = title.includes(SITE_NAME)
    ? title
    : `${title}｜${SITE_NAME}`;

  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: {
      canonical: `${SITE_URL}${path === "/" ? "/" : path}`,
    },
    openGraph: pageOpenGraph(fullTitle, description, path),
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [OG_IMAGE],
    },
    robots: { index: true, follow: true },
    ...(showAppBanner ? { other: appBanner(appBannerArgument) } : {}),
  };
}

// 運営者と発行元。実体は /about に置き、トップの WebSite.publisher からこの @id を
// 参照する。記事の columnJsonLd も同じ @id を使い、著者・発行元を結ぶ。
export const ABOUT_PERSON_ID = `${SITE_URL}/about#person`;
export const ABOUT_PUBLISHER_ID = `${SITE_URL}/about#organization`;

// /about に出す Person / Organization。
export const publisherJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Person",
      "@id": ABOUT_PERSON_ID,
      name: AUTHOR_NAME,
      url: `${SITE_URL}/about`,
    },
    {
      "@type": "Organization",
      "@id": ABOUT_PUBLISHER_ID,
      name: SITE_NAME,
      url: SITE_URL,
      email: CONTACT_EMAIL,
      founder: { "@id": ABOUT_PERSON_ID },
    },
  ],
};
