import Link from "next/link";
import { SITE_NAME } from "@/lib/constants";
import AnalyticsConsent from "@/components/AnalyticsConsent";

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <p className="footer-site-name">{SITE_NAME}</p>
        <nav aria-label="フッターメニュー">
          <Link href="/">トップ</Link>
          <Link href="/columns">コラム</Link>
          <Link href="/support">サポート</Link>
          <Link href="/about">運営者情報</Link>
          <Link href="/privacy">プライバシーポリシー</Link>
          <Link href="/terms">利用規約</Link>
        </nav>
        <AnalyticsConsent />
      </div>
    </footer>
  );
}
