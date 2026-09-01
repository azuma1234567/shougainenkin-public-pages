import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumb } from "@/components/platform/Platform";
import { CATEGORY_ANCHORS, CATEGORY_ORDER, COLUMNS, columnsInCategory, type ColumnCategory } from "@/lib/columns";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";

const DESCRIPTION = "申請の段階ごとの疑問に、実在する47本のコラムで答えます。初診日、納付要件、診断書、申立書、不支給後の選択肢まで、いま必要なところから探せます。";
export const metadata: Metadata = pageMetadata({ title: "障害年金の申請準備コラム", description: DESCRIPTION, path: "/columns" });
const breadcrumb = breadcrumbJsonLd([{ name: "トップ", path: "/" }, { name: "コラム", path: "/columns" }]);

const WORRIES = [
  ["初診日がわからない", "shoshinbi-wakaranai"], ["診断書を頼みづらい", "shindansho-tanomikata"],
  ["申立書が書けない", "moushitatesho-kakikata"], ["不支給と言われた", "fushikyuu-shinsa-seikyu"],
  ["働きながら申請したい", "hatarakinagara"], ["いくらもらえるか知りたい", "ikura-moraeru"],
  ["更新が不安", "koushin-kakuninhodo"], ["さかのぼって請求したい", "sokyuu-seikyuu"],
] as const;

const CATEGORY_COPY: Record<ColumnCategory, string> = {
  "申請の前に": "対象になるか・金額・手帳との関係", 初診日: "証明のしかた・カルテがないとき", 納付要件: "保険料の条件と特例",
  "相談・進め方": "年金事務所との付き合い方", "必要書類・提出": "そろえる物と提出前の確認", "診断書 — 主治医に伝える": "生活の実態が伝わる準備",
  申立書: "書き方と期間の区切り方", "結果を待つ・不支給のとき": "待ち方と、次の選択肢", "受給が始まってから": "更新・手続き・暮らし",
};

const THEME_LINKS = [
  ["障害年金の申請", "/shinsei"], ["障害年金の条件", "/hajimete#checks"], ["精神疾患の障害年金", "/byoki/utsu-soukyoku"],
  ["障害年金の診断書", "/columns/shindansho-ishi-ni-tsutaeru"], ["うつ病の障害年金", "/byoki/utsu-soukyoku"],
] as const;

function ArticleCard({ column }: { column: (typeof COLUMNS)[number] }) {
  return <li><Link className="columns-article-card" href={`/columns/${column.slug}`}><span className="columns-article-copy"><strong>{column.title}</strong><span>{column.description}</span></span><span className="columns-chevron" aria-hidden="true">›</span></Link></li>;
}

export default function ColumnsPage() {
  return (
    <div className="platform columns-page">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb).replace(/</g, "\\u003c") }} />
      <header className="p-page-hero columns-hero"><div className="p-container columns-reading-width"><Breadcrumb items={[{ href: "/", label: "トップ" }, { label: "コラム" }]} /><h1>コラム</h1><p className="p-page-intro">申請の段階ごとの疑問に、1記事ずつ答えています。全{COLUMNS.length}本。</p></div></header>
      <div className="p-container columns-reading-width columns-content">
        <section className="columns-section" aria-labelledby="columns-worries-heading"><h2 id="columns-worries-heading" className="columns-small-heading">よくある悩みから</h2><nav className="columns-worry-chips" aria-label="よくある悩み">{WORRIES.map(([label, slug]) => <Link key={slug} href={`/columns/${slug}`}>{label}</Link>)}</nav></section>
        <section className="columns-section" aria-labelledby="columns-stages-heading"><h2 id="columns-stages-heading">段階から探す</h2><nav className="columns-stage-grid" aria-label="申請の段階">{CATEGORY_ORDER.map((category) => <a href={`#${CATEGORY_ANCHORS[category]}`} key={category}><strong>{category}</strong><span>{CATEGORY_COPY[category]}</span><b>{columnsInCategory(category).length}本</b></a>)}</nav></section>
        <div className="columns-category-sections">{CATEGORY_ORDER.map((category) => { const items = columnsInCategory(category); return <section className="columns-category" key={category} aria-labelledby={CATEGORY_ANCHORS[category]}><span className="p-label">カテゴリ</span><h2 id={CATEGORY_ANCHORS[category]}>{category}</h2><p>{CATEGORY_COPY[category]}</p><ul className="columns-article-list">{items.map((column) => <ArticleCard column={column} key={column.slug} />)}</ul></section>; })}</div>
        <section className="columns-section columns-themes" aria-labelledby="columns-themes-heading"><h2 id="columns-themes-heading">テーマ別まとめ</h2><nav className="columns-theme-chips" aria-label="テーマ別まとめ">{THEME_LINKS.map(([label, href]) => <Link href={href} key={label}>{label}</Link>)}</nav></section>
      </div>
    </div>
  );
}
