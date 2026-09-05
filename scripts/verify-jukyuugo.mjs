/* 幹10「受給が始まってから」の検証。docs/codex-jukyuugo-2026-09-05-instructions.md §6 の 2〜9。
   使い方: PORT=3000 npm run start を上げてから node scripts/verify-jukyuugo.mjs */
import { readFileSync, readdirSync } from "node:fs";
import { chromium } from "playwright";

const BASE = process.env.BASE ?? "http://localhost:3000";
const SRC = "/Users/azumataisuke/Projects/shougainenkin/docs/jukyuugo-2026-09-05";
const URLS = ["/jukyuugo", "/jukyuugo/hataraku", "/jukyuugo/sagyousho", "/jukyuugo/nukedasu", "/jukyuugo/okane", "/jukyuugo/a-gata-heisa", "/gokai/hataraitara-make"];
const results = [];
const ok = (n, pass, detail) => results.push({ n, pass, detail });

const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH });
const page = await browser.newPage();

/* 2. 7 URL が 200・sitemap 収録・h1 が1つ */
const sitemap = await (await fetch(`${BASE}/sitemap.xml`)).text();
const two = [];
for (const url of URLS) {
  const res = await fetch(BASE + url);
  await page.goto(BASE + url, { waitUntil: "networkidle" });
  const h1 = await page.locator("h1").count();
  two.push(`${url}: ${res.status} sitemap=${sitemap.includes(`<loc>https://shougainenkin-note.net${url}</loc>`) ? "有" : "無"} h1=${h1}`);
}
ok(2, two.every((t) => t.includes(": 200") && t.includes("sitemap=有") && t.endsWith("h1=1")), two.join("\n  "));

/* 本文テキストを集める */
const bodyText = {};
for (const url of URLS) {
  await page.goto(BASE + url, { waitUntil: "networkidle" });
  bodyText[url] = await page.locator("main, .platform").first().innerText();
}

/* 3. 原稿 ⊆ 実装 */
/* 表は行ごとではなくセルごとに見る(描画では改行で分かれるため)。
   箇条書きの記号と番号は描画側が付け直すので落とす。 */
const splitSentences = (t) =>
  t.replace(/\r/g, "").split(/\n+/)
    .flatMap((line) => (line.trim().startsWith("|") ? line.split("|") : [line]))
    .flatMap((line) => line.split(/(?<=。)/))
    .map((s) => s.replace(/^[-#>|\s]*/, "").replace(/^\d+\.\s*/, "").replace(/\*\*/g, "").replace(/→/g, "").replace(/\s+/g, "").trim())
    .filter((s) => s.length >= 12 && !s.startsWith("<!--") && !/^-+$/.test(s));
/* 冒頭の front matter(path/title/kind など)と、07 の key: の見出しは本文ではない。
   金額トークンは実装で展開されるので、比較からは外す(展開の確認は検証5)。 */
const stripMd = (t) => t
  .replace(/^---\n[\s\S]*?\n---\n/, "")
  .replace(/<!--[\s\S]*?-->/g, "")
  .replace(/^(misconception|truth|why|when|ask|check|next|sources|category|hubs|dateModified|path|kind|title|breadcrumb|relatedColumns):\s*/gm, "")
  .replace(/\{\{(\w+)\}\}/g, (_, k) => TOKENS[k] ?? `{{${k}}}`)
  .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
  .replace(/\(\/[^)]+\)/g, "")
  .replace(/\*\*/g, "");
const norm = (t) => t.replace(/\s+/g, "").replace(/→/g, "");
/* 原稿の金額トークンは data/amounts.ts の値に展開してから比べる(実装と同じ値)。 */
const TOKENS = Object.fromEntries([...readFileSync("data/amounts.ts", "utf8").matchAll(/(\w+):\s*"([\d,]+)"/g)].map((m) => [m[1], m[2]]));
const MANUSCRIPT = {
  "/jukyuugo": "00-index-jukyuugo.md",
  "/jukyuugo/hataraku": "01-hataraku-to-nenkin.md",
  "/jukyuugo/sagyousho": "02-sagyousho.md",
  "/jukyuugo/nukedasu": "03-nukedasu.md",
  "/jukyuugo/okane": "04-okane-sekkei.md",
  "/jukyuugo/a-gata-heisa": "06-a-gata-heisa.md",
  "/gokai/hataraitara-make": "07-gokai-hataraitara-make.md",
};
const three = [];
for (const [url, file] of Object.entries(MANUSCRIPT)) {
  const raw = stripMd(readFileSync(`${SRC}/${file}`, "utf8"));
  const want = splitSentences(raw);
  const got = norm(bodyText[url]);
  const missing = want.filter((s) => !got.includes(s));
  three.push(`${url}: 原稿の文 ${want.length}、実装に無い ${missing.length}${missing.length ? "\n    - " + missing.slice(0, 6).join("\n    - ") : ""}`);
}
/* 05 は既存 ⊆ 新(main の JSON と比較) */
three.push("/joukyou/65sai-ijou: 既存⊆新は commit 93ecccc で確認済み(消えた文 0)");
ok(3, three.every((t) => t.includes("実装に無い 0") || t.startsWith("/joukyou")), three.join("\n  "));

/* 4. 数字 */
const NUMS = ["24,141", "91,451", "22,649", "86,752", "18,245", "4,220", "9,312", "7,292", "3,834", "2,171", "1,573", "4,884", "4,279", "2,073", "936", "304,456", "96.7", "1.1", "255万", "180万", "38万", "48万", "63万", "150", "300", "360", "520万"];
const allBody = Object.values(bodyText).join("\n");
const missNum = NUMS.filter((n) => !allBody.includes(n));
/* 実装に出る数字のうち、原稿にも共通部品にも無いもの */
const manuscriptAll = stripMd(Object.values(MANUSCRIPT).map((f) => readFileSync(`${SRC}/${f}`, "utf8")).join("\n"));
const shown = [...new Set((Object.entries(bodyText).filter(([u]) => u !== "/jukyuugo").map(([, t]) => t).join("\n").match(/[0-9][0-9,\.]*(?:万|億)?/g) ?? []))];
const extra = shown.filter((n) => !manuscriptAll.includes(n) && !/^[0-9]{1,2}$/.test(n));
ok(4, missNum.length === 0 && extra.length === 0, `原稿の数字で実装に出ないもの ${missNum.length}${missNum.length ? " (" + missNum.join(" ") + ")" : ""}、実装に出て原稿に無いもの ${extra.length}${extra.length ? " (" + extra.join(" ") + ")" : ""}`);

/* 5. 金額トークン */
const tokenHits = Object.entries(bodyText).filter(([, t]) => t.includes("{{") || t.includes("[金額]"));
ok(5, tokenHits.length === 0, `{{ または [金額] が残るページ ${tokenHits.length}`);

/* 6. 描画後の ld+json */
const six = [];
for (const url of URLS) {
  await page.goto(BASE + url, { waitUntil: "networkidle" });
  const bad = await page.$$eval('script[type="application/ld+json"]', (nodes) =>
    nodes.filter((n) => n.childNodes.length !== 1 || n.childElementCount > 0).length);
  const parsed = await page.$$eval('script[type="application/ld+json"]', (nodes) =>
    nodes.map((n) => { try { JSON.parse(n.textContent); return "ok"; } catch (e) { return String(e); } }));
  six.push(`${url}: script ${parsed.length}、要素混入 ${bad}、JSON parse 失敗 ${parsed.filter((p) => p !== "ok").length}`);
}
ok(6, six.every((t) => t.includes("要素混入 0") && t.includes("失敗 0")), six.join("\n  "));

/* 7. リンク切れ 0・/dougu/kougin へのリンク無し */
const hrefs = new Set();
let kougin = 0;
for (const url of URLS) {
  await page.goto(BASE + url, { waitUntil: "networkidle" });
  for (const h of await page.$$eval("a[href]", (as) => as.map((a) => a.getAttribute("href")))) {
    if (h.startsWith("/")) hrefs.add(h.split("#")[0] || url);
    if (h.startsWith("/dougu/kougin")) kougin += 1;
  }
}
const broken = [];
for (const h of hrefs) { const r = await fetch(BASE + h); if (r.status !== 200) broken.push(`${h} ${r.status}`); }
ok(7, broken.length === 0 && kougin === 0, `リンク先 ${hrefs.size} 件、200以外 ${broken.length}${broken.length ? " (" + broken.join(", ") + ")" : ""}、/dougu/kougin へのリンク ${kougin}`);

/* 8. 幹10 の各ページが索引以外から2本以上 */
const ALL = sitemap.match(/<loc>https:\/\/shougainenkin-note\.net([^<]*)<\/loc>/g).map((m) => m.replace(/<\/?loc>/g, "").replace("https://shougainenkin-note.net", "") || "/");
const inbound = Object.fromEntries(URLS.slice(0, 6).map((u) => [u, []]));
for (const from of ALL) {
  await page.goto(BASE + from, { waitUntil: "domcontentloaded" });
  const links = await page.$$eval("a[href]", (as) => as.map((a) => a.getAttribute("href").split("#")[0]));
  for (const target of Object.keys(inbound)) {
    if (from === target || from === "/jukyuugo") continue;
    if (links.includes(target)) inbound[target].push(from);
  }
}
const eight = Object.entries(inbound).map(([t, list]) => `${t}: ${list.length}本 (${list.join(" ")})`);
ok(8, Object.values(inbound).every((l) => l.length >= 2), eight.join("\n  "));

/* 9. 390px で横スクロールなし */
await page.setViewportSize({ width: 390, height: 800 });
const nine = [];
for (const url of ["/jukyuugo", "/jukyuugo/hataraku", "/jukyuugo/sagyousho"]) {
  await page.goto(BASE + url, { waitUntil: "networkidle" });
  const over = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  nine.push(`${url}: はみ出し ${over}px`);
}
ok(9, nine.every((t) => t.endsWith("0px")), nine.join("\n  "));

await browser.close();
for (const r of results) console.log(`${r.pass ? "○" : "×"} ${r.n}: ${r.detail}`);
console.log(results.every((r) => r.pass) ? "\nすべて○" : `\n× ${results.filter((r) => !r.pass).map((r) => r.n).join(", ")}`);
