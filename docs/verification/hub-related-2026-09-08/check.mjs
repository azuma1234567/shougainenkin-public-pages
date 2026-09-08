// HubLanding の関連記事(逆引き + relatedSlugs、上限8)の確認。被リンクが減った先が無いこと、指定ページに出ること、落とした slug、スクリーンショット。
//   node --import ./scripts/lib/ts-alias.mjs docs/verification/hub-related-2026-09-08/check.mjs http://127.0.0.1:3000 <before-dir>
import { chromium } from "playwright";
import { parse } from "node-html-parser";
import { readFileSync, writeFileSync } from "node:fs";
import { HUBS, hubColumnSlugs } from "../../../lib/hubs.ts";
import { COLUMNS } from "../../../lib/columns.ts";
const HUB_RELATED_LIMIT = 8; // components/platform/HubLanding.tsx と同じ値
const origin = process.argv[2] ?? "http://127.0.0.1:3000", before = process.argv[3];
const dir = "docs/verification/hub-related-2026-09-08";
const out = []; const say = (s) => { out.push(s); console.log(s); };
const paths = readFileSync(`${before}/paths.txt`, "utf8").trim().split("\n");
const fileOf = (p) => p.replace(/^\//, "").replaceAll("/", "_") + ".html";
const inChrome = (node) => { for (let el = node.parentNode; el; el = el.parentNode) { const cls = String(el.classNames ?? ""); const tag = String(el.rawTagName ?? "").toLowerCase(); if (tag === "header" && cls.includes("site-header")) return true; if (tag === "footer" && cls.includes("site-footer")) return true; if (cls.split(/\s+/).some((n) => n === "breadcrumb" || n === "p-breadcrumb")) return true; } return false; };
const bodyLinks = (root) => root.querySelectorAll("a[href^='/']").filter((a) => !inChrome(a)).map((a) => a.getAttribute("href").split("#")[0].split("?")[0]);
const inB = new Map(), inA = new Map(); const rows = [];
const known = new Set(COLUMNS.map((c) => c.slug));
for (const p of paths) {
  const htmlB = readFileSync(`${before}/${fileOf(p)}`, "utf8"), htmlA = await (await fetch(`${origin}${p}`)).text();
  const rb = parse(htmlB.replaceAll("<!-- -->", "")), ra = parse(htmlA.replaceAll("<!-- -->", ""));
  for (const l of bodyLinks(rb)) inB.set(l, (inB.get(l) ?? 0) + 1);
  for (const l of bodyLinks(ra)) inA.set(l, (inA.get(l) ?? 0) + 1);
  const relB = rb.querySelectorAll(".hub-theme-columns li a").map((a) => a.getAttribute("href").replace("/columns/", ""));
  const relA = ra.querySelectorAll(".hub-theme-columns li a").map((a) => a.getAttribute("href").replace("/columns/", ""));
  const hub = HUBS.find((h) => h.path === p);
  const ordered = [...new Set([...hubColumnSlugs(p), ...hub.relatedSlugs])].filter((s) => known.has(s));
  const dropped = ordered.slice(HUB_RELATED_LIMIT);
  const unknown = hub.relatedSlugs.filter((s) => !known.has(s));
  const dup = new Set(relA).size !== relA.length;
  if (relA.length !== relB.length || dropped.length || unknown.length) rows.push(`${p}: ${relB.length} → ${relA.length} 枚${dropped.length ? ` / 落とした: ${dropped.join(", ")}` : ""}${unknown.length ? ` / 存在しない slug: ${unknown.join(", ")}` : ""}${dup ? " / 重複あり!" : ""}${relA.length > HUB_RELATED_LIMIT ? " / 上限超え!" : ""}`);
}
say(`関連記事が変わったハブ ${rows.length} 件:`); for (const r of rows) say("  " + r);
const targets = new Set([...inB.keys(), ...inA.keys()]);
const dec = [...targets].filter((t) => (inA.get(t) ?? 0) < (inB.get(t) ?? 0));
const tb = [...inB.values()].reduce((a, b) => a + b, 0), ta = [...inA.values()].reduce((a, b) => a + b, 0);
say(`被リンク(ハブ49ページの本文から、ナビ・パンくず除く): 合計 ${tb} → ${ta}(+${ta - tb}) / 減った先 ${dec.length}${dec.length ? ": " + dec.join(", ") : ""} / 増えた先 ${[...targets].filter((t) => (inA.get(t) ?? 0) > (inB.get(t) ?? 0)).length} 種類`);
for (const [p, slug] of [["/erabu/jibun-ka-irai", "sharoushi-kawaranai-koto"], ["/erabu/irai-subeki-case", "sharoushi-kawaranai-koto"], ["/erabu/erabikata", "sharoushi-kawaranai-koto"], ["/erabu/hiyou-souba", "sharoushi-kawaranai-koto"], ["/erabu/fushikyu-no-ato", "sharoushi-kawaranai-koto"], ["/nayami/fushikyu", "fushikyu-85ken"], ["/erabu/fushikyu-no-ato", "fushikyu-85ken"]]) {
  const t = await (await fetch(`${origin}${p}`)).text(); const root = parse(t.replaceAll("<!-- -->", ""));
  const rel = root.querySelectorAll(".hub-theme-columns li a").map((a) => a.getAttribute("href"));
  say(`${p} の関連記事に /columns/${slug}: ${rel.includes(`/columns/${slug}`) ? "○" : "×"}(${rel.length} 枚)`);
}
const browser = await chromium.launch({ headless: true, executablePath: process.env.CHROME_PATH || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" });
for (const p of ["/erabu/erabikata", "/jukyuugo/sagyousho", "/nayami/fushikyu"]) for (const w of [1400, 390]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: 900 } }); const page = await ctx.newPage();
  await page.goto(`${origin}${p}`); await page.waitForLoadState("networkidle");
  const r = await page.evaluate(() => { const sec = document.querySelector(".hub-theme-columns"); const b = sec.getBoundingClientRect(); return { over: document.documentElement.scrollWidth - document.documentElement.clientWidth, items: sec.querySelectorAll("li").length, wider: [...sec.querySelectorAll("li")].filter((li) => li.getBoundingClientRect().right > document.documentElement.clientWidth).length, top: Math.round(b.top + window.scrollY) }; });
  say(`${w}px ${p}: 関連記事 ${r.items} 枚 / 幅超え ${r.wider} / 横はみ出し ${r.over}px`);
  await page.evaluate((y) => window.scrollTo(0, Math.max(0, y - 80)), r.top);
  await page.screenshot({ path: `${dir}/${p.slice(1).replaceAll("/", "_")}-${w}.png` });
  await ctx.close();
}
await browser.close();
writeFileSync(`${dir}/checks.txt`, out.join("\n") + "\n");
