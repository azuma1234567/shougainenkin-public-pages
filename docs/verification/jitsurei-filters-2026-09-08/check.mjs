// サイト内の全 /jitsurei?… リンクを開き、件数と絞り込みの表示を確かめる。node --import ./scripts/lib/ts-alias.mjs docs/verification/jitsurei-filters-2026-09-08/check.mjs http://127.0.0.1:3000
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { writeFileSync } from "node:fs";
import { parse } from "node-html-parser";
import { chromium } from "playwright";
const origin = process.argv[2] ?? "http://127.0.0.1:3000";
const dir = "docs/verification/jitsurei-filters-2026-09-08";
/* サイト内の /jitsurei?… リンクを app components content data lib の .ts .tsx .json .md から集める */
const walk = (d) => readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(join(d, e.name)) : /\.(tsx?|json|md)$/.test(e.name) ? [join(d, e.name)] : []));
const found = new Set();
for (const f of ["app", "components", "content", "data", "lib"].flatMap(walk)) for (const m of readFileSync(f, "utf8").matchAll(/\/jitsurei\?[^"' )<>\\`…]+/g)) found.add(m[0]);
const links = [...found].filter((l) => !l.endsWith("=")).sort();
const rows = [];
for (const link of links) {
  const html = await (await fetch(`${origin}${link}`)).text();
  const root = parse(html.replaceAll("<!-- -->", ""));
  const results = root.querySelector(".p-results")?.textContent.trim() ?? "";
  const cards = root.querySelectorAll(".p-case, .p-case-card, [id] > .p-case").length || root.querySelectorAll("main div[id] > *").length;
  const m = /(\d+)件/.exec(results);
  rows.push({ link, status: (await fetch(`${origin}${link}`)).status, results, count: m ? Number(m[1]) : null, narrowed: results.startsWith("争点「") || results.startsWith("傷病「") || !results.startsWith("全件") });
}
// 併用: 旧パラメータ・?filter と重ねる
for (const link of ["/jitsurei?kind=mental&争点=初診日", "/jitsurei?filter=accepted&争点=更新", "/jitsurei?傷病=統合失調症&争点=初診日", "/jitsurei?争点=更新&case=r06-03_05", "/jitsurei?争点=ない語", "/jitsurei?傷病=ない病名", "/jitsurei?争点=認定日・遡及", "/jitsurei?争点=更新・額改定", "/jitsurei?issue=teido&page=2"]) {
  const html = await (await fetch(`${origin}${link}`)).text();
  const root = parse(html.replaceAll("<!-- -->", ""));
  const results = root.querySelector(".p-results")?.textContent.trim() ?? "";
  const m = /(\d+)件/.exec(results);
  rows.push({ link, status: 200, results, count: m ? Number(m[1]) : null, narrowed: !results.startsWith("全件"), extra: true });
}
const lines = ["| リンク | 表示 | 件数 |", "|---|---|---|", ...rows.map((r) => `| ${r.link}${r.extra ? "(併用の確認)" : ""} | ${r.results} | ${r.count} |`)];
console.log(lines.join("\n"));
console.log(`\n件数 0: ${rows.filter((r) => r.count === 0).length}、200 でない: ${rows.filter((r) => r.status !== 200).length}、絞り込まれていない(全件のまま): ${rows.filter((r) => !r.extra && !r.link.includes("case=") && !r.narrowed).map((r) => r.link).join(", ") || "0"}`);
// ?case= が絞り込みのある一覧でも画面内
const browser = await chromium.launch({ headless: true, executablePath: process.env.CHROME_PATH || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" });
const out = [];
for (const [link, id] of [["/jitsurei?case=r06-03_05", "r06-03_05"], ["/jitsurei?争点=更新&case=r06-03_05", "r06-03_05"], ["/jitsurei?case=h30_r01-16_02", "h30_r01-16_02"]]) for (const w of [1400, 390]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: 900 } }); const pg = await ctx.newPage();
  await pg.goto(`${origin}${link}`); await pg.waitForLoadState("networkidle"); await pg.waitForTimeout(400);
  const r = await pg.evaluate((id) => { const el = document.getElementById(id); const b = el?.getBoundingClientRect(); const hb = document.querySelector("header.site-header")?.getBoundingClientRect().bottom ?? 0; return { exists: !!el, inView: !!b && b.top >= hb - 1 && b.top < window.innerHeight }; }, id);
  out.push(`${w}px ${link}: 要素あり=${r.exists} 画面内=${r.inView}`);
  await ctx.close();
}
await browser.close();
console.log(out.join("\n"));
writeFileSync(`${dir}/checks.md`, lines.join("\n") + "\n\n" + out.join("\n") + "\n");
