import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();
const slugs = ["irai-subeki-case", "hiyou-souba", "erabikata", "fushikyu-no-ato"];
const data = Object.fromEntries(slugs.map((slug) => [slug, JSON.parse(readFileSync(resolve(root, `data/hubs/erabu-${slug}.json`), "utf8"))]));

assert.equal(slugs.length + 1, 5, "/erabu は既存1本と追加4本");
for (const slug of slugs) {
  const item = data[slug];
  assert.doesNotMatch(item.source, /執筆メモ|codex向け|X等への言及/, `${slug}: 非公開メモを除外`);
  const internalLinks = [...item.source.matchAll(/→[^\n]*\((\/[^)]+)\)/g)];
  assert.equal(internalLinks.length, 1, `${slug}: 外向き内部リンクは1本`);
  const nextStep = item.source.indexOf("## 次の一歩");
  assert.ok(nextStep >= 0 && internalLinks[0].index > nextStep, `${slug}: 内部リンクは「次の一歩」内`);
}

assert.doesNotMatch(data["hiyou-souba"].source, /[1-9][0-9０-９,，]*\s*(?:万円|円)/, "費用ページに正の具体額を置かない");
assert.doesNotMatch(data.erabikata.source, /\/senmonka/, "選び方ページから掲載ページへ誘導しない");
assert.doesNotMatch(data["fushikyu-no-ato"].source, /\[?結論が変わった実例を見る\]?\(\/jitsurei\)/, "実例案内は非リンク");

const css = readFileSync(resolve(root, "app/platform.css"), "utf8");
assert.match(css, /\.hub-erabu \.article-table-figure\.is-wide td[^}]+grid-template-columns/s, "意思決定表はモバイルで縦積み");

console.log("Verified 4 decision pages: 5 total, one next-step link each, neutral costs/selection, mobile stacked tables.");
