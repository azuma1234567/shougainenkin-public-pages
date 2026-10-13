#!/usr/bin/env node
/* 崩れの機械検査: 代表 13 ページ × 375/1280px で、(a) 画面の右端からはみ出す要素、(b) white-space: nowrap で中身が切れている要素、
   (c) 横スクロールの有無 を数える。 node overflow-check.mjs http://localhost:3210 */
import { chromium } from "playwright";
import { PAGES, WIDTHS } from "../design-system-2026-10-06/snapshot.mjs";
const origin = process.argv[2] ?? "http://localhost:3210";
const browser = await chromium.launch();
let problems = 0;
for (const width of WIDTHS) {
  const page = await browser.newPage({ viewport: { width, height: 900 } });
  for (const [name, path] of PAGES) {
    await page.goto(origin + path, { waitUntil: "networkidle" });
    const r = await page.evaluate(() => {
      const vw = document.documentElement.clientWidth;
      const over = [], clipped = [];
      for (const el of document.querySelectorAll("body *")) {
        const cs = getComputedStyle(el);
        if (cs.display === "none" || cs.visibility === "hidden" || cs.position === "fixed") continue;
        const rect = el.getBoundingClientRect();
        if (rect.width === 0) continue;
        if (rect.right > vw + 1 && !el.closest(".article-table-wrap, [data-overflow-ok]")) over.push(`${el.tagName.toLowerCase()}.${[...el.classList].slice(0, 2).join(".")} right=${Math.round(rect.right)}`);
        if (cs.whiteSpace === "nowrap" && el.scrollWidth > el.clientWidth + 1 && cs.overflow !== "visible") clipped.push(`${el.tagName.toLowerCase()}.${[...el.classList].slice(0, 2).join(".")} ${el.scrollWidth}>${el.clientWidth} "${(el.textContent || "").trim().slice(0, 20)}"`);
      }
      return { hscroll: document.documentElement.scrollWidth > vw, over: [...new Set(over)].slice(0, 8), clipped: [...new Set(clipped)].slice(0, 8) };
    });
    const bad = r.hscroll || r.over.length || r.clipped.length;
    if (bad) problems += 1;
    console.log(`${bad ? "×" : "○"} ${width} ${path}${r.hscroll ? " 横スクロールあり" : ""}${r.over.length ? " はみ出し: " + r.over.join(" / ") : ""}${r.clipped.length ? " 切れ: " + r.clipped.join(" / ") : ""}`);
  }
  await page.close();
}
await browser.close();
console.log(problems ? `問題 ${problems} ページ分` : "はみ出し・切れ・横スクロールなし");
