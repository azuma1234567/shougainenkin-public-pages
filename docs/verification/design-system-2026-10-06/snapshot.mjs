#!/usr/bin/env node
/* 代表 12 ページ × 375/1280px のフルページスクリーンショット(docs/design-system-2026-10-06-instructions.md「守ること」)。
 *   node docs/verification/design-system-2026-10-06/snapshot.mjs http://localhost:3210 before
 *   node docs/verification/design-system-2026-10-06/snapshot.mjs http://localhost:3210 after
 * 出力: docs/verification/design-system-2026-10-06/shots/<before|after>/<name>-<width>.png
 * 動きは止めて(animations: disabled)、フォントの読み込みを待ってから撮る。 */
import { mkdirSync } from "node:fs";
import { chromium } from "playwright";

const origin = (process.argv[2] ?? "http://localhost:3210").replace(/\/$/, "");
const label = process.argv[3] ?? "before";
export const PAGES = [
  ["top", "/"],
  ["hajimete", "/hajimete"],
  ["columns-shinsatsu-mae-memo", "/columns/shinsatsu-mae-memo"],
  ["columns-moushitatesho-kikan-kugiri", "/columns/moushitatesho-kikan-kugiri"],
  ["columns-kougin-nenkin-tedori", "/columns/kougin-nenkin-tedori"],
  ["gokai-chokin-ga-aru", "/gokai/chokin-ga-aru"],
  ["jitsurei", "/jitsurei"],
  ["dougu-moushitatesho", "/dougu/moushitatesho"],
  ["byoki-utsu-soukyoku", "/byoki/utsu-soukyoku"],
  ["nayami-fushikyu", "/nayami/fushikyu"],
  ["support", "/support"],
  ["about", "/about"],
  /* 候補 6(--platform-line を使う一覧の目次)のために 2026-10-06 に追加。13 ページ目 */
  ["columns", "/columns"],
];
export const WIDTHS = [375, 1280];
const dir = `docs/verification/design-system-2026-10-06/shots/${label}`;
mkdirSync(dir, { recursive: true });

const browser = await chromium.launch();
for (const width of WIDTHS) {
  const context = await browser.newContext({ viewport: { width, height: 900 }, deviceScaleFactor: 1, reducedMotion: "reduce" });
  const page = await context.newPage();
  for (const [name, path] of PAGES) {
    await page.goto(origin + path, { waitUntil: "networkidle" });
    /* /about の <video> は再生位置の描画(再生ボタンの数ピクセル)が撮るたびに揺れるので隠す。CSS の検査には関係ない。 */
    await page.addStyleTag({ content: "video { visibility: hidden !important; }" });
    await page.evaluate(async () => { await document.fonts.ready; window.scrollTo(0, 0); });
    await page.waitForTimeout(300);
    await page.screenshot({ path: `${dir}/${name}-${width}.png`, fullPage: true, animations: "disabled", caret: "hide" });
    console.log(`${label} ${name} ${width}`);
  }
  await context.close();
}
await browser.close();
