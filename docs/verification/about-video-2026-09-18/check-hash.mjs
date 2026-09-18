// 2026-09-18 追加分: #t=<秒> での読み込み、目次の history.replaceState、書き起こしの2文、ポスター。
// node docs/verification/about-video-2026-09-18/check-hash.mjs http://localhost:3200
import { chromium } from "playwright";
import { writeFileSync } from "node:fs";
const origin = process.argv[2] ?? "http://localhost:3200";
const out = []; const say = (s) => { out.push(s); console.log(s); };
const browser = await chromium.launch({ headless: true, executablePath: process.env.CHROME_PATH || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" });
const isMp4 = (u) => u.includes("/video/about-intro.mp4");
async function pressNativePlay(page) {
  const video = page.locator("#about-intro");
  const box = await video.boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.waitForTimeout(400);
  await page.mouse.click(box.x + 24, box.y + box.height - 47);
}
const state = (page) => page.evaluate(() => {
  const v = document.getElementById("about-intro"); const r = v.getBoundingClientRect();
  return { t: Math.round(v.currentTime * 10) / 10, paused: v.paused, ready: v.readyState, inView: r.top >= 0 && r.bottom <= window.innerHeight, top: Math.round(r.top), scrollY: Math.round(window.scrollY), hash: location.hash, historyLength: history.length };
});

// A. /about#t=375 で開く: 動画が画面内、開始位置 375、止まったまま、mp4 は押すまで読まない → 押すと 375 から再生
for (const width of [1400, 390]) {
  const ctx = await browser.newContext({ viewport: { width, height: 900 } });
  const page = await ctx.newPage();
  const mp4 = []; page.on("request", (r) => { if (isMp4(r.url())) mp4.push(r.url()); });
  await page.goto(`${origin}/about#t=375`); await page.waitForLoadState("networkidle"); await page.waitForTimeout(800);
  const s = await state(page);
  say(`A. ${width}px /about#t=375: 画面内=${s.inView}(上端 ${s.top}px、scrollY ${s.scrollY}) / 開始位置 ${s.t}s / 停止中=${s.paused} / mp4 のリクエスト ${mp4.length} 件`);
  await pressNativePlay(page); await page.waitForTimeout(3000);
  const p = await state(page);
  say(`A. ${width}px 再生ボタンを押す: currentTime ${p.t}s 再生中=${!p.paused} / mp4 のリクエスト ${mp4.length} 件`);
  await ctx.close();
}
// B. 不正な値は無視する(シークもスクロールもしない)
for (const hash of ["#t=9999", "#t=abc", "#t=-5", "#ad-promises"]) {
  const ctx = await browser.newContext({ viewport: { width: 1400, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(`${origin}/about${hash}`); await page.waitForLoadState("networkidle"); await page.waitForTimeout(600);
  const s = await state(page);
  say(`B. /about${hash}: 開始位置 ${s.t}s / 動画が画面内=${s.inView} / scrollY ${s.scrollY}`);
  await ctx.close();
}
// C. 目次を押すと URL が #t=<秒> になり、履歴は増えない
{
  const ctx = await browser.newContext({ viewport: { width: 1400, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(`${origin}/about`); await page.waitForLoadState("networkidle");
  const before = await state(page);
  const rows = [];
  for (const [i, at] of [[1, 45], [4, 375], [6, 690]]) {
    await page.locator(".about-video-chapters button").nth(i).click();
    await page.waitForTimeout(1500);
    const s = await state(page);
    rows.push(`${at}s → hash ${s.hash} / 履歴 ${s.historyLength} / currentTime ${s.t}s 再生中=${!s.paused}`);
  }
  say(`C. 目次を押す(最初の履歴 ${before.historyLength}、hash「${before.hash}」): ${rows.join(" | ")}`);
  await page.reload(); await page.waitForLoadState("networkidle"); await page.waitForTimeout(800);
  const r = await state(page);
  say(`C. 押したあと再読み込み: hash ${r.hash} / 開始位置 ${r.t}s / 動画が画面内=${r.inView} / 停止中=${r.paused}`);
  await ctx.close();
}
// D. 書き起こしの2文、リンク、電話番号、「あなた」、構造化データの平文
{
  const ctx = await browser.newContext({ viewport: { width: 1400, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(`${origin}/about`); await page.waitForLoadState("networkidle");
  const d = await page.evaluate(() => {
    const tr = document.querySelector(".about-video-transcript");
    const text = tr.textContent;
    const links = [...tr.querySelectorAll("a")].map((a) => `${a.textContent}→${a.getAttribute("href")}`);
    const main = document.querySelector("main").innerText;
    const ld = JSON.parse(document.querySelector('script[type="application/ld+json"]').textContent)["@graph"].find((n) => n["@type"] === "VideoObject").transcript;
    return {
      gaiyou: (text.match(/概要欄/g) ?? []).length, phone: text.includes("番号は0570-064-556です。受付の曜日と時間は、都道府県によって違います。"),
      site: text.includes("全部、無料です。どちらも、このサイトの中にあります。"), links,
      anataMain: (main.match(/あなた/g) ?? []).length, anataTranscript: (text.match(/あなた/g) ?? []).length,
      ldGaiyou: (ld.match(/概要欄/g) ?? []).length, ldPhone: ld.includes("0570-064-556"), ldBrackets: /\[|\]\(/.test(ld),
    };
  });
  say(`D. 書き起こし: 「概要欄」${d.gaiyou} / 電話番号の文=${d.phone} / サイトの文=${d.site} / 文中リンク ${d.links.length} 本 ${d.links.join(", ")}`);
  for (const l of d.links) { const href = l.split("→")[1]; say(`D. ${href}: ${(await fetch(`${origin}${href}`)).status}`); }
  say(`D. 「あなた」: /about の本文 ${d.anataMain}(うち書き起こし ${d.anataTranscript}。直していない)`);
  say(`D. 構造化データの transcript: 「概要欄」${d.ldGaiyou} / 電話番号=${d.ldPhone} / リンク記法の残り=${d.ldBrackets}`);
  await ctx.close();
}
// E. ポスター
{
  const res = await fetch(`${origin}/img/about/intro-poster.webp`);
  const buf = Buffer.from(await res.arrayBuffer());
  const w = buf.readUIntLE(26, 2) & 0x3fff, h = buf.readUIntLE(28, 2) & 0x3fff;
  say(`E. ポスター: ${res.status} / ${buf.length} bytes / ${buf.toString("ascii", 12, 16)} ${w}×${h}`);
}
await browser.close();
writeFileSync("docs/verification/about-video-2026-09-18/checks-hash.txt", out.join("\n") + "\n");
