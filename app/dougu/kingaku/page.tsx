import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumb, PageDate } from "@/components/platform/Platform";
import { DouguCards } from "@/components/platform/DouguCard";
import KingakuTool from "@/components/tools/KingakuTool";
import { FISCAL_YEAR } from "@/data/amounts";
import { TOOLS } from "@/data/dougu";
import { pageMetadata } from "@/lib/seo";
import { isPublishedInternalPath } from "@/lib/published-links";

const UPDATED = "2026-09-06";
const TITLE = `障害年金の金額 — ${FISCAL_YEAR}の額で計算`;

const DESCRIPTION =
  `等級と、初診日に入っていた制度と、家族の状況から、障害年金の年額と月額を${FISCAL_YEAR}の額で出します。開いた瞬間に2級・国民年金の額が出て、3問で自分の場合に近づけます。厚生年金の上乗せは年収からも入れられます。入力内容は送信されません。`;

const isPublished = isPublishedInternalPath("/dougu/kingaku");

export const metadata: Metadata = {
  ...pageMetadata({ title: TITLE, description: DESCRIPTION, path: "/dougu/kingaku", showAppBanner: true, appBannerArgument: "https://shougainenkin-note.net/dougu/kingaku" }),
  ...(!isPublished && { robots: { index: false, follow: false } }),
};

export default function Page() {
  return (
    <div className="platform kg-page">
      <header className="dougu-hero">
        <div className="p-container kg-width">
          <Breadcrumb
            items={[{ href: "/", label: "トップ" }, { href: "/okane", label: "お金" }, { label: "障害年金の金額" }]}
            currentPath="/dougu/kingaku"
          />
          <h1>{TITLE}</h1>
          <p className="kg-lead">{FISCAL_YEAR}の額で、年額と月額を出します。入力はこの端末の中だけです。</p>
          <p className="jc-hero-meta jc--kingaku">
            <span className="jc-time">{TOOLS.kingaku.time}</span>
            <span className="jc-basis">入力した内容は送信しません</span>
          </p>
        </div>
      </header>

      <div className="p-container kg-width kg-main">
        <KingakuTool />

        <section className="kg-card" aria-labelledby="kg-next-heading">
          <h2 id="kg-next-heading">ここからできること</h2>
          <div className="dougu-band kg-dougu"><DouguCards placements={["shorui", "koushin"]} variant="grid" /></div>
          <div className="kg-next">
            <Link className="kg-next-item" href="/shinsei"><b>申請の流れ</b><span>初診日の確認から結果が届くまで、8つのステップで見ます</span></Link>
            <Link className="kg-next-item" href="/okane/ikura"><b>いくら・いつ振り込まれるか</b><span>金額の決まり方と振込の時期を、まとめて読む</span></Link>
          </div>
        </section>
        <p><Link href="/okane">お金の話へ戻る</Link></p>
        <p className="dougu-app-link"><Link href="/app">同じ機能をアプリで続ける →</Link></p>
        <PageDate updated={UPDATED} />
      </div>
    </div>
  );
}
