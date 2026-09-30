// 検証1(描画後に X・投稿・表示回数・万回が残っていないか)・検証3(数字10種・禁止語・FAQ・表の横スクロール)
//   node docs/verification/kougin-nenkin-tedori-2026-09-30/check-page.mjs http://localhost:3210
import { parse } from "node-html-parser";
import { chromium } from "playwright";
const origin = process.argv[2] ?? "http://localhost:3210";
const html = await (await fetch(`${origin}/columns/kougin-nenkin-tedori`)).text();
const dom = parse(html);
const article = dom.querySelector("article").textContent.replace(/\s+/g, " ");
console.log(`title: ${dom.querySelector("title").textContent}`);
console.log("## 検証1 調査元の表記(記事 <article> のテキスト)");
for (const w of ["X", "投稿", "表示回数", "万回", "知恵袋", "動画", "クリニック"]) { const c = (article.match(new RegExp(w, "g")) ?? []).length; console.log(`${c === 0 ? "○" : "×"} 「${w}」: ${c}${w === "X" && c ? " → " + [...article.matchAll(/.{12}X.{12}/g)].map((m) => m[0]).join(" | ") : ""}`); }
console.log(`h2「Xの声から」: ${dom.querySelectorAll("article h2").filter((h) => h.textContent.includes("Xの声")).length} 本、h2「お金でつまずくところ — よくある5つ」: ${dom.querySelectorAll("article h2").filter((h) => h.textContent.includes("お金でつまずくところ — よくある5つ")).length} 本`);
console.log("## 検証3 数字(前に数字・,・. が無い位置)");
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
for (const x of ["24,141", "91,451", "30,231", "19,747", "111,818", "73,802", "14,190", "106.6%", "22,649", "23,053"]) { const c = (article.match(new RegExp(`(?<![\\d,.])${esc(x)}`, "g")) ?? []).length; console.log(`${c > 0 ? "○" : "×"} ${x}: ${c} 回`); }
for (const w of ["道具", "個人で運営", "紹介料", "体験記"]) console.log(`${article.includes(w) ? "×" : "○"} 「${w}」: ${article.split(w).length - 1}`);
console.log(`FAQ(画面): ${dom.querySelectorAll(".column-faq-question").length} 件、表: ${dom.querySelectorAll(".column-body table").length} 本`);
const browser = await chromium.launch({ headless: true });
try {
  const p = await browser.newPage({ viewport: { width: 375, height: 812 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await p.goto(`${origin}/columns/kougin-nenkin-tedori`, { waitUntil: "networkidle" });
  const m = await p.evaluate(() => ({ page: document.documentElement.scrollWidth, vw: innerWidth, tables: [...document.querySelectorAll(".column-body table")].map((t) => ({ w: t.scrollWidth, c: t.parentElement.clientWidth, o: getComputedStyle(t.parentElement).overflowX })) }));
  console.log(`375px: ページ幅 ${m.page}/${m.vw}、表 ${m.tables.length} 本 ${m.tables.map((t) => `${t.w}px/${t.c}px ${t.o}`).join(", ")}`);
  const tbl = await p.locator(".column-body table").nth(2); await tbl.scrollIntoViewIfNeeded(); await p.screenshot({ path: "docs/verification/kougin-nenkin-tedori-2026-09-30/pref-table-375.png" });
} finally { await browser.close(); }
