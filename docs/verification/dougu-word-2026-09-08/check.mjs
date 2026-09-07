// 全ページ(sitemap の URL + /llms.txt)の描画後テキストにある「道具」を数える(script の中身・属性は除く)。
//   node docs/verification/dougu-word-2026-09-08/check.mjs http://127.0.0.1:3000
import { parse } from "node-html-parser";
import { writeFileSync } from "node:fs";
const origin = process.argv[2] ?? "http://127.0.0.1:3000";
const sm = await (await fetch(`${origin}/sitemap.xml`)).text();
const urls = [...sm.matchAll(/<loc>https:\/\/shougainenkin-note\.net([^<]*)<\/loc>/g)].map((m) => m[1] || "/");
const textOf = (root) => { const acc = []; const walk = (n) => { for (const c of n.childNodes) { if (c.nodeType === 3) acc.push(c.rawText); else if (!["script", "style"].includes(String(c.rawTagName ?? "").toLowerCase())) walk(c); } }; walk(root); return acc.join("\n"); };
const rows = []; let total = 0;
for (const u of urls) {
  const html = await (await fetch(`${origin}${u}`)).text();
  const root = parse(html.replaceAll("<!-- -->", ""));
  const body = textOf(root.querySelector("body") ?? root);
  const n = (body.match(/道具/g) ?? []).length; total += n;
  if (n) rows.push(`${u}: ${n} ${[...body.matchAll(/.{0,18}道具.{0,18}/g)].slice(0, 3).map((m) => m[0].replace(/\s+/g, " ")).join(" | ")}`);
}
const llms = await (await fetch(`${origin}/llms.txt`)).text(); const ln = (llms.match(/道具/g) ?? []).length;
const out = [`sitemap の URL ${urls.length} 件 + /llms.txt を確認`, `描画後テキストの「道具」合計: ${total}(ページ ${rows.length} 件) / llms.txt: ${ln}`, ...rows, `対象4ページ: ${["/about", "/quality", "/support"].map((p) => `${p}=${rows.find((r) => r.startsWith(p + ":")) ? "残りあり" : 0}`).join(" ")} /llms.txt=${ln}`];
console.log(out.join("\n")); writeFileSync("docs/verification/dougu-word-2026-09-08/checks.txt", out.join("\n") + "\n");
