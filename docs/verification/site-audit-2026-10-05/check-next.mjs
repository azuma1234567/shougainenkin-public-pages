// 「次に読む」: 57 本の送り先一覧(手で指定 13 本と relatedSlugs[0] の仮置き)、375px のスクリーンショット、webdriver ガード(Playwright では gtag が立ち上がらない)。
//   node docs/verification/site-audit-2026-10-05/check-next.mjs http://localhost:3210
import { parse } from "node-html-parser";
import { chromium } from "playwright";
import { readFileSync } from "node:fs";
const origin = process.argv[2] ?? "http://localhost:3210";
const out = "docs/verification/site-audit-2026-10-05";
const cols = readFileSync("lib/columns.ts", "utf8");
const manual = Object.fromEntries([...cols.matchAll(/    slug: "([^"]+)",\n(?:    [^\n]*\n)*?    nextSlug: "([^"]+)",/g)].map((m) => [m[1], m[2]]));
const sitemap = await (await fetch(`${origin}/sitemap.xml`)).text();
const slugs = [...sitemap.matchAll(/\/columns\/([a-z0-9-]+)<\/loc>/g)].map((m) => m[1]);
console.log(`## 次に読む(${slugs.length} 本)`);
for (const s of slugs) {
  const dom = parse(await (await fetch(`${origin}/columns/${s}`)).text());
  const a = dom.querySelector(".column-next a"); const href = a?.getAttribute("href");
  console.log(`${s} → ${href?.replace("/columns/", "") ?? "(なし)"} ${manual[s] ? "(手で指定)" : "(relatedSlugs[0])"} | ${a?.textContent ?? ""}`);
}
const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 375, height: 812 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await page.goto(`${origin}/columns/shinsatsu-mae-memo`, { waitUntil: "networkidle" });
  const m = await page.evaluate(() => { const el = document.querySelector(".column-next"); const r = el.getBoundingClientRect(); return { top: Math.round(r.top + scrollY), height: Math.round(r.height), text: el.textContent, webdriver: navigator.webdriver, gtag: typeof window.gtag, dataLayer: Array.isArray(window.dataLayer) ? window.dataLayer.length : null }; });
  console.log(`\n## 375px: .column-next top=${m.top}px height=${m.height}px 「${m.text}」`);
  console.log(`## webdriver ガード: navigator.webdriver=${m.webdriver}, window.gtag=${m.gtag}, dataLayer=${m.dataLayer}`);
  await page.evaluate((y) => scrollTo(0, y - 420), m.top); await page.screenshot({ path: `${out}/next-375.png` });
} finally { await browser.close(); }
