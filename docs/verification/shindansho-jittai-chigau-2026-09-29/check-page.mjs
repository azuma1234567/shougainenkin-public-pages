// 検証3(数字・禁止語・FAQ・mitate リンク・裁決 id と PDF/jitsurei リンク)
//   node docs/verification/shindansho-jittai-chigau-2026-09-29/check-page.mjs http://localhost:3210
import { parse } from "node-html-parser";
import { readFileSync } from "node:fs";
const origin = process.argv[2] ?? "http://localhost:3210";
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const dom = parse(await (await fetch(`${origin}/columns/shindansho-jittai-chigau`)).text());
const main = dom.querySelector("main").textContent.replace(/\s+/g, " ");
console.log(`title: ${dom.querySelector("title").textContent}`);
for (const x of ["75.3%", "44.7%", "64件", "85件", "15件", "7件", "8件", "1年", "3か月"]) { const c = (main.match(new RegExp(`(?<![\\d,.])${esc(x)}`, "g")) ?? []).length; console.log(`${c > 0 ? "○" : "×"} ${x}: ${c} 回`); }
const md = readFileSync("docs/columns-rewrite-2026-09-03/articles/shindansho-jittai-chigau.md", "utf8");
for (const w of ["道具", "個人で運営", "紹介料", "X", "体験記", "動画", "知恵袋", "厚労省の記載要領"]) console.log(`${md.includes(w) || main.includes(w) ? "×" : "○"} 「${w}」: 正本 ${md.split(w).length - 1} / 本文 ${main.split(w).length - 1}`);
console.log(`FAQ(画面): ${dom.querySelectorAll(".column-faq-question").length} 件`);
console.log(`/dougu/mitate リンク: ${dom.querySelectorAll('.column-body a[href="/dougu/mitate"]').length} 本`);
console.log(`裁決の PDF リンク(.gokai-case): ${dom.querySelectorAll(".column-body .gokai-case a").length} 本`);
for (const id of ["r06-03_05", "h28_29-16_06", "h28_29-07_13", "r07-03_04", "r04_05-06_12"]) console.log(`${main.includes(id) ? "○" : "×"} ${id}`);
console.log(`/jitsurei?case= リンク: ${dom.querySelectorAll('.column-body a[href^="/jitsurei?case="]').map((a) => a.getAttribute("href")).join(", ") || "(なし)"}`);
console.log(`h2: ${dom.querySelectorAll(".column-body h2").map((h) => h.textContent).filter((t) => t.includes("記載要領") || t.includes("分類")).join(" / ")}`);
console.log(`h3 C: ${dom.querySelectorAll(".column-body h3").filter((h) => h.textContent.startsWith("C:")).length} 本`);
