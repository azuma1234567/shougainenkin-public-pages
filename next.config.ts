import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 誤解カードのOG画像が同梱フォント(lib/fonts)を読むため、関数バンドルに含める。
  outputFileTracingIncludes: {
    "/gokai/[slug]/opengraph-image": ["./lib/fonts/*.ttf"],
  },
  async redirects() {
    return [
      // LPをトップページへ統合したため、旧 /app はトップへ恒久リダイレクト
      {
        source: "/app",
        destination: "/",
        permanent: true,
      },
      // 「申請の流れ」記事はトップページ(親ページ)へ統合したため恒久リダイレクト
      {
        source: "/columns/shinsei-nagare",
        destination: "/shinsei",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
