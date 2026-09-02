import Link from "next/link";
import { Breadcrumb, Card, SectionHeader } from "@/components/platform/Platform";
import { getColumn } from "@/lib/columns";
import type { HubDefinition } from "@/lib/hubs";

const kindLabels: Record<HubDefinition["kind"], string> = {
  byoki: "病気から探す", joukyou: "状況から探す", nayami: "悩み・トラブルから探す",
  okane: "お金の話", erabu: "進め方を選ぶ", existing: "テーマ", reserved: "テーマ",
};

export default function HubLanding({ hub }: { hub: HubDefinition }) {
  const columns = hub.relatedSlugs.map(getColumn);
  const isDecisionPage = hub.kind === "erabu";
  return (
    <div className="platform hub-landing">
      <header className="p-page-hero"><div className="p-container">
        <Breadcrumb items={[{ href: "/", label: "トップ" }, { label: kindLabels[hub.kind] }, { label: hub.label }]} />
        <span className="p-label">テーマガイド</span><h1>{hub.label}</h1>
        <p className="p-page-intro">このテーマに関係する制度の確認先と、いま公開しているコラムをひとつの入口にまとめています。</p>
      </div></header>
      {!isDecisionPage ? <>
        <section className="p-section" aria-labelledby="hub-columns-heading"><div className="p-container">
          <SectionHeader title="このテーマの関連コラム" lead={`${columns.length}本の記事を、棚割りに沿って掲載しています。`} />
          <div className="p-grid p-grid-2 hub-column-grid">{columns.map((column) => (
            <Card key={column.slug} className="p-card-lg">
              <span className="p-step-label">{column.role === "core" ? "中核コラム" : column.role === "promote" ? "ハブの元になった記事" : "関連コラム"}</span>
              <h2 className="p-card-title">{column.title}</h2><p className="p-card-copy">{column.description}</p>
              <Link className="p-card-link" href={`/columns/${column.slug}`}>記事を読む →</Link>
            </Card>
          ))}</div>
        </div></section>
        {hub.jitsureiFilter ? <section className="p-section p-band" aria-labelledby="hub-cases-heading"><div className="p-container">
          <SectionHeader title="結論を分けた実例" /><Card><p className="p-card-copy">公開裁決例から、このテーマに関係する争点を確認できます。</p>
          <Link className="p-card-link" href={`/jitsurei?hub=${encodeURIComponent(hub.path)}`}>実例を確認する →</Link></Card>
        </div></section> : null}
        <section className="p-section-lg" aria-labelledby="hub-next-heading"><div className="p-container p-split">
          <div><SectionHeader title="次の一歩" /><div className="p-primary-panel p-grid" style={{ gap: 10 }}>
            <p className="p-card-copy" style={{ color: "#dbeefa" }}>申請を自分で進めるか、誰かに依頼するかを比べたいときは、選び方のページで整理できます。</p>
            <Link href="/erabu/jibun-ka-irai">進め方を比べる →</Link>
          </div></div>
          <Card><h2 className="p-card-title">しんどくなったら</h2><p className="p-card-copy">途中で止まっても、失敗ではありません。体調を優先しながら、小分けに進める方法があります。</p>
            <Link className="p-card-link" href="/columns/shinsei-shindoi">申請がしんどいときの進め方 →</Link></Card>
        </div></section>
      </> : <section className="p-section-lg" aria-labelledby="decision-heading"><div className="p-container">
        <SectionHeader title="進め方を比べる" /><div className="p-grid p-grid-3">
          {[["自分で進める", "費用を抑えながら、年金事務所へ確認して進める方法です。"], ["アプリを使う", "記録や申立書の整理を、手元で少しずつ進める方法です。"], ["専門家に依頼する", "書類確認や手続きを依頼し、負担を減らす方法です。"]].map(([title, copy]) => <Card key={title}><h2 className="p-card-title">{title}</h2><p className="p-card-copy">{copy}</p></Card>)}
        </div><div className="p-primary-panel hub-decision-next"><p>選んだ方法にかかわらず、申請の全体像を先に確認できます。</p><Link href="/shinsei">8ステップの申請の流れを見る →</Link></div>
      </div></section>}
    </div>
  );
}
