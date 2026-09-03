// 結果画面を実際に印刷して、A4 何枚になるかを測る(§13-13)。
// 目安表がページ境界で割れていないかも、印刷メディアでの版面位置から見る。
//   npm run build && node scripts/verify-mitate/print.mjs
// 結果は scripts/verify-mitate/fixtures/print.json。verify.mjs の #13 がこれを読む。
import { chromium } from "playwright";
import { execFileSync, spawn } from "node:child_process";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

const PORT = process.env.MITATE_PORT ?? "3210";
const PY = process.env.PYTHON ?? "python3";
const chrome = process.env.CHROME_PATH || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const out = path.join(process.cwd(), "scripts/verify-mitate/fixtures/print.json");
const work = mkdtempSync(path.join(tmpdir(), "mitate-print-"));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const server = spawn("npm", ["run", "start", "--", "-p", PORT], { cwd: process.cwd(), stdio: "ignore" });
let ready = false;
for (let i = 0; i < 60; i += 1) {
  try { if ((await fetch(`http://127.0.0.1:${PORT}/dougu/mitate`)).ok) { ready = true; break; } } catch { /* まだ */ }
  await sleep(1000);
}
if (!ready) { server.kill("SIGTERM"); throw new Error("検証用サーバーが起動しない"); }

const browser = await chromium.launch({ headless: true, executablePath: chrome, args: ["--font-render-hinting=none"] });
const A4_CONTENT_MM = 297 - 12 * 2; // @page margin 12mm

// 判定7項目の値 → 平均2.71 / 程度(3) → 「2級又は3級」
const ABILITY = [2, 2, 3, 3, 3, 3, 3];

async function run({ name, mode, guides }) {
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto(`http://127.0.0.1:${PORT}/dougu/mitate`);
  await page.getByRole("button", { name: "はじめる" }).click();
  await page.locator(".mi-opt").first().click();                       // 精神の障害
  await page.getByRole("button", { name: "次へ" }).click();
  await page.locator(".mi-opt").nth(mode === "B" ? 1 : 0).click();      // モード
  await page.getByRole("button", { name: "次へ" }).click();
  for (const v of ABILITY) { await page.locator(".mi-opt").nth(v - 1).click(); await sleep(80); }
  await page.locator(".mi-opt").nth(2).click();                        // 程度(3)
  await sleep(150);
  for (let i = 0; i < guides; i += 1) { await page.locator(".mi-opt").nth(i).click(); await sleep(60); }
  await page.getByRole("button", { name: "目安を見る" }).click();
  await page.locator(".mi-gt").waitFor();

  await page.emulateMedia({ media: "print" });
  await page.evaluate(() => document.fonts?.ready);
  await sleep(300);

  // 印刷メディアでの版面。落としたカードが消えているか、表がどのページに載るか。
  const layout = await page.evaluate((contentMm) => {
    const perPx = (96 / 25.4) * contentMm;                       // 1ページ分の高さ(px)
    const main = document.querySelector(".mi-main");
    const top = main.getBoundingClientRect().top + window.scrollY;
    const rel = (el) => {
      const r = el.getBoundingClientRect();
      return { top: r.top + window.scrollY - top, bottom: r.bottom + window.scrollY - top };
    };
    const table = rel(document.querySelector("table.mi-gt"));
    const mm = (px) => +(px / (96 / 25.4)).toFixed(1);
    return {
      screenOnlyVisible: [...document.querySelectorAll(".mi-screen-only")].filter((el) => el.offsetParent !== null).length,
      cardsOnPrint: [...document.querySelectorAll(".mi-card")].filter((el) => el.offsetParent !== null).map((el) => el.querySelector("h2")?.textContent),
      hasSource: !!document.querySelector(".mi-src") && document.querySelector(".mi-src").offsetParent !== null,
      hasPrintHead: !!document.querySelector(".mi-printhead") && document.querySelector(".mi-printhead").offsetParent !== null,
      contentMm: mm(main.getBoundingClientRect().height),
      tableStartPage: Math.floor(table.top / perPx) + 1,
      tableEndPage: Math.floor((table.bottom - 1) / perPx) + 1,
      tableHeightMm: mm(table.bottom - table.top),
    };
  }, A4_CONTENT_MM);

  const file = path.join(work, `${name}.pdf`);
  await page.pdf({ path: file, format: "A4", printBackground: true, preferCSSPageSize: true, margin: { top: "0", right: "0", bottom: "0", left: "0" } });
  const pages = Number(execFileSync(PY, ["-c", `import fitz,sys;print(fitz.open(sys.argv[1]).page_count)`, file], { encoding: "utf8" }).trim());
  await context.close();
  return { name, mode, guides, pages, ...layout };
}

const cases = [];
cases.push(await run({ name: "modeA-guides0", mode: "A", guides: 0 }));
cases.push(await run({ name: "modeB-guides2", mode: "B", guides: 2 }));
cases.push(await run({ name: "modeB-guides6", mode: "B", guides: 6 }));  // 引用は最大6件
await browser.close();
server.kill("SIGTERM");

const result = { generatedAt: new Date().toISOString(), a4ContentMm: A4_CONTENT_MM, cases };
writeFileSync(out, `${JSON.stringify(result, null, 1)}\n`);
for (const c of cases) {
  console.log(`${c.name}: ${c.pages}ページ / 内容 ${c.contentMm}mm / 目安表 ${c.tableStartPage}〜${c.tableEndPage}ページ目(${c.tableHeightMm}mm) / 印刷に残るカード ${c.cardsOnPrint.length}`);
}
