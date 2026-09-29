// data/saiketsu-cases-2026-08-26.json の全 url に HEAD を打ち、200 以外を一覧して非 0 で終わる。
// mhlw は User-Agent の無い要求を弾くことがあるので、失敗したら UA を付けて GET で再試行する。
// CI には入れない。四半期に1回、手動で回す(docs/fix-saiketsu-urls-2026-09-28.md)。
//
//   npm run check:saiketsu-urls
import { readFileSync } from "node:fs";
const { cases } = JSON.parse(readFileSync(new URL("../data/saiketsu-cases-2026-08-26.json", import.meta.url), "utf8"));
const UA = "Mozilla/5.0 (compatible; shougainenkin-note link check; +https://shougainenkin-note.net/)";
const status = async (url) => {
  try {
    const head = await fetch(url, { method: "HEAD", redirect: "follow" });
    if (head.status === 200) return 200;
    const get = await fetch(url, { method: "GET", redirect: "follow", headers: { "User-Agent": UA } });
    return get.status;
  } catch (error) { return `error: ${error.message}`; }
};
const results = [];
for (let i = 0; i < cases.length; i += 6) {
  const batch = cases.slice(i, i + 6);
  results.push(...await Promise.all(batch.map(async (c) => ({ id: c.id, url: c.url, excluded: Boolean(c.excluded), verified: Boolean(c.verified), status: await status(c.url) }))));
}
const bad = results.filter((r) => r.status !== 200);
console.log(`裁決 ${results.length} 件の url: 200 が ${results.length - bad.length} 件、それ以外 ${bad.length} 件`);
for (const r of bad) console.log(`  ${r.status}  ${r.id}${r.excluded ? "(excluded)" : ""}${r.verified ? "" : "(未 verified)"}  ${r.url}`);
const badPublished = bad.filter((r) => !r.excluded);
if (badPublished.length) { console.error(`公開対象で 200 でない url が ${badPublished.length} 件`); process.exit(1); }
if (bad.length) console.log("200 でないのは excluded の裁決だけ(公開ページからはリンクされない)");
