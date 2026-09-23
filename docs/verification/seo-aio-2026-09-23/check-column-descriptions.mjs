// SEO・AIO 2026-09-23 §3 の確認: 57 本のコラムの HTML から meta description・og:description を取り、
// lib/columns.ts の description と同じ文か、字数、「*」の有無を出す。
//   node --import ./scripts/lib/ts-alias.mjs docs/verification/seo-aio-2026-09-23/check-column-descriptions.mjs http://localhost:3210
import { parse } from "node-html-parser";
const origin = process.argv[2] ?? "http://localhost:3210";
const { COLUMNS } = await import("../../../lib/columns.ts");
const rows = [];
for (const column of COLUMNS) {
  const dom = parse(await (await fetch(`${origin}/columns/${column.slug}`)).text());
  const meta = dom.querySelector('meta[name="description"]')?.getAttribute("content");
  const og = dom.querySelector('meta[property="og:description"]')?.getAttribute("content");
  rows.push({ slug: column.slug, length: [...(meta ?? "")].length, same: meta === og && meta === column.description, star: (meta ?? "").includes("*"), meta });
}
rows.sort((a, b) => a.length - b.length);
for (const r of rows) console.log(`${r.slug}\t${r.length}字\tcolumns.ts・og と一致 ${r.same ? "○" : "×"}\t* ${r.star ? "×" : "なし"}\t${r.meta}`);
const lengths = rows.map((r) => r.length);
console.log(`\n${rows.length} 本: 最短 ${Math.min(...lengths)} 字・最長 ${Math.max(...lengths)} 字、一致 ${rows.filter((r) => r.same).length}、* の残り ${rows.filter((r) => r.star).length}`);
