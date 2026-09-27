// 検証2(metaTitle・description の数字が本文にあるか。数字+単位をひとまとまりで、(?<![\d,.]) の規則)・検証5(375×812 の位置)
//   node docs/verification/shinsei-kikan-2026-09-27/check-kikan.mjs http://localhost:3210
import { parse } from "node-html-parser";
import { chromium } from "playwright";
const origin = process.argv[2] ?? "http://localhost:3210";
const out = "docs/verification/shinsei-kikan-2026-09-27";
const dom = parse(await (await fetch(`${origin}/columns/shinsei-kikan`)).text());
const main = dom.querySelector("main").textContent.replace(/\s+/g, " ");
const esc = (t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
console.log("## 検証2 metaTitle・description の数字(描画した本文 <main>、前に数字・,・. が無い位置)");
for (const t of ["3か月", "95%", "95.1%", "65日", "65.1日", "03-5155-1933", "4か月"]) { const n = (main.match(new RegExp(`(?<![\\d,.])${esc(t)}`, "g")) ?? []).length; console.log(`${n > 0 ? "○" : "×"} ${t}: ${n} 回`); }
console.log(`title: ${dom.querySelector("title").textContent}`);
console.log(`description: ${dom.querySelector('meta[name="description"]').getAttribute("content")}`);
console.log("## 検証5 375×812 のファーストビュー");
const browser = await chromium.launch({ headless: true });
try {
  for (const [w, h] of [[375, 812], [390, 844]]) {
    const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    await page.goto(`${origin}/columns/shinsei-kikan`, { waitUntil: "networkidle" });
    const m = await page.evaluate(() => { const find = (sel, text) => [...document.querySelectorAll(sel)].find((el) => el.textContent.includes(text)); const rect = (el) => el ? Math.round(el.getBoundingClientRect().top + scrollY) : null; return { viewport: innerHeight, h1: rect(document.querySelector("h1")), box: rect(document.querySelector(".column-conclusion")), h2: rect(find("h2", "いま何日目ですか")), table: rect(find("table", "提出からの日数")) }; });
    console.log(`${w}×${h}: h2「いま何日目ですか」 top=${m.h2}px / 画面 ${m.viewport}px → ${m.h2 < m.viewport ? "最初の画面に入る" : `入らない(あと ${m.h2 - m.viewport}px)`}。h1=${m.h1} 結論の箱=${m.box} 表=${m.table}`);
    await page.screenshot({ path: `${out}/firstview-local-${w}x${h}.png` }); await page.close();
  }
} finally { await browser.close(); }
