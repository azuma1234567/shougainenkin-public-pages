// docs/gokai/gokai-cards-addon-2026-09-02.json の3ブロック(check / ask / figure)を
// data/gokai.ts の各カードに追記する。import-gokai.mjs で本文を再生成したあとに実行する。
//
//   node scripts/import-gokai.mjs && node scripts/merge-gokai-addon.mjs
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const addonPath = process.argv[2] ?? path.resolve("docs/gokai/gokai-cards-addon-2026-09-02.json");
const outputPath = path.resolve("data/gokai.ts");

const { GOKAI, GOKAI_CATEGORIES, GOKAI_UPDATED } = await import(outputPath);
const addon = JSON.parse(await readFile(addonPath, "utf8")).cards;

const merged = GOKAI.map(({ check: _c, ask: _a, figure: _f, ...card }) => {
  const extra = addon[card.slug];
  if (!extra) throw new Error(`${card.slug}: addon に無い`);
  if (!Array.isArray(extra.check) || extra.check.length !== 3) throw new Error(`${card.slug}: check は3項目`);
  if (typeof extra.ask !== "string" || !extra.ask) throw new Error(`${card.slug}: ask が無い`);
  return { ...card, check: extra.check, ask: extra.ask, ...(extra.figure ? { figure: extra.figure } : {}) };
});
const unknown = Object.keys(addon).filter((slug) => !GOKAI.find((card) => card.slug === slug));
if (unknown.length) throw new Error(`addon にあるが本文に無い: ${unknown.join(", ")}`);

const output = `// docs/gokai-cards-batch1〜4-2026-09-02.md から生成(scripts/import-gokai.mjs)。\n` +
`// check / ask / figure は docs/gokai/gokai-cards-addon-2026-09-02.json から scripts/merge-gokai-addon.mjs で追記。\n` +
`// 本文を直接編集しないこと。\n` +
`export const GOKAI_CATEGORIES = ${JSON.stringify(GOKAI_CATEGORIES, null, 2)} as const;\n\n` +
`export const GOKAI_UPDATED = ${JSON.stringify(GOKAI_UPDATED ?? "2026-09-02")};\n\n` +
`export type GokaiCategory = (typeof GOKAI_CATEGORIES)[number];\n` +
`export type GokaiLink = { label: string; href: string };\n` +
`export type GokaiCard = { slug: string; misconception: string; truth: string; why: string; when: string; next: GokaiLink[]; sources: string[]; hubs: string[]; category: GokaiCategory; check: string[]; ask: string; figure?: string };\n\n` +
`export const GOKAI: GokaiCard[] = ${JSON.stringify(merged, null, 2)};\n`;

await writeFile(outputPath, output);
console.log(`Merged addon into ${merged.length} cards → ${outputPath}`);
