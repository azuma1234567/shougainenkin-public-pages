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
    ];
  },
};

export default nextConfig;
