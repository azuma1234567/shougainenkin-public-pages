import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

// docs/gokai-cards-batch1〜4-2026-09-02.md の48枚を data/gokai.ts に変換する。
// 「## 執筆メモ」「## 第N弾候補」「## ハブ別配分」はカード見出しにも出典にも一致しないため、
// 変換結果には入らない。

const docsDir = process.argv[2] ?? path.resolve("../shougainenkin/docs");
const outputPath = path.resolve("data/gokai.ts");
const batches = [1, 2, 3, 4].map((n) => `gokai-cards-batch${n}-2026-09-02.md`);

export const GOKAI_CATEGORIES = ["制度の入口", "お金", "手続き", "受給後", "気持ち"];

// 原稿はカテゴリを指定していないため、48枚を5カテゴリに割り当てる。
// 「もらえる/もらえないの誤解」=制度の入口、金額・加算・税・給付=お金、
// 書類と初診日の進め方=手続き、決まったあとの話=受給後、ためらいの感情=気持ち。
const CATEGORY_BY_NUMBER = {
  制度の入口: [1, 2, 3, 4, 6, 7, 13, 14, 17, 19, 22, 23, 25, 31, 46, 48],
  お金: [5, 20, 34, 35, 41, 42, 43, 45, 47],
  手続き: [8, 9, 11, 12, 16, 26, 27, 28, 29, 30, 37, 38, 40],
  受給後: [10, 18, 32, 33, 36, 44],
  気持ち: [15, 21, 24, 39],
};

// 原稿の対応ハブ欄の表記をハブのURLに合わせる。
const HUB_ALIASES = { "/shinsei step3": "/shinsei" };

function parseLinks(line) {
  return line
    .replace(/^→\s*/, "")
    .split(" / ")
    .map((item) => {
      const match = item.trim().replace(/^→\s*/, "").match(/^(.+)\((\/[^)]+)\)$/);
      if (!match) throw new Error(`次に読む の解析に失敗: ${item}`);
      return { label: match[1].trim(), href: match[2] };
    });
}

const cards = new Map();
const sourcesByNumber = new Map();

for (const file of batches) {
  const text = await readFile(path.join(docsDir, file), "utf8");

  const headings = [...text.matchAll(/^## (\d+)\. \/gokai\/([a-z0-9-]+) — 「(.+)」$/gm)];
  for (const [index, heading] of headings.entries()) {
    const start = heading.index + heading[0].length;
    const end = index + 1 < headings.length ? headings[index + 1].index : text.length;
    const block = text.slice(start, end).split(/^## /m)[0];
    const field = (name) => block.match(new RegExp(`^\\*\\*${name}\\*\\*: (.+)$`, "m"))?.[1]?.trim();
    const number = Number(heading[1]);
    const hubsLine = block.match(/^対応ハブ: (.+)$/m)?.[1];
    const truth = field("本当は");
    const why = field("なぜ");
    const when = field("こんなときに多い");
    const next = field("次に読む");
    if (!truth || !why || !when || !next || !hubsLine) throw new Error(`カード${number}の解析に失敗`);
    cards.set(number, {
      number,
      slug: heading[2],
      misconception: `「${heading[3]}」`,
      truth,
      why,
      when,
      next: parseLinks(next),
      sources: [],
      hubs: hubsLine.split("、").map((hub) => HUB_ALIASES[hub.trim()] ?? hub.trim()),
    });
  }

  const sourceBlock = text.match(/^## 出典[^\n]*\n([\s\S]*?)(?=^## |(?![\s\S]))/m)?.[1] ?? "";
  for (const line of sourceBlock.split("\n")) {
    const match = line.match(/^- (.+)\(([\d・]+)\)\s*$/);
    if (!match) continue;
    for (const number of match[2].split("・").map(Number)) {
      sourcesByNumber.set(number, [...(sourcesByNumber.get(number) ?? []), match[1].trim()]);
    }
  }
}

const items = [];
for (let number = 1; number <= 48; number += 1) {
  const card = cards.get(number);
  if (!card) throw new Error(`カード${number}が見つからない`);
  const category = GOKAI_CATEGORIES.find((name) => CATEGORY_BY_NUMBER[name].includes(number));
  const sources = sourcesByNumber.get(number) ?? [];
  if (!category) throw new Error(`カード${number}のカテゴリが未設定`);
  if (sources.length === 0) throw new Error(`カード${number}の出典が見つからない`);
  const { number: _number, ...rest } = card;
  items.push({ ...rest, sources, category, check: [], ask: "" });
}

if (items.length !== 48) throw new Error(`Expected 48 cards, found ${items.length}`);

// check / ask / figure は scripts/merge-gokai-addon.mjs で追記する。ここでは空で出す。
const output = `// docs/gokai-cards-batch1〜4-2026-09-02.md から生成(scripts/import-gokai.mjs)。\n` +
`// check / ask / figure は docs/gokai/gokai-cards-addon-2026-09-02.json から scripts/merge-gokai-addon.mjs で追記。\n` +
`// 本文を直接編集しないこと。\n` +
`export const GOKAI_CATEGORIES = ${JSON.stringify(GOKAI_CATEGORIES, null, 2)} as const;\n\n` +
`export const GOKAI_UPDATED = "2026-09-02";\n\n` +
`export type GokaiCategory = (typeof GOKAI_CATEGORIES)[number];\n` +
`export type GokaiLink = { label: string; href: string };\n` +
`export type GokaiCard = { slug: string; misconception: string; truth: string; why: string; when: string; next: GokaiLink[]; sources: string[]; hubs: string[]; category: GokaiCategory; check: string[]; ask: string; figure?: string };\n\n` +
`export const GOKAI: GokaiCard[] = ${JSON.stringify(items, null, 2)};\n`;

await mkdir(path.dirname(outputPath), { recursive: true });
await writeFile(outputPath, output);
console.log(`Wrote ${items.length} cards to ${outputPath}`);
