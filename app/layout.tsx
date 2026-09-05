import type { Metadata } from "next";
import { Zen_Kaku_Gothic_New, Zen_Old_Mincho } from "next/font/google";
import "./globals.css";
import "./platform.css";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import YougoAutoLinker from "@/components/YougoAutoLinker";
import {
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

// 新しい情報プラットフォームの見出し用。next/font でセルフホストし、
// Google Fonts への実行時リクエストを発生させない。
const zenKakuGothic = Zen_Kaku_Gothic_New({
  weight: ["500", "700"],
  subsets: ["latin"],
  display: "swap",
  preload: false,
  variable: "--font-platform-heading",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "障害年金の疑問に、公的根拠と実例で答える｜障害年金申請サポート",
    template: `%s｜${SITE_NAME}`,
  },
  description:
    "障害年金がはじめての方へ。病気、申請の段階、いまの悩みから、公的資料の根拠と公開裁決例を使って自分に近い情報を探せます。",
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: "障害年金の疑問に、公的根拠と実例で答える｜障害年金申請サポート",
    description:
      "障害年金がはじめての方へ。病気、申請の段階、いまの悩みから、公的資料の根拠と公開裁決例を使って自分に近い情報を探せます。",
    url: "/",
    locale: "ja_JP",
    images: [OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    images: [OG_IMAGE],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ja"
      className={`${zenOldMincho.variable} ${zenKakuGothic.variable}`}
    >
      <body>
        <SiteHeader />
        <main>{children}</main>
        <YougoAutoLinker />
        <SiteFooter />
      </body>
    </html>
  );
}
