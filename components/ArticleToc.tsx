"use client";

import { useEffect, useState } from "react";

export type Heading = { id: string; text: string };

// 記事本文のh2から目次を自動生成する(「あわせて読みたい」は除外)。
// h2にidが無い場合はここで採番する。
export default function ArticleToc({ headings: suppliedHeadings }: { headings?: Heading[] }) {
  const [headings, setHeadings] = useState<Heading[]>(suppliedHeadings ?? []);

  useEffect(() => {
    if (suppliedHeadings) return;
    const article = document.querySelector("article");
    if (!article) return;

    const h2s = Array.from(article.querySelectorAll("h2")).filter(
      (h) => !h.closest(".related-columns") && !h.closest(".references"),
    );

    setHeadings(
      h2s.map((h, index) => {
        if (!h.id) {
          h.id = `section-${index + 1}`;
        }
        return { id: h.id, text: h.textContent ?? "" };
      }),
    );
  }, [suppliedHeadings]);

  if (headings.length === 0) return null;

  return (
    <details className="article-toc" open>
      <summary>目次</summary>
      <ol>
        {headings.map((h) => (
          <li key={h.id}>
            <a href={`#${h.id}`}>{h.text}</a>
          </li>
        ))}
      </ol>
    </details>
  );
}
