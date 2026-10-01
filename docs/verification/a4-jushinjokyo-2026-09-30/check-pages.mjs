// A: a4-insatsu の <title> と h1。B: jushinjokyo の <title>・h1・description、数字、禁止語、FAQ、表、パンくずの表記。
//   node docs/verification/a4-jushinjokyo-2026-09-30/check-pages.mjs http://localhost:3210
import { parse } from "node-html-parser";
const origin = process.argv[2] ?? "http://localhost:3210";
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
{
  const dom = parse(await (await fetch(`${origin}/columns/moushitatesho-a4-insatsu`)).text());
  console.log("## A moushitatesho-a4-insatsu"); console.log(`title: ${dom.querySelector("title").textContent}`); console.log(`h1: ${dom.querySelector("h1").textContent}`);
  console.log(`更新日の表示: ${dom.querySelector("time")?.getAttribute("datetime")}`);
}
{
  const dom = parse(await (await fetch(`${origin}/columns/jushinjokyo-shomeisho`)).text());
  const main = dom.querySelector("main").textContent.replace(/\s+/g, " ");
  console.log("\n## B jushinjokyo-shomeisho"); console.log(`title: ${dom.querySelector("title").textContent}`); console.log(`h1: ${dom.querySelector("h1").textContent}`);
  console.log(`description: ${dom.querySelector('meta[name="description"]').getAttribute("content")}`);
  for (const x of ["5つ", "13項目", "5年"]) { const c = (main.match(new RegExp(`(?<![\\d,.])${esc(x)}`, "g")) ?? []).length; console.log(`${c > 0 ? "○" : "×"} ${x}: ${c} 回`); }
  for (const w of ["道具", "個人で運営", "紹介料", "体験記", "動画", "知恵袋", "投稿"]) console.log(`${main.includes(w) ? "×" : "○"} 「${w}」: ${main.split(w).length - 1}`);
  console.log(`X(英字の前後を除く): ${(main.match(/(?<![A-Za-z])X(?![A-Za-z])/g) ?? []).length}`);
  console.log(`FAQ(画面): ${dom.querySelectorAll(".column-faq-question").length} 件、表: ${dom.querySelectorAll(".column-body table").length} 本、引用: ${dom.querySelectorAll(".column-body blockquote").length} 個`);
  console.log(`裁決の PDF リンク: ${dom.querySelectorAll(".column-body .gokai-case a").length} 本`);
}
