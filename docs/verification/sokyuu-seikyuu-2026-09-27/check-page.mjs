// 検証3(数字が描画後の本文にあるか。数字+単位のまとまり、前に数字・,・. が無い位置)・検証4(禁止語・FAQ 数)・裁決 id が本文にあるか
//   node docs/verification/sokyuu-seikyuu-2026-09-27/check-page.mjs http://localhost:3210
import { parse } from "node-html-parser";
import { readFileSync } from "node:fs";
const origin = process.argv[2] ?? "http://localhost:3210";
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const dom = parse(await (await fetch(`${origin}/columns/sokyuu-seikyuu`)).text());
const main = dom.querySelector("main").textContent.replace(/\s+/g, " ");
console.log(`title: ${dom.querySelector("title").textContent}`);
console.log("## 検証3 数字");
for (const x of ["13.0%", "12.1%", "94件", "24件", "15件", "8件", "5年", "3年", "3か月", "1年", "5か月", "21年", "15年", "102条", "92条", "24条", "9条"]) { const c = (main.match(new RegExp(`(?<![\\d,.])${esc(x)}`, "g")) ?? []).length; console.log(`${c > 0 ? "○" : "×"} ${x}: ${c} 回`); }
console.log("## 検証4 禁止語・FAQ");
const md = readFileSync("docs/columns-rewrite-2026-09-03/articles/sokyuu-seikyuu.md", "utf8");
for (const w of ["道具", "個人で運営", "紹介料", "X", "体験記", "動画", "知恵袋"]) console.log(`${md.includes(w) || main.includes(w) ? "×" : "○"} 「${w}」: 正本 ${md.split(w).length - 1} / 本文 ${main.split(w).length - 1}`);
console.log(`FAQ(画面): ${dom.querySelectorAll(".column-faq-question").length} 件`);
console.log("## 裁決 id と PDF リンク");
const pdfs = dom.querySelectorAll(".column-body .gokai-case a").map((a) => a.getAttribute("href"));
for (const id of ["h28_29-16_03", "h28_29-16_04", "h28_29-16_05", "r02_03-12_02", "r07-07_02", "r06-07_02", "h28_29-07_13", "r04_05-06_02"]) console.log(`${main.includes(id) ? "○" : "×"} ${id}`);
console.log(`裁決の PDF リンク: ${pdfs.length} 本`);
