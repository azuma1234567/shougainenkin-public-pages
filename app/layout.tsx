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
    default: "障害年金申請サポート｜申請準備・記録・申立書の下書きを支援",
    template: `%s｜${SITE_NAME}`,
  },
  description:
    "障害年金の申請準備を、ひとつずつ。日々の困りごとを記録し、診察で医師に見せる資料や病歴・就労状況等申立書の下書き作成を支援するiPhoneアプリです。",
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: "障害年金申請サポート｜申請準備・記録・申立書の下書きを支援",
    description:
      "障害年金の申請準備を、ひとつずつ。日々の困りごとを記録し、診察で医師に見せる資料や病歴・就労状況等申立書の下書き作成を支援するiPhoneアプリです。",
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
