import Link from "next/link";
import AnalyticsConsent from "@/components/AnalyticsConsent";
import { HAS_ACTIVE_ADS } from "@/lib/ads";
import { SITE_NAME } from "@/lib/constants";

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <nav className="footer-links" aria-label="フッターメニュー">
          <section><h2>探す</h2><Link href="/byoki">病気から</Link><Link href="/joukyou">状況から</Link><Link href="/nayami">悩みから</Link><Link href="/okane">お金の話</Link><Link href="/erabu">自分でやるか、頼むか</Link></section>
          <section><h2>読む</h2><Link href="/hajimete">はじめての方へ</Link><Link href="/shinsei">申請の流れ</Link><Link href="/gokai">よくある誤解</Link><Link href="/jitsurei">実例と数字</Link><Link href="/suuji">数字で見る障害年金</Link><Link href="/columns">コラム</Link><Link href="/yougo">用語辞典</Link></section>
          <section><h2>このサイトについて</h2><Link href="/about">運営者情報</Link><Link href="/quality">情報の品質について</Link><Link href="/support">お問い合わせ</Link><Link href="/privacy">プライバシーポリシー</Link><Link href="/terms">利用規約</Link><Link href="/ads">広告掲載について</Link><Link href="/app">無料iPhoneアプリ</Link><Link href="/app/terms">アプリの利用規約・プライバシーポリシー</Link></section>
        </nav>
        <div className="footer-bottom">
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
        </div>
        <AnalyticsConsent />
      </div>
    </footer>
  );
}
