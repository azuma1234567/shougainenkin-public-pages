// 検証2(数字)・検証3(禁止語・FAQ・リンク残存)・裁決 id
//   node docs/verification/shoshinbi-wakaranai-2026-09-28/check-page.mjs http://localhost:3210
import { parse } from "node-html-parser";
import { readFileSync } from "node:fs";
const origin = process.argv[2] ?? "http://localhost:3210";
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const dom = parse(await (await fetch(`${origin}/columns/shoshinbi-wakaranai`)).text());
const main = dom.querySelector("main").textContent.replace(/\s+/g, " ");
console.log(`title: ${dom.querySelector("title").textContent}`);
console.log("## 検証2 数字(前に数字・,・. が無い位置)");
for (const x of ["35件", "26件", "22件", "4件", "9件", "94件", "2名", "1名", "平成27年", "5年以上前"]) { const c = (main.match(new RegExp(`(?<![\\d,.])${esc(x)}`, "g")) ?? []).length; console.log(`${c > 0 ? "○" : "×"} ${x}: ${c} 回`); }
console.log("## 検証3 禁止語・FAQ・リンク");
const md = readFileSync("docs/columns-rewrite-2026-09-03/articles/shoshinbi-wakaranai.md", "utf8");
for (const w of ["道具", "個人で運営", "紹介料", "X", "体験記", "動画", "知恵袋"]) console.log(`${md.includes(w) || main.includes(w) ? "×" : "○"} 「${w}」: 正本 ${md.split(w).length - 1} / 本文 ${main.split(w).length - 1}`);
console.log(`FAQ(画面): ${dom.querySelectorAll(".column-faq-question").length} 件`);
const hrefs = new Set(dom.querySelectorAll(".column-body a[href]").map((a) => a.getAttribute("href")));
for (const p of ["/columns/shakaiteki-chiyu", "/columns/daisansha-shomei", "/columns/shoshinbi-karute-nashi", "/columns/shoshinbi-haiin", "/gokai/kikan-de-tokutei", "/jitsurei"]) console.log(`${hrefs.has(p) ? "○" : "×"} ${p}`);
console.log("## 裁決 id");
const ids = "r02_03-12_08 r04_05-06_01 r06-07_01 r04_05-06_06 r04_05-06_09 r02_03-05_07 r02_03-12_03 h30_r01-16_04 r04_05-06_04 r04_05-06_05 r02_03-12_07 r06-03_02 r04_05-06_14 r02_03-05_03 r02_03-05_05 r02_03-12_06".split(" ");
for (const id of ids) console.log(`${main.includes(id) ? "○" : "×"} ${id}`);
console.log(`裁決の PDF リンク(.gokai-case): ${dom.querySelectorAll(".column-body .gokai-case a").length} 本`);
