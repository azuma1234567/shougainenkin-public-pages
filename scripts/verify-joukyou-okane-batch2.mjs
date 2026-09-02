import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();
const pages = [
  "joukyou-65sai-ijou", "joukyou-shufu-mushoku", "joukyou-gakusei",
  "joukyou-kazoku-ga-tetsudau", "joukyou-seikatsu-hogo", "okane-zeikin", "okane-chousei",
];
for (const name of pages) {
  const item = JSON.parse(readFileSync(resolve(root, `data/hubs/${name}.json`), "utf8"));
  assert.doesNotMatch(item.source, /執筆メモ|codexへの確認依頼|codex向け|x-research|@[A-Za-z0-9_]+/, `${name}: 非公開メモを除外`);
  assert.equal([...item.source.matchAll(/→[^\n]*\((\/[^)]+)\)/g)].length, 1, `${name}: 次の一歩を1本表示`);
  assert.match(item.source, /## 出典\n- /, `${name}: 出典を表示`);
}

const hubs = readFileSync(resolve(root, "lib/hubs.ts"), "utf8");
assert.equal([...hubs.matchAll(/hub\("\/joukyou\/[^"#]+"[^\n]+"joukyou", true/g)].length, 9, "状況ハブは9本");
assert.equal([...hubs.matchAll(/hub\("\/okane\/[^"#]+"[^\n]+"okane", true/g)].length, 3, "お金ハブは3本");

const home = readFileSync(resolve(root, "app/page.tsx"), "utf8");
const expectedOrder = ["hatarakinagara", "hatachi-mae", "hitorigurashi", "shoubyou-teatekin-kara", "65sai-ijou", "shufu-mushoku", "gakusei", "kazoku-ga-tetsudau", "seikatsu-hogo"];
let cursor = home.indexOf("const situations");
for (const slug of expectedOrder) {
  const next = home.indexOf(`/joukyou/${slug}`, cursor);
  assert.ok(next > cursor, `トップの状況順: ${slug}`);
  cursor = next;
}

const amounts = readFileSync(resolve(root, "data/amounts.ts"), "utf8");
assert.match(amounts, /dependentDisabledIncomeLimit: "180"/);
assert.match(amounts, /dependentGeneralIncomeLimit: "130"/);
for (const name of ["joukyou-shufu-mushoku", "okane-zeikin"]) {
  const source = readFileSync(resolve(root, `data/hubs/${name}.json`), "utf8");
  assert.match(source, /\{\{dependentDisabledIncomeLimit\}\}/, `${name}: 障害者基準はamounts参照`);
  assert.match(source, /\{\{dependentGeneralIncomeLimit\}\}/, `${name}: 一般基準はamounts参照`);
}

console.log("Verified 7 pages: 9 situation hubs, 3 money hubs, ordered top links, shared amounts, no private notes.");
