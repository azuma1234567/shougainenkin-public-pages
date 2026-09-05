import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumb, PageDate } from "@/components/platform/Platform";
import ShoruiTool from "@/components/tools/ShoruiTool";
import { TOOLS } from "@/data/dougu";
import { pageMetadata } from "@/lib/seo";
import { isPublishedInternalPath } from "@/lib/published-links";

const UPDATED = "2026-09-03";

const DESCRIPTION =
  "誰にでも要る書類を先に出しています。下の質問に答えると、あなたの場合に要るものが足されます。年金事務所へ行く日の持ち物と、窓口で聞くことも一緒にA4 1枚で印刷できます。入力内容は送信されません。";

const isPublished = isPublishedInternalPath("/dougu/shorui");

export const metadata: Metadata = {
  ...pageMetadata({ title: TOOLS.shorui.question, description: DESCRIPTION, path: "/dougu/shorui", showAppBanner: true, appBannerArgument: "https://shougainenkin-note.net/dougu/shorui" }),
  ...(!isPublished && { robots: { index: false, follow: false } }),
};

export default function Page() {
  return (
    <div className="platform sr-page">
      <header className="no-print">
        <div className="p-container sr-width sr-top">
          <Breadcrumb
            items={[{ href: "/", label: "トップ" }, { href: "/shinsei", label: "申請の流れ" }, { label: "必要書類チェックリスト" }]}
            currentPath="/dougu/shorui"
          />
          <h1>{TOOLS.shorui.question}</h1>
          <p className="sr-lead">誰にでも要る書類を先に出しています。下の質問に答えると、あなたの場合に要るものが足されます。</p>
          <p className="jc-hero-meta jc--shorui">
            <span className="jc-time">{TOOLS.shorui.time}</span>
            <span className="jc-basis">入力した内容は送信しません</span>
          </p>
        </div>
      </header>

      <div className="p-container sr-width sr-main">
        <p className="sr-printhead">
          障害年金の必要書類チェックリスト（障害年金申請サポート）。これで全部とは限りません。最後は年金事務所で確認してください。
        </p>
        <ShoruiTool />
        <div className="no-print">
          <p><Link href="/shinsei">申請の流れへ戻る</Link></p>
          <p className="dougu-app-link"><Link href="/app">同じ機能をアプリで続ける →</Link></p>
          <PageDate updated={UPDATED} />
        </div>
      </div>
    </div>
  );
}
