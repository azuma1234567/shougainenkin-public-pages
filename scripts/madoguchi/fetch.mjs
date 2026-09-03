/* 機構サイトから、窓口データのもとになる生HTMLを取得して保存する。
   docs/madoguchi-research-2026-09-03.md §6:
   - 生HTMLを全部保存する(保存先は .gitignore。証跡は offices.json の sourceHash で持つ)
   - 1秒以上あける。User-Agent にサイト名を入れる
   - 1回で全部取り、失敗したページは再試行せず一覧に出す
   実行: node scripts/madoguchi/fetch.mjs */
import { createHash } from "node:crypto";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { BASE, CHECKED_ON, DELAY_MS, ENTRY, PREFS, SOURCE_DIR, USER_AGENT } from "./config.mjs";
import { parsePrefIndex } from "./parse.mjs";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const manifest = [];
const failures = [];
let n = 0;

async function get(url, file) {
  n += 1;
  await sleep(DELAY_MS);
  try {
    const res = await fetch(url, { headers: { "User-Agent": USER_AGENT }, redirect: "follow" });
    if (!res.ok) { failures.push({ url, file, status: res.status }); return null; }
    const html = await res.text();
    const full = path.join(SOURCE_DIR, file);
    mkdirSync(path.dirname(full), { recursive: true });
    writeFileSync(full, html);
    const sha256 = createHash("sha256").update(html).digest("hex");
    manifest.push({ url, file, sha256, bytes: html.length, status: res.status, fetchedAt: new Date().toISOString() });
    if (n % 25 === 0) process.stderr.write(`  ${n} pages\n`);
    return html;
  } catch (e) {
    failures.push({ url, file, status: String(e.message ?? e) });
    return null;
  }
}

mkdirSync(SOURCE_DIR, { recursive: true });
console.error(`取得開始 ${CHECKED_ON} / 間隔 ${DELAY_MS}ms`);

await get(ENTRY, "index.html");

const listing = [];
for (const [slug] of PREFS) {
  const html = await get(`${BASE}/section/soudan/${slug}/index.html`, `${slug}/index.html`);
  if (!html) continue;
  for (const item of parsePrefIndex(html)) listing.push({ ...item, slug });
}
console.error(`都道府県ページから ${listing.length} 件の窓口リンク`);

for (const item of listing) {
  const file = item.href.replace("/section/soudan/", "");
  await get(BASE + item.href, file);
}

for (const [slug] of PREFS) {
  await get(`${BASE}/section/soudan/kankatsu/kankatsu_${slug}.html`, `kankatsu/kankatsu_${slug}.html`);
}

writeFileSync(path.join(SOURCE_DIR, "manifest.json"),
  `${JSON.stringify({ checkedOn: CHECKED_ON, userAgent: USER_AGENT, delayMs: DELAY_MS, listing, pages: manifest, failures }, null, 1)}\n`);
console.error(`完了: 取得 ${manifest.length} / 失敗 ${failures.length}`);
for (const f of failures) console.error(`  失敗 ${f.status} ${f.url}`);
