import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { HUBS } from "../lib/hubs.ts";

const root = process.cwd();
const slugs = ["ninchishou","koujinou","izon","kanzou","kokyuuki","ketsueki","shikaku","choukaku","gengo","nanbyou"];
const data = Object.fromEntries(slugs.map((slug) => [slug, JSON.parse(readFileSync(resolve(root, `data/hubs/byoki-${slug}.json`), "utf8"))]));
assert.equal(slugs.filter((slug) => data[slug]).length, 10);
assert.equal(HUBS.filter((hub) => hub.kind === "byoki" && hub.published).length, 21);
for (const slug of slugs) assert.doesNotMatch(data[slug].source, /執筆メモ|codex向け|X等への言及/);
assert.doesNotMatch(data.ninchishou.source, /## 結論を分けた実例/);
assert.match(data.ninchishou.source, /## 見られているのは、この3つ/);
assert.match(data.kanzou.source, /## 評価の物差し/);

const home = readFileSync(resolve(root, "app/page.tsx"), "utf8");
const order = ["utsu-soukyoku","tekiou-fuan","hattatsu","tougou","chiteki","tenkan","ninchishou","koujinou","izon","jinzou-touseki","tounyou","shinzou","gan","kanzou","kokyuuki","ketsueki","shitai","shikaku","choukaku","gengo","nanbyou"];
let cursor = 0;
for (const slug of order) { const next = home.indexOf(`/byoki/${slug}`, cursor); assert.ok(next >= cursor, `一覧順: ${slug}`); cursor = next + slug.length; }

const cases = JSON.parse(readFileSync(resolve(root, "data/saiketsu-cases-2026-08-26.json"), "utf8")).cases.filter((item) => item.verified && !item.excluded);
const queries = { koujinou:"高次脳機能障害", izon:"依存症", kokyuuki:"呼吸器", ketsueki:"血液", shikaku:"眼", choukaku:"聴覚", gengo:"言語", nanbyou:"その他" };
const counts = Object.fromEntries(Object.entries(queries).map(([slug,q]) => [slug, cases.filter((item) => item.shobyo.includes(q)).length]));
for (const [slug, count] of Object.entries(counts)) count === 0
  ? assert.doesNotMatch(data[slug].source, /\/jitsurei\?傷病=/, `${slug}: 0件フィルタなし`)
  : assert.match(data[slug].source, /\/jitsurei\?傷病=/, `${slug}: 実在フィルタあり`);

assert.match(data.shikaku.source, /両眼の視力がそれぞれ0\.03以下/);
assert.match(data.choukaku.source, /90デシベル以上/);
assert.match(data.choukaku.source, /80デシベル以上かつ最良語音明瞭度30%以下/);
assert.match(data.choukaku.source, /閉眼で立っていられない/);
assert.match(data.choukaku.source, /10メートルを転倒せずに歩けない/);
assert.match(data.gengo.source, /流動食以外を摂取できない/);
assert.match(data.gengo.source, /ゾンデ\(経管\)栄養の併用が必要/);
assert.match(data.kokyuuki.source, /在宅酸素療法をしている方は、原則3級/);
assert.match(data.izon.source, /故意の犯罪行為や重大な過失などによる障害について支給を制限する規定/);
assert.match(data.choukaku.source, /第2節 聴覚の障害、第4節 平衡機能の障害/);
assert.match(data.gengo.source, /第5節 そしゃく・嚥下機能の障害、第6節 音声又は言語機能の障害/);

const landing = readFileSync(resolve(root, "components/platform/HubLanding.tsx"), "utf8");
const expected = [["ninchishou","koujinou"],["koujinou","ninchishou"],["koujinou","gengo"],["gengo","koujinou"],["koujinou","shitai"],["kanzou","gan"],["gan","kanzou"],["ketsueki","gan"],["gan","ketsueki"],["kokyuuki","shinzou"],["shikaku","tounyou"],["choukaku","gengo"],["nanbyou","shitai"]];
for (const [from,to] of expected) { const start = landing.indexOf(`"/byoki/${from}": [`); const block = landing.slice(start, landing.indexOf("],", start)); assert.ok(start >= 0 && block.includes(`"/byoki/${to}"`), `兄弟リンク ${from}→${to}`); }

const origin = process.env.VERIFY_ORIGIN;
if (origin) for (const slug of slugs) { const response = await fetch(`${origin}/byoki/${slug}`); assert.equal(response.status, 200, `/byoki/${slug}: 200`); const html = await response.text(); assert.ok(html.includes(data[slug].title), `${slug}: H1`); }
console.log(JSON.stringify({ hubs:10, publishedDiseaseHubs:21, caseFilterCounts:counts, sourceSections:"corrected and verified", siblingDirections:expected.length, failures:[] }, null, 2));
