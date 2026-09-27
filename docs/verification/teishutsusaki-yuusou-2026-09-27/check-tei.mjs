// 検証2(数字・metaTitle の語)・検証4(ページ内リンクの id)・検証5(既存リンク)・検証6(375×812 の位置)
//   node docs/verification/teishutsusaki-yuusou-2026-09-27/check-tei.mjs http://localhost:3210
import { parse } from "node-html-parser";
import { chromium } from "playwright";
const origin = process.argv[2] ?? "http://localhost:3210";
const out = "docs/verification/teishutsusaki-yuusou-2026-09-27";
const dom = parse(await (await fetch(`${origin}/columns/teishutsusaki-yuusou`)).text());
const main = dom.querySelector("main").textContent.replace(/\s+/g, " ");
console.log("## 検証2 description の数字・metaTitle の語(描画した本文 <main>)");
for (const t of ["3か月", "簡易書留", "送付状", "年金事務所", "市役所"]) { const n = main.split(t).length - 1; console.log(`${n > 0 ? "○" : "×"} ${t}: ${n} 回`); }
console.log(`title: ${dom.querySelector("title").textContent}`);
console.log(`description: ${dom.querySelector('meta[name="description"]').getAttribute("content")}`);
console.log("## 検証4 冒頭 h2 のページ内リンク");
for (const a of dom.querySelectorAll('.column-body a[href^="#"]')) { const id = decodeURIComponent(a.getAttribute("href").slice(1)); const el = dom.querySelector(`[id="${id}"]`); console.log(`${el ? "○" : "×"} #${id} → ${el ? `<${el.tagName.toLowerCase()}> ${el.textContent.trim()}` : "(id なし)"}`); }
console.log("## 検証5 既存リンク(ページ内の <a href>)");
const hrefs = new Set(dom.querySelectorAll("a[href]").map((a) => a.getAttribute("href")));
for (const p of ["/columns/shoshinbi-wakaranai", "/columns/hatachi-mae", "/columns/nenkin-jimusho-soudan", "/columns/moushitatesho-a4-insatsu", "/columns/koushin-kakuninhodo", "/columns/fushikyuu-shinsa-seikyu", "/columns/shoubyou-teatekin", "/columns/shindansho-kakunin", "/columns/shinsei-kikan", "/columns/shinsatsu-mae-memo", "/columns/hitsuyou-shorui-seishin", "/dougu/madoguchi", "/dougu/shorui"]) console.log(`${hrefs.has(p) ? "○" : "×"} ${p}`);
console.log("## 検証6 375×812 のファーストビュー");
const browser = await chromium.launch({ headless: true });
try {
  for (const [w, h] of [[375, 812], [390, 844]]) {
    const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    await page.goto(`${origin}/columns/teishutsusaki-yuusou`, { waitUntil: "networkidle" });
    const m = await page.evaluate(() => { const find = (sel, text) => [...document.querySelectorAll(sel)].find((el) => el.textContent.includes(text)); const rect = (el) => el ? Math.round(el.getBoundingClientRect().top + scrollY) : null; return { viewport: innerHeight, h1: rect(document.querySelector("h1")), box: rect(document.querySelector(".column-conclusion")), h2: rect(find("h2", "先に答え")) }; });
    console.log(`${w}×${h}: h2「先に答え: 郵送で出せます」 top=${m.h2}px / 画面 ${m.viewport}px → ${m.h2 < m.viewport ? "最初の画面に入る" : `入らない(あと ${m.h2 - m.viewport}px)`}。h1=${m.h1} 結論の箱=${m.box}`);
    await page.screenshot({ path: `${out}/firstview-local-${w}x${h}.png` }); await page.close();
  }
} finally { await browser.close(); }
