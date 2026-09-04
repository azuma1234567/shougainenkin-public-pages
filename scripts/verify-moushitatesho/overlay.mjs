/* 記入済みの紙を、公式PDFに 50% で重ねた画像を出す(設計 §9-3)。
     npm run build && node scripts/verify-moushitatesho/overlay.mjs
   出力は docs/verification/moushitatesho-youshiki-2026-09-04/png/ */
import { chromium } from "playwright";
import { execFileSync, spawn } from "node:child_process";
import { mkdirSync } from "node:fs";
import path from "node:path";
import { SAMPLES } from "./samples.mjs";

const PORT = process.env.MT_PORT ?? "3263";
const CHROME = process.env.CHROME_PATH || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const OUT = "docs/verification/moushitatesho-youshiki-2026-09-04/png";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

mkdirSync(OUT, { recursive: true });
try { execFileSync("bash", ["-c", `lsof -ti tcp:${PORT} | xargs -r kill`], { stdio: "ignore" }); } catch { /* 居なければよい */ }
await sleep(400);
const server = spawn("npm", ["run", "start", "--", "-p", PORT], { stdio: "ignore" });
for (let i = 0; i < 90; i += 1) {
  try { if ((await fetch(`http://127.0.0.1:${PORT}/dougu/moushitatesho/insatsu`)).ok) break; } catch { /* まだ */ }
  await sleep(1000);
}
const browser = await chromium.launch({ headless: true, executablePath: CHROME });
const made = [];

for (const [name, data] of Object.entries(SAMPLES)) {
  const ctx = await browser.newContext({ viewport: { width: 1300, height: 1000 }, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  await page.addInitScript((v) => { window.name = `moushitatesho:${JSON.stringify(v)}`; }, data);
  await page.goto(`http://127.0.0.1:${PORT}/dougu/moushitatesho/insatsu`);
  await page.getByLabel("A3原寸").check();
  await page.locator("[data-sheet]").first().waitFor();
  await page.emulateMedia({ media: "print" });
  await page.evaluate(() => document.fonts?.ready);
  await sleep(700);
  const sheets = await page.locator("[data-sheet]").all();
  for (let i = 0; i < sheets.length; i += 1) {
    const kind = await sheets[i].getAttribute("data-sheet");
    const file = path.join(OUT, `${name}-${i + 1}-${kind}.png`);
    await sheets[i].screenshot({ path: file });
    made.push({ file, kind });
  }
  await ctx.close();
}
await browser.close();
server.kill("SIGTERM");

/* 公式PDFに 50% で重ねる */
execFileSync(process.env.PYTHON ?? "python3", ["scripts/verify-moushitatesho/overlay.py"],
  { input: JSON.stringify(made), stdio: ["pipe", "inherit", "inherit"] });
