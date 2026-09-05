import Link from "next/link";
import HubGokai from "@/components/platform/HubGokai";
import { Breadcrumb, Card, CaseCard, CheckIcon, SectionHeader } from "@/components/platform/Platform";
import type { SaiketsuCase } from "@/lib/saiketsu";

export type DiseaseHubData = {
  name: string;
  answer: string;
  intro: string;
  source: string;
  points: { title: string; copy: string; source?: string }[];
  cases: SaiketsuCase[];
  stumbles: { title: string; copy: string }[];
  faqs: { question: string; answer: string }[];
  related: { href: string; label: string }[];
};

export default function DiseaseHub({ data, showListings = false }: { data: DiseaseHubData; showListings?: boolean }) {
  return (
    <div className="platform">
      <header className="p-page-hero">
        <div className="p-container">
          <Breadcrumb items={[{ href: "/", label: "トップ" }, { href: "/byoki/utsu-soukyoku", label: "病気から探す" }, { label: data.name }]} currentPath="/byoki/utsu-soukyoku" />
          <h1>{data.name}の障害年金</h1>
          <div className="p-answer">
            <p className="p-answer-title"><CheckIcon size={20} />{data.answer}</p>
            <p className="p-card-copy">{data.intro}</p>
            <p className="p-source">出典: {data.source} ・ 確認日 2026-08-31</p>
          </div>
        </div>
      </header>

      <section className="p-section" aria-labelledby="points-heading">
        <div className="p-container">
          <SectionHeader title="審査で本当に見られている4つのこと" lead="診断名ではなく「生活の実態」が判断の中心です。普段の状態や援助の内容が伝わることが大切です。" />
          <div className="p-grid p-grid-2">
            {data.points.map((point) => (
              <Card key={point.title}>
                <h3 className="p-card-title">{point.title}</h3>
                <p className="p-card-copy">{point.copy}</p>
                {point.source && <p className="p-source">出典: {point.source} ・ 確認日 2026-08-31</p>}
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="p-section p-band" aria-labelledby="disease-cases-heading">
        <div className="p-container">
          <SectionHeader title={`結論を分けた実例（${data.name}）`} lead="国の再審査の公開実例から。「何が判断を分けたか」に注目してください。全件、原文つき。" href="/jitsurei?kind=mental" linkLabel="この病気に近い実例を見る" />
          <div className="p-grid p-grid-3">
            {data.cases.map((item) => <CaseCard key={item.id} item={item} />)}
          </div>
        </div>
      </section>

      <section className="p-section" aria-labelledby="stumbles-heading">
        <div className="p-container">
          <SectionHeader title="同じ道を歩いた人が、つまずいた場所" lead="申請した人たちが「先に知りたかった」と言うポイントです。" />
          <div className="p-grid" style={{ gap: 10 }}>
            {data.stumbles.map((item, index) => (
              <Card className="p-action-card" key={item.title}>
                <span className="p-step-label" style={{ whiteSpace: "nowrap" }}>つまずき {index + 1}</span>
                <p className="p-action-copy"><strong>{item.title}</strong> <span style={{ color: "#4a6a80" }}>{item.copy}</span></p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="p-section" aria-labelledby="hub-gokai-heading">
        <div className="p-container">
          <HubGokai hubPath="/byoki/utsu-soukyoku" />
        </div>
      </section>

      <section className="p-section-lg" aria-labelledby="faq-heading">
        <div className="p-container p-split">
          <div>
            <SectionHeader title="よくある質問" />
            <div className="p-grid" style={{ gap: 8 }}>
              {data.faqs.map((item) => (
                <Card key={item.question}>
                  <h3 className="p-card-title">Q. {item.question}</h3>
                  <p className="p-card-copy">A. {item.answer}</p>
                </Card>
              ))}
            </div>
          </div>
          <div className="p-grid" style={{ gap: 12 }}>
            <div className="p-primary-panel p-grid" style={{ gap: 12 }}>
              <h2>この病気での次の一歩</h2>
              <p className="p-card-copy" style={{ color: "#dbeefa" }}>まず「その症状で最初に病院へ行った日」を確認してください。精神科でなく、不眠や体調不良で行った内科でもかまいません。</p>
              <Link href="/shinsei#step-1">初診日の確認からはじめる →</Link>
              <Link href="/erabu/jibun-ka-irai">自分で進めるか、依頼するかを比べる →</Link>
            </div>
            <Card>
              <h3 className="p-card-title">関連コラム</h3>
              {data.related.map((item) => <Link className="p-card-link" href={item.href} key={item.href}>{item.label} →</Link>)}
            </Card>
            <Card>
              <h3 className="p-card-title">しんどくなったら</h3>
              <Link className="p-card-link" href="/columns/shinsei-shindoi">小分けで進める方法を読む →</Link>
            </Card>
            {showListings && (
              <Card>
                <span className="p-label">掲載</span>
                <h3 className="p-card-title">精神疾患の申請に対応する専門家</h3>
                <p className="p-card-copy">当サイトは特定の事務所を推薦・選定しません。</p>
              </Card>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
