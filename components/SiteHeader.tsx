import Link from "next/link";
import { SITE_NAME } from "@/lib/constants";

const NAV_ITEMS = [
  { href: "/", label: "トップ" },
  { href: "/support", label: "サポート" },
  { href: "/privacy", label: "プライバシーポリシー" },
  { href: "/terms", label: "利用規約" },
];

export default function SiteHeader() {
  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Link href="/" className="site-title">
          {SITE_NAME}
        </Link>
        <nav className="site-nav-desktop" aria-label="サイト内メニュー">
          {NAV_ITEMS.map((item) => (
            <Link key={item.href} href={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>
        <details className="site-nav-mobile">
          <summary aria-label="メニューを開く">メニュー</summary>
          <ul>
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                {/* クライアント遷移だとメニューが開いたまま残るため、通常のリンクにする */}
                <a href={item.href}>{item.label}</a>
              </li>
            ))}
          </ul>
        </details>
      </div>
    </header>
  );
}
