// §2 の 2〜8。node --import ./scripts/lib/ts-alias.mjs docs/verification/fushikyu-85ken-2026-09-07/check.mjs http://127.0.0.1:3000
import { chromium } from "playwright";
import { parse } from "node-html-parser";
import { writeFileSync } from "node:fs";
import { faqs, lead } from "../../../content/columns/fushikyu-85ken.ts";
const origin = process.argv[2] ?? "http://127.0.0.1:3000";
const dir = "docs/verification/fushikyu-85ken-2026-09-07";
const out = []; const say = (s) => { out.push(s); console.log(s); };
const SLUG = "fushikyu-85ken", URL_ = `${origin}/columns/${SLUG}`;
const html = await (await fetch(URL_)).text(); const root = parse(html.replaceAll("<!-- -->", ""));
// 2. lead 4行、FAQ 6問、FAQPage と画面が一致、<a 0
const lds = root.querySelectorAll('script[type="application/ld+json"]').map((s) => s.textContent);
const faqLd = lds.map((t) => JSON.parse(t)).filter((j) => j["@type"] === "FAQPage" || (Array.isArray(j) && j.some((x) => x["@type"] === "FAQPage"))).flat().filter((j) => j["@type"] === "FAQPage");
const screenQ = root.querySelectorAll(".column-body details summary, .column-faq summary, summary").map((s) => s.textContent.trim()).filter((t) => t.startsWith("Q"));
say(`2. lead ${lead.length} 行 / faqs ${faqs.length} 問 / FAQPage ${faqLd.length} 個(質問 ${faqLd[0]?.mainEntity.length}) / JSON-LD と faqs の Q が一致=${JSON.stringify(faqLd[0]?.mainEntity.map((q) => q.name)) === JSON.stringify(faqs.map((f) => f.question))} / 画面の Q ${screenQ.length} / JSON-LD 全体に <a: ${lds.join("").includes("<a") ? "あり" : "0"}`);
// 3. 本文の内部リンクが 200、/jitsurei#id のアンカー先
const links = [...new Set(root.querySelectorAll(".column-body a[href^='/']").map((a) => a.getAttribute("href")))];
const codes = []; for (const l of links) { const r = await fetch(`${origin}${l.split("#")[0]}`); codes.push([l, r.status]); }
say(`3. 本文の内部リンク ${links.length} 種類: 200 でないもの ${codes.filter(([, c]) => c !== 200).length} ${codes.filter(([, c]) => c !== 200).map(([l, c]) => l + " " + c).join(", ")}`);
const anchors = links.filter((l) => l.startsWith("/jitsurei#")).map((l) => l.split("#")[1]);
const where = [];
for (const id of anchors) { let found = null; for (let p = 1; p <= 8 && !found; p += 1) { const t = await (await fetch(`${origin}/jitsurei${p > 1 ? `?page=${p}` : ""}`)).text(); if (t.includes(`id="${id}"`)) found = p; } where.push(`${id} → ${found ? `/jitsurei の ${found} ページ目に id あり` : "無し"}`); }
say(`3. /jitsurei#id ${anchors.length} 本: ${where.join(" / ")}`);
// 3b. /jitsurei?case= の4本: 開いた直後に該当事案が画面内(1400px / 390px)
{
  const b2 = await chromium.launch({ headless: true, executablePath: process.env.CHROME_PATH || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" });
  const cases = links.filter((l) => l.startsWith("/jitsurei?case=")).map((l) => l.split("case=")[1]);
  for (const id of cases) for (const w of [1400, 390]) {
    const ctx = await b2.newContext({ viewport: { width: w, height: 900 } }); const pg = await ctx.newPage();
    await pg.goto(`${origin}/jitsurei?case=${id}`); await pg.waitForLoadState("networkidle"); await pg.waitForTimeout(400);
    const r = await pg.evaluate((id) => { const el = document.getElementById(id); const b = el?.getBoundingClientRect(); const hb = document.querySelector("header.site-header")?.getBoundingClientRect().bottom ?? 0; return { exists: !!el, inView: !!b && b.top >= hb - 1 && b.top < window.innerHeight, top: b ? Math.round(b.top) : null, page: document.querySelector(".p-results")?.textContent?.trim() }; }, id);
    say(`3b. ${w}px /jitsurei?case=${id}: 要素あり=${r.exists} 画面内=${r.inView}(top ${r.top}px) / ${r.page}`);
    await ctx.close();
  }
  await b2.close();
}
// 4. 禁止語
const body = root.querySelector(".column-body")?.textContent ?? ""; const main = root.querySelector("main")?.textContent ?? "";
const bad = { "あなた": /あなた/g, "あなたは◯級": /あなたは[０-９0-9◯]級/g, "◯級相当": /[０-９0-9◯]級相当/g, "通りそう": /通りそう/g, "もらえそう": /もらえそう/g, "難しそう": /難しそう/g, "厳しそう": /厳しそう/g, "道具": /道具/g, "X・アカウント名": /x\.com|twitter|@[A-Za-z0-9_]{4,}/gi, "執筆メモ": /執筆メモ/g };
say(`4. 本文(.column-body): ${Object.entries(bad).map(([k, re]) => `${k}=${(body.match(re) ?? []).length}`).join(" ")} / <main> 全体の「道具」=${(main.match(/道具/g) ?? []).length}「あなた」=${(main.match(/あなた/g) ?? []).length}`);
// 6. ColumnThemeBlock と 4ハブの関連記事
const theme = root.querySelectorAll(".column-theme a, .column-theme-block a, [class*='theme'] a").map((a) => a.getAttribute("href"));
say(`6. 記事末尾のテーマ導線のリンク: ${[...new Set(theme)].join(", ") || "(セレクタ不明)"}`);
for (const h of ["/nayami/fushikyu", "/erabu/fushikyu-no-ato"]) {
  const t = await (await fetch(`${origin}${h}`)).text();
  say(`6. ${h} に新記事へのリンク: ${(t.match(new RegExp(`href="/columns/${SLUG}"`, "g")) ?? []).length} 本`);
}
for (const h of ["/erabu/jibun-ka-irai", "/erabu/irai-subeki-case", "/erabu/erabikata", "/erabu/hiyou-souba", "/erabu/fushikyu-no-ato"]) {
  const t = await (await fetch(`${origin}${h}`)).text();
  say(`A. ${h} に「社労士に頼んでも…」へのリンク: ${(t.match(/href="\/columns\/sharoushi-kawaranai-koto"/g) ?? []).length} 本`);
}
// 8. sitemap
const sm = await (await fetch(`${origin}/sitemap.xml`)).text(); const m = sm.match(new RegExp(`<loc>[^<]*/columns/${SLUG}</loc>\\s*<lastmod>([^<]*)</lastmod>`));
say(`8. sitemap: ${m ? m[1] : "無し"}`);
// 7. スクリーンショットと表・矢印カード
const browser = await chromium.launch({ headless: true, executablePath: process.env.CHROME_PATH || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" });
for (const w of [1400, 390]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: 900 } }); const page = await ctx.newPage();
  await page.goto(URL_); await page.waitForLoadState("networkidle");
  const r = await page.evaluate(() => {
    const tables = [...document.querySelectorAll(".column-body table")].map((t) => ({ wrapped: !!t.closest(".article-table-wrap"), overflow: t.closest(".article-table-wrap") ? getComputedStyle(t.closest(".article-table-wrap")).overflowX : "" , wider: t.scrollWidth > (t.closest(".article-table-wrap")?.clientWidth ?? 0) }));
    const cards = [...document.querySelectorAll(".column-body .column-inline-card")].map((a) => ({ href: a.getAttribute("href"), w: a.getBoundingClientRect().width, cls: a.className }));
    const vw = document.documentElement.clientWidth;
    return { tables, cards: cards.length, tool: cards.filter((c) => /jc--/.test(c.cls)).map((c) => c.href), cardOver: cards.filter((c) => c.w > vw).length, over: document.documentElement.scrollWidth - vw };
  });
  say(`7. ${w}px: 表 ${r.tables.length} 個(枠 ${r.tables.map((t) => `${t.wrapped ? "wrap" : "no-wrap"}/${t.overflow}${t.wider ? "/横スクロール" : ""}`).join(", ")}) / 矢印カード ${r.cards} 枚(機能カード: ${r.tool.join(", ")}) / 幅超え ${r.cardOver} / 横はみ出し ${r.over}px`);
  await page.screenshot({ path: `${dir}/${SLUG}-${w}.png`, fullPage: true });
  await ctx.close();
}
await browser.close();
writeFileSync(`${dir}/checks.txt`, out.join("\n") + "\n");
