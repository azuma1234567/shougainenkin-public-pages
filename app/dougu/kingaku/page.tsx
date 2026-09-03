import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumb, PageDate } from "@/components/platform/Platform";
import KingakuTool from "@/components/tools/KingakuTool";
import { TOOLS } from "@/data/dougu";
import { pageMetadata } from "@/lib/seo";
import { isPublishedInternalPath } from "@/lib/published-links";

const UPDATED = "2026-09-03";

const DESCRIPTION =
  "等級と、初診日に入っていた制度と、家族の状況から、障害年金の年額と月額を内訳つきで計算します。厚生年金の報酬比例部分まで出します。入力内容は送信されません。";

const isPublished = isPublishedInternalPath("/dougu/kingaku");

export const metadata: Metadata = {
  ...pageMetadata({ title: "障害年金は、いくらになるか", description: DESCRIPTION, path: "/dougu/kingaku" }),
  ...(!isPublished && { robots: { index: false, follow: false } }),
};

const NEXT = [
  { title: "申請の流れ", note: "初診日の確認から結果が届くまで、8つのステップで見ます", href: "/shinsei" },
] as const;

export default function Page() {
  return (
    <div className="platform kg-page">
      <header className="dougu-hero">
        <div className="p-container kg-width">
          <Breadcrumb
            items={[{ href: "/", label: "トップ" }, { href: "/okane", label: "お金の話" }, { label: "障害年金の金額" }]}
            currentPath="/dougu/kingaku"
          />
          <h1>障害年金は、いくらになるか</h1>
          <p className="kg-lead">
            等級と、初診日に入っていた制度と、家族の状況から、年額と月額を内訳つきで出します。厚生年金の報酬比例部分まで計算します。入力した内容は送信されません。
          </p>
          <p className="jc-hero-meta jc--kingaku">
            <span className="jc-time">{TOOLS.kingaku.time}</span>
            <span className="jc-basis">入力した内容は送信しません</span>
          </p>
          <PageDate updated={UPDATED} />
        </div>
      </header>

      <div className="p-container kg-width kg-main">
        <KingakuTool />

        <section className="kg-card" aria-labelledby="kg-next-heading">
          <h2 id="kg-next-heading">ここからできること</h2>
          <div className="kg-next">
            {NEXT.map((item) => {
              const body = <><b>{item.title}</b><span>{item.note}</span></>;
              return isPublishedInternalPath(item.href)
                ? <Link className="kg-next-item" href={item.href} key={item.title}>{body}</Link>
                : <p className="kg-next-item kg-next-soon" key={item.title}>{body}<span className="kg-soon">準備中</span></p>;
            })}
          </div>
        </section>
        <p><Link href="/okane">お金の話へ戻る</Link></p>
      </div>
    </div>
  );
}
