import type { Metadata } from "next";
import Link from "next/link";
import { CONTACT_EMAIL, SITE_NAME } from "@/lib/constants";
import { QUALITY_METRICS } from "@/lib/quality";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";

const DESCRIPTION = `${SITE_NAME}で案内する制度情報の出典、確認方法、更新方針について説明します。`;

export const metadata: Metadata = pageMetadata({
  title: "情報の品質について",
  description: DESCRIPTION,
  path: "/quality",
});

const breadcrumb = breadcrumbJsonLd([
  { name: "トップ", path: "/" },
  { name: "情報の品質について", path: "/quality" },
]);

export default function QualityPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />

      <h1>情報の品質について</h1>

      <h2>この情報はどう作られているか</h2>
      <p>
        制度に関する情報は、日本年金機構・厚生労働省・法令（e-Gov）の一次資料だけを事実の出典とし、各項目に出典と確認日を付けて管理しています。SNS・ブログ・伝聞は、何が知られていないかを知る参考にはしますが、事実の出典にはしません。
      </p>
      <p>
        記事に何を書くかは、広告主から独立して決めています。広告と編集の関係については、
        <Link href="/about#ad-promises">運営者情報の「運営のしかたと、広告についての約束」</Link>
        をご覧ください。医師や社会保険労務士による監修は受けていません。その方針も同じ場所に記しています。
      </p>

      <h2>いま収録しているもの</h2>
      <p>
        現在、制度情報を{QUALITY_METRICS.knowledgeUnits}項目、確認済みの出典を
        {QUALITY_METRICS.verifiedSources}件収録しています。
      </p>

      <h2>鮮度の保ち方</h2>
      <p>
        年度改定が行われる毎年4月に合わせて総点検します。また、確認日が古くなった項目を自動で見つけ、再確認できる仕組みを運用しています。
      </p>

      <h2>AIの答え方の方針</h2>
      <p>
        確認できないことは「確認できません」とお伝えします。受給の可否や等級は断定せず、正確に確認できる年金事務所などをご案内します。
      </p>

      <h2>更新履歴</h2>
      <ul>
        <li>2026-08-19 制度情報の出典台帳を整備（全項目にURL・確認日）</li>
        <li>2026-08-31 保険料納付要件の特例期限・子の加算額を最新の公的資料で再確認</li>
        <li>2026-08-31 収録項目を240に拡充。回答への出典表示を開始</li>
      </ul>

      <h2>誤りのご連絡</h2>
      <p>
        情報の誤りにお気づきの場合は、
        <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
        までお知らせください。病歴などの記載は不要です。
      </p>

      <h2>免責</h2>
      <p>
        最終的な確認は年金事務所・市区町村で行ってください。本サイトとアプリは、個別の受給可否や等級を判断するものではありません。
      </p>
    </>
  );
}
