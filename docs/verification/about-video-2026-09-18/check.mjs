// §5 の 2・4・5・7 と、印刷・HTML の条件。node docs/verification/about-video-2026-09-18/check.mjs http://localhost:3200
import { chromium } from "playwright";
import { writeFileSync } from "node:fs";
const origin = process.argv[2] ?? "http://localhost:3200";
const dir = "docs/verification/about-video-2026-09-18";
const out = []; const say = (s) => { out.push(s); console.log(s); };
const browser = await chromium.launch({ headless: true, executablePath: process.env.CHROME_PATH || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" });
const isMp4 = (u) => u.includes("/video/about-intro.mp4");
/* ネイティブのコントロールの再生ボタンを押す(コントロールはシャドウ DOM なので、位置で押す)。
   Chrome のコントロールバーの再生ボタンは、動画の左下から 24px・下端から 47px のところにある。 */
async function pressNativePlay(page) {
  const video = page.locator("#about-intro");
  await video.scrollIntoViewIfNeeded();
  const box = await video.boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.waitForTimeout(400);
  await page.mouse.click(box.x + 24, box.y + box.height - 47);
}

// 0. サーバーから返る HTML(JS なしで見える形)
{
  const html = await (await fetch(`${origin}/about`)).text();
  const video = html.match(/<video[^>]*>/)?.[0] ?? "";
  say(`0. <video> タグ: ${video}`);
  say(`0. preload="none"=${/preload="none"/.test(video)} / controls=${/\bcontrols\b/.test(video)} / playsinline=${/playsinline/i.test(video)} / width=1280 height=720=${/width="1280"/.test(video) && /height="720"/.test(video)} / autoplay・muted・loop=${/autoplay|muted|loop/.test(video) ? "あり" : "なし"} / <track>=${/<track/.test(html) ? "あり" : "なし"}`);
  say(`0. 書き起こしが閉じた状態で HTML に入っている: details=${/<details class="about-video-transcript">/.test(html)} / 冒頭の文=${html.includes("場所は、本屋の心理学の棚の前でした。")} / 最後の文=${html.includes("ここまで聞いてくれて、ありがとうございました。")} / details に open 属性=${/<details class="about-video-transcript" open/.test(html) ? "あり" : "なし"}`);
}

// 2. 初回読み込みで mp4 へのリクエスト 0、再生ボタンを押して初めて 206
{
  const ctx = await browser.newContext({ viewport: { width: 1400, height: 900 } });
  const page = await ctx.newPage();
  const mp4 = [];
  page.on("response", (r) => { if (isMp4(r.url())) mp4.push(r.status()); });
  page.on("request", (r) => { if (isMp4(r.url())) mp4.push("req"); });
  await page.goto(`${origin}/about`); await page.waitForLoadState("networkidle"); await page.waitForTimeout(1500);
  say(`2. 初回読み込み: about-intro.mp4 へのリクエスト ${mp4.filter((x) => x === "req").length} 件`);
  const poster = await page.evaluate(() => performance.getEntriesByType("resource").filter((e) => e.name.includes("intro-poster.webp")).map((e) => Math.round(e.transferSize)));
  say(`2. ポスター画像の読み込み: ${poster.length} 件(転送 ${poster.join(",")} bytes)`);
  await pressNativePlay(page);
  await page.waitForTimeout(3000);
  const st = await page.evaluate(() => { const v = document.getElementById("about-intro"); return { paused: v.paused, t: Math.round(v.currentTime * 10) / 10, ready: v.readyState }; });
  say(`2. 再生ボタンを押したあと: リクエスト ${mp4.filter((x) => x === "req").length} 件 / 応答 ${JSON.stringify([...new Set(mp4.filter((x) => x !== "req"))])} / 再生中=${!st.paused} currentTime=${st.t} readyState=${st.ready}`);
  await ctx.close();
}

// 4. 目次の7つのボタン: その時間へ飛んで再生が始まる
{
  const ctx = await browser.newContext({ viewport: { width: 1400, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(`${origin}/about`); await page.waitForLoadState("networkidle");
  const buttons = page.locator(".about-video-chapters button");
  const n = await buttons.count();
  const errors = [];
  page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
  const rows = [];
  for (let i = 0; i < n; i += 1) {
    const label = (await buttons.nth(i).innerText()).replace(/\s+/g, " ").trim();
    const at = Number((await page.evaluate((i) => document.querySelectorAll(".about-video-chapters button")[i].querySelector(".about-video-time").textContent, i)).split(":").reduce((m, s) => m * 60 + Number(s), 0));
    await buttons.nth(i).click();
    let st = null;
    for (let k = 0; k < 40; k += 1) {
      await page.waitForTimeout(250);
      st = await page.evaluate(() => { const v = document.getElementById("about-intro"); return { paused: v.paused, t: v.currentTime }; });
      if (!st.paused && st.t >= at && st.t < at + 5) break;
    }
    const ok = !st.paused && st.t >= at && st.t < at + 5;
    rows.push(ok);
    say(`4. 「${label}」: 目標 ${at}s → currentTime ${st.t.toFixed(1)}s 再生中=${!st.paused} ${ok ? "○" : "×"}`);
  }
  say(`4. ${rows.filter(Boolean).length} / ${n} 本が、その時間へ飛んで再生を始めた。コンソールのエラー ${errors.length} 件`);
  await ctx.close();
}

// 5. JavaScript を切った状態
{
  const ctx = await browser.newContext({ viewport: { width: 1400, height: 900 }, javaScriptEnabled: false });
  const page = await ctx.newPage();
  const mp4 = [];
  page.on("response", (r) => { if (isMp4(r.url())) mp4.push(r.status()); });
  await page.goto(`${origin}/about`); await page.waitForLoadState("load");
  const chapterText = await page.locator(".about-video-chapters li").allTextContents();
  say(`5. JS なし: 目次 ${chapterText.length} 行 → ${chapterText.map((s) => s.replace(/\s+/g, " ").trim()).join(" / ")}`);
  const summary = page.locator(".about-video-transcript summary");
  const before = await page.locator(".about-video-transcript p").first().isVisible();
  await summary.click();
  const after = await page.locator(".about-video-transcript p").first().isVisible();
  say(`5. JS なし: 書き起こし 閉じた状態で本文が見える=${before} → summary を押したあと見える=${after}`);
  await pressNativePlay(page);
  await page.waitForTimeout(3000);
  say(`5. JS なし: 再生ボタンを押したあとの mp4 の応答 ${JSON.stringify([...new Set(mp4)])}(206 なら再生のために読み込んでいる)`);
  await ctx.close();
}

// 7. 390 / 1400 で横スクロールなし・動画がはみ出さない、印刷
for (const width of [1400, 390]) {
  const ctx = await browser.newContext({ viewport: { width, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(`${origin}/about`); await page.waitForLoadState("networkidle");
  const r = await page.evaluate(() => {
    const v = document.getElementById("about-intro").getBoundingClientRect();
    const main = document.querySelector("main").getBoundingClientRect();
    return { scrollX: document.documentElement.scrollWidth - document.documentElement.clientWidth, vw: Math.round(v.width), vh: Math.round(v.height), left: Math.round(v.left), right: Math.round(v.right), mainRight: Math.round(main.right), viewport: window.innerWidth, ratio: (v.width / v.height).toFixed(3) };
  });
  say(`7. ${width}px: 横はみ出し ${r.scrollX}px / 動画 ${r.vw}×${r.vh}(比 ${r.ratio})、左 ${r.left} 右 ${r.right}(画面幅 ${r.viewport}) はみ出し=${r.right > r.viewport || r.left < 0 ? "あり" : "なし"}`);
  await page.locator("#about-intro").scrollIntoViewIfNeeded();
  await page.evaluate(() => window.scrollBy(0, -120));
  await page.screenshot({ path: `${dir}/about-video-${width}.png` });
  await page.emulateMedia({ media: "print" });
  const p = await page.evaluate(() => ({
    video: getComputedStyle(document.querySelector(".about-video")).display,
    chapters: getComputedStyle(document.querySelector(".about-video-chapters")).display,
    open: document.querySelector(".about-video-transcript").open,
    firstPara: document.querySelector(".about-video-transcript p").checkVisibility(),
    lastPara: [...document.querySelectorAll(".about-video-transcript p")].at(-1).checkVisibility(),
  }));
  say(`7. ${width}px 印刷: 動画 display=${p.video} / 目次 display=${p.chapters} / 書き起こしは閉じたまま(open=${p.open})で 最初の段落 見える=${p.firstPara} 最後の段落 見える=${p.lastPara}`);
  await ctx.close();
}
await browser.close();
writeFileSync(`${dir}/checks.txt`, out.join("\n") + "\n");
