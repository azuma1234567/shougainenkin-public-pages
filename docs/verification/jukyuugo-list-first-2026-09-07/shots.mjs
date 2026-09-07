import { chromium } from "playwright";
const b = await chromium.launch({ headless: true, executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" });
for (const w of [1400, 390]) {
  const c = await b.newContext({ viewport: { width: w, height: 900 } }); const p = await c.newPage();
  await p.goto((process.argv[2] ?? "http://127.0.0.1:3000") + "/jukyuugo"); await p.waitForLoadState("networkidle");
  const over = await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  const order = await p.evaluate(() => [...document.querySelectorAll("h2")].map((h) => h.textContent.trim().slice(0, 18)));
  console.log(`${w}px: はみ出し ${over}px / h2 の順: ${order.join(" → ")} / hub-card ${await p.locator("a.hub-card").count()}枚`);
  await p.screenshot({ path: `docs/verification/jukyuugo-list-first-2026-09-07/jukyuugo-${w}.png`, fullPage: true });
  await c.close();
}
await b.close();
