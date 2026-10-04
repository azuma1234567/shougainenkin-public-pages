// 描画後の <title>・h1・FAQ・数字・禁止語(A: shindansho-kakunin、B: shindansho-tanomikata)
//   node docs/verification/kakunin-tanomikata-2026-10-04/check-pages.mjs http://localhost:3210
import { parse } from "node-html-parser";
const origin = process.argv[2] ?? "http://localhost:3210";
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
for (const [slug, nums] of [["shindansho-kakunin", ["75.3%", "44.7%", "64件", "85件", "11件", "12.9%", "1年"]], ["shindansho-tanomikata", ["3か月", "7万円"]]]) {
  const dom = parse(await (await fetch(`${origin}/columns/${slug}`)).text());
  const main = dom.querySelector("main").textContent.replace(/\s+/g, " ");
  console.log(`## ${slug}`); console.log(`title: ${dom.querySelector("title").textContent}`); console.log(`h1: ${dom.querySelector("h1").textContent}`);
  for (const x of nums) { const c = (main.match(new RegExp(`(?<![\\d,.])${esc(x)}`, "g")) ?? []).length; console.log(`${c > 0 ? "○" : "×"} ${x}: ${c} 回`); }
  for (const w of ["道具", "個人で運営", "紹介料", "体験記", "動画", "知恵袋", "投稿", "医師法違反では"]) console.log(`${(w === "医師法違反では" ? !main.includes(w) : main.includes(w)) ? "×" : "○"} 「${w}」: ${main.split(w).length - 1}`);
  console.log(`X(英字の前後を除く): ${(main.match(/(?<![A-Za-z])X(?![A-Za-z])/g) ?? []).length}`);
  console.log(`FAQ(画面): ${dom.querySelectorAll(".column-faq-question").length} 件、引用: ${dom.querySelectorAll(".column-body blockquote").length} 個\n`);
}
