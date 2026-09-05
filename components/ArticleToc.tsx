"use client";

import { useEffect, useRef, useState } from "react";

type Heading = { id: string; text: string };

/* 記事本文のh2から目次を自動生成する(「あわせて読みたい」は除外)。
   markdownの記事はMarkdownArticleが見出しにidを振っているのでそれを使う。
   idが無い手書きの記事(jibun-de-shinseiなど)だけ、ここで採番する。

   2026-09-05: 画面が広いとき(1181px以上)は本文の左に固定して置く。
   マークアップは1つで、幅で見た目を切り替える(docs/columns-parts-2026-09-05-instructions.md §2-4)。 */
const RAIL_QUERY = "(min-width: 1181px)";

export default function ArticleToc({ bodyOnly = false }: { bodyOnly?: boolean }) {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [open, setOpen] = useState(!bodyOnly);
  const [rail, setRail] = useState(false);
  const [current, setCurrent] = useState("");
  const [hasNext, setHasNext] = useState(false);
  const railRef = useRef(false);

  useEffect(() => {
    const article = document.querySelector(bodyOnly ? ".column-body" : "article");
    if (!article) return;

    const media = window.matchMedia(RAIL_QUERY);
    const apply = () => {
      railRef.current = media.matches;
      setRail(media.matches);
      /* 左レールのときは常に開く。狭いときは従来どおり761px以上で開く。 */
      setOpen(media.matches || (bodyOnly ? window.matchMedia("(min-width: 761px)").matches : true));
    };
    apply();
    media.addEventListener("change", apply);

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
    setHasNext(document.getElementById("col-next-title") !== null);

    /* いま読んでいる節。画面の上のほうに入った見出しを現在地とする。 */
    let observer: IntersectionObserver | undefined;
    if (typeof IntersectionObserver !== "undefined" && h2s.length > 0) {
      const visible = new Set<string>();
      observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) visible.add(entry.target.id);
            else visible.delete(entry.target.id);
          }
          const first = h2s.find((h) => visible.has(h.id));
          if (first) setCurrent(first.id);
        },
        { rootMargin: "-80px 0px -70% 0px" },
      );
      for (const h of h2s) observer.observe(h);
    }

    return () => {
      media.removeEventListener("change", apply);
      observer?.disconnect();
    };
  }, [bodyOnly]);

  if (headings.length === 0) return null;

  return (
    <details
      className={`article-toc${rail ? " is-rail" : ""}`}
      open={open}
      onToggle={(event) => {
        /* 左レールのときは畳ませない(見出し扱い)。 */
        if (railRef.current) { if (!event.currentTarget.open) event.currentTarget.open = true; return; }
        setOpen(event.currentTarget.open);
      }}
    >
      <summary>目次</summary>
      <ol>
        {headings.map((h) => (
          <li key={h.id}>
            <a aria-current={rail && current === h.id ? "true" : undefined} href={`#${h.id}`}>{h.text}</a>
          </li>
        ))}
      </ol>
      {rail && hasNext ? <p className="article-toc-next"><a href="#col-next-title">次にすること</a></p> : null}
    </details>
  );
}
