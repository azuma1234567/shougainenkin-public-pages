// tokyu と nichijo の相互リンク(B-4-2)、tokyu の数字が描画後の本文にあるか、375×812 での tokyu 表1 の位置
//   node docs/verification/tokyu-nichijo-2026-09-27/check-pages.mjs http://localhost:3210
import { parse } from "node-html-parser";
import { chromium } from "playwright";
const origin = process.argv[2] ?? "http://localhost:3210";
const out = "docs/verification/tokyu-nichijo-2026-09-27";
const page = async (slug) => parse(await (await fetch(`${origin}/columns/${slug}`)).text());
const t = await page("tokyu-hantei-guideline"), n = await page("nichijo-seikatsu-7koumoku");
const links = (d) => new Set(d.querySelectorAll(".column-body a[href]").map((a) => a.getAttribute("href")));
console.log("## 相互リンク(本文内)");
console.log(`${links(t).has("/columns/nichijo-seikatsu-7koumoku") ? "○" : "×"} tokyu → nichijo`);
console.log(`${links(n).has("/columns/tokyu-hantei-guideline") ? "○" : "×"} nichijo → tokyu`);
console.log(`${links(t).has("/dougu/mitate") ? "○" : "×"} tokyu → /dougu/mitate`);
const main = t.querySelector("main").textContent.replace(/\s+/g, " ");
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
console.log("## tokyu 数字(描画した本文 <main>、前に数字・,・. が無い位置)");
for (const x of ["85件", "64件", "75.3%", "44.7%", "58件", "26件", "14,841件", "444件", "3か月"]) { const c = (main.match(new RegExp(`(?<![\\d,.])${esc(x)}`, "g")) ?? []).length; console.log(`${c > 0 ? "○" : "×"} ${x}: ${c} 回`); }
console.log(`title: ${t.querySelector("title").textContent}`);
console.log("## 375×812 での tokyu 表1 の位置");
const browser = await chromium.launch({ headless: true });
try {
  const p = await browser.newPage({ viewport: { width: 375, height: 812 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await p.goto(`${origin}/columns/tokyu-hantei-guideline`, { waitUntil: "networkidle" });
  const m = await p.evaluate(() => { const find = (sel, text) => [...document.querySelectorAll(sel)].find((el) => el.textContent.includes(text)); const rect = (el) => el ? Math.round(el.getBoundingClientRect().top + scrollY) : null; const table = find("table", "判定の平均"); return { viewport: innerHeight, h3: rect(find("h3", "目安表(表1)の全体")), table: rect(table), tableWidth: table?.scrollWidth, container: table?.parentElement.clientWidth, overflow: table && getComputedStyle(table.parentElement).overflowX }; });
  console.log(`h3「目安表(表1)の全体」 top=${m.h3}px、表=${m.table}px / 画面 ${m.viewport}px。表の幅 ${m.tableWidth}px(容器 ${m.container}px、overflow-x=${m.overflow})`);
  await p.screenshot({ path: `${out}/tokyu-375-top.png` });
  await p.evaluate((y) => scrollTo(0, y - 80), m.table); await p.screenshot({ path: `${out}/tokyu-375-table1.png` });
} finally { await browser.close(); }
