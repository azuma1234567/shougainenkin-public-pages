// SEO・AIO 2026-09-23 §3: 差し替えた14本の description の数字が本文(lead・本文・FAQ)にもあるか。
// 照合は scripts/verify-hub-content.mjs の metaTitle・metaDescription と同じ規則(数字＋単位、(?<![\d,.]))。
//   node --import ./scripts/lib/ts-alias.mjs docs/verification/seo-aio-2026-09-23/check-column-description-numbers.mjs
import { readFileSync } from "node:fs";
import { parseColumns } from "../../../scripts/import-columns.mjs";
const doc = readFileSync("docs/seo-aio-2026-09-23-instructions.md", "utf8");
const section = doc.slice(doc.indexOf("## §3"), doc.indexOf("### 検証3"));
const rows = [...section.matchAll(/^\| ([a-z0-9-]+) \| (.+) \|$/gm)].filter((m) => m[1] !== "slug").map((m) => [m[1], m[2]]);
const articles = parseColumns();
const plain = (t) => t.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").replace(/\*\*(.+?)\*\*/g, "$1");
const UNIT = /^(?:か所|か月|項目|段階|デシベル|[級つ年歳号件回日割%万円人])/;
const escape = (t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
for (const [slug, text] of rows) {
  const a = Object.values(articles).find((x) => x.slug === slug);
  const body = plain([...a.lead, a.content, ...a.faqs.flatMap((f) => [f.question, f.answer])].join("\n"));
  const tokens = [...text.matchAll(/\d+(?:[,.]\d+)*/g)].map((m) => m[0] + (UNIT.exec(text.slice(m.index + m[0].length))?.[0] ?? ""));
  const res = tokens.map((t) => `${t}${new RegExp(`(?<![\\d,.])${escape(t)}`).test(body) ? "○" : "×"}`);
  console.log(`${slug}\t${res.join(" ") || "(数字なし)"}`);
}
