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
    default: "障害年金申請サポート｜日々のメモが診察メモと申立書になるアプリ",
    template: `%s｜${SITE_NAME}`,
  },
  description:
    "障害年金の申請準備を自分で進めるためのiOSアプリ。日々のひとことメモから、診察で見せられる1枚と申立書の下書きを作成。費用を抑えて、受給の可能性を高める準備を。",
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: "障害年金申請サポート｜日々のメモが診察メモと申立書になるアプリ",
    description:
      "障害年金の申請準備を自分で進めるためのiOSアプリ。日々のひとことメモから、診察で見せられる1枚と申立書の下書きを作成。費用を抑えて、受給の可能性を高める準備を。",
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
