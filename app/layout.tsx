import type { Metadata } from "next";
import "./globals.css";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { SITE_NAME, SITE_URL } from "@/lib/constants";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — 障害年金の申請準備を、ひとつずつ。`,
    template: `%s | ${SITE_NAME}`,
  },
  description:
    "障害年金の申請準備のための記録・整理アプリ。日々の記録が、診察で医師に渡せる資料になり、申立書の下書きになる。ログイン不要・記録は端末の中に。",
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
