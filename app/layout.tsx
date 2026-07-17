import type { Metadata } from "next";
import "./globals.css";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import {
  APP_STORE_ID,
  IS_APP_RELEASED,
  SITE_NAME,
  SITE_URL,
} from "@/lib/constants";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — 障害年金の申請準備を、ひとつずつ。`,
    template: `%s | ${SITE_NAME}`,
  },
  description:
    "障害年金の申請準備のための記録・整理アプリ。日々の記録が、診察で医師に渡せる資料になり、申立書の下書きになる。ログイン不要・記録は端末の中に。",
  // Smart App Banner。App Store公開後(IS_APP_RELEASED = true)のみ出力する
  other: IS_APP_RELEASED
    ? { "apple-itunes-app": `app-id=${APP_STORE_ID}` }
    : undefined,
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
