import assert from "node:assert/strict";
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
await import("./lib/ts-alias.mjs");
const { COLUMNS } = await import("../lib/columns.ts");
const { apply2026Amounts } = await import("../data/amounts.ts");

const directory = new URL("../docs/columns-rewrite-2026-09-03/articles/", import.meta.url);
export const plain = value => value.replace(/\*\*(.*?)\*\*/g, "$1").replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
export function parseColumns() {
  const articles = {};
  for (const file of readdirSync(directory).filter(file => file.endsWith(".md")).sort()) {
    const input = readFileSync(new URL(file, directory), "utf8").replace(/\r\n/g, "\n");
    const match = input.match(/^---\nslug: ([^\n]+)\ndateModified: ([^\n]+)\nlead:\n((?:  - [^\n]+\n)+)---\n([\s\S]+)$/);
    assert.ok(match, `${file}: frontmatter`);
    const [, slug, dateModified, leadLines, raw] = match;
    assert.equal(file, `${slug}.md`);
    assert.ok(!articles[slug]);
    const lead = leadLines.trimEnd().split("\n").map(line => line.slice(4));
    assert.ok(lead.length >= 3 && lead.length <= 5, `${slug}: leadは3〜5項目`);
    const rawContent = raw.replace(/<!--\s*変更[\s\S]*?-->/g, "").trim();
    assert.ok(!rawContent.includes("<!--"), `${slug}: 未対応コメント`);
    const amounts = ["hatachi-mae", "ikura-moraeru"].includes(slug);
    const content = amounts ? apply2026Amounts(rawContent) : rawContent;
    const section = content.match(/^## [^\n]*よくある質問[^\n]*\n([\s\S]*?)(?=^## |$(?![\s\S]))/m)?.[1];
    assert.ok(section, `${slug}: FAQ節なし`);
    const faqs = [...section.matchAll(/^\*\*Q[.．]\s*(.+?)\*\*\s*\n([\s\S]*?)(?=^\*\*Q[.．]|$(?![\s\S]))/gm)].map(m => ({ question: plain(m[1]), answer: plain(m[2].trim().replace(/^A[.．]\s*/, "").replace(/\n+/g, " ")) }));
    assert.ok(faqs.length && faqs.every(faq => faq.answer), `${slug}: FAQ抽出`);
    articles[slug] = { slug, dateModified, lead, rawContent, content, faqs, amounts };
  }
  assert.deepEqual(Object.keys(articles).sort(), COLUMNS.map(c => c.slug).sort());
  assert.equal(Object.keys(articles).length, 47);
  return articles;
}
export function generatedColumn(article) {
  return `// scripts/import-columns.mjs で生成。直接編集しない。\n${article.amounts ? 'import { apply2026Amounts } from "@/data/amounts";\n' : ''}\nexport const lead = ${JSON.stringify(article.lead, null, 2)};\nexport const dateModified = ${JSON.stringify(article.dateModified)};\nexport const faqs = ${JSON.stringify(article.faqs, null, 2)};\n\n${article.amounts ? 'const rawContent' : 'const content'} = ${JSON.stringify(article.rawContent)};\n${article.amounts ? '\nconst content = apply2026Amounts(rawContent);\n' : ''}\nexport default content;\n`;
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  for (const article of Object.values(parseColumns())) {
    const output = generatedColumn(article);
    const target = new URL(`../content/columns/${article.slug}.ts`, import.meta.url);
    if (process.argv.includes("--check")) assert.equal(readFileSync(target, "utf8"), output, `${article.slug}: 再現性`);
    else writeFileSync(target, output);
  }
  console.log("コラム47本: lead・本文・FAQ生成 / 変更コメント除去 OK");
}
