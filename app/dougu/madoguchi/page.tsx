import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumb, PageDate } from "@/components/platform/Platform";
import MadoguchiTool from "@/components/tools/MadoguchiTool";
import { CHECKED_ON } from "@/lib/madoguchi";
import { TOOLS } from "@/data/dougu";
import { pageMetadata } from "@/lib/seo";
import { isPublishedInternalPath } from "@/lib/published-links";

const UPDATED = "2026-09-03";

const DESCRIPTION =
  "お住まいの市区町村を選ぶと、管轄の年金事務所が出ます。街角の年金相談センター、予約のしかた、行く日の持ち物と窓口で聞くことまで1枚に。入力内容は送信されません。";

const isPublished = isPublishedInternalPath("/dougu/madoguchi");

export const metadata: Metadata = {
  ...pageMetadata({ title: TOOLS.madoguchi.question, description: DESCRIPTION, path: "/dougu/madoguchi", showAppBanner: true, appBannerArgument: "https://shougainenkin-note.net/dougu/madoguchi" }),
  ...(!isPublished && { robots: { index: false, follow: false } }),
};

export default function Page() {
  return (
    <div className="platform md-page">
      <header className="no-print">
        <div className="p-container md-width md-top">
          <Breadcrumb
            items={[{ href: "/", label: "トップ" }, { href: "/shinsei", label: "申請の流れ" }, { label: "年金事務所を探す" }]}
            currentPath="/dougu/madoguchi"
          />
          <h1>{TOOLS.madoguchi.question}</h1>
          <p className="md-lead">お住まいの市区町村を選ぶと、管轄の年金事務所が出ます。日本年金機構の公表({CHECKED_ON} 取得)によります。</p>
          <p className="jc-hero-meta jc--madoguchi">
            <span className="jc-time">{TOOLS.madoguchi.time}</span>
            <span className="jc-basis">入力した内容は送信しません</span>
          </p>
        </div>
      </header>

      <div className="p-container md-width md-main">
        <p className="md-printhead">
          障害年金の窓口メモ（障害年金申請サポート）。窓口の情報は日本年金機構の公表（{CHECKED_ON} 取得）によるものです。統廃合や移転があるため、行く前に機構の公式ページで確認してください。
        </p>
        <MadoguchiTool />
        <div className="no-print">
          <p><Link href="/shinsei">申請の流れへ戻る</Link></p>
          <p className="dougu-app-link"><Link href="/app">同じ機能をアプリで続ける →</Link></p>
          <PageDate updated={UPDATED} />
        </div>
      </div>
    </div>
  );
}
