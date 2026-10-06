import Link from "next/link";
import type { ReactNode } from "react";
import ArticleToc from "@/components/ArticleToc";
import Breadcrumb from "@/components/Breadcrumb";
import MarkdownArticle from "@/components/MarkdownArticle";
import MoritaSafetyNote from "@/components/morita/MoritaSafetyNote";
import { formatDate } from "@/lib/columns";
import { getMoritaArticle, moritaJsonLd, moritaPath, moritaShortTitle, type MoritaArticleMeta } from "@/lib/morita";
import "@/app/columns/columns.css";
import "@/app/morita/morita.css";

/* 森田療法の記事(ColumnArticle の森田版。docs/claude-code-morita-2026-10-06-instructions.md §5)。
   使わないもの: ColumnFooter(年金の参考リンク)・DouguCards・AppCta・AdLabel・ColumnThemeBlock・社労士導線。
   参照した資料名や URL の一覧は出さない(内部記録 docs/morita-2026-10-06/sources-internal.md のみ)。 */
export default function MoritaArticle({
  article,
  source,
  lead,
  faqs,
  insertAfter,
}: {
  article: MoritaArticleMeta;
  source: string;
  lead: string[];
  faqs: { question: string; answer: string }[];
  /* ハブ用: この h2 見出しの節の直後に差し込む要素(症状別カードなど)。本文の文字列は変えない。 */
  insertAfter?: { heading: string; node: ReactNode };
}) {
  const isHub = article.group === "hub";
  const related = article.related.map((slug) => getMoritaArticle(slug)).slice(0, 3);
  /* 差し込みがあるときは、指定の節の次の h2 で本文を 2 つに分けて描く(見出し id は節ごとに振られるが、節名が重複しない前提) */
  const parts = (() => {
    if (!insertAfter) return [source];
    const lines = source.split("\n");
    const start = lines.findIndex((line) => line.trim() === `## ${insertAfter.heading}`);
    if (start < 0) throw new Error(`見出しが無い: ## ${insertAfter.heading}`);
    const next = lines.findIndex((line, i) => i > start && line.startsWith("## "));
    if (next < 0) return [source];
    return [lines.slice(0, next).join("\n"), lines.slice(next).join("\n")];
  })();

  /* data-yougo-skip: 年金の用語辞典の自動リンク(YougoAutoLinker)をこの区画では走らせない(2026-10-06 の指示) */
  return (
    <article className="column-article morita-article" data-yougo-skip>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(moritaJsonLd(article, faqs)).replace(/</g, "\\u003c") }}
      />
      <Breadcrumb current={isHub ? "森田療法" : article.title} parents={isHub ? [] : [{ name: "森田療法", path: "/morita" }]} showColumns={false} />
      <h1>{article.title}</h1>
      <p className="meta-line">
        公開日: <time dateTime={article.datePublished}>{formatDate(article.datePublished)}</time>
        {" "}/ 最終確認日: <time dateTime={article.dateModified}>{formatDate(article.dateModified)}</time>
      </p>

      <section className="column-conclusion" aria-labelledby="column-conclusion-heading">
        <h2 id="column-conclusion-heading">この記事の結論</h2>
        {lead.map((line, index) => <p key={index}>{line}</p>)}
      </section>
      <MoritaSafetyNote />
      <ArticleToc bodyOnly />

      <div className="column-body">
        <MarkdownArticle source={parts[0]} appCtaSlug="morita" columnStyle />
        {insertAfter && parts.length > 1 ? insertAfter.node : null}
        {parts.length > 1 ? <MarkdownArticle source={parts[1]} appCtaSlug="morita" columnStyle /> : null}
      </div>

      {related.length > 0 && (
        <section className="related-columns morita-next">
          <h2>次に読む</h2>
          <ul>
            {related.map((a) => <li key={a.slug}><Link href={moritaPath(a)}>{moritaShortTitle(a)}</Link></li>)}
          </ul>
        </section>
      )}

      <aside className="morita-author">
        <p>
          この記事は、不安障害の当事者である運営者が、創始者の著作・医療機関・公益財団・学会の公開資料・公的統計などの一次資料をもとに書いています。医療監修はありません。両団体(東京慈恵会医科大学森田療法センター・生活の発見会)と当サイトは無関係で、推薦・監修・提携はありません。
        </p>
        <p><Link href="/about">運営者について</Link></p>
      </aside>
    </article>
  );
}
