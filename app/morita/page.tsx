import type { Metadata } from "next";
import Link from "next/link";
import MoritaArticle from "@/components/morita/MoritaArticle";
import source, { faqs, lead } from "@/content/morita/morita";
import { MORITA_HUB, moritaArticlesInGroup, moritaPath, moritaShortTitle } from "@/lib/morita";
import { pageMetadata } from "@/lib/seo";

/* 森田療法のハブ(/morita/)。本文の「どんな症状に向いているか」節のあとに症状別のカードを出す。
   カードは一覧ページの .hub-card(components/platform/HubIndexList.tsx)と同じ見た目を流用。 */
export const metadata: Metadata = pageMetadata({
  title: MORITA_HUB.metaTitle ?? MORITA_HUB.title,
  description: MORITA_HUB.description,
  path: "/morita",
});

export default function MoritaHubPage() {
  const cards = moritaArticlesInGroup("shoujou");
  return (
    <MoritaArticle
      article={MORITA_HUB}
      source={source}
      lead={lead}
      faqs={faqs}
      insertAfter={{
        heading: "どんな症状に向いているか",
        node: (
          <ul className="morita-cards" aria-label="症状別の記事">
            {cards.map((a) => (
              <li key={a.slug}>
                <Link className="hub-card" href={moritaPath(a)}>
                  <h3>{moritaShortTitle(a)}</h3>
                  <p>{a.title.split(/\s*—\s*/)[1] ?? ""}</p>
                  <span className="hub-card-meta"><span>症状別</span><b>読む →</b></span>
                </Link>
              </li>
            ))}
          </ul>
        ),
      }}
    />
  );
}
