// /jitsurei?case=<id>: 該当事案のページが描かれ、開いた直後に画面内にあること(1400px / 390px)。絞り込みとの併用、無い id の扱い。
//   node docs/verification/jitsurei-case-2026-09-08/check.mjs http://127.0.0.1:3000
import { chromium } from "playwright";
import { writeFileSync } from "node:fs";
const origin = process.argv[2] ?? "http://127.0.0.1:3000";
const dir = "docs/verification/jitsurei-case-2026-09-08";
const out = []; const say = (s) => { out.push(s); console.log(s); };
const browser = await chromium.launch({ headless: true, executablePath: process.env.CHROME_PATH || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" });
const IDS = ["r04_05-06_04", "r06-07_01", "r07-07_02", "r06-03_05"];
async function probe(url, id, width) {
  const ctx = await browser.newContext({ viewport: { width, height: 900 } }); const page = await ctx.newPage();
  await page.goto(`${origin}${url}`); await page.waitForLoadState("networkidle"); await page.waitForTimeout(400);
  const r = await page.evaluate((id) => {
    const el = id ? document.getElementById(id) : null; const b = el?.getBoundingClientRect();
    const results = document.querySelector(".p-results")?.textContent ?? "";
    const header = document.querySelector("header.site-header")?.getBoundingClientRect().bottom ?? 0;
    /* 画面内 = sticky ヘッダーの下端より下から始まり、画面の下端より上にある */
    return { exists: !!el, top: b ? Math.round(b.top) : null, headerBottom: Math.round(header), inView: !!b && b.top >= header - 1 && b.top < window.innerHeight, results, firstId: document.querySelector(".p-grid[style] > div[id]")?.id, scrollY: Math.round(window.scrollY) };
  }, id);
  return { page, ctx, r };
}
for (const id of IDS) for (const w of [1400, 390]) {
  const { page, ctx, r } = await probe(`/jitsurei?case=${id}`, id, w);
  say(`${w}px /jitsurei?case=${id}: 要素あり=${r.exists} 画面内=${r.inView}(top ${r.top}px, ヘッダー下端 ${r.headerBottom}px, scrollY ${r.scrollY}) / ${r.results.trim()}`);
  if (w === 1400 || id === IDS[0]) await page.screenshot({ path: `${dir}/case-${id}-${w}.png` });
  await ctx.close();
}
// 絞り込みとの併用(legacy ?issue= と ?filter=)
for (const url of ["/jitsurei?issue=first-visit&case=r06-07_01", "/jitsurei?filter=accepted&case=r06-03_05", "/jitsurei?filter=first-visit&case=r06-03_05"]) {
  const id = url.split("case=")[1];
  const { ctx, r } = await probe(url, id, 1400);
  say(`併用 ${url}: 要素あり=${r.exists} 画面内=${r.inView} / ${r.results.trim()}`);
  await ctx.close();
}
// 無い id・id なし・page 指定
for (const url of ["/jitsurei?case=nope-01", "/jitsurei", "/jitsurei?page=2"]) {
  const { ctx, r } = await probe(url, null, 1400);
  say(`${url}: ${r.results.trim()} / 先頭の事案 ${r.firstId} / scrollY ${r.scrollY}`);
  await ctx.close();
}
// 記事側のリンク
const html = await (await fetch(`${origin}/columns/sharoushi-kawaranai-koto`)).text();
const links = [...html.matchAll(/href="(\/jitsurei[^"]*)"/g)].map((m) => m[1]);
const codes = []; for (const l of [...new Set(links)]) codes.push(`${l} → ${(await fetch(`${origin}${l}`)).status}`);
say(`記事の /jitsurei リンク: ${codes.join(" / ")} / #id の残り ${links.filter((l) => l.includes("#")).length}`);
await browser.close();
writeFileSync(`${dir}/checks.txt`, out.join("\n") + "\n");
