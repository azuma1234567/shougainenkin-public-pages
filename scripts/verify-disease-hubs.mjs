import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();
const origin = process.argv[2] ?? "http://localhost:3100";
const hubs = [
  ["tougou", "統合失調症", "統合失調症"],
  ["chiteki", "知的障害", "知的障害"],
  ["tenkan", "てんかん", null],
  ["jinzou-touseki", "腎", "腎"],
  ["gan", "がん", null],
  ["shinzou", "心疾患", null],
  ["tounyou", "糖尿病", "糖尿病"],
  ["shitai", "肢体", null],
];
const cases = JSON.parse(readFileSync(resolve(root, "data/saiketsu-cases-2026-08-26.json"), "utf8")).cases
  .filter((item) => item.verified && !item.excluded);
const failures = [];
const counts = {};

for (const [slug, query, expectedLink] of hubs) {
  const item = JSON.parse(readFileSync(resolve(root, `data/hubs/byoki-${slug}.json`), "utf8"));
  if (slug === "chiteki" && item.title !== "知的障害と障害年金 — 20歳の誕生日の前に、家族が知っておくこと") {
    failures.push("/byoki/chiteki: H1不一致");
  }
  if (slug === "tenkan" && /実例をすべて見る|\/jitsurei\?傷病=/.test(item.source)) {
    failures.push("/byoki/tenkan: 実例リンクが存在");
  }
  const count = query ? cases.filter((entry) => entry.shobyo.includes(query)).length : 0;
  counts[query ?? "てんかん"] = count;
  const noExamples = slug === "tenkan";
  const linkPattern = expectedLink ? `(/jitsurei?傷病=${expectedLink})` : "(/jitsurei)";
  if (!noExamples && !item.source.includes(linkPattern)) failures.push(`/byoki/${slug}: 実例リンク不一致`);
  if (noExamples && item.source.includes("/jitsurei")) failures.push(`/byoki/${slug}: 実例リンクが存在`);
  if (!expectedLink && !noExamples && item.source.includes("/jitsurei?傷病=")) failures.push(`/byoki/${slug}: 0件フィルタが残存`);
  if (expectedLink && count < 1) failures.push(`/byoki/${slug}: ${expectedLink}の件数が0件`);
  const response = await fetch(`${origin}/jitsurei?${encodeURIComponent("傷病")}=${encodeURIComponent(query ?? "てんかん")}`);
  if (expectedLink && response.status !== 200) failures.push(`/jitsurei?傷病=${expectedLink}: ${response.status}`);
  if (expectedLink && count > 0) {
    const html = (await response.text()).replaceAll("<!-- -->", "");
    if (!html.includes(`傷病「${query}」の実例 ・ ${count}件`)) failures.push(`/jitsurei?傷病=${query}: 件数表示不一致`);
  }
}

const landing = readFileSync(resolve(root, "components/platform/HubLanding.tsx"), "utf8");
const siblingBlock = landing.slice(landing.indexOf("const siblingLinks"), landing.indexOf("const siblingLabels"));
const expectedSiblings = [
  ["/byoki/tounyou", "/byoki/jinzou-touseki"], ["/byoki/jinzou-touseki", "/byoki/tounyou"],
  ["/byoki/shinzou", "/byoki/shitai"], ["/byoki/chiteki", "/byoki/hattatsu"], ["/byoki/hattatsu", "/byoki/chiteki"],
];
for (const [from, to] of expectedSiblings) {
  if (!siblingBlock.includes(`"${from}": ["${to}"]`)) failures.push(`兄弟リンク不足: ${from} -> ${to}`);
}
const siblingPaths = [...siblingBlock.matchAll(/"(\/byoki\/[^"]+)"/g)].map((match) => match[1]);
const allowedSiblingPaths = new Set(expectedSiblings.flat());
if (siblingPaths.some((path) => !allowedSiblingPaths.has(path))) failures.push("兄弟リンクに指定外の病名ハブあり");

if (failures.length) {
  console.error(JSON.stringify({ counts, failures }, null, 2));
  process.exit(1);
}
console.log(JSON.stringify({ counts, siblingLinks: expectedSiblings.length, failures: [] }, null, 2));
