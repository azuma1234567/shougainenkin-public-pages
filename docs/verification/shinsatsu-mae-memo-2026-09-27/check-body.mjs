// 検証2・3: /columns/shinsatsu-mae-memo の描画した本文(<main>)と正本に、指示書の数字が出ているか、禁止語が無いか。
//   node docs/verification/shinsatsu-mae-memo-2026-09-27/check-body.mjs http://localhost:3210
import { readFileSync } from "node:fs";
import { parse } from "node-html-parser";
const origin = process.argv[2] ?? "http://localhost:3210";
const dom = parse(await (await fetch(`${origin}/columns/shinsatsu-mae-memo`)).text());
const main = dom.querySelector("main").textContent.replace(/\s+/g, " ");
const md = readFileSync("docs/columns-rewrite-2026-09-03/articles/shinsatsu-mae-memo.md", "utf8");
console.log("## 検証2 数字(本文 <main> / 正本 md)");
for (const t of ["13.0%", "8.4%", "7.7", "8.0%", "85件", "64件", "11件", "12.9%", "75.3%", "1,000件", "5,000〜10,000円", "2〜3回", "週1回"]) {
  const n = main.split(t).length - 1;
  console.log(`${n > 0 ? "○" : "×"} ${t}: 本文 ${n} 回 / 正本 ${md.split(t).length - 1} 回`);
}
console.log("## 検証3 禁止語(本文 <main> / ページ全体 / 正本 md)");
const whole = dom.textContent;
for (const w of ["道具", "個人で運営", "紹介料"]) console.log(`${main.includes(w) || md.includes(w) ? "×" : "○"} ${w}: 本文 ${main.split(w).length - 1} / ページ全体 ${whole.split(w).length - 1} / 正本 ${md.split(w).length - 1}`);
