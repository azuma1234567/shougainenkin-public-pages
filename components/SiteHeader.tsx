import Link from "next/link";
import { availableClusters } from "@/lib/columns";
import { SITE_NAME } from "@/lib/constants";

// ヘッダーは少数の項目だけ(モバイルでも折りたたみ不要)。
// 残りのページ(運営者情報・規約類)へのリンクはフッターに置く。
//
// 柱ページは lib/clusters.ts で inHeader を立てたものだけがここに並ぶ。
// 未公開のうちは何も増えないので、存在しないページへのリンクは出ない。
const PILLAR_ITEMS = availableClusters()
  .filter((cluster) => cluster.inHeader && cluster.pillarPath !== "/")
  .map((cluster) => ({ href: cluster.pillarPath, label: cluster.navLabel }));

const NAV_ITEMS = [
  { href: "/", label: "申請の流れ" },
  ...PILLAR_ITEMS,
  { href: "/columns", label: "コラム" },
  { href: "/support", label: "サポート" },
];

export default function SiteHeader() {
  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Link
          href="/"
          className="site-title"
          aria-label={`${SITE_NAME} トップページ`}
        >
          {/* 8段階のうち3つ目を進んでいる、というマーク。装飾なので読み上げない。
              2026-08: 金色のアークを白に変更(サイト全体から金色を外したため) */}
          <svg
            className="site-mark"
            viewBox="0 0 32 32"
            aria-hidden="true"
            focusable="false"
          >
            <circle
              cx="16"
              cy="16"
              r="13"
              fill="none"
              stroke="rgba(255,255,255,0.3)"
              strokeWidth="3"
            />
            <circle
              cx="16"
              cy="16"
              r="13"
              fill="none"
              stroke="#ffffff"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray="30.6 81.7"
              transform="rotate(-90 16 16)"
            />
            <circle cx="16" cy="16" r="4.5" fill="#ffffff" />
          </svg>
          <span className="site-title-text">{SITE_NAME}</span>
        </Link>
        <nav className="site-nav" aria-label="サイト内メニュー">
          {NAV_ITEMS.map((item) => (
            <Link key={item.href} href={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
