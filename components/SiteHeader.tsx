import Link from "next/link";
import { SITE_NAME } from "@/lib/constants";

const NAV_ITEMS = [
  { href: "/hajimete", label: "はじめての方へ" },
  { href: "/byoki", label: "病気から" },
  { href: "/joukyou", label: "状況から" },
  { href: "/nayami", label: "悩みから" },
  { href: "/shinsei", label: "申請の流れ" },
  { href: "/jitsurei", label: "実例と数字" },
  { href: "/columns", label: "コラム" },
];

function BookIcon() {
  return (
    <svg
      className="site-mark"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  );
}

function NavigationLinks() {
  return (
    <>
      {NAV_ITEMS.map((item) => (
        <Link key={item.href} href={item.href}>
          {item.label}
        </Link>
      ))}
    </>
  );
}

export default function SiteHeader() {
  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Link
          href="/"
          className="site-title"
          aria-label={`${SITE_NAME} トップページ`}
        >
          <BookIcon />
          <span className="site-title-text">{SITE_NAME}</span>
        </Link>
        <nav className="site-nav site-nav-desktop" aria-label="サイト内メニュー">
          <NavigationLinks />
          <Link className="site-app-link" href="/app">無料アプリ</Link>
        </nav>
        <details className="site-mobile-menu">
          <summary>メニュー</summary>
          <nav aria-label="モバイルメニュー">
            <NavigationLinks />
            <Link href="/support">サポート</Link>
            <Link href="/app">無料アプリ</Link>
          </nav>
        </details>
      </div>
    </header>
  );
}
