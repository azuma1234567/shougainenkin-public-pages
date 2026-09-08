// §3 の 2〜8。node --import ./scripts/lib/ts-alias.mjs docs/verification/analytics-optout-2026-09-08/check.mjs http://127.0.0.1:3000
// GA へ実データを送らないよう、/g/collect は 204 で受け止めて件数だけ数える。
import { chromium } from "playwright";
import { writeFileSync } from "node:fs";
import { emptyState } from "../../../data/moushitatesho/types.ts";
const origin = process.argv[2] ?? "http://127.0.0.1:3000";
const dir = "docs/verification/analytics-optout-2026-09-08";
const out = []; const say = (s) => { out.push(s); console.log(s); };
const browser = await chromium.launch({ headless: true, executablePath: process.env.CHROME_PATH || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" });

async function newPage({ denied = false, granted = false, width = 1400 } = {}) {
  const ctx = await browser.newContext({ viewport: { width, height: 900 } });
  const collect = []; const gtagJs = [];
  /* 数えるのは ctx の request(キャッシュや sendBeacon も見えるため)。
     実データを GA に送らないよう、collect だけ 204 で受け止める。 */
  ctx.on("request", (r) => {
    const url = r.url();
    if (/g\/collect/.test(url)) collect.push(url);
    if (/googletagmanager\.com\/gtag\/js/.test(url)) gtagJs.push(url);
  });
  await ctx.route(/g\/collect/, (route) => route.fulfill({ status: 204, body: "" }));
  const page = await ctx.newPage();
  if (denied || granted) {
    await page.goto(`${origin}/privacy`);
    await page.evaluate((v) => window.localStorage.setItem("analytics-consent-v1", v), denied ? "denied" : "granted");
    collect.length = 0; gtagJs.length = 0;
  }
  return { ctx, page, collect, gtagJs };
}
/* GA4 は2回目以降のヒットをまとめて送る(数秒遅れる)ので、collect が増えるまで待つ。
   増えないことを確かめる場合も、同じだけ待ってから 0 を確認する。 */
const settle = async (page, collect, expect) => {
  await page.waitForLoadState("networkidle");
  const deadline = Date.now() + 12000;
  while (Date.now() < deadline) {
    await page.waitForTimeout(300);
    if (expect !== undefined && collect.length >= expect) break;
  }
  await page.waitForTimeout(500);
};

// 2. localStorage 空: バナー無し。collect がページごとに1回
{
  const { ctx, page, collect, gtagJs } = await newPage();
  await page.goto(`${origin}/`); await settle(page, collect, 1);
  const banner = await page.locator(".analytics-consent-banner, [role=dialog]").count();
  say(`2. 空の状態で / を開く: バナー要素 ${banner} 個 / gtag/js ${gtagJs.length} 本 / collect ${collect.length} 回`);
  const afterFirst = collect.length;
  await page.click('a[href="/privacy"]'); await settle(page, collect, 2);
  say(`2. クライアント遷移で /privacy へ: collect が ${afterFirst} → ${collect.length} 回(遷移で +${collect.length - afterFirst})`);
  await page.goto(`${origin}/about`); await settle(page, collect, 3);
  say(`2. さらに /about を開く: collect ${collect.length} 回(累計)。ページごと1回=${collect.length === 3}`);
  say(`2. localStorage: ${JSON.stringify(await page.evaluate(() => window.localStorage.getItem("analytics-consent-v1")))}(未設定のまま計測している)`);
  await ctx.close();
}
// 3. denied
{
  const { ctx, page, collect, gtagJs } = await newPage({ denied: true });
  await page.goto(`${origin}/`); await settle(page, collect);
  await page.goto(`${origin}/privacy`); await settle(page, collect);
  const label = (await page.locator(".analytics-preference-button").textContent())?.trim();
  const scriptTag = await page.locator('script#google-analytics-gtag, script[src*="googletagmanager.com/gtag/js"]').count();
  say(`3. denied で2ページ開く: gtag/js の読み込み ${gtagJs.length} 本 / script タグ ${scriptTag} 個 / collect ${collect.length} 回 / ボタン「${label}」`);
  await ctx.close();
}
// 4. 計測中に「停止する」
{
  const { ctx, page, collect } = await newPage();
  await page.goto(`${origin}/privacy`); await settle(page, collect, 1);
  const before = await page.context().cookies();
  const gaBefore = before.filter((c) => c.name === "_ga" || c.name.startsWith("_ga_")).map((c) => c.name);
  await page.click(".analytics-preference-button");
  await settle(page, collect);
  const gaAfter = (await page.context().cookies()).filter((c) => c.name === "_ga" || c.name.startsWith("_ga_")).map((c) => c.name);
  const stored = await page.evaluate(() => window.localStorage.getItem("analytics-consent-v1"));
  const n = collect.length;
  await page.goto(`${origin}/`); await settle(page, collect);
  say(`4. 停止する: Cookie ${JSON.stringify(gaBefore)} → ${JSON.stringify(gaAfter)} / localStorage=${stored} / 押したあと〜次のページで collect 増分 ${collect.length - n}`);
  await page.goto(`${origin}/privacy`); await settle(page, collect);
  say(`4. 停止後の /privacy: ボタン「${(await page.locator(".analytics-preference-button").textContent())?.trim()}」 collect 累計 ${collect.length}`);
  await ctx.close();
}
// 5. 停止中に「再開する」
{
  const { ctx, page, collect } = await newPage({ denied: true });
  await page.goto(`${origin}/privacy`); await settle(page, collect);
  say(`5. 再開する前: ボタン「${(await page.locator(".analytics-preference-button").textContent())?.trim()}」 collect ${collect.length}`);
  await page.click(".analytics-preference-button");
  await settle(page, collect, 1);
  const stored = await page.evaluate(() => window.localStorage.getItem("analytics-consent-v1"));
  say(`5. 再開する: localStorage=${stored} / collect ${collect.length} 回 / ボタン「${(await page.locator(".analytics-preference-button").textContent())?.trim()}」`);
  await ctx.close();
}
// 6. /privacy 第5条の本文
{
  const { ctx, page } = await newPage();
  await page.goto(`${origin}/privacy`); await settle(page, [], 0);
  const text = (await page.locator("main").innerText()).replace(/\s+/g, "");
  const must = [
    "Googleアナリティクスによって外部へ送信される情報は、次のものです。",
    "閲覧したページのURLとページの題名、参照元のURL",
    "閲覧日時、サイト内での滞在時間や操作の回数",
    "ブラウザとOSの種類、画面の大きさ、言語設定",
    "IPアドレスから推定されるおおよその地域(市区町村まで。IPアドレス自体は保存しません)",
    "Googleアナリティクスが発行する識別子(Cookie)",
    "送信先はGoogleLLCで、利用目的は本サイトの利用状況の把握と、記事や導線の改善です。",
    "広告の配信や、広告のための個人の特定には使いません(広告関連のCookieは既定で無効にしています)。",
    "アクセス解析は、既定で有効です。停止したい場合は、下のボタンからいつでも止められます。",
    "停止すると、Googleアナリティクスのタグを読み込まず、通信も行いません。すでに保存されているCookieも削除します。",
    "選択はこのブラウザに保存され、あとから再開することもできます。",
    "このボタンのほかに、Googleアナリティクスオプトアウトアドオン(上のリンク)や、ブラウザのCookieの設定でも停止できます。",
  ].map((s) => s.replace(/\s+/g, ""));
  const missing = must.filter((s) => !text.includes(s));
  say(`6. /privacy 第5条: §2-2 の文 ${must.length} 本中、無いもの ${missing.length}${missing.length ? " → " + missing.join(" / ") : ""}`);
  await ctx.close();
}
// 6b. 公開ページに「同意バナー」「同意する」が残っていないか
{
  const { ctx, page } = await newPage();
  const pages = ["/", "/privacy", "/terms", "/ads", "/about", "/quality", "/support", "/shinsei", "/app", "/app/privacy", "/app/terms"];
  const hits = [];
  for (const path of pages) {
    await page.goto(`${origin}${path}`); await page.waitForLoadState("domcontentloaded");
    const t = await page.locator("main").innerText();
    for (const word of ["同意バナー", "同意する", "拒否する"]) if (t.includes(word)) hits.push(`${path}: ${word}`);
  }
  say(`6b. 公開 ${pages.length} ページの本文に「同意バナー」「同意する」「拒否する」: ${hits.length} 件${hits.length ? " → " + hits.join(", ") : ""}`);
  await ctx.close();
}
// 7. 印刷でボタンが出ない
{
  const { ctx, page } = await newPage();
  await page.goto(`${origin}/privacy`); await settle(page, [], 0);
  await page.emulateMedia({ media: "print" });
  const printed = await page.evaluate(() => { const b = document.querySelector(".analytics-preference-button"); return b ? getComputedStyle(b).display : "(要素なし)"; });
  say(`7. /privacy を印刷メディアで: ボタンの display=${printed}`);
  await page.emulateMedia({ media: "screen" });
  /* 印刷ページは下書きが無いと入力画面へ戻るので、空の下書きを1つ入れてから開く。 */
  await page.goto(`${origin}/dougu/moushitatesho`); await page.waitForLoadState("networkidle");
  await page.evaluate((s) => window.localStorage.setItem("shougainenkin-note:moushitatesho:v3", s), JSON.stringify(emptyState()));
  await page.goto(`${origin}/dougu/moushitatesho/insatsu`); await page.waitForLoadState("networkidle"); await page.waitForTimeout(1500);
  await page.emulateMedia({ media: "print" });
  const r = await page.evaluate(() => ({
    url: location.pathname,
    printPage: !!document.querySelector(".mt-print-page"),
    button: document.querySelectorAll(".analytics-preference-button").length,
    banner: document.querySelectorAll(".analytics-consent-banner").length,
    footer: getComputedStyle(document.querySelector("footer.site-footer")).display,
    fixedVisible: [...document.querySelectorAll("body *")].filter((el) => getComputedStyle(el).position === "fixed" && getComputedStyle(el).display !== "none").map((el) => el.className || el.tagName),
  }));
  say(`7. 申立書の印刷ページ(${r.url})を印刷メディアで: .mt-print-page=${r.printPage} / オプトアウトのボタン ${r.button} 個 / バナー ${r.banner} 個 / フッター display=${r.footer} / 画面固定で見えている要素 ${JSON.stringify(r.fixedVisible)}`);
  await ctx.close();
}
// 8. 1400 / 390 のスクリーンショットと、下部の余白
for (const width of [1400, 390]) {
  const { ctx, page } = await newPage({ width });
  await page.goto(`${origin}/privacy`); await settle(page, [], 0);
  const r = await page.evaluate(() => ({
    scrollX: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    banner: document.querySelectorAll(".analytics-consent-banner, [role=dialog]").length,
    fixed: [...document.querySelectorAll("body *")].filter((el) => getComputedStyle(el).position === "fixed" && el.getBoundingClientRect().height > 0).map((el) => el.className || el.tagName),
    footerBottomGap: Math.round(document.body.scrollHeight - document.querySelector("footer.site-footer").getBoundingClientRect().bottom - window.scrollY),
  }));
  say(`8. ${width}px /privacy: 横はみ出し ${r.scrollX}px / バナー ${r.banner} 個 / 画面固定の要素 ${JSON.stringify(r.fixed)} / フッター下の余白 ${r.footerBottomGap}px`);
  await page.screenshot({ path: `${dir}/privacy-${width}.png`, fullPage: true });
  await ctx.close();
}
await browser.close();
writeFileSync(`${dir}/checks.txt`, out.join("\n") + "\n");
