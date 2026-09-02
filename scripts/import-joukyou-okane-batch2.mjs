import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const source = resolve(process.cwd(), "../shougainenkin/docs/hub-joukyou-okane-batch2-7hon-2026-09-02.md");
const raw = readFileSync(source, "utf8").replace(/\r\n/g, "\n");
const pages = [
  ["joukyou-65sai-ijou", "/joukyou/65sai-ijou", "# 1. "],
  ["joukyou-shufu-mushoku", "/joukyou/shufu-mushoku", "# 2. "],
  ["joukyou-gakusei", "/joukyou/gakusei", "# 3. "],
  ["joukyou-kazoku-ga-tetsudau", "/joukyou/kazoku-ga-tetsudau", "# 4. "],
  ["joukyou-seikatsu-hogo", "/joukyou/seikatsu-hogo", "# 5. "],
  ["okane-zeikin", "/okane/zeikin", "# 6. "],
  ["okane-chousei", "/okane/chousei", "# 7. "],
];
const sources = {
  "/joukyou/65sai-ijou": [0, 1, 4],
  "/joukyou/shufu-mushoku": [0, 1, 5],
  "/joukyou/gakusei": [0, 4],
  "/joukyou/kazoku-ga-tetsudau": [4],
  "/joukyou/seikatsu-hogo": [0, 3],
  "/okane/zeikin": [0, 1, 5],
  "/okane/chousei": [0, 1, 2, 3, 4, 6],
};
const commonSources = [
  "- 国民年金法(第25条 公課の禁止、第4条の3ほか、20歳前傷病の所得制限・停止事由、受給権の保護、第三者行為の調整) ・ 確認日 2026-08-31",
  "- 厚生年金保険法(第41条、障害手当金、加給年金) ・ 確認日 2026-08-31",
  "- 健康保険法第108条(傷病手当金との調整) ・ 確認日 2026-08-31",
  "- 生活保護法第4条(補足性の原則)/厚生労働省 生活保護実施要領(障害者加算) ・ 確認日 2026-08-31",
  "- 日本年金機構「年金受給選択申出書」「老齢年金の繰上げ請求」「委任状」「学生納付特例」「特別障害給付金」 ・ 確認日 2026-08-31",
  "- 厚生労働省 被扶養者認定の収入基準に関する通知 ・ 確認日 2026-08-31",
  "- 労働者災害補償保険法(併給調整) ・ 確認日 2026-08-31",
];

mkdirSync(resolve(process.cwd(), "data/hubs"), { recursive: true });
for (let index = 0; index < pages.length; index += 1) {
  const [name, path, marker] = pages[index];
  const start = raw.indexOf(marker);
  const end = index + 1 < pages.length ? raw.indexOf(pages[index + 1][2], start + marker.length) : raw.indexOf("\n## 出典(7本の共通ブロック", start);
  if (start < 0 || end < 0) throw new Error(`${path}: 公開本文の境界がありません`);
  const lines = raw.slice(start, end).trim().split("\n");
  const title = lines.shift().replace(/^# \d+\. /, "").replace(/ — \/(?:joukyou|okane)\/.+$/, "");
  const breadcrumbIndex = lines.findIndex((line) => line.startsWith("パンくず:"));
  const breadcrumb = lines[breadcrumbIndex].replace(/^パンくず:\s*/, "").split(" > ");
  lines.splice(breadcrumbIndex, 1);
  while (!lines.at(-1)?.trim() || lines.at(-1)?.trim() === "---") lines.pop();
  lines.push("", "## 出典", ...sources[path].map((sourceIndex) => commonSources[sourceIndex]));
  const publicSource = lines.join("\n").trim()
    .replaceAll("180万円", "{{dependentDisabledIncomeLimit}}万円")
    .replaceAll("130万円", "{{dependentGeneralIncomeLimit}}万円");
  writeFileSync(resolve(process.cwd(), `data/hubs/${name}.json`), `${JSON.stringify({ title, breadcrumb, source: publicSource }, null, 2)}\n`);
}
console.log(`Imported ${pages.length} situation/money pages.`);
