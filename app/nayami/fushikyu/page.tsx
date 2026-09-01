import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumb, Card, CaseCard, SectionHeader } from "@/components/platform/Platform";
import { SAIKETSU_CASES, SAIKETSU_COUNTS } from "@/lib/saiketsu";
import { pageMetadata } from "@/lib/seo";

const TITLE = "障害年金が不支給と言われたとき｜期限と次の選択肢";
const DESCRIPTION = "障害年金の不支給通知を受け取った方へ。審査請求の3か月の期限、再請求との違い、公開裁決例、次に確認することを順番に整理します。";
const SHOW_LISTINGS = false;

export const metadata: Metadata = pageMetadata({ title: TITLE, description: DESCRIPTION, path: "/nayami/fushikyu" });

const caseIds = ["r07-07_02", "r07-03_01"];
const cases = caseIds.flatMap((id) => SAIKETSU_CASES.filter((item) => item.id === id));

export default function FushikyuPage() {
  return (
    <div className="platform">
      <header className="p-page-hero">
        <div className="p-container">
          <Breadcrumb items={[{ href: "/", label: "トップ" }, { href: "/nayami/fushikyu", label: "悩みから探す" }, { label: "不支給と言われたとき" }]} />
          <h1>不支給と言われたとき</h1>
          <p className="p-page-intro">不支給の通知は、それだけで気持ちをすり減らすものです。ただ、一度の不支給が最終結論とは限りません。実際に、不服申立てで結論が見直された公開裁決例が数多くあります。ここでは、いま確認してほしいことを順番に整理します。</p>
        </div>
      </header>

      <section className="p-section" aria-labelledby="deadline-heading">
        <div className="p-container">
          <SectionHeader title="1. まず、期限だけ確認してください" />
          <div className="p-grid p-grid-2">
            <Card className="p-card-lg">
              <span className="p-step-label">審査請求（不服申立て）</span>
              <h3 className="p-card-title" style={{ fontSize: 20 }}>通知を知った日の翌日から 3か月以内</h3>
              <p className="p-card-copy">地方厚生局の社会保険審査官に対して行います。書面のほか口頭でも可能です。</p>
            </Card>
            <Card className="p-card-lg">
              <span className="p-step-label">別の道</span>
              <h3 className="p-card-title" style={{ fontSize: 20 }}>あらためて請求し直す（再請求）</h3>
              <p className="p-card-copy">診断書や申立書の内容を整えて、もう一度請求する方法です。不服申立てと並行して検討できます。</p>
            </Card>
          </div>
          <p className="p-source" style={{ marginTop: 12 }}>出典: 日本年金機構「不服申立て（審査請求）について」 ・ 確認日 2026-08-31</p>
        </div>
      </section>

      <section className="p-section" aria-labelledby="numbers-heading">
        <div className="p-container">
          <SectionHeader title="2. 数字で知っておいてほしいこと" />
          <div className="p-grid p-grid-3">
            <Card className="p-card-lg"><strong style={{ color: "#0273ad", fontSize: 30 }}>13.0%</strong><p className="p-card-copy">新規申請のうち不支給の割合（令和6年度・厚労省調査）。裏を返せば、大多数は支給に至っています。</p></Card>
            <Card className="p-card-lg"><strong style={{ color: "#0273ad", fontSize: 30 }}>70.3%</strong><p className="p-card-copy">新規裁定に占める精神の診断書の割合。精神疾患での申請は特別なことではなく、標準的です。</p></Card>
            <Card className="p-card-lg"><strong style={{ color: "#0273ad", fontSize: 30 }}>{SAIKETSU_COUNTS.accepted}件</strong><p className="p-card-copy">当サイト収録の公開裁決例のうち、容認・一部容認で結論が見直された件数。</p></Card>
          </div>
          <p className="p-source" style={{ marginTop: 12 }}>出典: 厚生労働省「令和6年度の障害年金の認定状況についての調査報告書」 ・ 確認日 2026-08-31</p>
        </div>
      </section>

      <section className="p-section p-band" aria-labelledby="fushikyu-cases-heading">
        <div className="p-container">
          <SectionHeader title="3. 同じ状況から結論が変わった実例" href="/jitsurei?filter=accepted" linkLabel="結論が変わった実例で探す" />
          <div className="p-grid p-grid-2">
            {cases.map((item) => <CaseCard key={item.id} item={item} />)}
          </div>
        </div>
      </section>

      <section className="p-section-lg" aria-labelledby="next-heading">
        <div className="p-container p-split">
          <div>
            <SectionHeader title="4. 次の一歩" />
            <div className="p-grid" style={{ gap: 10 }}>
              {[
                "不支給の理由を通知書で確認する（等級非該当か、初診日か、納付要件か）",
                "同じ争点の公開裁決例を読み、何が判断を分けたかを知る",
                "審査請求・再請求のどちらで進めるかを、期限内に決める",
              ].map((item, index) => <Card className="p-action-card" key={item}><span className="p-action-number">{index + 1}</span><p className="p-action-copy">{item}</p></Card>)}
            </div>
          </div>
          <div className="p-grid" style={{ gap: 12 }}>
            <Card>
              <h2 style={{ fontSize: 15 }}>関連コラム</h2>
              <Link className="p-card-link" href="/columns/fushikyuu-shinsa-seikyu">審査請求と再請求の違いを詳しく読む →</Link>
              <Link className="p-card-link" href="/columns/shindansho-jittai-chigau">診断書が実態と違うときの確認 →</Link>
            </Card>
            {SHOW_LISTINGS && <Card><span className="p-label">掲載</span><h2 style={{ fontSize: 15 }}>ひとりで進めるのが難しいとき</h2><p className="p-card-copy">当サイトは特定の事務所を推薦・選定しません。</p></Card>}
          </div>
        </div>
      </section>
    </div>
  );
}
