import Link from "next/link";
import { availableClusters } from "@/lib/columns";
import { SITE_NAME } from "@/lib/constants";
import AnalyticsConsent from "@/components/AnalyticsConsent";

// 主要ガイド(柱ページ)の一覧。公開済みのものだけが並ぶ。
// トップ以外の柱ページがまだ1本も無いうちは、トップへの重複リンクにしかならないので
// ブロックごと出さない。
const GUIDE_ITEMS = availableClusters();
const HAS_PILLAR_PAGES = GUIDE_ITEMS.some(
  (cluster) => cluster.pillarPath !== "/",
);

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <p className="footer-site-name">{SITE_NAME}</p>
        {HAS_PILLAR_PAGES && (
          <nav aria-label="主要ガイド" className="footer-guides">
            {GUIDE_ITEMS.map((cluster) => (
              <Link key={cluster.id} href={cluster.pillarPath}>
                {cluster.label}
              </Link>
            ))}
          </nav>
        )}
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
