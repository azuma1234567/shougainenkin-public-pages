import Link from "next/link";
import { SITE_NAME } from "@/lib/constants";

// ヘッダーは主要3項目のみ(モバイルでも折りたたみ不要)。
// 残りのページ(運営者情報・規約類)へのリンクはフッターに置く。
const NAV_ITEMS = [
  { href: "/", label: "トップ" },
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
          {SITE_NAME}
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
