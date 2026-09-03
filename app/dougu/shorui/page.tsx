import type { Metadata } from "next";
import { Breadcrumb, PageDate } from "@/components/platform/Platform";
import ShoruiTool from "@/components/tools/ShoruiTool";
import { pageMetadata } from "@/lib/seo";
import { isPublishedInternalPath } from "@/lib/published-links";

const UPDATED = "2026-09-03";

const DESCRIPTION =
  "7つの質問に答えると、自分の場合に必要な障害年金の書類だけが出ます。年金事務所へ行く日の持ち物と、窓口で聞くことも一緒にA4 1枚で印刷できます。入力内容は送信されません。";

const isPublished = isPublishedInternalPath("/dougu/shorui");

export const metadata: Metadata = {
  ...pageMetadata({ title: "自分に必要な書類だけを、1枚にする", description: DESCRIPTION, path: "/dougu/shorui" }),
  ...(!isPublished && { robots: { index: false, follow: false } }),
};

export default function Page() {
  return (
    <div className="platform sr-page">
      <header className="dougu-hero no-print">
        <div className="p-container sr-width">
          <Breadcrumb
            items={[{ href: "/", label: "ホーム" }, { href: "/dougu", label: "道具" }, { label: "必要書類チェックリスト" }]}
            currentPath="/dougu/shorui"
          />
          <h1>自分に必要な書類だけを、1枚にする</h1>
          <p className="sr-lead">
            7つの質問に答えると、あなたの場合に要る書類だけが出ます。年金事務所へ行く日の持ち物と、窓口で聞くことも一緒に印刷できます。答えたくない質問は飛ばせます。
          </p>
          <PageDate updated={UPDATED} />
        </div>
      </header>

      <div className="p-container sr-width sr-main">
        <p className="sr-printhead">
          障害年金の必要書類チェックリスト（障害年金ノート）。これで全部とは限りません。最後は年金事務所で確認してください。
        </p>
        <ShoruiTool />
      </div>
    </div>
  );
}
