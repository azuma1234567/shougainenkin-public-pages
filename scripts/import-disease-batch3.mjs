import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const input = process.argv[2] ?? resolve(process.cwd(), "../shougainenkin/docs/hub-byoki-batch3-10hon-2026-09-02.md");
const raw = readFileSync(input, "utf8").replace(/\r\n/g, "\n");
const entries = [...raw.matchAll(/^# \d+\. (.+?) — (\/byoki\/[a-z0-9-]+)\n([\s\S]*?)(?=\n---\n(?:\n# \d+\.|\n## 出典))/gm)];
const sectionBySlug = {
  ninchishou: "第8節 精神(器質性精神障害・依存症)", koujinou: "第8節 精神(器質性精神障害・依存症)", izon: "第8節 精神(器質性精神障害・依存症)",
  kanzou: "第13節 肝疾患", kokyuuki: "第10節 呼吸器疾患", ketsueki: "第14節 血液・造血器疾患", shikaku: "第1節 眼",
  choukaku: "第2節 聴覚の障害、第4節 平衡機能の障害", gengo: "第5節 そしゃく・嚥下機能の障害、第6節 音声又は言語機能の障害", nanbyou: "第18節 その他の疾患",
};
const special = new Set(["kokyuuki", "gengo"]);
const zeroCaseFilters = new Set(["izon", "kokyuuki", "ketsueki", "gengo", "nanbyou"]);
mkdirSync(resolve(process.cwd(), "data/hubs"), { recursive: true });

for (const [, title, route, manuscript] of entries) {
  const slug = route.split("/").pop();
  const sourceLines = [
    `- 厚生労働省「国民年金・厚生年金保険 障害認定基準」${sectionBySlug[slug]} ・ 確認日 2026-08-31`,
    ...(special.has(slug) ? ["- 日本年金機構「障害認定日の特例」(在宅酸素療法・喉頭全摘出) ・ 確認日 2026-08-31"] : []),
    ...(slug === "nanbyou" ? ["- 日本年金機構「線維筋痛症等の診断書作成にあたっての留意事項」 ・ 確認日 2026-08-31"] : []),
  ];
  const publicManuscript = zeroCaseFilters.has(slug)
    ? manuscript.replace(/\(\/jitsurei\?傷病=[^)]+\)/, "(/jitsurei)")
    : manuscript;
  const source = `${publicManuscript.trim()}\n\n## 出典\n${sourceLines.join("\n")}`;
  const value = { title, breadcrumb: ["トップ", "病気から探す", title.replace(/と障害年金.*$/, "")], source };
  writeFileSync(resolve(process.cwd(), `data/hubs/byoki-${slug}.json`), `${JSON.stringify(value, null, 2)}\n`);
}
if (entries.length !== 10) throw new Error(`Expected 10 hubs, found ${entries.length}`);
console.log("Imported 10 disease hubs.");
