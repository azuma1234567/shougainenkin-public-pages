import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const sourceRoot = process.env.HUB_SOURCE_ROOT ?? resolve(process.cwd(), "../shougainenkin/docs");
const files = [
  ["byoki-tougou", "/byoki/tougou"], ["byoki-chiteki", "/byoki/chiteki"], ["byoki-tenkan", "/byoki/tenkan"],
  ["byoki-jinzou-touseki", "/byoki/jinzou-touseki"], ["byoki-gan", "/byoki/gan"], ["byoki-shinzou", "/byoki/shinzou"],
  ["byoki-tounyou", "/byoki/tounyou"],
  ["byoki-hattatsu", "/byoki/hattatsu"], ["byoki-tekiou-fuan", "/byoki/tekiou-fuan"],
  ["erabu-jibun-ka-irai", "/erabu/jibun-ka-irai"], ["joukyou-hatachi-mae", "/joukyou/hatachi-mae"],
  ["joukyou-hatarakinagara", "/joukyou/hatarakinagara"], ["joukyou-hitorigurashi", "/joukyou/hitorigurashi"],
  ["joukyou-shoubyou-teatekin-kara", "/joukyou/shoubyou-teatekin-kara"], ["nayami-koushin", "/nayami/koushin"],
  ["nayami-shikyuu-teishi", "/nayami/shikyuu-teishi"], ["nayami-shindansho-komatta", "/nayami/shindansho-komatta"],
  ["nayami-shoshinbi-karute", "/nayami/shoshinbi-karute"], ["nayami-sokyuu", "/nayami/sokyuu"],
  ["okane-ikura", "/okane/ikura"],
];

const result = {};
mkdirSync(resolve(process.cwd(), "data/hubs"), { recursive: true });
for (const [name, path] of files) {
  const raw = readFileSync(resolve(sourceRoot, `hub-${name}-2026-09-02.md`), "utf8").replace(/\r\n/g, "\n");
  const h1s = [...raw.matchAll(/^# .+$/gm)];
  if (h1s.length < 2) throw new Error(`${name}: 公開用H1がありません`);
  const start = h1s[1].index;
  const memo = raw.indexOf("\n## 執筆メモ", start);
  if (memo < 0) throw new Error(`${name}: 執筆メモ境界がありません`);
  const publicText = raw.slice(start, memo).trim();
  const lines = publicText.split("\n");
  const title = lines.shift().replace(/^# /, "");
  const breadcrumbLine = lines.findIndex((line) => line.startsWith("パンくず:"));
  const breadcrumb = lines[breadcrumbLine].replace(/^パンくず:\s*/, "").split(" > ");
  lines.splice(breadcrumbLine, 1);
  result[path] = { title, breadcrumb, source: lines.join("\n").trim() };
  writeFileSync(resolve(process.cwd(), `data/hubs/${name}.json`), `${JSON.stringify(result[path], null, 2)}\n`);
}

console.log(`Imported ${Object.keys(result).length} hub manuscripts.`);
