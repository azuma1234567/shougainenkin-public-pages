import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumb, PageDate } from "@/components/platform/Platform";
import SiteSearch, { type SearchItem } from "@/components/platform/SiteSearch";
import { CATEGORY_ANCHORS, CATEGORY_ORDER, COLUMNS, columnsInCategory, type Column, type ColumnCategory } from "@/lib/columns";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";

/*
  2026-09-02 コラム一覧の再設計。
  前の版の問題:
  - 47本が1列で並び、ページが15画面ぶんの縦スクロールになっていた
  - 「段階から探す」の大きなカード9枚と、その下のカテゴリ9節が二重になっていた
  - 47本が全部同じ重さで、実測で読まれている記事(上位3本で全クリックの67%)の手がかりが無かった
  - カードに更新日が無く、タイトルは副題まで全部表示で2〜3行
  - 検索が無い(トップにはあるのに、47本を探すページに無い)
  - 「テーマ別まとめ」が最下部にあり、誰も到達しない
  直し方:
  - 検索を最上部に。段階の目次はチップ1〜2行に圧縮し、追従させる
  - 「まず読まれている3本」を実測データで置く
  - カードは2列(モバイル1列)。短いタイトル(metaTitle)・1行説明・更新日
  - 末尾は「記事ではなく状況から探す」で、ハブの一覧へ
*/

const DESCRIPTION =
  "申請の段階ごとの疑問に、47本のコラムで答えます。初診日、納付要件、診断書、申立書、不支給後の選択肢まで。検索と段階の目次から探せます。";
export const metadata: Metadata = pageMetadata({ title: "障害年金の申請準備コラム", description: DESCRIPTION, path: "/columns" });
const breadcrumb = breadcrumbJsonLd([{ name: "トップ", path: "/" }, { name: "コラム", path: "/columns" }]);

// Search Console(2026-09-02 時点・過去3か月)のクリック上位3本。実測で選ぶ。増やさない。
const MOST_READ = ["moushitatesho-a4-insatsu", "moushitatesho-kikan-kugiri", "teishutsusaki-yuusou"] as const;

// 悩みの入口は、記事ではなく悩みハブへ送る(記事はハブの中から辿れる)。
const WORRIES = [
  ["初診日がわからない", "/nayami/shoshinbi-karute"],
  ["診断書で困った", "/nayami/shindansho-komatta"],
  ["不支給と言われた", "/nayami/fushikyu"],
  ["更新が不安", "/nayami/koushin"],
  ["さかのぼって請求したい", "/nayami/sokyuu"],
  ["働きながら申請したい", "/joukyou/hatarakinagara"],
  ["いくらもらえる?", "/okane/ikura"],
] as const;

const CATEGORY_COPY: Record<ColumnCategory, string> = {
  "申請の前に": "対象になるか・金額・手帳との関係",
  初診日: "証明のしかた・カルテがないとき",
  納付要件: "保険料の条件と特例",
  "相談・進め方": "年金事務所との付き合い方",
  "必要書類・提出": "そろえる物と提出前の確認",
  "診断書 — 主治医に伝える": "生活の実態が伝わる準備",
  申立書: "書き方と期間の区切り方",
  "結果を待つ・不支給のとき": "待ち方と、次の選択肢",
  "受給が始まってから": "更新・手続き・暮らし",
};

// 一覧用の短いタイトル。metaTitle があればそれ、無ければ副題(「 — 」「｜」以降)を落とす。
function shortTitle(column: Column): string {
  if (column.metaTitle) return column.metaTitle.replace(/【[^】]*】$/, "");
  return column.title.split(/\s*[—｜]\s*/)[0];
}
function subTitle(column: Column): string | null {
  const parts = column.title.split(/\s*—\s*/);
  return parts.length > 1 ? parts.slice(1).join(" — ") : null;
}
function fmtDate(value: string): string {
  const [y, m, d] = value.split("-");
  return `${y}年${Number(m)}月${Number(d)}日`;
}

const searchItems: SearchItem[] = COLUMNS.map((column) => ({
  href: `/columns/${column.slug}`,
  title: shortTitle(column),
  description: column.description,
  category: column.category,
}));

function ArticleCard({ column, featured = false }: { column: Column; featured?: boolean }) {
  const sub = subTitle(column);
  return (
    <li>
      <Link className={`columns-card${featured ? " is-featured" : ""}`} data-column-slug={column.slug} href={`/columns/${column.slug}`}>
        <span className="columns-card-meta">
          <span className="columns-card-cat">{column.category}</span>
          <time dateTime={column.dateModified}>更新 {fmtDate(column.dateModified)}</time>
        </span>
        <strong className="columns-card-title">{shortTitle(column)}</strong>
        {sub ? <span className="columns-card-sub">{sub}</span> : null}
        <span className="columns-card-desc">{column.description}</span>
      </Link>
    </li>
  );
}

export default function ColumnsPage() {
  const mostRead = MOST_READ.map((slug) => COLUMNS.find((column) => column.slug === slug)).filter((c): c is Column => Boolean(c));
  return (
    <div className="platform columns-page">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb).replace(/</g, "\\u003c") }} />

      <header className="p-page-hero columns-hero">
        <div className="p-container columns-width">
          <Breadcrumb items={[{ href: "/", label: "トップ" }, { label: "コラム" }]} currentPath="/columns" />
          <h1>コラム</h1>
          <p className="p-page-intro">申請の段階ごとの疑問に、1記事ずつ答えています。全{COLUMNS.length}本。言葉で探すか、段階から探してください。</p>
          <PageDate updated={COLUMNS.map((column) => column.dateModified).sort().at(-1) ?? "2026-09-02"} />
          <div className="columns-search"><SiteSearch items={searchItems} /></div>
        </div>
      </header>

      <nav className="columns-toc" aria-label="段階から探す">
        <div className="p-container columns-width columns-toc-inner">
          <span className="columns-toc-label">段階から</span>
          {CATEGORY_ORDER.map((category) => (
            <a href={`#${CATEGORY_ANCHORS[category]}`} key={category}>
              {category}<b>{columnsInCategory(category).length}</b>
            </a>
          ))}
        </div>
      </nav>

      <div className="p-container columns-width columns-content">
        <section className="columns-block" aria-labelledby="columns-mostread-heading">
          <div className="columns-block-head">
            <h2 id="columns-mostread-heading">まず読まれている3本</h2>
            <p>実際に検索から読まれている順です。書類の実務で詰まった人が来ています。</p>
          </div>
          <ul className="columns-grid columns-grid-3">
            {mostRead.map((column) => <ArticleCard column={column} featured key={column.slug} />)}
          </ul>
        </section>

        <section className="columns-block" aria-labelledby="columns-worries-heading">
          <div className="columns-block-head">
            <h2 id="columns-worries-heading">記事ではなく、いま困っていることから</h2>
            <p>悩みごとの入口は、関係する記事をまとめて置いています。</p>
          </div>
          <nav className="columns-worry-chips" aria-label="よくある悩み">
            {WORRIES.map(([label, href]) => <Link key={href} href={href}>{label}</Link>)}
          </nav>
        </section>

        <div className="columns-category-sections">
          {CATEGORY_ORDER.map((category) => {
            const items = columnsInCategory(category);
            return (
              <section className="columns-category" key={category} aria-labelledby={CATEGORY_ANCHORS[category]}>
                <div className="columns-block-head">
                  <h2 id={CATEGORY_ANCHORS[category]}>{category}<span className="columns-count">{items.length}本</span></h2>
                  <p>{CATEGORY_COPY[category]}</p>
                </div>
                <ul className="columns-grid">
                  {items.map((column) => <ArticleCard column={column} key={column.slug} />)}
                </ul>
              </section>
            );
          })}
        </div>

        <section className="columns-block columns-tail" aria-labelledby="columns-tail-heading">
          <div className="columns-block-head">
            <h2 id="columns-tail-heading">記事で探しにくいときは</h2>
            <p>病気・悩み・状況ごとに、関係する記事と実例をまとめたページがあります。</p>
          </div>
          <nav className="columns-worry-chips" aria-label="まとめページ">
            <Link href="/byoki">病気から探す</Link>
            <Link href="/nayami">悩みから探す</Link>
            <Link href="/joukyou">状況から探す</Link>
            <Link href="/gokai">よくある誤解</Link>
            <Link href="/jitsurei">結論が変わった実例</Link>
          </nav>
        </section>
      </div>
    </div>
  );
}
