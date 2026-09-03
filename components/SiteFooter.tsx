import Link from "next/link";
import AnalyticsConsent from "@/components/AnalyticsConsent";

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <nav aria-label="フッターメニュー">
          <Link href="/joukyou">状況から探す</Link>
          <Link href="/okane">お金の話</Link>
          <Link href="/erabu">自分でやるか、頼むか</Link>
          <Link href="/gokai">よくある誤解</Link>
          <Link href="/yougo">用語辞典</Link>
          <Link href="/about">運営者情報</Link>
          <Link href="/quality">情報の品質について</Link>
          <Link href="/privacy">プライバシーポリシー</Link>
          <Link href="/terms">利用規約</Link>
          <Link href="/ads">広告掲載について</Link>
          <Link href="/app/terms">アプリの利用規約・プライバシーポリシー</Link>
        </nav>
        {/* 景表法のステマ規制対応。広告で運営していることを全ページの下部で常時開示する。 */}
        <p className="footer-ad-disclosure">
          当サイトは広告収入で運営しています。広告・PRであるものにはその旨を表示します。
        </p>
        <AnalyticsConsent />
      </div>
    </footer>
  );
}
