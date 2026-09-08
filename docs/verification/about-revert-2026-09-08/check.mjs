// node --import ./scripts/lib/ts-alias.mjs docs/verification/about-revert-2026-09-08/check.mjs http://127.0.0.1:3000
import { chromium } from "playwright";
import { writeFileSync } from "node:fs";
const origin = process.argv[2] ?? "http://127.0.0.1:3000";
const out = []; const say = (s) => { out.push(s); console.log(s); };
const browser = await chromium.launch({ headless: true, executablePath: process.env.CHROME_PATH || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" });
const ctx = await browser.newContext({ viewport: { width: 1400, height: 900 } });
const page = await ctx.newPage();
await page.goto(`${origin}/about`); await page.waitForLoadState("networkidle");
const r = await page.evaluate(() => {
  const main = document.querySelector("main");
  const text = main.innerText;
  const count = (re) => (text.match(re) ?? []).length;
  return {
    h1: document.querySelector("h1")?.textContent?.trim(),
    dougu: count(/道具/g), anata: count(/あなた/g), kojin: count(/個人で運営|個人運営/g),
    adPromises: !!document.getElementById("ad-promises"),
    adPromisesHeading: document.getElementById("ad-promises")?.textContent?.trim(),
    h2: [...main.querySelectorAll("h2")].map((h) => h.textContent.trim()),
    qualityLink: [...main.querySelectorAll('a[href="/quality"]')].map((a) => a.textContent.trim()),
    footerAbout: [...document.querySelectorAll('.site-footer a[href="/about"], footer a[href="/about"]')].map((a) => a.textContent.trim()),
    footerQuality: [...document.querySelectorAll('.site-footer a[href="/quality"], footer a[href="/quality"]')].map((a) => a.textContent.trim()),
    footerHeadings: [...document.querySelectorAll(".footer-links section h2")].map((h) => h.textContent.trim()),
    title: document.title,
  };
});
say(`h1: 「${r.h1}」 / title: ${r.title}`);
say(`描画後テキスト: 道具=${r.dougu} あなた=${r.anata} 個人で運営=${r.kojin}`);
say(`id="ad-promises": ${r.adPromises}(見出し「${r.adPromisesHeading}」)`);
say(`h2: ${r.h2.join(" / ")}`);
say(`本文の /quality リンク文言: ${JSON.stringify(r.qualityLink)}`);
say(`フッターの /about 文言: ${JSON.stringify(r.footerAbout)} / /quality 文言: ${JSON.stringify(r.footerQuality)}`);
say(`フッターの区分: ${r.footerHeadings.join(" / ")}`);
// /terms /ads からの /about リンクと、フッターからの到達
for (const path of ["/terms", "/ads", "/quality", "/support", "/shinsei"]) {
  await page.goto(`${origin}${path}`); await page.waitForLoadState("networkidle");
  const links = await page.evaluate(() => ({
    body: [...document.querySelectorAll("main a[href^='/about']")].map((a) => `${a.getAttribute("href")}「${a.textContent.trim()}」`),
    footer: [...document.querySelectorAll(".site-footer a[href='/about'], footer a[href='/about']")].map((a) => a.textContent.trim()),
  }));
  const codes = [];
  for (const href of [...new Set([...links.body.map((l) => l.split("「")[0]), "/about"])]) codes.push(`${href}=${(await fetch(`${origin}${href.split("#")[0]}`)).status}`);
  say(`${path}: 本文の /about リンク ${JSON.stringify(links.body)} / フッター ${JSON.stringify(links.footer)} / status ${codes.join(", ")}`);
}
await page.goto(`${origin}/about`); await page.waitForLoadState("networkidle");
await page.screenshot({ path: "docs/verification/about-revert-2026-09-08/about-1400.png", fullPage: true });
const ctx2 = await browser.newContext({ viewport: { width: 390, height: 900 } }); const p2 = await ctx2.newPage();
await p2.goto(`${origin}/about`); await p2.waitForLoadState("networkidle");
say(`390px 横はみ出し: ${await p2.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)}px`);
await p2.screenshot({ path: "docs/verification/about-revert-2026-09-08/about-390.png", fullPage: true });
await browser.close();
writeFileSync("docs/verification/about-revert-2026-09-08/checks.txt", out.join("\n") + "\n");
