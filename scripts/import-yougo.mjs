import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

const sourcePath = process.argv[2] ?? path.resolve("../shougainenkin/docs/yougo-jiten-2026-09-02.md");
const outputPath = path.resolve("data/yougo.ts");
const source = (await readFile(sourcePath, "utf8")).split(/^## 実装メモ/m)[0];

const categoryByLetter = {
  A: "初診日まわり",
  B: "書類",
  C: "審査",
  D: "お金・要件",
  E: "受給後",
};

const sections = [...source.matchAll(/^## ([A-E])\.[^\n]*\n([\s\S]*?)(?=^## [A-E]\. |(?![\s\S]))/gm)];
const items = [];

for (const section of sections) {
  const category = categoryByLetter[section[1]];
  const entries = [...section[2].matchAll(/^### \/yougo\/([a-z0-9-]+) ([^\n(]+?)(?:\(([^\n)]+)\))?\n([\s\S]*?)(?=^### |(?![\s\S]))/gm)];
  for (const entry of entries) {
    const [, slug, rawTerm, rawYomi = "", block] = entry;
    const lines = block.trim().split("\n").filter(Boolean);
    const paraphrase = lines.shift()?.match(/^\*\*(.+)\*\*$/)?.[1];
    const relatedLine = lines.find((line) => line.startsWith("関連: "));
    const noteLine = lines.find((line) => /^(注意|例外): /.test(line));
    const body = lines.filter((line) => line !== relatedLine && line !== noteLine).join("\n");
    const relatedMatch = relatedLine?.match(/^関連: (.+)\((\/[^)]+)\)$/);
    if (!paraphrase || !relatedMatch) throw new Error(`Parse failed: ${slug}`);
    items.push({
      slug,
      term: rawTerm.trim(),
      yomi: rawYomi.trim(),
      paraphrase,
      body,
      note: noteLine ?? "",
      category,
      related: [{ label: relatedMatch[1], href: relatedMatch[2] }],
    });
  }
}

if (items.length !== 40) throw new Error(`Expected 40 entries, found ${items.length}`);

const output = `// docs/yougo-jiten-2026-09-02.md から生成。本文を直接編集しないこと。\n` +
`export const YOUGO_CATEGORIES = ${JSON.stringify(Object.values(categoryByLetter), null, 2)} as const;\n\n` +
`export type YougoCategory = (typeof YOUGO_CATEGORIES)[number];\n` +
`export type YougoRelated = { label: string; href: string };\n` +
`export type YougoEntry = { slug: string; term: string; yomi: string; paraphrase: string; body: string; note: string; category: YougoCategory; related: YougoRelated[] };\n\n` +
`export const YOUGO: YougoEntry[] = ${JSON.stringify(items, null, 2)};\n`;

await mkdir(path.dirname(outputPath), { recursive: true });
await writeFile(outputPath, output);
console.log(`Wrote ${items.length} entries to ${outputPath}`);
