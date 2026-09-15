import type { Metadata } from "next";
import localFont from "next/font/local";
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
import { ADSENSE_CLIENT, ADSENSE_ENABLED } from "@/lib/ads";

/* 見出し用の2書体は、見出しに出る文字だけの自前サブセット(public/fonts/。scripts/build-font-subset.mjs で生成)。
   next/font/google は subsets: ["latin"] でも日本語の unicode-range 分割を 100 本以上読みに行き、LCP を数十秒に
   していた(docs/perf-fonts-2026-09-15-instructions.md)。見出しの文字が増えたら npm run build:fonts。
   charset に無い文字は font-family の後続(システムフォント)に落ちる。scripts/verify-fonts.mjs が見張る。 */

// 見出し専用の明朝体(h1・h2 用。CSS は 700 しか使わないので 700 だけ読み、これだけ preload する)。本文はシステムフォントのまま。
const zenOldMincho = localFont({
  src: [{ path: "../public/fonts/zen-old-mincho-700.woff2", weight: "700", style: "normal" }],
  display: "swap",
  preload: true,
  variable: "--font-display",
});

// 情報プラットフォームの見出し用ゴシック。preload はしない(h1 の明朝より後でよい)。
const zenKakuGothic = localFont({
  src: [
    { path: "../public/fonts/zen-kaku-gothic-new-500.woff2", weight: "500", style: "normal" },
    { path: "../public/fonts/zen-kaku-gothic-new-700.woff2", weight: "700", style: "normal" },
  ],
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
        {/* AdSense のサイト所有権確認用。広告ユニットはまだ置いていない
            (自動広告も管理画面で OFF のまま)。開示の文面は lib/ads.ts の
            ADSENSE_ENABLED と連動して /privacy 第6条・/terms・/about・
            フッターに出る。
            next/script は使わない。App Router の afterInteractive も
            beforeInteractive も、配信される HTML に script タグを出さず
            (前者は水和後に差し込み、後者は preload だけ)、審査の
            「コードが見つかりません」になる。素の <script async> なら
            React が <head> に持ち上げ、HTML にそのまま出る
            (指示書 §5-2 の curl 確認)。 */}
        {ADSENSE_ENABLED && (
          <script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`}
            crossOrigin="anonymous"
          />
        )}
        <SiteHeader />
        <main>{children}</main>
        <YougoAutoLinker />
        <SiteFooter />
      </body>
    </html>
  );
}
