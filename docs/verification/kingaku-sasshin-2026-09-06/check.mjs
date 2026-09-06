// /dougu/kingaku 刷新の実ブラウザ検証(docs/kingaku-madoguchi-sasshin-2026-09-06-instructions.md A-4 の 3〜10)。
//   node docs/verification/kingaku-sasshin-2026-09-06/check.mjs http://127.0.0.1:3000
import { chromium } from "playwright";
import { writeFileSync } from "node:fs";
const origin = process.argv[2] ?? "http://127.0.0.1:3000";
const dir = "docs/verification/kingaku-sasshin-2026-09-06";
const chrome = process.env.CHROME_PATH || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const browser = await chromium.launch({ headless: true, executablePath: chrome });
const out = []; const say = (s) => { out.push(s); console.log(s); };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const url = `${origin}/dougu/kingaku`;
async function open(width, height = 900) {
  const ctx = await browser.newContext({ viewport: { width, height } });
  const page = await ctx.newPage();
  const requests = [];
  page.on("request", (r) => requests.push({ url: r.url(), type: r.type ? r.type() : r.resourceType(), method: r.method(), body: r.postData() }));
  await page.goto(url); await page.waitForLoadState("networkidle");
  return { ctx, page, requests };
}
const big = (page) => page.locator(".kg-big").innerText();
const esc = (t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const chip = (page, group, label) => page.locator(`[aria-labelledby="${group}"] button`, { hasText: new RegExp(`^${esc(label)}$`) }).click();
const total = (page) => page.locator("tr.kg-total td").innerText();
const rowAmount = (page, label) => page.locator("table.kg-br tr", { hasText: label }).locator("td").innerText();

// 3. 375px で開いた瞬間に 847,300 が画面内
{
  const { page, ctx } = await open(375, 667);
  const box = await page.locator(".kg-y").boundingBox();
  const vh = await page.evaluate(() => window.innerHeight);
  say(`3. 375×667: 年額の位置 top=${Math.round(box.y)} bottom=${Math.round(box.y + box.height)} / viewport ${vh} / スクロールなしで見える=${box.y + box.height <= vh} / 文字=${(await page.locator(".kg-y").innerText()).replace(/\s+/g, " ")}`);
  await page.screenshot({ path: `${dir}/top-375-firstview.png` });
  await page.screenshot({ path: `${dir}/kingaku-390.png`, fullPage: true });
  const over = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  say(`10. 375px 横はみ出し=${over}px`);
  await ctx.close();
}
// 4〜9
{
  const { page, ctx, requests } = await open(1400);
  say(`4. 既定: ${(await big(page)).replace(/\n/g, " | ")}`);
  await chip(page, "kg-grade-label", "1級"); await sleep(100);
  say(`4. 1級: ${(await page.locator(".kg-y").innerText()).replace(/\s+/g, " ")} / 合計=${await total(page)}`);
  await chip(page, "kg-grade-label", "2級");
  await chip(page, "kg-seido-label", "はい"); await sleep(100);
  say(`4. 厚生年金・未入力: caption=${await page.locator(".kg-caption").innerText()} / 配偶者の質問=${await page.locator('[aria-labelledby="kg-spouse-label"]').count()} / 折りたたみ open=${await page.locator("details.kg-fold").first().evaluate((d) => d.open)}`);
  await chip(page, "kg-salary-mode-label", "平均標準報酬額から(正確)");
  await page.fill("#kg-hyoujun", "300000"); await page.fill("#kg-tsuki", "120"); await sleep(150);
  say(`4. 厚生・月30万・120月・2級: 報酬比例=${await rowAmount(page, "報酬比例部分")} / 合計=${await total(page)} / 年額=${(await page.locator(".kg-y").innerText()).replace(/\s+/g, " ")} / flags=${(await page.locator(".kg-flag").allInnerTexts()).join("・")}`);
  // 5. 年収から
  await chip(page, "kg-salary-mode-label", "年収から(かんたん)"); await sleep(100);
  say(`5. 切替直後: 報酬比例=${await rowAmount(page, "報酬比例部分")}(もう一方の値を消した)`);
  await page.fill("#kg-nenshu", "3600000"); await sleep(150);
  say(`5. 年収 360万: hint=${await page.locator("#kg-nenshu ~ .kg-hintline").innerText()} / 報酬比例=${await rowAmount(page, "報酬比例部分")} / 合計=${await total(page)}`);
  // 3級
  await chip(page, "kg-grade-label", "3級"); await sleep(100);
  say(`A-2. 3級: いいえ disabled=${await page.locator('[aria-labelledby="kg-seido-label"] button', { hasText: "いいえ" }).isDisabled()} / hint=${await page.locator('[aria-labelledby="kg-seido-label"] ~ .kg-hintline').first().innerText()} / 合計=${await total(page)}`);
  await page.fill("#kg-nenshu", ""); await sleep(100);
  say(`A-2. 3級・未入力: caption=${await page.locator(".kg-caption").innerText()} / 年額=${(await page.locator(".kg-y").innerText()).replace(/\s+/g, " ")}`);
  await chip(page, "kg-grade-label", "2級"); await chip(page, "kg-seido-label", "いいえ");
  await chip(page, "kg-kids-label", "3人以上"); await sleep(100);
  say(`A-2. 3人以上: 子の加算=${await rowAmount(page, "子の加算")} / hint=${await page.locator('[aria-labelledby="kg-kids-label"] ~ .kg-hintline').first().innerText()}`);
  await chip(page, "kg-kids-label", "いない");
  await chip(page, "kg-seido-label", "わからない"); await sleep(100);
  say(`A-2. わからない: caption=${await page.locator(".kg-caption").innerText()} / 合計=${await total(page)}`);
  await chip(page, "kg-seido-label", "いいえ");
  // 6. さかのぼり
  await page.locator("details.kg-fold").nth(1).locator("summary").click();
  await page.fill("#kg-shoshin", "2023-01"); await sleep(150);
  say(`6. 初診日 2023-01: 認定日=${await page.inputValue("#kg-nintei")} / ${(await page.locator("details.kg-fold").nth(1).locator(".kg-note").innerText()).replace(/\n/g, " ")}`);
  await page.fill("#kg-shoshin", "2015-01"); await sleep(150);
  say(`6. 初診日 2015-01: 認定日=${await page.inputValue("#kg-nintei")} / ${(await page.locator("details.kg-fold").nth(1).locator(".kg-note").innerText()).replace(/\n/g, " ")}`);
  await page.fill("#kg-shoshin", "2026-01"); await sleep(150);
  say(`6. 初診日 2026-01(認定日が未来): note=${await page.locator("details.kg-fold").nth(1).locator(".kg-note").count()} / hint=${await page.locator("details.kg-fold").nth(1).locator(".kg-hintline").last().innerText()}`);
  await page.fill("#kg-shoshin", "2023-01"); await sleep(100);
  // 7. 準備中・あなた・黄色
  const main = await page.locator("main, .kg-page").first().innerText();
  const yellow = await page.evaluate(() => [...document.querySelectorAll(".kg-page *")].filter((el) => { const bg = getComputedStyle(el).backgroundColor; return bg === "rgb(253, 243, 221)"; }).length);
  say(`7. 準備中=${(main.match(/準備中/g) ?? []).length} あなた=${(main.match(/あなた/g) ?? []).length} 黄色の箱=${yellow} kg-warnbox=${await page.locator(".kg-warnbox").count()}`);
  // 8. 加入月数
  say(`8. 加入月数の説明: ${await page.locator("#kg-tsuki ~ .kg-hintline").textContent()} / 「初診日の前月」=${(main.match(/初診日の前月/g) ?? []).length}`);
  // 9. 静的の表と FAQ
  const cells = await page.locator("table.kg-amounts tr").allInnerTexts();
  const ld = (await page.locator('script[type="application/ld+json"]').allInnerTexts()).map((t) => JSON.parse(t));
  const faq = ld.find((j) => j["@type"] === "FAQPage");
  say(`9. 静的の表: ${cells.map((c) => c.replace(/\s+/g, " ")).join(" / ")}`);
  say(`9. FAQPage ${faq ? faq.mainEntity.length : 0}問 / JSON-LD に <a: ${JSON.stringify(ld).includes("<a") ? "あり" : "0"} / 本文の FAQ dt=${await page.locator(".kg-static dt").count()}`);
  say(`13. title=${await page.title()} / h1=${await page.locator("h1").innerText()} / パンくず=${(await page.locator("nav.p-breadcrumb").innerText()).replace(/\s+/g, " ")}`);
  const xhr = requests.filter((r) => ["xhr", "fetch", "websocket"].includes(r.type) && !/[?&]_rsc=/.test(r.url));
  say(`11. xhr/fetch(先読み以外)=${xhr.length} ${xhr.map((r) => r.url).join(" ")} / POST=${requests.filter((r) => r.method !== "GET").length}`);
  await page.screenshot({ path: `${dir}/kingaku-1400.png`, fullPage: true });
  await ctx.close();
}
await browser.close();
writeFileSync(`${dir}/checks.txt`, out.join("\n") + "\n");
