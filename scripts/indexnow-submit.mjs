/* IndexNow に URL を知らせる(監査 §4-4)。
     npm run indexnow            … 直近7日ぶん(package.json が --since を渡す)
     node scripts/indexnow-submit.mjs            … sitemap の全 URL
     node scripts/indexnow-submit.mjs --since 2026-09-01  … その日以降に更新された URL だけ
     node scripts/indexnow-submit.mjs --dry-run  … 送らずに、送る URL だけ出す

   これは「サイト運営者の手元から検索エンジンへ」の送信で、サイトの訪問者からの送信ではない。
   道具の「入力を送らない」約束とは別の話。 */
import { readdirSync, readFileSync } from "node:fs";

const HOST = "shougainenkin-note.net";
const SITEMAP = `https://${HOST}/sitemap.xml`;
const ENDPOINT = "https://api.indexnow.org/indexnow";

/* 鍵は public/<32桁>.txt。中身がファイル名と同じであること(IndexNow の決まり)。 */
function findKey() {
  const files = readdirSync("public").filter((f) => /^[0-9a-f]{32}\.txt$/.test(f));
  if (files.length !== 1) {
    throw new Error(`public に 32桁の鍵ファイルが ${files.length} 個ある。1個にすること`);
  }
  const key = files[0].replace(/\.txt$/, "");
  const body = readFileSync(`public/${files[0]}`, "utf8").trim();
  if (body !== key) throw new Error(`${files[0]} の中身が鍵と違う(中身: ${body})`);
  return key;
}

async function urlsFromSitemap(since) {
  const res = await fetch(SITEMAP);
  if (!res.ok) throw new Error(`sitemap が読めない: ${res.status}`);
  const xml = await res.text();
  const entries = [...xml.matchAll(/<url>([\s\S]*?)<\/url>/g)].map((m) => {
    const loc = /<loc>(.*?)<\/loc>/.exec(m[1])?.[1] ?? "";
    const mod = /<lastmod>(.*?)<\/lastmod>/.exec(m[1])?.[1] ?? "";
    return { loc, mod: mod.slice(0, 10) };
  }).filter((e) => e.loc);
  return since ? entries.filter((e) => e.mod && e.mod >= since) : entries;
}

const args = process.argv.slice(2);
const sinceIndex = args.indexOf("--since");
const since = sinceIndex >= 0 ? args[sinceIndex + 1] : "";
const dryRun = args.includes("--dry-run");

const key = findKey();
const entries = await urlsFromSitemap(since);
const urlList = entries.map((e) => e.loc);

console.log(`鍵 ${key} / 送る URL ${urlList.length} 件${since ? `(${since} 以降に更新)` : "(全部)"}`);
if (!urlList.length) { console.log("送るものが無いので終わり"); process.exit(0); }
if (dryRun) { urlList.slice(0, 10).forEach((u) => console.log(`  ${u}`)); console.log("  …(--dry-run なので送っていない)"); process.exit(0); }

/* IndexNow は 1回 10,000 URL まで。いまは166件だが、増えたときのために区切る。 */
const CHUNK = 10000;
for (let i = 0; i < urlList.length; i += CHUNK) {
  const chunk = urlList.slice(i, i + CHUNK);
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({ host: HOST, key, keyLocation: `https://${HOST}/${key}.txt`, urlList: chunk }),
  });
  const text = await res.text();
  console.log(`  ${chunk.length}件 → HTTP ${res.status} ${res.statusText}${text ? ` ${text.slice(0, 200)}` : ""}`);
  /* 200 は受理、202 は受理して後で検証。どちらも成功。 */
  if (res.status !== 200 && res.status !== 202) process.exitCode = 1;
}
