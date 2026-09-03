import Link from "next/link";
import AnalyticsConsent from "@/components/AnalyticsConsent";
import { HAS_ACTIVE_ADS } from "@/lib/ads";
import { SITE_NAME } from "@/lib/constants";
import { TOOLS } from "@/data/dougu";
import { JIBUN_ORDER } from "@/components/platform/JibunCard";
import { isPublishedInternalPath } from "@/lib/published-links";

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <nav className="footer-jibun" aria-label="自分の場合を確かめる">
          <span className="footer-jibun-heading">自分の場合を確かめる</span>
          {JIBUN_ORDER.filter((id) => isPublishedInternalPath(TOOLS[id].path)).map((id) => (
            <Link key={id} href={TOOLS[id].path}>{TOOLS[id].question}</Link>
          ))}
        </nav>
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
          <Link href="/app">無料iPhoneアプリ</Link>
          <Link href="/app/terms">アプリの利用規約・プライバシーポリシー</Link>
        </nav>
        <p className="footer-copyright">© 2026 {SITE_NAME}</p>
        {/* 景表法のステマ規制対応。広告で運営していることを全ページの下部で常時開示する。
            導入前に「運営しています」と書くと先行記載になるので、lib/ads.ts の
            フラグで実態に合わせる(/terms 第3条・/about と同じ切り替え)。 */}
        <p className="footer-ad-disclosure">
          {HAS_ACTIVE_ADS
            ? "当サイトは広告収入で運営しています。"
            : "当サイトは広告収入での運営を予定しています。"}
          広告・PRであるものにはその旨を表示します。
        </p>
        <AnalyticsConsent />
      </div>
    </footer>
  );
}
