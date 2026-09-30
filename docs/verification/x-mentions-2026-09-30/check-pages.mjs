// 7 記事の描画後の <article> に、調査元の表記が残っていないか(広い grep と同じ条件、直前が英字の X は除外)。h2 の改題と FAQ 数も。
//   node docs/verification/x-mentions-2026-09-30/check-pages.mjs http://localhost:3210
import { parse } from "node-html-parser";
const origin = process.argv[2] ?? "http://localhost:3210";
const re = /(?<![A-Za-z])X(を|の|に|で|には|上|では)|投稿|表示され|万回|収集|リポスト|いいね|99%/g;
for (const slug of ["kousei-3kyu-hataraku", "koushin-hatarakinagara", "muryou-soudan-psw", "sagyousho-hajimeru-tsutaeru", "sagyousho-kayoenai", "shindansho-shurojokyo", "zaitaku-freelance-nenkin"]) {
  const dom = parse(await (await fetch(`${origin}/columns/${slug}`)).text());
  const text = dom.querySelector("article").textContent.replace(/\s+/g, " ");
  const hits = [...text.matchAll(re)].map((m) => text.slice(Math.max(0, m.index - 15), m.index + 20));
  const h2 = dom.querySelectorAll("article h2").map((h) => h.textContent).find((t) => /よくある\d+つ$/.test(t));
  console.log(`${hits.length === 0 ? "○" : "×"} ${slug}: 残り ${hits.length}${hits.length ? " → " + hits.join(" | ") : ""} / FAQ ${dom.querySelectorAll(".column-faq-question").length} / h2 「${h2 ?? "(改題なし)"}」`);
}
