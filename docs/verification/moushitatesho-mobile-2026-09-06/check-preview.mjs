// 390px の印刷プレビューで、縮めた用紙が画面内(左の余白 20px の内側)から始まり、横スクロールが無いことを実測する。
//   node --import ./scripts/lib/ts-alias.mjs docs/verification/moushitatesho-mobile-2026-09-06/check-preview.mjs http://127.0.0.1:3000
import { chromium } from "playwright";
import { appendFileSync } from "node:fs";
import { SAMPLES } from "../../../scripts/verify-moushitatesho/samples.mjs";
const origin = process.argv[2] ?? "http://127.0.0.1:3000";
const dir = "docs/verification/moushitatesho-mobile-2026-09-06";
const chrome = process.env.CHROME_PATH || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const browser = await chromium.launch({ headless: true, executablePath: chrome });
const out = [];
for (const [width, name] of [[390, "minimal"], [390, "typical"], [720, "minimal"]]) {
  const ctx = await browser.newContext({ viewport: { width, height: 900 } }); const page = await ctx.newPage();
  await page.goto(`${origin}/dougu/moushitatesho`);
  await page.evaluate(([k, v]) => localStorage.setItem(k, v), ["shougainenkin-note:moushitatesho:v3", JSON.stringify(SAMPLES[name])]);
  await page.goto(`${origin}/dougu/moushitatesho/insatsu`); await page.locator(".mt-print-controls").waitFor(); await page.waitForTimeout(800);
  const r = await page.evaluate(() => {
    const de = document.documentElement;
    const papers = [...document.querySelectorAll(".mt-paper")].map((e) => { const b = e.getBoundingClientRect(); return { left: Math.round(b.left), right: Math.round(b.right), top: Math.round(b.top + window.scrollY), w: Math.round(b.width) }; });
    const stage = document.querySelector(".mt-preview-stage");
    return { vw: de.clientWidth, scroll: de.scrollWidth, papers, stageJustify: getComputedStyle(stage).justifyContent, stageLeft: Math.round(stage.getBoundingClientRect().left) };
  });
  const ok = r.papers.every((p) => p.left >= 20 && p.right <= r.vw) && r.scroll === r.vw;
  const line = `${width}px(${name}): 用紙 ${r.papers.length}枚 left=${[...new Set(r.papers.map((p) => p.left))].join("/")} right=${[...new Set(r.papers.map((p) => p.right))].join("/")} 幅=${r.papers[0]?.w} / stage left=${r.stageLeft} justify=${r.stageJustify} / scrollWidth ${r.scroll} = viewport ${r.vw} ${r.scroll === r.vw ? "(横スクロール 0)" : "(横スクロールあり)"} → ${ok ? "○" : "×"}`;
  console.log(line); out.push(line);
  await page.screenshot({ path: `${dir}/dougu_moushitatesho_insatsu-preview-${width}-${name}.png`, fullPage: true });
  await page.locator(".mt-paper").first().scrollIntoViewIfNeeded();
  await page.screenshot({ path: `${dir}/dougu_moushitatesho_insatsu-preview-${width}-${name}-viewport.png` });
  await ctx.close();
}
await browser.close();
appendFileSync(`${dir}/checks.txt`, "\n# 印刷プレビューの用紙(2つ目の直し)\n" + out.join("\n") + "\n");
