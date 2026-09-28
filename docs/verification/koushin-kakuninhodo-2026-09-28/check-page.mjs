// koushin: 検証2(数字)・検証3(禁止語・FAQ)・裁決リンク。shoshinbi: 16 件の /jitsurei?case= リンクと、そのページが 200 を返すか。
//   node docs/verification/koushin-kakuninhodo-2026-09-28/check-page.mjs http://localhost:3210
import { parse } from "node-html-parser";
import { readFileSync } from "node:fs";
const origin = process.argv[2] ?? "http://localhost:3210";
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
{
  const dom = parse(await (await fetch(`${origin}/columns/koushin-kakuninhodo`)).text());
  const main = dom.querySelector("main").textContent.replace(/\s+/g, " ");
  console.log("## koushin-kakuninhodo"); console.log(`title: ${dom.querySelector("title").textContent}`);
  for (const x of ["96.8%", "1.4%", "0.8%", "1.0%", "1.1%", "10,000件", "105件", "11件", "9件", "2件", "平成28年", "3か月"]) { const c = (main.match(new RegExp(`(?<![\\d,.])${esc(x)}`, "g")) ?? []).length; console.log(`${c > 0 ? "○" : "×"} ${x}: ${c} 回`); }
  const md = readFileSync("docs/columns-rewrite-2026-09-03/articles/koushin-kakuninhodo.md", "utf8");
  for (const w of ["道具", "個人で運営", "紹介料", "X", "体験記", "動画", "知恵袋", "r02_03-05_04"]) console.log(`${md.includes(w) || main.includes(w) ? "×" : "○"} 「${w}」: 正本 ${md.split(w).length - 1} / 本文 ${main.split(w).length - 1}`);
  console.log(`FAQ(画面): ${dom.querySelectorAll(".column-faq-question").length} 件`);
  console.log(`裁決の PDF リンク(.gokai-case): ${dom.querySelectorAll(".column-body .gokai-case a").length} 本`);
  for (const id of ["r06-03_05", "r07-03_05", "h28_29-16_01", "r07-03_04"]) console.log(`${main.includes(id) ? "○" : "×"} ${id}`);
  console.log(`FAQ の r07-03_04 リンク: ${dom.querySelectorAll('.column-body a[href="/jitsurei?case=r07-03_04"]').length} 本`);
}
{
  const dom = parse(await (await fetch(`${origin}/columns/shoshinbi-wakaranai`)).text());
  const links = dom.querySelectorAll('.column-body a[href^="/jitsurei?case="]').map((a) => a.getAttribute("href"));
  console.log(`\n## shoshinbi-wakaranai: /jitsurei?case= リンク ${links.length} 本(異なる id ${new Set(links).size})`);
  let ok = 0;
  for (const h of [...new Set(links)]) { const r = await fetch(`${origin}${h}`); if (r.status === 200) ok += 1; else console.log(`× ${h}: ${r.status}`); }
  console.log(`リンク先 200: ${ok} / ${new Set(links).size}`);
  console.log(`裁決の PDF リンク(.gokai-case): ${dom.querySelectorAll(".column-body .gokai-case a").length} 本`);
}
