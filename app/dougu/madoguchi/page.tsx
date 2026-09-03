import type { Metadata } from "next";
import { Breadcrumb, PageDate } from "@/components/platform/Platform";
import MadoguchiTool from "@/components/tools/MadoguchiTool";
import { CHECKED_ON } from "@/lib/madoguchi";
import { pageMetadata } from "@/lib/seo";
import { isPublishedInternalPath } from "@/lib/published-links";

const UPDATED = "2026-09-03";

const DESCRIPTION =
  "障害年金の提出先を初診日の制度から判定し、お住まいの市区町村を管轄する年金事務所と街角の年金相談センターを出します。予約のしかた・持ち物・窓口で聞くことまで1枚に。入力内容は送信されません。";

const isPublished = isPublishedInternalPath("/dougu/madoguchi");

export const metadata: Metadata = {
  ...pageMetadata({ title: "どこへ、どう持っていくか", description: DESCRIPTION, path: "/dougu/madoguchi" }),
  ...(!isPublished && { robots: { index: false, follow: false } }),
};

export default function Page() {
  return (
    <div className="platform md-page">
      <header className="dougu-hero no-print">
        <div className="p-container md-width">
          <Breadcrumb
            items={[{ href: "/", label: "ホーム" }, { href: "/dougu", label: "自分の場合を確かめる" }, { label: "年金事務所を探す" }]}
            currentPath="/dougu/madoguchi"
          />
          <h1>どこへ、どう持っていくか</h1>
          <p className="md-lead">
            提出先は、初診日にどの制度に入っていたかで変わります。まずそれを調べて、それから管轄の窓口と、予約のしかたと、持ち物までを1枚にします。
          </p>
          <PageDate updated={UPDATED} />
        </div>
      </header>

      <div className="p-container md-width md-main">
        <p className="md-printhead">
          障害年金の窓口メモ（障害年金申請サポート）。窓口の情報は日本年金機構の公表（{CHECKED_ON} 取得）によるものです。統廃合や移転があるため、行く前に機構の公式ページで確認してください。
        </p>
        <MadoguchiTool />
      </div>
    </div>
  );
}
