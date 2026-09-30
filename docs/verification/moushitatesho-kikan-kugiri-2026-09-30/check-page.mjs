// 検証4(数字・禁止語・FAQ・70.3・裁決 id とリンク)と検証5(375×812 でのファーストビュー: 新 h2 と 5 行の表の位置)
//   node docs/verification/moushitatesho-kikan-kugiri-2026-09-30/check-page.mjs http://localhost:3210
import { parse } from "node-html-parser";
import { readFileSync } from "node:fs";
import { chromium } from "playwright";
const origin = process.argv[2] ?? "http://localhost:3210";
const out = "docs/verification/moushitatesho-kikan-kugiri-2026-09-30";
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const dom = parse(await (await fetch(`${origin}/columns/moushitatesho-kikan-kugiri`)).text());
const main = dom.querySelector("main").textContent.replace(/\s+/g, " ");
console.log(`title: ${dom.querySelector("title").textContent}`);
for (const x of ["5年", "3〜5年", "1年以上", "令和2年10月", "3か月"]) { const c = (main.match(new RegExp(`(?<![\\d,.])${esc(x)}`, "g")) ?? []).length; console.log(`${c > 0 ? "○" : "×"} ${x}: ${c} 回`); }
const md = readFileSync("docs/columns-rewrite-2026-09-03/articles/moushitatesho-kikan-kugiri.md", "utf8");
for (const w of ["道具", "個人で運営", "紹介料", "X", "体験記", "動画", "知恵袋", "70.3"]) console.log(`${md.includes(w) || main.includes(w) ? "×" : "○"} 「${w}」: 正本 ${md.split(w).length - 1} / 本文 ${main.split(w).length - 1}`);
console.log(`FAQ(画面): ${dom.querySelectorAll(".column-faq-question").length} 件`);
console.log(`h2 の並び: ${dom.querySelectorAll("article h2").map((h) => h.textContent).slice(0, 4).join(" / ")} …`);
console.log(`裁決の PDF リンク(.gokai-case): ${dom.querySelectorAll(".column-body .gokai-case a").length} 本、/jitsurei?case= リンク: ${dom.querySelectorAll('.column-body a[href^="/jitsurei?case="]').length} 本`);
for (const id of ["h28_29-16_04", "r07-07_02", "r02_03-05_05"]) console.log(`${main.includes(id) ? "○" : "×"} ${id}`);
console.log(`/dougu/moushitatesho リンク(本文): ${dom.querySelectorAll('.column-body a[href^="/dougu/moushitatesho"]').length} 本`);
console.log("## 検証5 ファーストビュー");
const browser = await chromium.launch({ headless: true });
try {
  for (const [w, h] of [[375, 812], [390, 844]]) {
    const p = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    await p.goto(`${origin}/columns/moushitatesho-kikan-kugiri`, { waitUntil: "networkidle" });
    const m = await p.evaluate(() => { const find = (sel, text) => [...document.querySelectorAll(sel)].find((el) => el.textContent.includes(text)); const rect = (el) => el ? Math.round(el.getBoundingClientRect().top + scrollY) : null; const table = find("table", "何が変わったか"); return { viewport: innerHeight, h1: rect(document.querySelector("h1")), box: rect(document.querySelector(".column-conclusion")), h2: rect(find("h2", "まず現物")), quote: rect(document.querySelector(".column-body blockquote")), table: rect(table), tableBottom: table ? Math.round(table.getBoundingClientRect().bottom + scrollY) : null, tableWidth: table?.scrollWidth, container: table?.parentElement.clientWidth }; });
    console.log(`${w}×${h}: h1=${m.h1} 結論の箱=${m.box} h2「まず現物」=${m.h2} 引用=${m.quote} 表の上端=${m.table}px 表の下端=${m.tableBottom}px(画面 ${m.viewport}px)→ 表の上端は 1,800px ${m.table <= 1800 ? "以内" : "を超える"}。表の幅 ${m.tableWidth}px/容器 ${m.container}px`);
    await p.screenshot({ path: `${out}/firstview-${w}x${h}.png` }); await p.evaluate((y) => scrollTo(0, y - 60), m.h2); await p.screenshot({ path: `${out}/h2-table-${w}x${h}.png` }); await p.close();
  }
} finally { await browser.close(); }
