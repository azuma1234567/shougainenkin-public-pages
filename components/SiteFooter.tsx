import Link from "next/link";
import { COPYRIGHT } from "@/lib/constants";

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <nav aria-label="フッターメニュー">
          <Link href="/">トップ</Link>
          <Link href="/support">サポート</Link>
          <Link href="/privacy">プライバシーポリシー</Link>
          <Link href="/terms">利用規約</Link>
        </nav>
        <p className="copyright">{COPYRIGHT}</p>
      </div>
    </footer>
  );
}
