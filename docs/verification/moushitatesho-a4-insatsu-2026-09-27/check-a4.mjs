// 検証2(数字)・検証6(既存リンク)・検証5(375×812 で h3「自宅のプリンターで(5分)」の位置)
//   node docs/verification/moushitatesho-a4-insatsu-2026-09-27/check-a4.mjs http://localhost:3210
import { parse } from "node-html-parser";
import { chromium } from "playwright";
const origin = process.argv[2] ?? "http://localhost:3210";
const out = "docs/verification/moushitatesho-a4-insatsu-2026-09-27";
const html = await (await fetch(`${origin}/columns/moushitatesho-a4-insatsu`)).text();
const dom = parse(html);
const main = dom.querySelector("main").textContent.replace(/\s+/g, " ");
console.log("## 検証2 数字(描画した本文 <main>)");
for (const t of ["10〜20円", "20円", "2日", "30日", "5年", "3〜5年", "304,456件", "96.7%"]) { const n = main.split(t).length - 1; console.log(`${n > 0 ? "○" : "×"} ${t}: ${n} 回`); }
console.log("## 検証6 既存リンク(ページ内の <a href>)");
const hrefs = new Set(dom.querySelectorAll("a[href]").map((a) => a.getAttribute("href")));
for (const p of ["/columns/moushitatesho-kakikata", "/columns/moushitatesho-kikan-kugiri", "/columns/moushitatesho-mijushin-kikan", "/columns/shindansho-kakunin", "/columns/nichijo-seikatsu-7koumoku", "/columns/koushin-kakuninhodo", "/columns/fushikyuu-shinsa-seikyu", "/columns/shinsatsu-mae-memo", "/dougu/moushitatesho", "/dougu/shorui"]) console.log(`${hrefs.has(p) ? "○" : "×"} ${p}`);
const appStore = [...hrefs].find((h) => /apps\.apple\.com/.test(h));
console.log(`${appStore ? "○" : "×"} App Store: ${appStore ?? "(なし)"}`);
console.log("## 検証5 375×812 のファーストビュー");
const browser = await chromium.launch({ headless: true });
try {
  for (const [w, h] of [[375, 812], [390, 844]]) {
    const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    await page.goto(`${origin}/columns/moushitatesho-a4-insatsu`, { waitUntil: "networkidle" });
    const m = await page.evaluate(() => {
      const find = (sel, text) => [...document.querySelectorAll(sel)].find((el) => el.textContent.includes(text));
      const rect = (el) => el ? Math.round(el.getBoundingClientRect().top + scrollY) : null;
      return { viewport: innerHeight, h1: rect(document.querySelector("h1")), box: rect(document.querySelector(".column-conclusion")), h2: rect(find("h2", "まず手順")), h3: rect(find("h3", "自宅のプリンターで(5分)")) };
    });
    console.log(`${w}×${h}: h3「自宅のプリンターで(5分)」 top=${m.h3}px / 画面 ${m.viewport}px → ${m.h3 < m.viewport ? "最初の画面に入る" : `入らない(あと ${m.h3 - m.viewport}px)`}。h1=${m.h1} 結論の箱=${m.box} h2「まず手順」=${m.h2}`);
    await page.screenshot({ path: `${out}/firstview-local-${w}x${h}.png` });
    await page.close();
  }
} finally { await browser.close(); }
