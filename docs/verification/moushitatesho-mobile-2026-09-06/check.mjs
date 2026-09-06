// 申立書ページのスマホの左右余白(20px)を実測する。
//   node docs/verification/moushitatesho-mobile-2026-09-06/check.mjs http://127.0.0.1:3000
import { chromium } from "playwright";
import { writeFileSync } from "node:fs";
import { SAMPLES } from "../../../scripts/verify-moushitatesho/samples.mjs";
const STORAGE_KEY = "shougainenkin-note:moushitatesho:v3";
const origin = process.argv[2] ?? "http://127.0.0.1:3000";
const dir = "docs/verification/moushitatesho-mobile-2026-09-06";
const chrome = process.env.CHROME_PATH || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const browser = await chromium.launch({ headless: true, executablePath: chrome });
const out = []; const say = (s) => { out.push(s); console.log(s); };
const TARGETS = {
  "/dougu/moushitatesho": [["パンくず", "nav.p-breadcrumb"], ["h1", "h1"], ["リード", ".mt-page-lead"], ["白いパネル", ".mt-panel"], ["下の説明 h2", ".mt-about h2"], ["下の説明 本文", ".mt-about p"]],
  "/dougu/moushitatesho/insatsu": [["操作欄", ".mt-print-controls"], ["操作欄の中身", ".mt-print-controls > *"]],
};
for (const width of [390, 720]) {
  for (const [path, targets] of Object.entries(TARGETS)) {
    const ctx = await browser.newContext({ viewport: { width, height: 900 } });
    const page = await ctx.newPage();
    /* 印刷ページは下書きが無いと入力へ戻るので、検証用の下書き(samples.mjs の minimal)を先に置く */
    if (path.endsWith("/insatsu")) {
      await page.goto(`${origin}/dougu/moushitatesho`);
      await page.evaluate(([k, v]) => localStorage.setItem(k, v), [STORAGE_KEY, JSON.stringify(SAMPLES.minimal)]);
    }
    await page.goto(`${origin}${path}`); await page.waitForLoadState("networkidle");
    if (path.endsWith("/insatsu")) await page.locator(".mt-print-controls").waitFor();
    const r = await page.evaluate((targets) => {
      const w = document.documentElement.clientWidth;
      const rows = targets.map(([name, sel]) => {
        const els = [...document.querySelectorAll(sel)].filter((e) => e.getBoundingClientRect().width > 0);
        if (els.length === 0) return `${name}: (無し)`;
        const left = Math.min(...els.map((e) => e.getBoundingClientRect().left)), right = Math.max(...els.map((e) => e.getBoundingClientRect().right));
        return `${name}: left=${left.toFixed(1)} right=${(w - right).toFixed(1)} ${left >= 20 && w - right >= 20 ? "○" : "×"}`;
      });
      const tool = document.querySelector(".mt-tool, .mt-print-controls");
      return { w, rows, scroll: document.documentElement.scrollWidth, boxSizing: tool ? getComputedStyle(tool).boxSizing : "", pad: tool ? getComputedStyle(tool).paddingInline || getComputedStyle(tool).paddingLeft : "" };
    }, targets);
    say(`${width}px ${path}: viewport ${r.w} scrollWidth ${r.scroll} ${r.scroll === r.w ? "(横はみ出しなし)" : "(横スクロールあり)"} / .mt-tool box-sizing=${r.boxSizing} padding=${r.pad}\n   ${r.rows.join("\n   ")}`);
    await page.screenshot({ path: `${dir}/${path.replace(/\//g, "_").slice(1)}-${width}.png`, fullPage: true });
    await ctx.close();
  }
}
await browser.close();
writeFileSync(`${dir}/checks.txt`, out.join("\n") + "\n");
