"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { YOUGO } from "@/data/yougo";
import { findFirstYougoTerm, isYougoExcludedTag } from "@/lib/yougo-linker.mjs";

const SKIP_SELECTOR = ".p-source, .article-sources, .suuji-sources, .yougo-sources, .references, [data-yougo-skip]";

export default function YougoAutoLinker() {
  const pathname = usePathname();

  useEffect(() => {
    // 用語辞典は1ページ構成(/yougo#<slug>)。辞典ページ自身では自動リンクを動かさない。
    if (pathname === "/yougo") return;
    const main = document.querySelector("main");
    if (!main) return;
    const selfSlug = "";
    const linkedSlugs = new Set(
      [...main.querySelectorAll<HTMLAnchorElement>('a[href^="/yougo#"]')]
        .map((anchor) => anchor.getAttribute("href")?.split("#").pop())
        .filter((slug): slug is string => Boolean(slug)),
    );
    const walker = document.createTreeWalker(main, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        const parent = node.parentElement;
        if (!parent || !node.textContent?.trim()) return NodeFilter.FILTER_REJECT;
        if (isYougoExcludedTag(parent.tagName) || parent.closest(`a, h1, h2, h3, code, pre, ${SKIP_SELECTOR}`)) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      },
    });
    const nodes: Text[] = [];
    while (walker.nextNode()) nodes.push(walker.currentNode as Text);

    for (const node of nodes) {
      let rest = node.data;
      let match = findFirstYougoTerm(rest, YOUGO, linkedSlugs, selfSlug);
      if (!match) continue;
      const fragment = document.createDocumentFragment();
      while (match) {
        fragment.append(rest.slice(0, match.index));
        const anchor = document.createElement("a");
        anchor.href = `/yougo#${match.entry.slug}`;
        anchor.className = "yougo-auto-link";
        anchor.dataset.yougoAuto = match.entry.slug;
        anchor.textContent = match.entry.term;
        fragment.append(anchor);
        linkedSlugs.add(match.entry.slug);
        rest = rest.slice(match.index + match.entry.term.length);
        match = findFirstYougoTerm(rest, YOUGO, linkedSlugs, selfSlug);
      }
      fragment.append(rest);
      node.replaceWith(fragment);
    }
  }, [pathname]);

  return null;
}
