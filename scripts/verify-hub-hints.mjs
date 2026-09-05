#!/usr/bin/env node
/* 一覧ページ(/byoki /joukyou)のカードの「一言」を、指示書の表と突き合わせる。
 * docs/hub-index-sasshin-2026-09-05-instructions.md §3。
 *
 *   node scripts/verify-hub-hints.mjs
 *
 * 見るのは3つ:
 *   1. 指示書の30件と lib/hub-index.tsx の HUB_HINTS が1文字も違わないこと。
 *   2. 別名(絞り込み用)10件も同じであること。
 *   3. どの一言も「不支給・対象外・却下・打ち切り・無理・通らない」で始まっていないこと
 *      (読む人が最初に見る1文は、当てはまる側から書く)。
 */
import { readFileSync } from "node:fs";

const DOC = "docs/hub-index-sasshin-2026-09-05-instructions.md";
const SRC = "lib/hub-index.tsx";
/* 一言の先頭に置かない語。 */
const BANNED_HEAD = ["不支給", "対象外", "却下", "打ち切り", "無理", "通らない"];

/* ---------- 指示書の表を読む ---------- */
const doc = readFileSync(DOC, "utf8");
const section = doc.slice(doc.indexOf("## §3"), doc.indexOf("## §4"));
const aliasAt = section.indexOf("### 絞り込みの別名");
const rows = (text) => [...text.matchAll(/^\s*\|\s*(\/[0-9a-z\-/]+)\s*\|\s*(.+?)\s*\|\s*$/gm)]
  .map((m) => [m[1], m[2]]);
const docHints = new Map(rows(section.slice(0, aliasAt)));
const docAliases = new Map(rows(section.slice(aliasAt)).map(([p, v]) => [p, v.split(",").map((s) => s.trim())]));

/* ---------- 実装を読む ---------- */
const src = readFileSync(SRC, "utf8");
const block = (name) => {
  const start = src.indexOf(name);
  return src.slice(start, src.indexOf("\n};", start));
};
const srcHints = new Map([...block("export const HUB_HINTS").matchAll(/"(\/[^"]+)":\s*"([^"]*)"/g)]
  .map((m) => [m[1], m[2]]));
const srcAliases = new Map([...block("export const HUB_ALIASES").matchAll(/"(\/[^"]+)":\s*\[([^\]]*)\]/g)]
  .map((m) => [m[1], [...m[2].matchAll(/"([^"]*)"/g)].map((x) => x[1])]));

/* ---------- 突き合わせ ---------- */
const problems = [];

const compare = (label, expected, actual, eq) => {
  for (const [path, want] of expected) {
    if (!actual.has(path)) { problems.push(`${label}: ${path} が実装に無い`); continue; }
    if (!eq(want, actual.get(path))) {
      problems.push(`${label}: ${path} が指示書と違う\n    指示書: ${want}\n    実装  : ${actual.get(path)}`);
    }
  }
  for (const path of actual.keys()) {
    if (!expected.has(path)) problems.push(`${label}: ${path} は指示書に無い`);
  }
};

compare("一言", docHints, srcHints, (a, b) => a === b);
compare("別名", docAliases, srcAliases, (a, b) => a.join(",") === b.join(","));

const badHead = [...srcHints].filter(([, text]) => BANNED_HEAD.some((word) => text.startsWith(word)));
for (const [path, text] of badHead) problems.push(`一言の先頭: ${path} が「${text.slice(0, 8)}…」で始まっている`);

/* ---------- 出力 ---------- */
console.log(`指示書の一言 ${docHints.size}件 / 実装 ${srcHints.size}件`);
console.log(`指示書の別名 ${docAliases.size}件 / 実装 ${srcAliases.size}件`);
console.log(`先頭に ${BANNED_HEAD.join("・")} を置いたもの: ${badHead.length}件`);
if (problems.length === 0) {
  console.log("○ すべて一致。");
} else {
  console.log(`× ${problems.length}件`);
  for (const p of problems) console.log(`  - ${p}`);
  process.exitCode = 1;
}
