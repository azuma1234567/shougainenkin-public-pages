#!/usr/bin/env node
/* サイトの構造(ナビ・被リンク・パンくず・アプリ導線・道具の配置)の検査。
 * docs/site-structure-2026-09-05-instructions.md §8。
 *
 *   node scripts/verify-site-graph.mjs http://localhost:3205
 *
 * 1  sitemap の全 URL が / から3クリック以内
 * 2  ハブ・誤解・コラム・道具が、ナビと一覧ページ以外から2本以上リンクされている
 * 3  孤立 URL(被リンク0)が無い
 * 4  ヘッダー8項目とフッター4区分が指示書の表と一致・古い区分名が残っていない
 * 5  BreadcrumbList の item がすべて 200・表示と JSON-LD の経路が同じ
 * 6  apple-itunes-app が指定の7 URL にだけある
 * 7  道具カードが指定の場所にある・同じページに同じ道具のカードが2枚出ていない
 * 8  ヘッダーの aria-current が正しく付く
 * 9  390px で横スクロールが無い
 * 10 内部リンク切れが無い
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { parse } from "node-html-parser";
import { chromium } from "playwright";

const origin = process.argv[2] ?? process.env.VERIFY_ORIGIN ?? "http://localhost:3205";
const out = "docs/verification/site-structure-2026-09-05";
mkdirSync(out, { recursive: true });

const results = [];
const failures = (number, label) => {
  const errors = [];
  return {
    check: (condition, message) => { if (!condition) errors.push(message); },
    finish: (count = "") => results.push({ number, label, ok: errors.length === 0, count, errors }),
  };
};

/* ---------- 指示書 §1・§2 の表 ---------- */
const HEADER = [
  ["/hajimete", "はじめての方へ"], ["/shinsei", "申請の流れ"], ["/byoki", "病気別"],
  ["/joukyou", "状況別"], ["/nayami", "困りごと別"], ["/okane", "お金"],
  ["/jitsurei", "実例と数字"], ["/columns", "コラム"],
];
const FOOTER = [
  ["病気・状況・困りごと別", ["/byoki", "/joukyou", "/nayami", "/dougu/mitate", "/erabu"]],
  ["申請の進め方", ["/hajimete", "/shinsei", "/dougu/shorui", "/dougu/madoguchi", "/dougu/moushitatesho", "/gokai", "/columns", "/yougo"]],
  ["お金と数字", ["/dougu/kingaku", "/okane", "/jitsurei", "/suuji"]],
  ["このサイトについて", ["/about", "/quality", "/support", "/privacy", "/terms", "/ads", "/app", "/app/terms"]],
];
const OLD_LABELS = ["探す", "読む", "道具", "悩みから", "病気から", "状況から"];
const APP_BANNER_URLS = ["/", "/app", "/dougu/mitate", "/dougu/kingaku", "/dougu/shorui", "/dougu/madoguchi", "/dougu/moushitatesho"];
/* 被リンクを数えるとき、入口として除く一覧ページ(検査2)。 */
const LIST_PAGES = new Set(["/", "/byoki", "/joukyou", "/nayami", "/okane", "/erabu", "/gokai", "/columns"]);

/* ---------- sitemap ---------- */
const sitemap = await (await fetch(`${origin}/sitemap.xml`)).text();
const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)]
  .map((m) => m[1].replace(/^https?:\/\/[^/]+/, ""))
  .map((p) => (p === "" ? "/" : p));
const known = new Set(urls);

/* ---------- 全ページを読む ---------- */
const pages = new Map();
for (const url of urls) {
  const response = await fetch(`${origin}${url}`);
  const html = await response.text();
  const root = parse(html.replaceAll("<!-- -->", ""));
  /* ヘッダー・フッター・パンくずの中にあるリンクは、被リンクの数から外す(検査2)。
     同じ URL が本文にもある場合は本文のぶんを数えたいので、要素をたどって判断する。 */
  const inChrome = (node) => {
    for (let el = node.parentNode; el; el = el.parentNode) {
      const cls = String(el.classNames ?? "");
      const tag = String(el.rawTagName ?? "").toLowerCase();
      if (tag === "header" && cls.includes("site-header")) return true;
      if (tag === "footer" && cls.includes("site-footer")) return true;
      if (cls.split(/\s+/).some((name) => name === "breadcrumb" || name === "p-breadcrumb")) return true;
    }
    return false;
  };
  const clean = (href) => href.split("#")[0].split("?")[0] || "/";
  const links = new Set();
  const bodyLinks = new Set();
  for (const a of root.querySelectorAll("a")) {
    const href = a.getAttribute("href");
    if (!href || !href.startsWith("/") || href.startsWith("//")) continue;
    links.add(clean(href));
    if (!inChrome(a)) bodyLinks.add(clean(href));
  }
  pages.set(url, { status: response.status, html, root, links: [...links], bodyLinks });
}

/* ---------- 1. / から3クリック以内 ---------- */
const depth = new Map([["/", 0]]);
{
  const { check, finish } = failures(1, "sitemap の全 URL が / から3クリック以内");
  let frontier = ["/"];
  while (frontier.length > 0) {
    const next = [];
    for (const url of frontier) {
      for (const link of pages.get(url)?.links ?? []) {
        if (!known.has(link) || depth.has(link)) continue;
        depth.set(link, depth.get(url) + 1);
        next.push(link);
      }
    }
    frontier = next;
  }
  const far = urls.filter((url) => (depth.get(url) ?? 99) > 3);
  for (const url of far) check(false, `${url}: ${depth.get(url) ?? "到達できない"}クリック`);
  finish(`3クリック超 ${far.length} / ${urls.length}`);
}

/* ---------- 2・3. 被リンク ---------- */
const inbound = new Map(urls.map((url) => [url, 0]));
const inboundBody = new Map(urls.map((url) => [url, 0]));
for (const [url, page] of pages) {
  for (const link of page.links) {
    if (!known.has(link) || link === url) continue;
    inbound.set(link, (inbound.get(link) ?? 0) + 1);
    /* ナビの中のリンクと、一覧ページからのリンクは数えない。 */
    if (page.bodyLinks.has(link) && !LIST_PAGES.has(url)) inboundBody.set(link, (inboundBody.get(link) ?? 0) + 1);
  }
}
const isContent = (url) => /^\/(byoki|joukyou|nayami|okane|erabu)\/|^\/gokai\/|^\/columns\/|^\/dougu\//.test(url);
{
  /* 指示書 §8 の検査2は「未達の一覧を報告」。本文を書き足さない約束なので、
     ここでは落とさずに数と一覧を出す(0 が目標)。 */
  const { finish } = failures(2, "ハブ・誤解・コラム・道具が、ナビと一覧以外から2本以上(報告のみ)");
  const weak = urls.filter((url) => isContent(url) && (inboundBody.get(url) ?? 0) < 2);
  results.push({ number: 2.1, label: "  未達の一覧", ok: true, count: `${weak.length}件`, errors: weak.map((url) => `${url}: ${inboundBody.get(url) ?? 0}本`) });
  finish(`未達 ${weak.length} / ${urls.filter(isContent).length}`);
}
{
  const { check, finish } = failures(3, "孤立 URL(被リンク0)が無い");
  const orphans = urls.filter((url) => url !== "/" && (inbound.get(url) ?? 0) === 0);
  for (const url of orphans) check(false, url);
  finish(`孤立 ${orphans.length}`);
}

/* ---------- 4. ヘッダーとフッター ---------- */
{
  const { check, finish } = failures(4, "ヘッダー8項目・フッター4区分が指示書の表と一致");
  const root = pages.get("/").root;
  const nav = root.querySelector(".site-nav-desktop");
  const items = nav.querySelectorAll("a").filter((a) => !a.classNames.includes("site-app-link"))
    .map((a) => [a.getAttribute("href"), a.textContent.trim()]);
  check(JSON.stringify(items) === JSON.stringify(HEADER), `ヘッダー: ${JSON.stringify(items)}`);
  const sections = root.querySelectorAll(".footer-links section").map((section) => [
    section.querySelector("h2").textContent.trim(),
    section.querySelectorAll("a").map((a) => a.getAttribute("href")),
  ]);
  check(JSON.stringify(sections) === JSON.stringify(FOOTER), `フッター: ${JSON.stringify(sections)}`);
  /* 古い区分名が、ヘッダー・フッターの区分名に残っていないこと。
     トップの区分見出し(.p-find-title)は 09-05 午後の刷新(f38114e)の部品で、
     復元(docs/restore-2026-09-05-instructions.md)で外したので見ない。 */
  const labels = [
    ...items.map(([, label]) => label),
    ...sections.map(([label]) => label),
  ];
  for (const old of OLD_LABELS) {
    const hit = labels.filter((label) => label === old);
    check(hit.length === 0, `区分名に「${old}」が残っている`);
  }
  finish("ヘッダー・フッターの区分名");
}

/* ---------- 5. パンくず ---------- */
{
  const { check, finish } = failures(5, "BreadcrumbList の item がすべて 200・表示と経路が同じ");
  let count = 0;
  for (const [url, page] of pages) {
    const lists = [];
    for (const script of page.root.querySelectorAll('script[type="application/ld+json"]')) {
      let data;
      try { data = JSON.parse(script.textContent.replaceAll("\\u003c", "<")); } catch { continue; }
      for (const item of data["@graph"] ?? [data]) {
        if (item["@type"] === "BreadcrumbList") lists.push(item);
      }
    }
    if (lists.length === 0) continue;
    count += 1;
    for (const list of lists) {
      for (const entry of list.itemListElement) {
        /* 節へのアンカー(/shinsei#step-1)は、ページとしては /shinsei。 */
        const path = String(entry.item ?? "").replace(/^https?:\/\/[^/]+/, "").split("#")[0] || "/";
        if (!known.has(path)) check(false, `${url}: ${path} が sitemap に無い`);
      }
    }
    const shown = page.root.querySelectorAll(".breadcrumb li, .p-breadcrumb span")
      .map((el) => el.textContent.replace(/^\s*\/\s*/, "").trim()).filter(Boolean);
    const ld = lists[0].itemListElement.map((entry) => entry.name);
    if (shown.length > 0) check(JSON.stringify(shown) === JSON.stringify(ld), `${url}: 表示 ${shown.join(">")} ≠ JSON-LD ${ld.join(">")}`);
  }
  finish(`${count} ページ`);
}

/* ---------- 6. Smart App Banner ---------- */
{
  const { check, finish } = failures(6, "apple-itunes-app が指定の7 URL にだけある");
  const has = urls.filter((url) => pages.get(url).html.includes("apple-itunes-app"));
  check(JSON.stringify(has.sort()) === JSON.stringify([...APP_BANNER_URLS].sort()), `出ている URL: ${has.join(" ")}`);
  finish(`${has.length} / ${APP_BANNER_URLS.length}`);
}

/* ---------- 7. 道具カードの配置 ---------- */
{
  const { check, finish } = failures(7, "道具カードが指定の場所にある・同じページに同じ道具が2枚ない");
  const cardsOn = (url) => pages.get(url).root.querySelectorAll(".mt-column-card")
    .map((card) => card.querySelector("a")?.getAttribute("href"))
    .filter((href) => href?.startsWith("/dougu/"));
  /* /hajimete は復元(docs/restore-2026-09-05-instructions.md §2)で昨日の版のまま。
     道具は「自分の場合を、確かめる」の JibunCards 2枚(.jc)で、道具カード(.mt-column-card)は無い。 */
  const want = {
    "/okane": ["/dougu/kingaku"],
    "/hajimete": [],
    "/nayami/shindansho-komatta": ["/dougu/mitate"],
    "/joukyou/kazoku-ga-tetsudau": ["/dougu/madoguchi"],
    "/byoki/utsu-soukyoku": ["/dougu/mitate"],
  };
  for (const [url, expected] of Object.entries(want)) {
    const found = cardsOn(url);
    check(JSON.stringify(found) === JSON.stringify(expected), `${url}: ${JSON.stringify(found)} ≠ ${JSON.stringify(expected)}`);
  }
  const hajimeteJibun = pages.get("/hajimete").root.querySelectorAll(".jc").map((a) => a.getAttribute("href"));
  check(JSON.stringify(hajimeteJibun) === JSON.stringify(["/dougu/mitate", "/dougu/kingaku"]), `/hajimete の JibunCards: ${hajimeteJibun.join(" ")}`);
  /* /shinsei のステップ3と7に窓口の道具があること。復元後の /shinsei は昨日の版(.step-flow-tool)。 */
  const step7 = pages.get("/shinsei").root.querySelectorAll(".dougu-chip, .step-flow-tool").map((a) => a.getAttribute("href"));
  check(step7.filter((href) => href === "/dougu/madoguchi").length === 2, `/shinsei の窓口の道具: ${step7.join(" ")}`);
  /* どのページでも、同じ道具のカードが2枚出ていないこと。 */
  for (const url of urls) {
    const found = cardsOn(url);
    check(new Set(found).size === found.length, `${url}: 同じ道具のカードが2枚 ${found.join(" ")}`);
  }
  finish("配置5か所 + ステップ7 + 重複");
}

/* ---------- 8・9. ブラウザで見る ---------- */
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH });
{
  const { check, finish } = failures(8, "ヘッダーの aria-current が正しく付く");
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const cases = [
    ["/hajimete", "/hajimete"], ["/shinsei", "/shinsei"], ["/byoki/tenkan", "/byoki"],
    ["/joukyou/gakusei", "/joukyou"], ["/nayami/fushikyu", "/nayami"], ["/okane/ikura", "/okane"],
    ["/jitsurei", "/jitsurei"], ["/columns/nofu-yoken", "/columns"], ["/dougu/kingaku", "/okane"],
  ];
  let ok = 0;
  for (const [url, expected] of cases) {
    const page = await context.newPage();
    await page.goto(`${origin}${url}`, { waitUntil: "networkidle" });
    /* aria-current はサーバーで付くが、水和の途中で一瞬外れることがある。付くまで待つ。 */
    await page.waitForFunction(() => document.querySelector('.site-nav-desktop a[aria-current="page"]') !== null, null, { timeout: 5000 }).catch(() => {});
    const current = await page.evaluate(() => document.querySelector('.site-nav-desktop a[aria-current="page"]')?.getAttribute("href") ?? null);
    if (current === expected) ok += 1;
    check(current === expected, `${url}: ${current} ≠ ${expected}`);
    await page.close();
  }
  await context.close();
  finish(`${ok} / ${cases.length}`);
}
{
  const { check, finish } = failures(9, "390px で横スクロールが無い");
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const targets = ["/", "/okane", "/columns/nofu-yoken", "/byoki/utsu-soukyoku"];
  let ok = 0;
  for (const url of targets) {
    const page = await context.newPage();
    await page.goto(`${origin}${url}`, { waitUntil: "networkidle" });
    /* 描画の途中で一時的に広がることがあるので、少し待って幅を見る。 */
    await page.waitForTimeout(300);
    const scrolls = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
    if (!scrolls) ok += 1;
    check(!scrolls, `${url}: 横スクロールがある`);
    await page.close();
  }
  await context.close();
  finish(`${ok} / ${targets.length}`);
}
await browser.close();

/* ---------- 10. 内部リンク切れ ---------- */
{
  const { check, finish } = failures(10, "内部リンク切れが無い");
  const seen = new Set();
  const broken = [];
  for (const [, page] of pages) {
    for (const link of page.links) {
      if (known.has(link) || seen.has(link)) continue;
      seen.add(link);
      const response = await fetch(`${origin}${link}`, { method: "HEAD" });
      if (response.status >= 400) broken.push(`${link}: ${response.status}`);
    }
  }
  for (const item of broken) check(false, item);
  finish(`sitemap 外のリンク ${seen.size} 本を確認、切れ ${broken.length}`);
}

results.sort((a, b) => a.number - b.number);
writeFileSync(`${out}/report.json`, JSON.stringify({
  origin,
  urls: urls.length,
  depth: Object.fromEntries([...depth].sort()),
  inbound: Object.fromEntries([...inbound].sort()),
  inboundBody: Object.fromEntries([...inboundBody].sort()),
  results,
}, null, 2) + "\n");
for (const result of results) {
  console.log(`${result.number}. ${result.ok ? "○" : "×"} ${result.label}${result.count ? ` (${result.count})` : ""}`);
  for (const error of result.errors.slice(0, 12)) console.log(`     - ${error}`);
  if (result.errors.length > 12) console.log(`     …ほか ${result.errors.length - 12} 件`);
}
if (results.some((result) => !result.ok)) process.exitCode = 1;
