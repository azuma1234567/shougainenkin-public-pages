import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 誤解カードのOG画像が同梱フォント(lib/fonts)を読むため、関数バンドルに含める。
  outputFileTracingIncludes: {
    "/gokai/[slug]/opengraph-image": ["./lib/fonts/*.ttf"],
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
