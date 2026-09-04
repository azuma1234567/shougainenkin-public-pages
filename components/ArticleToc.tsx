"use client";

import { useEffect, useState } from "react";

type Heading = { id: string; text: string };

// 記事本文のh2から目次を自動生成する(「あわせて読みたい」は除外)。
// markdownの記事はMarkdownArticleが見出しにidを振っているのでそれを使う。
// idが無い手書きの記事(jibun-de-shinseiなど)だけ、ここで採番する。
export default function ArticleToc({ bodyOnly = false }: { bodyOnly?: boolean }) {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [open, setOpen] = useState(!bodyOnly);

  useEffect(() => {
    const article = document.querySelector(bodyOnly ? ".column-body" : "article");
    if (!article) return;
    if (bodyOnly) setOpen(window.matchMedia("(min-width: 761px)").matches);

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
  }, [bodyOnly]);

  if (headings.length === 0) return null;

  return (
    <details className="article-toc" open={open} onToggle={event => setOpen(event.currentTarget.open)}>
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
