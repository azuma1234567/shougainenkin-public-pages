// 「主治医に見せる1枚」を実際に印刷して、A4 1枚に収まるか・何が載るかを測る
// (docs/mitate-sasshin-2026-09-06-instructions.md §5-11)。
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

async function run({ name, mode, guides, withGrade }) {
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto(`http://127.0.0.1:${PORT}/dougu/mitate${mode === "A" ? "?mode=shindansho" : ""}`);
  await page.getByRole("button", { name: "はじめる" }).click();
  for (const v of ABILITY) { await page.locator(".mi-answer-list button").nth(v - 1).click(); await sleep(40); }
  await page.locator(".mi-answer-list button").nth(2).click();         // 程度(3)
  await page.locator(".mi-answer-list button").first().click();        // 診断名
  await page.locator(".mi-gt").waitFor();
  for (let i = 0; i < guides; i += 1) await page.locator(".mi-guide-btn").nth(i).click();  // 総合評価の行を押す
  if (withGrade) await page.locator(".mi-print-opt input").check();

  await page.emulateMedia({ media: "print" });
  await page.evaluate(() => document.fonts?.ready);
  await sleep(300);

  // 印刷メディアでの版面。画面の結果が消え、主治医に見せる1枚だけが出ているか。
  const layout = await page.evaluate((contentMm) => {
    const perPx = (96 / 25.4) * contentMm;                       // 1ページ分の高さ(px)
    const main = document.querySelector(".mi-main");
    const top = main.getBoundingClientRect().top + window.scrollY;
    const rel = (el) => {
      const r = el.getBoundingClientRect();
      return { top: r.top + window.scrollY - top, bottom: r.bottom + window.scrollY - top };
    };
    const visible = (sel) => [...document.querySelectorAll(sel)].filter((el) => el.offsetParent !== null).length;
    const table = rel(document.querySelector(".mi-ds-table"));
    const mm = (px) => +(px / (96 / 25.4)).toFixed(1);
    return {
      screenResultVisible: visible(".mi-result-heading,.mi-result-section,.mi-result-actions,.mi-calm-note"),
      sheetVisible: visible(".mi-doctor-sheet"),
      hasSource: visible(".mi-ds-src") === 1,
      hasPrintHead: visible(".mi-printhead") === 1,
      answerRows: [...document.querySelectorAll(".mi-ds-table tbody td")].filter((td) => td.textContent.trim() !== "").length,
      hitsPrinted: document.querySelectorAll(".mi-ds-line li").length,
      contentMm: mm(main.getBoundingClientRect().height),
      tableStartPage: Math.floor(table.top / perPx) + 1,
      tableEndPage: Math.floor((table.bottom - 1) / perPx) + 1,
    };
  }, A4_CONTENT_MM);

  const file = path.join(work, `${name}.pdf`);
  await page.pdf({ path: file, format: "A4", printBackground: true, preferCSSPageSize: true, margin: { top: "0", right: "0", bottom: "0", left: "0" } });
  const info = JSON.parse(execFileSync(PY, ["-c", `import fitz,sys,json;d=fitz.open(sys.argv[1]);print(json.dumps({"pages":d.page_count,"text":"".join(p.get_text() for p in d)}))`, file], { encoding: "utf8" }));
  const gradeInPdf = /[1-3１-３]級|非該当/.test(info.text);
  await context.close();
  return { name, mode, guides, withGrade, pages: info.pages, gradeInPdf, ...layout };
}

const cases = [];
cases.push(await run({ name: "modeA-guides0", mode: "A", guides: 0, withGrade: false }));
cases.push(await run({ name: "modeB-guides3", mode: "B", guides: 3, withGrade: false }));
cases.push(await run({ name: "modeB-guides7-grade", mode: "B", guides: 7, withGrade: true }));
await browser.close();
server.kill("SIGTERM");

const result = { generatedAt: new Date().toISOString(), a4ContentMm: A4_CONTENT_MM, cases };
writeFileSync(out, `${JSON.stringify(result, null, 1)}\n`);
for (const c of cases) {
  console.log(`${c.name}: ${c.pages}ページ / 内容 ${c.contentMm}mm / 答え ${c.answerRows}行 / 押した項目 ${c.hitsPrinted}件 / 等級の文字 ${c.gradeInPdf} / 画面の結果 ${c.screenResultVisible}`);
}
