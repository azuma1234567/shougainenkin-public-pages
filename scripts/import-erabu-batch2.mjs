import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const source = resolve(process.cwd(), "../shougainenkin/docs/hub-erabu-batch2-4hon-2026-09-02.md");
const raw = readFileSync(source, "utf8").replace(/\r\n/g, "\n");
const pages = [
  ["erabu-irai-subeki-case", "/erabu/irai-subeki-case", "# 1. "],
  ["erabu-hiyou-souba", "/erabu/hiyou-souba", "# 2. "],
  ["erabu-erabikata", "/erabu/erabikata", "# 3. "],
  ["erabu-fushikyu-no-ato", "/erabu/fushikyu-no-ato", "# 4. "],
];
const sourcesByPath = {
  "/erabu/irai-subeki-case": [
    "- 社会保険労務士法(業務の範囲) ・ 確認日 2026-08-31",
    "- 日本年金機構「障害年金ガイド」(請求手続き・予約相談・文書料の取扱い) ・ 確認日 2026-08-31",
  ],
  "/erabu/hiyou-souba": [
    "- 日本年金機構「障害年金ガイド」(請求手続き・予約相談・文書料の取扱い) ・ 確認日 2026-08-31",
    "- 国民年金法・厚生年金保険法(受給権の保護、非課税) ・ 確認日 2026-08-31",
  ],
  "/erabu/erabikata": [
    "- 社会保険労務士法(業務の範囲) ・ 確認日 2026-08-31",
  ],
  "/erabu/fushikyu-no-ato": [
    "- 社会保険審査官及び社会保険審査会法(審査請求3か月・再審査請求2か月) ・ 確認日 2026-08-31",
    "- 社会保険審査会 裁決例(/jitsurei に原文リンク)",
  ],
};

mkdirSync(resolve(process.cwd(), "data/hubs"), { recursive: true });
for (let pageIndex = 0; pageIndex < pages.length; pageIndex += 1) {
  const [name, path, marker] = pages[pageIndex];
  const start = raw.indexOf(marker);
  const end = pageIndex + 1 < pages.length
    ? raw.indexOf(pages[pageIndex + 1][2], start + marker.length)
    : raw.indexOf("\n## 執筆メモ", start);
  if (start < 0 || end < 0) throw new Error(`${path}: 公開本文の境界がありません`);

  const lines = raw.slice(start, end).trim().split("\n");
  const title = lines.shift().replace(/^# \d+\. /, "").replace(/ — \/erabu\/.+$/, "");
  const breadcrumbIndex = lines.findIndex((line) => line.startsWith("パンくず:"));
  if (breadcrumbIndex < 0) throw new Error(`${path}: パンくずがありません`);
  const breadcrumb = lines[breadcrumbIndex].replace(/^パンくず:\s*/, "").split(" > ");
  lines.splice(breadcrumbIndex, 1);

  // 本文の表示文言は維持し、棚割りで非リンク指定の実例導線だけURLを公開データから外す。
  const commonSources = lines.findIndex((line) => line.startsWith("## 出典(4本の共通ブロック"));
  if (commonSources >= 0) lines.splice(commonSources);
  while (!lines.at(-1)?.trim() || lines.at(-1)?.trim() === "---") lines.pop();
  lines.push("", "## 出典", ...sourcesByPath[path]);
  const publicSource = lines.join("\n").trim().replace(
    "→ 結論が変わった実例を見る(/jitsurei)",
    "→ 結論が変わった実例を見る",
  );
  writeFileSync(
    resolve(process.cwd(), `data/hubs/${name}.json`),
    `${JSON.stringify({ title, breadcrumb, source: publicSource }, null, 2)}\n`,
  );
}

console.log(`Imported ${pages.length} decision pages.`);
