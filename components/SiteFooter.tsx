import Link from "next/link";
import AnalyticsConsent from "@/components/AnalyticsConsent";

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <p className="footer-site-name">
          障害年金ノート
          <span>確認できないことは「確認できません」とお伝えします</span>
        </p>
        <nav aria-label="フッターメニュー">
          <Link href="/about">運営者情報</Link>
          <Link href="/quality">情報の品質について</Link>
          <Link href="/privacy">プライバシーポリシー</Link>
          <Link href="/terms">利用規約</Link>
        </nav>
        <AnalyticsConsent />
      </div>
    </footer>
  );
}
