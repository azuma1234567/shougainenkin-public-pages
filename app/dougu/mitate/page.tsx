import type { Metadata } from "next";
import { Breadcrumb, PageDate } from "@/components/platform/Platform";
import MitateTool from "@/components/tools/MitateTool";
import { pageMetadata } from "@/lib/seo";
import { isPublishedInternalPath } from "@/lib/published-links";

const UPDATED = "2026-09-03";

const DESCRIPTION =
  "国が公表している「精神の障害に係る等級判定ガイドライン」の障害等級の目安表に、日常生活能力の判定と程度を当てはめて見られます。判定しているのは国のガイドラインで、このサイトではありません。入力内容は送信されません。";

const isPublished = isPublishedInternalPath("/dougu/mitate");

export const metadata: Metadata = {
  ...pageMetadata({ title: "国が公表している目安に、当てはめてみる", description: DESCRIPTION, path: "/dougu/mitate" }),
  ...(!isPublished && { robots: { index: false, follow: false } }),
};

export default function Page() {
  return (
    <div className="platform mi-page">
      <header className="dougu-hero no-print">
        <div className="p-container mi-width">
          <Breadcrumb
            items={[{ href: "/", label: "ホーム" }, { href: "/dougu", label: "道具" }, { label: "等級の目安をしらべる" }]}
            currentPath="/dougu/mitate"
          />
          <h1>国が公表している目安に、当てはめてみる</h1>
          <p className="mi-lead">
            精神の障害の審査には、国が公表している「障害等級の目安」の表があります。診断書に書かれる2つの欄の組み合わせで、目安がどうなるかを見られます。判定しているのは国のガイドラインで、このサイトではありません。
          </p>
          <PageDate updated={UPDATED} />
        </div>
      </header>

      <div className="p-container mi-width mi-main">
        <p className="mi-printhead">
          国が公表している目安に当てはめた結果です（障害年金申請サポート / 精神の障害に係る等級判定ガイドライン 平成28年9月）。このサイトが判定したものではありません。
        </p>
        <MitateTool />
      </div>
    </div>
  );
}
