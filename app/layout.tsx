import type { Metadata } from "next";
import "./globals.css";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import {
  APP_STORE_ID,
  SITE_NAME,
  SITE_URL,
} from "@/lib/constants";
import { OG_IMAGE } from "@/lib/seo";

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
    <html lang="ja">
      <body>
        <SiteHeader />
        <main>{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
