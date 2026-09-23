// SEO・AIO 2026-09-23 §2 の確認: 49 本のハブの HTML から meta description・og:description・Article.description を取り、
// 3つが同じ文か、字数、Markdown 記号の有無を出す。
//   node --import ./scripts/lib/ts-alias.mjs docs/verification/seo-aio-2026-09-23/check-hub-descriptions.mjs http://localhost:3210
import { parse } from "node-html-parser";
const origin = process.argv[2] ?? "http://localhost:3210";
const { HUB_CONTENT } = await import("../../../lib/hub-content.ts");
const rows = [];
for (const path of Object.keys(HUB_CONTENT)) {
  const dom = parse(await (await fetch(`${origin}${path}`)).text());
  const meta = dom.querySelector('meta[name="description"]')?.getAttribute("content");
  const og = dom.querySelector('meta[property="og:description"]')?.getAttribute("content");
  const graph = dom.querySelectorAll('script[type="application/ld+json"]').flatMap((el) => JSON.parse(el.textContent)["@graph"] ?? []);
  const article = graph.find((item) => item["@type"] === "Article")?.description;
  rows.push({ path, length: [...(meta ?? "")].length, same: meta === og && meta === article, markdown: /[*`]|\[|\]\(/.test(meta ?? ""), meta });
}
rows.sort((a, b) => a.length - b.length);
for (const r of rows) console.log(`${r.path}\t${r.length}字\t3つ一致 ${r.same ? "○" : "×"}\tMarkdown ${r.markdown ? "×" : "なし"}\t${r.meta}`);
const lengths = rows.map((r) => r.length);
console.log(`\n${rows.length} 本: 最短 ${Math.min(...lengths)} 字・最長 ${Math.max(...lengths)} 字、3つ一致 ${rows.filter((r) => r.same).length}、Markdown 記号の残り ${rows.filter((r) => r.markdown).length}`);
