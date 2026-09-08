// §D の 2〜6・8・9。node --import ./scripts/lib/ts-alias.mjs docs/verification/jukyuugo-links-2026-09-08/check.mjs http://127.0.0.1:3000
import { chromium } from "playwright";
import { parse } from "node-html-parser";
import { readFileSync, writeFileSync } from "node:fs";
import { apply2026Amounts } from "../../../data/amounts.ts";
import { extractHubFaqs, HUB_CONTENT } from "../../../lib/hub-content.ts";
const origin = process.argv[2] ?? "http://127.0.0.1:3000";
const dir = "docs/verification/jukyuugo-links-2026-09-08";
const out = []; const say = (s) => { out.push(s); console.log(s); };
const CHROME = process.env.CHROME_PATH || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const hubs = { "/nayami/koushin": "nayami-koushin", "/nayami/shikyuu-teishi": "nayami-shikyuu-teishi", "/joukyou/65sai-ijou": "joukyou-65sai-ijou", "/okane/ikura": "okane-ikura" };
const norm = (t) => t.replace(/\s+/g, "").trim();
const plain = (line) => apply2026Amounts(line).replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").replace(/\*\*/g, "").replace(/^→\s*/, "").replace(/\((\/[^\s)]+)\)/g, "").replace(/^#+\s*/, "").replace(/^(-|\*|\d+\.)\s+/, "");
const pages = {};
for (const path of Object.keys(hubs)) pages[path] = parse((await (await fetch(`${origin}${path}`)).text()).replaceAll("<!-- -->", ""));

// 2. 原稿 ⊆ 実装(3ハブ + ikura): 段落・箇条書き・表のセル・見出しの文が <main> のテキストにある
for (const [path, name] of Object.entries(hubs)) {
  const src = name === "okane-ikura" ? JSON.parse(readFileSync(`data/hubs/${name}.json`, "utf8")).source : (() => { const md = readFileSync(`docs/jukyuugo-links-2026-09-08/${name}.md`, "utf8"); return md.slice(md.indexOf("## リード(直答)")); })();
  const main = norm(pages[path].querySelector("main").textContent);
  const units = [];
  for (const raw of src.split("\n")) {
    const line = raw.trim();
    if (!line || line === "---" || /^\|\s*-+/.test(line)) continue;
    if (line.startsWith("|")) { for (const cell of line.split("|").slice(1, -1)) if (cell.trim()) units.push(plain(cell.trim())); continue; }
    units.push(plain(line));
  }
  const missing = units.map(norm).filter((u) => u && !main.includes(u));
  say(`2. ${path}: 原稿の単位 ${units.length}、HTML に無いもの ${missing.length}${missing.length ? " → " + missing.slice(0, 5).map((m) => m.slice(0, 40)).join(" / ") : ""}`);
}
// 3. {{ が残っていない
for (const path of Object.keys(hubs)) say(`3. ${path}: 「{{」 ${(pages[path].querySelector("main").textContent.match(/\{\{/g) ?? []).length} 件、「[[」 ${(pages[path].querySelector("main").textContent.match(/\[\[/g) ?? []).length} 件、?case= リンク ${pages[path].querySelectorAll("main a[href^='/jitsurei?case=']").length} 本`);
// 5. FAQ: extractHubFaqs の件数、画面 summary、JSON-LD が一致、<a 0
for (const path of Object.keys(hubs)) {
  const ex = extractHubFaqs(HUB_CONTENT[path].source);
  const lds = pages[path].querySelectorAll('script[type="application/ld+json"]').map((s) => s.textContent);
  const faq = lds.map((t) => JSON.parse(t)).flat().filter((j) => j && j["@type"] === "FAQPage")[0];
  const screen = pages[path].querySelectorAll("main details summary").map((s) => s.textContent.trim()).filter((t) => /^Q[.．]/.test(t));
  say(`5. ${path}: extractHubFaqs ${ex.length} / 画面 ${screen.length} / JSON-LD ${faq?.mainEntity.length ?? 0} / Q 一致=${JSON.stringify(ex.map((f) => f.question)) === JSON.stringify(faq?.mainEntity.map((q) => q.name))} / <a: ${lds.join("").includes("<a") ? "あり" : "0"}`);
}
// 6. <main> の「あなた」「道具」禁止語(4ページ + 記事2本)
const bad = { "あなた": /あなた/g, "道具": /道具/g, "あなたは◯級": /あなたは[０-９0-9◯]級/g, "◯級相当": /[０-９0-9◯]級相当/g, "通りそう": /通りそう/g, "もらえそう": /もらえそう/g, "難しそう": /難しそう/g, "厳しそう": /厳しそう/g, "X": /x\.com|twitter|@[A-Za-z0-9_]{4,}/gi, "執筆メモ": /執筆メモ/g };
for (const path of [...Object.keys(hubs), "/columns/gaku-kaitei-seikyuu", "/columns/koushin-kakuninhodo"]) {
  const root = pages[path] ?? parse((await (await fetch(`${origin}${path}`)).text()).replaceAll("<!-- -->", ""));
  const main = root.querySelector("main").textContent;
  say(`6. ${path}: ${Object.entries(bad).map(([k, re]) => `${k}=${(main.match(re) ?? []).length}`).join(" ")}`);
}
// 9. /jukyuugo の年表と本文からの内部リンクが全部 200
{
  const root = parse((await (await fetch(`${origin}/jukyuugo`)).text()).replaceAll("<!-- -->", ""));
  const links = [...new Set(root.querySelectorAll("main a[href^='/']").map((a) => a.getAttribute("href")))].filter((l) => !/^\/(dougu|columns)?$/.test(l));
  const codes = []; for (const l of links) codes.push([l, (await fetch(`${origin}${l}`)).status]);
  say(`9. /jukyuugo の <main> 内部リンク ${links.length} 種類: 200 でないもの ${codes.filter(([, c]) => c !== 200).length}。${codes.map(([l, c]) => `${l}=${c}`).join(", ")}`);
}
// 争点リンク(原稿の /jitsurei?争点=…)の描画と 200
for (const path of ["/nayami/koushin", "/nayami/shikyuu-teishi"]) {
  const a = pages[path].querySelectorAll("main a").filter((x) => (x.getAttribute("href") ?? "").includes("争点") || (x.getAttribute("href") ?? "").includes("%E4%BA%89"));
  for (const x of a) say(`争点: ${path} → href=${decodeURIComponent(x.getAttribute("href"))} 「${x.textContent}」 status=${(await fetch(`${origin}${x.getAttribute("href")}`)).status}`);
}
// 4・8. ブラウザ: ?case= 9本が画面内、表の枠、空欄セルの罫線、スクリーンショット
const browser = await chromium.launch({ headless: true, executablePath: CHROME });
const caseIds = ["r06-03_05", "r07-03_04", "r07-03_02", "h28_29-16_01", "r07-03_09", "r07-03_05", "r07-03_01", "r06-03_01", "h30_r01-16_02"];
for (const id of caseIds) for (const w of [1400, 390]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: 900 } }); const pg = await ctx.newPage();
  await pg.goto(`${origin}/jitsurei?case=${id}`); await pg.waitForLoadState("networkidle"); await pg.waitForTimeout(400);
  const r = await pg.evaluate((id) => { const el = document.getElementById(id); const b = el?.getBoundingClientRect(); const hb = document.querySelector("header.site-header")?.getBoundingClientRect().bottom ?? 0; return { exists: !!el, inView: !!b && b.top >= hb - 1 && b.top < window.innerHeight, top: b ? Math.round(b.top) : null }; }, id);
  say(`4. ${w}px /jitsurei?case=${id}: 要素あり=${r.exists} 画面内=${r.inView}(top ${r.top}px)`);
  await ctx.close();
}
for (const path of Object.keys(hubs)) for (const w of [1400, 390]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: 900 } }); const pg = await ctx.newPage();
  await pg.goto(`${origin}${path}`); await pg.waitForLoadState("networkidle");
  const r = await pg.evaluate(() => {
    const tables = [...document.querySelectorAll("main table")];
    const wrapped = tables.filter((t) => { const p = t.parentElement; return p && p.classList.contains("article-table-wrap") && p.getBoundingClientRect().width <= document.documentElement.clientWidth + 1; }).length;
    const emptyCells = tables.flatMap((t) => [...t.querySelectorAll("td")]).filter((td) => !td.textContent.trim());
    const bordered = emptyCells.filter((td) => { const s = getComputedStyle(td); return parseFloat(s.borderBottomWidth) > 0 || parseFloat(s.borderTopWidth) > 0; }).length;
    const emptyH = emptyCells.filter((td) => td.getBoundingClientRect().height >= 16).length;
    return { tables: tables.length, wrapped, emptyCells: emptyCells.length, bordered, emptyH, scrollX: document.documentElement.scrollWidth - document.documentElement.clientWidth };
  });
  say(`8. ${w}px ${path}: 表 ${r.tables} 個(枠に入っている ${r.wrapped})、空欄セル ${r.emptyCells}(罫線あり ${r.bordered}、高さ16px以上 ${r.emptyH})、横はみ出し ${r.scrollX}px`);
  await pg.screenshot({ path: `${dir}/${hubs[path]}-${w}.png`, fullPage: true });
  await ctx.close();
}
await browser.close();
writeFileSync(`${dir}/checks.txt`, out.join("\n") + "\n");
