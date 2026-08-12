import type { Metadata } from "next";
import { Zen_Old_Mincho } from "next/font/google";
import "./globals.css";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import {
  APP_STORE_ID,
  SITE_NAME,
  SITE_URL,
} from "@/lib/constants";
import { OG_IMAGE } from "@/lib/seo";

// 見出し専用の明朝体。本文は現行のシステムゴシックスタックのまま(パフォーマンス優先)。
const zenOldMincho = Zen_Old_Mincho({
  weight: ["600", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-display",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "障害年金の申請の流れと必要書類｜初めての方へ8ステップで解説",
    template: `%s｜${SITE_NAME}`,
  },
  description:
    "障害年金の申請を何から始めればよいか、初診日の確認、納付要件、年金事務所への相談、必要書類、診断書、申立書、提出、結果待ちまで8ステップで分かりやすく解説します。",
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: "障害年金の申請の流れと必要書類｜初めての方へ8ステップで解説",
    description:
      "障害年金の申請を何から始めればよいか、初診日の確認、納付要件、年金事務所への相談、必要書類、診断書、申立書、提出、結果待ちまで8ステップで分かりやすく解説します。",
    url: "/",
    locale: "ja_JP",
    images: [OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    images: [OG_IMAGE],
  },
  other: { "apple-itunes-app": `app-id=${APP_STORE_ID}` },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className={zenOldMincho.variable}>
      <body>
        <SiteHeader />
        <main>{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
