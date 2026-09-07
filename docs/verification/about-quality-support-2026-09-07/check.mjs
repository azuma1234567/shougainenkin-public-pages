// §5 の 2〜7: 本文が原稿と一致、「あなた」「個人で運営」0、#ad-promises と各ページからのリンク、訂正の記録3行、道具の表7行、フッター、スクリーンショット。
//   node --import ./scripts/lib/ts-alias.mjs docs/verification/about-quality-support-2026-09-07/check.mjs http://127.0.0.1:3000
import { chromium } from "playwright";
import { readFileSync, writeFileSync } from "node:fs";
import { TOOLS } from "../../../data/dougu.ts";
import { CORRECTIONS } from "../../../data/corrections.ts";
const origin = process.argv[2] ?? "http://127.0.0.1:3000";
const dir = "docs/verification/about-quality-support-2026-09-07";
const chrome = process.env.CHROME_PATH || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const browser = await chromium.launch({ headless: true, executablePath: chrome });
const out = []; const say = (s) => { out.push(s); console.log(s); };
const norm = (s) => s.replace(/\s+/g, "");

/* 原稿(指示書 §1〜§3 のコードブロック)から、照合する行を取り出す。[…] の指示行・★・見出し・表の罫線は除く */
const doc = readFileSync("docs/about-quality-support-2026-09-07-instructions.md", "utf8");
const block = (heading) => { const i = doc.indexOf(heading); const s = doc.indexOf("```", i) + 3; const e = doc.indexOf("```", s); return doc.slice(s, e); };
const linesOf = (text) => text.split("\n").map((l) => l.trim()).filter((l) => l && !l.startsWith("#") && !l.startsWith("[") && !l.startsWith("|---") && !l.includes("[") && !l.includes("★"))
  .map((l) => l.replace(/^- /, "").replace(/^\| /, "").replace(/ \|$/, "").split(" | ")).flat().map((l) => l.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").trim()).filter(Boolean);
const PAGES = { "/about": "## 1. `/about`", "/quality": "## 2. `/quality`", "/support": "## 3. `/support`" };

for (const [path, heading] of Object.entries(PAGES)) {
  const ctx = await browser.newContext({ viewport: { width: 1400, height: 900 } }); const page = await ctx.newPage();
  await page.goto(`${origin}${path}`); await page.waitForLoadState("networkidle");
  const main = await page.locator("main").innerText();
  const want = linesOf(block(heading));
  const missing = want.filter((l) => !norm(main).includes(norm(l)));
  say(`2. ${path}: 原稿の行 ${want.length} 本のうち本文に無いもの ${missing.length}${missing.length ? ": " + missing.map((m) => m.slice(0, 50)).join(" / ") : ""} / 「あなた」=${(main.match(/あなた/g) ?? []).length}(うち「あなたは◯級」の引用 ${(main.match(/あなたは◯級/g) ?? []).length}) / 「個人で運営」「個人運営」=${(main.match(/個人で運営|個人運営/g) ?? []).length}`);
  say(`   title=${await page.title()} / h1=${await page.locator("h1").innerText()}`);
  if (path === "/quality") {
    const rows = await page.locator("#corrections ~ .article-table-wrap tbody tr").allInnerTexts();
    say(`4. 訂正の記録 ${rows.length} 行(data/corrections.ts ${CORRECTIONS.length} 件): ${rows.map((r) => r.split("\t")[0]).join(", ")} / 日付順=${JSON.stringify(rows.map((r) => r.split("\t")[0]))}`);
  }
  if (path === "/support") {
    const names = await page.locator(".article-table-wrap tbody tr td:first-child").allInnerTexts();
    const want = ["mitate", "kingaku", "shorui", "madoguchi", "moushitatesho", "kougin", "koushin"].map((id) => TOOLS[id].name);
    say(`5. 道具の表 ${names.length} 行: ${names.join(" / ")} → TOOLS の名前と一致=${JSON.stringify(names) === JSON.stringify(want)}`);
  }
  const footer = await page.locator("footer section", { hasText: "このサイトについて" }).locator("a").allInnerTexts();
  say(`6. ${path} のフッター「このサイトについて」: ${footer.slice(0, 3).join(" / ")}`);
  for (const w of [1400, 390]) {
    const c2 = await browser.newContext({ viewport: { width: w, height: 900 } }); const p2 = await c2.newPage();
    await p2.goto(`${origin}${path}`); await p2.waitForLoadState("networkidle");
    say(`7. ${w}px ${path}: 横はみ出し ${await p2.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)}px`);
    await p2.screenshot({ path: `${dir}/${path.slice(1)}-${w}.png`, fullPage: true }); await c2.close();
  }
  await ctx.close();
}
// 3. /about#ad-promises と、/terms /ads /quality から /about へのリンク
{
  const ctx = await browser.newContext(); const page = await ctx.newPage();
  await page.goto(`${origin}/about`); say(`3. /about に id="ad-promises": ${await page.locator("#ad-promises").count()}(${await page.locator("#ad-promises").innerText()})`);
  for (const from of ["/terms", "/ads", "/quality"]) {
    await page.goto(`${origin}${from}`);
    const links = await page.locator('main a[href^="/about"]').evaluateAll((as) => as.map((a) => a.getAttribute("href")));
    const codes = [];
    for (const l of [...new Set(links)]) { const r = await fetch(`${origin}${l}`); codes.push(`${l} → ${r.status}`); }
    say(`3. ${from} から /about へのリンク: ${codes.join(", ") || "(無し)"}`);
  }
  // 6. 全ページから届く(フッター)は site-graph 検査4・10 で。ここでは3ページ以外の1ページで確認
  await page.goto(`${origin}/shinsei`);
  const f = await page.locator("footer section", { hasText: "このサイトについて" }).locator("a").evaluateAll((as) => as.slice(0, 3).map((a) => `${a.textContent}→${a.getAttribute("href")}`));
  say(`6. /shinsei のフッター: ${f.join(" / ")}`);
  await ctx.close();
}
await browser.close();
writeFileSync(`${dir}/checks.txt`, out.join("\n") + "\n");
