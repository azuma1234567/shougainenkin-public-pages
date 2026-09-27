// 検証1(数字が描画後の本文にあるか。数字+単位のまとまり、前に数字・,・. が無い位置)・検証2(禁止語)・FAQ 数
//   node docs/verification/hitorigurashi-hatarakinagara-2026-09-27/check-pages.mjs http://localhost:3210
import { parse } from "node-html-parser";
import { readFileSync } from "node:fs";
const origin = process.argv[2] ?? "http://localhost:3210";
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const NUMS = {
  "hitorigurashi-furi": ["209.6万人", "25.2%", "52.8万人", "25.8%", "85件", "26件", "4人に1人"],
  hatarakinagara: ["209.6万人", "34.0%", "28.3%", "43.1%", "22.1%", "50.2%", "24.8%", "27.1%", "38.7%", "13.8%", "4.8%", "2.3%", "8.8%", "9.7%", "3.7%", "1.6%", "714千人", "725千人", "205千人", "34.0%"],
};
for (const [slug, nums] of Object.entries(NUMS)) {
  const dom = parse(await (await fetch(`${origin}/columns/${slug}`)).text());
  const main = dom.querySelector("main").textContent.replace(/\s+/g, " ");
  console.log(`## ${slug}`);
  console.log(`title: ${dom.querySelector("title").textContent}`);
  for (const x of nums) { const c = (main.match(new RegExp(`(?<![\\d,.])${esc(x)}`, "g")) ?? []).length; console.log(`${c > 0 ? "○" : "×"} ${x}: ${c} 回`); }
  const md = readFileSync(`docs/columns-rewrite-2026-09-03/articles/${slug}.md`, "utf8");
  for (const w of ["道具", "個人で運営", "紹介料", "X", "体験記", "動画", "知恵袋"]) console.log(`${md.includes(w) || main.includes(w) ? "×" : "○"} 「${w}」: 正本 ${md.split(w).length - 1} / 本文 ${main.split(w).length - 1}`);
  console.log(`FAQ(画面): ${dom.querySelectorAll(".column-faq-question").length} 件`);
  console.log(`リンク tokyu-hantei-guideline: ${dom.querySelectorAll('.column-body a[href="/columns/tokyu-hantei-guideline"]').length} 本`);
}
