import type { Metadata } from "next";
import { SITE_NAME, SITE_URL } from "@/lib/constants";

export const OG_IMAGE = {
  url: "/opengraph-image",
  width: 1200,
  height: 630,
  alt: `${SITE_NAME} — 障害年金の申請準備を、ひとつずつ。`,
};

// 下層ページ用のOpenGraph設定を組み立てる。
// og:imageはサイト共通の /og.png を使う。
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

export function pageMetadata({
  title,
  description,
  path,
  absoluteTitle = false,
}: {
  title: string;
  description: string;
  path: string;
  absoluteTitle?: boolean;
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
  };
}
