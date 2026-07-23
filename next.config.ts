import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
        destination: "/",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
