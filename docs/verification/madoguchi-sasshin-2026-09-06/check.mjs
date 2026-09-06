// /dougu/madoguchi 刷新の実ブラウザ検証(docs/kingaku-madoguchi-sasshin-2026-09-06-instructions.md B-2 の 3〜10)。
//   node docs/verification/madoguchi-sasshin-2026-09-06/check.mjs http://127.0.0.1:3000
import { chromium } from "playwright";
import { writeFileSync } from "node:fs";
const origin = process.argv[2] ?? "http://127.0.0.1:3000";
const dir = "docs/verification/madoguchi-sasshin-2026-09-06";
const chrome = process.env.CHROME_PATH || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const browser = await chromium.launch({ headless: true, executablePath: chrome });
const out = []; const say = (s) => { out.push(s); console.log(s); };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const url = `${origin}/dougu/madoguchi`;
async function open(width) {
  const ctx = await browser.newContext({ viewport: { width, height: 900 } });
  const page = await ctx.newPage();
  const requests = [];
  page.on("request", (r) => requests.push({ url: r.url(), type: r.resourceType(), method: r.method(), body: r.postData() }));
  await page.goto(url); await page.waitForLoadState("networkidle"); await sleep(400);
  return { ctx, page, requests };
}
async function search(page, q) { await page.fill("#md-search", ""); await page.fill("#md-search", q); await sleep(250); return page.locator(".md-hits button").allInnerTexts(); }
const office = (page) => page.locator(".md-office .md-n").first().innerText();
const stored = (page) => page.evaluate(() => { const o = {}; for (let i = 0; i < localStorage.length; i += 1) { const k = localStorage.key(i); o[k] = localStorage.getItem(k); } return o; });

{
  const { page, ctx, requests } = await open(1400);
  say(`13. title=${await page.title()} / h1=${await page.locator("h1").innerText()} / パンくず=${(await page.locator("nav.p-breadcrumb").innerText()).replace(/\s+/g, " ")}`);
  say(`9. 開いた直後の localStorage: ${JSON.stringify(await stored(page))}`);
  // 3. 検索
  for (const q of ["旭川", "世田谷", "堺", "大阪"]) { const hits = await search(page, q); say(`3. 「${q}」→ ${hits.length}件: ${hits.map((h) => h.replace(/\s+/g, " ")).join(" / ")}`); }
  say(`3. 「旭」(1文字・前方一致だけ)→ ${(await search(page, "旭")).map((h) => h.replace(/\s+/g, " ")).join(" / ")} / 「ぬぬぬ」→ ${(await search(page, "ぬぬぬ")).length}件・案内=${await page.locator("#md-search-note").innerText()}`);
  await search(page, "旭川"); await page.locator(".md-hits button").first().click(); await page.locator(".md-office").first().waitFor();
  say(`3. 旭川市を押した → 選んだ地名=${await page.locator(".md-picked-name").innerText()} / 事務所=${await office(page)} / 検索欄は畳まれた=${await page.locator("#md-search").count() === 0}`);
  const viaSearch = await stored(page);
  say(`9. 確定後の localStorage: ${JSON.stringify(viaSearch)}`);
  // 4. プルダウンで同じ code
  await page.locator(".md-change").click(); await page.locator("details.md-select-fold summary").click();
  await page.selectOption("#md-pref", "北海道"); await sleep(200);
  const value = await page.locator("#md-city option").filter({ hasText: /^旭川市$/ }).first().getAttribute("value");
  await page.selectOption("#md-city", value); await page.locator(".md-office").first().waitFor(); await sleep(200);
  const viaSelect = await stored(page);
  say(`4. プルダウンで 北海道→旭川市: code=${JSON.parse(viaSelect["shougainenkin-note:madoguchi:v1"]).code} / 検索の code=${JSON.parse(viaSearch["shougainenkin-note:madoguchi:v1"]).code} / 一致=${viaSelect["shougainenkin-note:madoguchi:v1"] === viaSearch["shougainenkin-note:madoguchi:v1"]} / 事務所=${await office(page)}`);
  // 5. あなた・黄色・電話で言うこと・窓口リンク
  const main = await page.locator(".md-page").innerText();
  const yellow = await page.evaluate(() => [...document.querySelectorAll(".md-page *")].filter((el) => getComputedStyle(el).backgroundColor === "rgb(253, 243, 221)").length);
  say(`5. あなた=${(main.match(/あなた/g) ?? []).length} 黄色の箱=${yellow} md-warnbox=${await page.locator(".md-warnbox").count()} / 電話で言うこと=${await page.locator(".md-say-lines li").count()}行: ${(await page.locator(".md-say-lines li").allInnerTexts()).join(" | ")}`);
  say(`5. 国民年金窓口の検索リンク: 文言=${await page.locator(".md-kokumin-link a").innerText()} href=${decodeURIComponent(await page.locator(".md-kokumin-link a").getAttribute("href"))}`);
  say(`6. 開所時間の行: ${(await page.locator("table.md-yoyaku tr", { hasText: "年金事務所の開所時間" }).innerText()).replace(/\s+/g, " ")}`);
  say(`8. 予約電話(表)=${await page.locator("table.md-yoyaku .md-tel").first().innerText()} href=${await page.locator("table.md-yoyaku .md-tel").first().getAttribute("href")}`);
  // 8. FAQ
  const ld = (await page.locator('script[type="application/ld+json"]').allInnerTexts()).map((t) => JSON.parse(t));
  const faq = ld.find((j) => j["@type"] === "FAQPage");
  say(`8. FAQPage ${faq ? faq.mainEntity.length : 0}問 / JSON-LD に <a: ${JSON.stringify(ld).includes("<a") ? "あり" : "0"} / 予約の答え=${faq.mainEntity[1].acceptedAnswer.text} / 静的本文の h2: ${(await page.locator(".md-static h2").allInnerTexts()).join("・")}`);
  // 厚年・国年で違う(横浜市南区)→ 薄い青
  await page.locator(".md-change").click(); await search(page, "横浜市南"); await page.locator(".md-hits button").first().click(); await page.locator(".md-office").first().waitFor(); await sleep(200);
  const noteBg = await page.locator("#md-h2 ~ .md-note").first().evaluate((el) => getComputedStyle(el).backgroundColor);
  say(`B-1-2. 横浜市南区: 帯=${(await page.locator("#md-h2 ~ .md-note").first().innerText()).slice(0, 40)}… 背景=${noteBg}`);
  // 7. 印刷: 街角が出ない、順番
  await page.emulateMedia({ media: "print" }); await sleep(200);
  const order = await page.evaluate(() => [...document.querySelectorAll(".md-picked-name, #md-h2, .md-where, #md-h4, .md-say-title, .md-fold > summary, .md-screen-only")].filter((e) => e.offsetParent !== null).map((e) => e.innerText.trim().slice(0, 14)));
  say(`7. 印刷に出る順: ${order.join(" → ")} / 街角が見える=${await page.locator(".md-screen-only:visible").count()}`);
  await page.screenshot({ path: `${dir}/print-preview-1400.png`, fullPage: true });
  await page.emulateMedia({ media: "screen" });
  const xhr = requests.filter((r) => ["xhr", "fetch", "websocket"].includes(r.type) && !/[?&]_rsc=/.test(r.url));
  say(`9. xhr/fetch(先読み以外)=${xhr.length} ${xhr.map((r) => r.url).join(" ")} / POST=${requests.filter((r) => r.method !== "GET").length} / localStorage のキー=${Object.keys(await stored(page)).join(",")}`);
  await page.locator(".md-change").click(); await sleep(100);
  await page.screenshot({ path: `${dir}/madoguchi-1400.png`, fullPage: true });
  await ctx.close();
}
{
  const { page, ctx } = await open(390);
  const over = () => page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  say(`10. 390px 入口 はみ出し=${await over()}px`);
  await page.screenshot({ path: `${dir}/madoguchi-390-top.png`, fullPage: true });
  await search(page, "堺"); await page.locator(".md-hits button").first().click(); await page.locator(".md-office").first().waitFor(); await sleep(200);
  say(`10. 390px 結果 はみ出し=${await over()}px / 事務所=${await office(page)}`);
  await page.screenshot({ path: `${dir}/madoguchi-390.png`, fullPage: true });
  await ctx.close();
}
await browser.close();
writeFileSync(`${dir}/checks.txt`, out.join("\n") + "\n");
