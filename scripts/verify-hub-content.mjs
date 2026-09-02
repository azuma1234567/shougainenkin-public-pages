import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();
const sourceRoot = resolve(root, "../shougainenkin/docs");
const names = ["byoki-tougou", "byoki-chiteki", "byoki-tenkan", "byoki-jinzou-touseki", "byoki-gan", "byoki-shinzou", "byoki-tounyou", "byoki-hattatsu", "byoki-tekiou-fuan", "erabu-jibun-ka-irai", "joukyou-hatachi-mae", "joukyou-hatarakinagara", "joukyou-hitorigurashi", "joukyou-shoubyou-teatekin-kara", "nayami-koushin", "nayami-shikyuu-teishi", "nayami-shindansho-komatta", "nayami-shoshinbi-karute", "nayami-sokyuu", "okane-ikura"];
const content = Object.fromEntries(names.map((name) => [`/${name.replace("-", "/")}`, JSON.parse(readFileSync(resolve(root, `data/hubs/${name}.json`), "utf8"))]));
const reserved = ["/suuji", "/gokai", "/okane/zeikin", "/okane/chousei", "/erabu/irai-subeki-case", "/erabu/hiyou-souba", "/erabu/erabikata", "/erabu/fushikyu-no-ato", "/senmonka"];
const failures = [];
for (const [path, item] of Object.entries(content)) {
  const counts = (text) => ({ h2: (text.match(/^## /gm) ?? []).length, h3: (text.match(/^### /gm) ?? []).length, faq: (text.match(/^\*\*Q[.．]/gm) ?? []).length });
  const name = path.slice(1).replaceAll("/", "-");
  const raw = readFileSync(resolve(sourceRoot, `hub-${name}-2026-09-02.md`), "utf8");
  const h1s = [...raw.matchAll(/^# .+$/gm)];
  const start = h1s[1].index;
  const memo = raw.indexOf("\n## 執筆メモ", start);
  const publicText = raw.slice(start, memo).trim().split("\n");
  publicText.shift();
  const breadcrumb = publicText.findIndex((line) => line.startsWith("パンくず:"));
  publicText.splice(breadcrumb, 1);
  const expected = publicText.join("\n").trim();
  if (item.source !== expected) failures.push(`${path}: 本文不一致`);
  if (JSON.stringify(counts(item.source)) !== JSON.stringify(counts(expected))) failures.push(`${path}: 見出し/FAQ数不一致`);
  for (const forbidden of ["執筆メモ", "x.com", "@", "いいね"]) if (item.source.includes(forbidden)) failures.push(`${path}: ${forbidden}`);
  for (const target of reserved) if (new RegExp(`\\[[^\\]]+\\]\\(${target.replaceAll("/", "\\/")}\\)`).test(item.source)) failures.push(`${path}: 予約URLがリンク`);
}
if (Object.keys(content).length !== 20) failures.push("本文ページ数が20ではありません");
if (failures.length) { console.error(failures.join("\n")); process.exit(1); }
console.log(`OK: 本文20ページ。本文一致、見出し/FAQ一致、非公開語0、予約URLリンク0。`);
