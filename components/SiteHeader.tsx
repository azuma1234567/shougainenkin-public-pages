"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SITE_NAME } from "@/lib/constants";

/* 8項目 + 無料アプリ。柱(申請の流れ)を前に、区分名はすべて名詞にそろえる。
   docs/site-structure-2026-09-05-instructions.md §1。 */
const NAV_ITEMS = [
  { href: "/hajimete", label: "はじめての方へ" },
  { href: "/shinsei", label: "申請の流れ" },
  { href: "/byoki", label: "病気別" },
  { href: "/joukyou", label: "状況別" },
  { href: "/nayami", label: "困りごと別" },
  { href: "/okane", label: "お金" },
  { href: "/jitsurei", label: "実例と数字" },
  { href: "/columns", label: "コラム" },
];

/* いまどの区画にいるか。道具は申請の流れの下に置くが、金額の計算だけはお金に寄せる。 */
export function currentNavHref(pathname: string): string | null {
  if (pathname === "/dougu/kingaku" || pathname.startsWith("/okane")) return "/okane";
  if (pathname.startsWith("/dougu")) return "/shinsei";
  if (pathname.startsWith("/shinsei")) return "/shinsei";
  if (pathname.startsWith("/hajimete")) return "/hajimete";
  if (pathname.startsWith("/byoki")) return "/byoki";
  if (pathname.startsWith("/joukyou")) return "/joukyou";
  if (pathname.startsWith("/nayami")) return "/nayami";
  if (pathname.startsWith("/columns")) return "/columns";
  if (pathname.startsWith("/jitsurei") || pathname.startsWith("/suuji")) return "/jitsurei";
  return null;
}

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

function NavigationLinks({ current }: { current: string | null }) {
  return (
    <>
      {NAV_ITEMS.map((item) => (
        <Link aria-current={current === item.href ? "page" : undefined} key={item.href} href={item.href}>
          {item.label}
        </Link>
      ))}
    </>
  );
}

export default function SiteHeader() {
  const current = currentNavHref(usePathname() ?? "/");
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
          <NavigationLinks current={current} />
          <Link className="site-app-link" href="/app">無料アプリ</Link>
        </nav>
        <details className="site-mobile-menu">
          <summary>メニュー</summary>
          <nav aria-label="モバイルメニュー">
            <NavigationLinks current={current} />
            <Link href="/support">サポート</Link>
            <Link href="/app">無料アプリ</Link>
          </nav>
        </details>
      </div>
    </header>
  );
}
