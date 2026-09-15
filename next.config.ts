import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 誤解カードのOG画像が同梱フォント(lib/fonts)を読むため、関数バンドルに含める。
  outputFileTracingIncludes: {
    "/gokai/[slug]/opengraph-image": ["./lib/fonts/*.ttf"],
  },
  // AI クローラー方針(2026-09-15): RSL 1.0 のライセンス文書(public/license.xml)を仕様どおりの media type で返し、
  // 全ページに Link ヘッダでライセンスの場所を示す。HTML の <link rel="license"> は重複になるので入れない。
  async headers() {
    return [
      {
        source: "/license.xml",
        headers: [{ key: "Content-Type", value: "application/rsl+xml; charset=utf-8" }],
      },
      {
        source: "/:path*",
        headers: [{ key: "Link", value: '<https://shougainenkin-note.net/license.xml>; rel="license"; type="application/rsl+xml"' }],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: "/dougu",
        destination: "/shinsei",
        statusCode: 301,
      },
      // 「申請の流れ」記事はトップページ(親ページ)へ統合したため恒久リダイレクト
      {
        source: "/columns/shinsei-nagare",
        destination: "/shinsei",
        permanent: true,
      },
      // 道具ページの名称を /dougu に統一。旧候補URLは301で引き継ぐ。
      {
        source: "/tsukuru",
        destination: "/dougu",
        statusCode: 301,
      },
      {
        source: "/tsukuru/:path*",
        destination: "/dougu/:path*",
        statusCode: 301,
      },
    ];
  },
};

export default nextConfig;
