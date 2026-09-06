/* 申立書ツールの、様式の位置以外の完了条件(設計 §14 / 指示書2 §3)。
     npm run build && node scripts/verify-moushitatesho/verify.mjs
   位置の検証は scripts/verify-moushitatesho-layout.mjs のほう。
   2026-09-04 に v2 用へ書き直した(旧版は v1 のデータと旧クラス名を前提にしていた)。 */
import { chromium } from "playwright";
import { execFileSync, spawn } from "node:child_process";
import { readFileSync } from "node:fs";
import { SAMPLES } from "./samples.mjs";

const PORT = process.env.MT_PORT ?? "3261";
const CHROME = process.env.CHROME_PATH || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const TOOL_URL = `http://127.0.0.1:${PORT}/dougu/moushitatesho`;
const PRINT_URL = `${TOOL_URL}/insatsu`;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const SOURCES = [
  "components/tools/MoushitateshoTool.tsx", "components/tools/MoushitateshoPrint.tsx",
  "components/tools/MoushitateshoSheet.tsx", "components/tools/MoushitateshoCapacity.tsx",
  "lib/moushitatesho-storage.ts", "lib/moushitatesho-sheets.ts", "lib/moushitatesho-tel.ts",
  "lib/wareki.ts", "data/moushitatesho/types.ts", "data/moushitatesho/layout.ts",
  "app/dougu/moushitatesho/page.tsx", "app/dougu/moushitatesho/insatsu/page.tsx",
];
const src = (f) => readFileSync(f, "utf8");
const stripComments = (t) => t.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/(^|[^:])\/\/[^\n]*/g, "$1 ");

const results = [];
const check = (id, label, fn) => {
  try { results.push({ id, label, ok: true, note: fn() ?? "" }); }
  catch (e) { results.push({ id, label, ok: false, note: e.message.split("\n")[0] }); }
};
const fail = (m) => { throw new Error(m); };

try { execFileSync("bash", ["-c", `lsof -ti tcp:${PORT} | xargs -r kill`], { stdio: "ignore" }); } catch { /* 居なければよい */ }
await sleep(400);
const server = spawn("npm", ["run", "start", "--", "-p", PORT], { stdio: "ignore" });
let ready = false;
for (let i = 0; i < 90; i += 1) {
  try { if ((await fetch(TOOL_URL)).ok) { ready = true; break; } } catch { /* まだ */ }
  await sleep(1000);
}
if (!ready) { server.kill("SIGTERM"); throw new Error("検証用サーバーが起動しない"); }
const browser = await chromium.launch({ headless: true, executablePath: CHROME });

/* 1. 外部へ何も送らない */
const network = [];
{
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  page.on("request", (r) => {
    const u = r.url();
    network.push({ method: r.method(), url: u, body: r.postData() || "",
      /* 2026-09-05 に全ページへ入れた AdSense の読み込み。道具の入力とは無関係だが、入力文字が乗っていないかは下で全通信を見る */
      ads: /googlesyndication\.com|doubleclick\.net|adtrafficquality\.google|google\.com\/recaptcha/.test(u),
      /* 同じサーバーの静的ファイル・ページ自身・画面遷移の先読みは「送信」ではない。
         入力が外へ出ているかは、URL と本文に入力文字列が乗っているかで見る。 */
      sameOriginStatic: u.startsWith(`http://127.0.0.1:${PORT}/`)
        && (/\/_next\//.test(u) || /\.(png|svg|ico|jpg|css|js|woff2?)($|\?)/.test(u)
            || /[?&]_rsc=/.test(u) || u.split("?")[0] === TOOL_URL || u.split("?")[0] === `${TOOL_URL}/`
            || u.split("?")[0] === PRINT_URL) });
  });
  await page.addInitScript((v) => {
    try { localStorage.setItem("shougainenkin-note:moushitatesho:v3", JSON.stringify(v)); } catch { /* 無くても動く */ }
  }, SAMPLES.typical);
  await page.goto(TOOL_URL);
  await page.getByRole("button", { name: "続きから" }).click().catch(() => {});
  await sleep(500);
  /* 印刷画面まで行って、そこでも通信を見る */
  await page.goto(PRINT_URL);
  await sleep(1200);
  await ctx.close();
}
check(1, "外部へ何も送らない", () => {
  const BAD = ["fetch(", "XMLHttpRequest", "sendBeacon", "WebSocket", "EventSource", "new Image(", "<form"];
  for (const f of SOURCES) {
    const code = stripComments(src(f));
    for (const b of BAD) if (code.includes(b)) fail(`${f} に ${b}`);
  }
  const outside = network.filter((n) => !n.sameOriginStatic && !n.ads);
  if (outside.length) fail(`同じサーバーの静的ファイル・広告以外への通信 ${outside.length}件: ${outside.slice(0, 3).map((n) => n.method + " " + n.url).join(" / ")}`);
  const posts = network.filter((n) => n.method !== "GET" || n.body);
  if (posts.length) fail(`本文つき・GET以外の通信 ${posts.length}件`);
  /* 入力した文字が URL や本文に乗っていないか */
  const secrets = ["うつ病", "年金 太郎", "さくら病院", "1234-5678", "西新宿"];
  for (const n of network) {
    const hay = decodeURIComponent(n.url) + n.body;
    for (const w of secrets) if (hay.includes(w)) fail(`入力「${w}」が ${n.url} に乗っている`);
  }
  const ads = network.filter((n) => n.ads).length;
  return `ソース ${SOURCES.length}本に送信コード0 / 通信 ${network.length}件は同じサーバーの静的ファイル ${network.length - ads}件と全ページ共通の広告 ${ads}件(いずれも GET・本文なし)で、入力文字は乗っていない`;
});

/* 2. 期間が6つ以上で続紙へ自動で送られる */
{
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  await page.addInitScript((v) => { window.name = `moushitatesho:${JSON.stringify(v)}`; }, SAMPLES.seven);
  await page.goto(PRINT_URL);
  await page.getByLabel("A3原寸").check();
  await page.locator("[data-sheet]").first().waitFor();
  await sleep(400);
  const sheets = await page.evaluate(() => [...document.querySelectorAll("[data-sheet]")].map((e) => e.dataset.sheet));
  const seq = await page.evaluate(() => [...document.querySelectorAll('[data-sheet="cont-front"] .mt-slot-digits')].map((e) => e.textContent));
  await ctx.close();
  const has = sheets.includes("cont-front");
  results.push({ id: 2, label: "期間が6つ以上になると続紙へ自動で送られる", ok: has,
    note: has ? `紙: ${sheets.join(" / ")} / 続紙の数字 ${seq.join(",")}` : `続紙が出ない(${sheets.join(",")})` });
}

/* 3〜9 はブラウザで一気に見る */
{
  const ctx = await browser.newContext({ viewport: { width: 375, height: 800 } });
  const page = await ctx.newPage();
  await page.goto(TOOL_URL);
  await page.getByRole("button", { name: "はじめる" }).click();
  await sleep(300);

  const wide = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
  results.push({ id: 6, label: "375px で横スクロールが出ない", ok: !wide,
    note: wide ? "横スクロールが出ている" : "scrollWidth = clientWidth" });

  /* 3. 入力の気づきが消えていない */
  const notices = ["この期間は5年を超えています", "発病より前から始まっています", "開始の月は空欄のままでも進めます"];
  const toolSrc = src("components/tools/MoushitateshoTool.tsx");
  check(3, "入力の気づき(期間の3つ+収まらない知らせ)が消えていない", () => {
    for (const n of notices) if (!toolSrc.includes(n)) fail(`「${n}」が無い`);
    if (!toolSrc.includes("Capacity")) fail("収まらない欄の知らせが無い");
    if (!src("components/tools/MoushitateshoCapacity.tsx").includes("この枠に収まりません")) fail("収まらない文言が無い");
    return `期間の気づき3つ + 各欄の「収まりません」`;
  });

  /* 4. localStorage に保存され、読み直しで戻る。
     2026-09-06 に v3 の画面へ合わせた: 最初の画面は 傷病名(text)→ 発病日・初診日(date と「日は分からない」)。
     はじめる → 入力 → 印刷まで通しで動くことを、年月日あり / 日は分からない の2ケースで見る。 */
  const { MAIN_FRONT } = await import("../../data/moushitatesho/layout.ts");
  const readDate = (row) => page.evaluate((r) => {
    const find = (slot) => [...document.querySelectorAll('[data-sheet="main-front"] .mt-slot-digits')]
      .find((e) => e.style.left === `${slot.cx}mm` && e.style.top === `${slot.cy}mm`)?.textContent ?? "";
    return { year: find(r.year), month: find(r.month), day: find(r.day) };
  }, row);
  const savedV3 = () => page.evaluate(() => localStorage.getItem("shougainenkin-note:moushitatesho:v3"));

  await page.evaluate(() => { localStorage.clear(); });
  await page.reload();
  await page.getByRole("button", { name: "はじめる" }).click();
  await page.locator(".mt-fields input").first().fill("テスト傷病");
  await page.locator('input[type="date"]').nth(0).fill("2020-01-15");
  await page.locator('input[type="date"]').nth(1).fill("2020-06-15");
  await sleep(900);
  const saved = await savedV3();
  await page.reload();
  await sleep(600);
  const resumed = await page.getByText("前回の続きがあります", { exact: false }).count();
  check(4, "localStorage に保存され、開き直すと続きから書ける", () => {
    if (!saved) fail("v3 のキーに保存されていない");
    const v = JSON.parse(saved);
    if (v.byoumei !== "テスト傷病") fail("傷病名が保存されていない");
    if (v.hatsubyou !== "2020-01-15" || v.shoshin !== "2020-06-15") fail(`年月日が保存されていない(${v.hatsubyou} / ${v.shoshin})`);
    if (!resumed) fail("開き直しても「前回の続き」が出ない");
    return "傷病名・発病日 2020-01-15・初診日 2020-06-15 を v3 のキーに保存 / 再訪で続きから";
  });

  /* 4.1 年月日あり → 紙に 令和2年1月15日 / 令和2年6月15日 */
  await page.goto(PRINT_URL);
  await page.locator('[data-sheet="main-front"]').first().waitFor();
  await sleep(500);
  const withDay = { hatsubyou: await readDate(MAIN_FRONT.hatsubyou), shoshin: await readDate(MAIN_FRONT.shoshin) };
  check(4.1, "発病日 2020-01-15・初診日 2020-06-15 が紙に 令和2年1月15日 / 令和2年6月15日 で出る", () => {
    const want = (d, m) => d.year === "2" && d.month === m && d.day === "15";
    if (!want(withDay.hatsubyou, "1")) fail(`発病日 ${JSON.stringify(withDay.hatsubyou)}`);
    if (!want(withDay.shoshin, "6")) fail(`初診日 ${JSON.stringify(withDay.shoshin)}`);
    return `発病日 {年 ${withDay.hatsubyou.year}, 月 ${withDay.hatsubyou.month}, 日 ${withDay.hatsubyou.day}} / 初診日 {年 ${withDay.shoshin.year}, 月 ${withDay.shoshin.month}, 日 ${withDay.shoshin.day}}`;
  });

  /* 4.2 「日は分からない」→ 保存は YYYY-MM、紙の日欄が空欄 */
  await page.goto(TOOL_URL);
  await page.getByRole("button", { name: "続きから" }).click();
  await page.locator(".mt-datefield .mt-check input").nth(0).check();
  await page.locator(".mt-datefield .mt-check input").nth(1).check();
  await sleep(900);
  const savedNoDay = JSON.parse((await savedV3()) ?? "{}");
  await page.goto(PRINT_URL);
  await page.locator('[data-sheet="main-front"]').first().waitFor();
  await sleep(500);
  const noDay = { hatsubyou: await readDate(MAIN_FRONT.hatsubyou), shoshin: await readDate(MAIN_FRONT.shoshin) };
  check(4.2, "「日は分からない」で年月だけ保存され、紙の日欄が空欄になる", () => {
    if (savedNoDay.hatsubyou !== "2020-01" || savedNoDay.shoshin !== "2020-06") fail(`保存が年月でない(${savedNoDay.hatsubyou} / ${savedNoDay.shoshin})`);
    const want = (d, m) => d.year === "2" && d.month === m && d.day === "";
    if (!want(noDay.hatsubyou, "1")) fail(`発病日 ${JSON.stringify(noDay.hatsubyou)}`);
    if (!want(noDay.shoshin, "6")) fail(`初診日 ${JSON.stringify(noDay.shoshin)}`);
    return `保存 2020-01 / 2020-06 → 紙の日欄 "" / ""(年 2・月 1 / 年 2・月 6 は出る)`;
  });
  await page.goto(TOOL_URL);
  await page.getByRole("button", { name: "続きから" }).click();
  await sleep(300);

  /* 8・9. 出してはいけない言葉 */
  const bodyText = await page.evaluate(() => document.body.innerText);
  check(8, "「様式第120号の4」が画面にも紙にも無い", () => {
    for (const f of SOURCES) if (src(f).includes("様式第120号の4")) fail(`${f} にある`);
    if (bodyText.includes("様式第120号の4")) fail("画面に出ている");
    return "ソース・画面とも0件";
  });
  check(9, "判定・評価・攻略の語が無い", () => {
    const WORDS = ["判定します", "あなたは○級", "評価します", "攻略", "通りやすく", "有利になります"];
    for (const f of SOURCES) for (const w of WORDS) if (src(f).includes(w)) fail(`${f} に「${w}」`);
    for (const w of WORDS) if (bodyText.includes(w)) fail(`画面に「${w}」`);
    return `${WORDS.length}語とも0件`;
  });
  await ctx.close();
}

/* 5. JSON の書き出し→読み込みで往復する */
{
  const { normalize } = await import("../../lib/moushitatesho-storage.ts");
  const round = normalize(JSON.parse(JSON.stringify(SAMPLES.typical)));
  const same = JSON.stringify(round) === JSON.stringify(normalize(JSON.parse(JSON.stringify(round))));
  results.push({ id: 5, label: "JSON の書き出し→読み込みで往復して一致する", ok: same,
    note: same ? "typical を書き出して読み直しても同じ" : "往復で変わる" });
}

/* 7. キーボードだけで印刷まで行ける */
{
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  await page.goto(TOOL_URL);
  let reached = false;
  for (let i = 0; i < 400; i += 1) {
    await page.keyboard.press("Tab");
    const el = await page.evaluate(() => {
      const a = document.activeElement;
      return { tag: a?.tagName, text: (a?.textContent || "").trim().slice(0, 20), href: a?.getAttribute?.("href") };
    });
    const isPrintLink = (e) => e.href === "/dougu/moushitatesho/insatsu";
    if (isPrintLink(el)) { reached = true; break; }
    if (el.text === "はじめる" || el.text === "次へ" || el.text === "続きから") {
      await page.keyboard.press("Enter");
      await sleep(250);
      /* 最後の画面は印刷リンクに自動でフォーカスが移る。Tab で通り過ぎる前に見る */
      const after = await page.evaluate(() => ({ href: document.activeElement?.getAttribute?.("href") }));
      if (isPrintLink(after)) { reached = true; break; }
    }
  }
  await ctx.close();
  results.push({ id: 7, label: "キーボードだけで印刷まで到達できる", ok: reached,
    note: reached ? "Tab と Enter だけで印刷プレビューのリンクに到達" : "400回の Tab で印刷まで届かなかった" });
}

await browser.close();
server.kill("SIGTERM");

const ok = results.every((r) => r.ok);
console.log("# 申立書ツール 設計 §14 の完了条件(v2)\n");
for (const r of results.sort((a, b) => a.id - b.id)) console.log(`${r.ok ? "○" : "×"} ${r.id}. ${r.label}\n   ${r.note}`);
if (!ok) process.exitCode = 1;
