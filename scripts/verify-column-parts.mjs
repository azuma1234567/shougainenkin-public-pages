#!/usr/bin/env node
/* コラムの部品(要約・固定目次・末尾ブロック)の検査 14〜19。
 * docs/columns-parts-2026-09-05-instructions.md §6。
 *
 *   node scripts/verify-column-parts.mjs http://localhost:3205
 *
 * 14. 本文のテキスト(要約の中身を除く)と JSON-LD が baseline と一致
 * 15. 末尾「次にすること」が47本にある(次に読む3本・道具1枚・固定文・道具の重複なし)
 * 16. 1280px で目次が sticky・現在地が動く / 1180px・390px は従来の details・横スクロールなし
 * 17. 新しい部品の文字色と地のコントラストが AA(4.5:1)以上
 * 18. 印刷で左レールが出ない・要約は出る
 * 19. 目次の項目と、FAQ の JSON-LD の件数が変更前と一致
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { parse } from "node-html-parser";
import { chromium } from "playwright";

const origin = process.argv[2] ?? process.env.VERIFY_ORIGIN ?? "http://localhost:3205";
const out = "docs/verification/columns-parts-2026-09-05";
mkdirSync(out, { recursive: true });
const baseline = JSON.parse(readFileSync(`${out}/baseline.json`, "utf8"));
const slugs = Object.keys(baseline);
const SAMPLE = ["hatachi-mae", "shoshinbi-wakaranai", "nofu-yoken"];
const CLOSING = "今日はここまでで大丈夫です。";

const results = [];
const failures = (number, label) => {
  const errors = [];
  return {
    check: (condition, message) => { if (!condition) errors.push(message); },
    finish: () => results.push({ number, label, ok: errors.length === 0, errors }),
  };
};

/* ---------- ページを読む ---------- */
const documents = new Map();
for (const slug of slugs) {
  const response = await fetch(`${origin}/columns/${slug}`);
  if (response.status !== 200) throw new Error(`${slug}: ${response.status}`);
  documents.set(slug, await response.text());
}

const textOf = (html, dropClass) => {
  const root = parse(html.replaceAll("<!-- -->", ""));
  const body = root.querySelector(".column-body");
  if (!body) return "";
  if (dropClass) for (const node of body.querySelectorAll(`.${dropClass}`)) node.remove();
  return body.textContent.replace(/\s+/g, " ").trim();
};
const jsonLdOf = (html) => [...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)]
  .map((m) => JSON.parse(m[1].replaceAll("\\u003c", "<")));

/* ---------- 14. 本文と構造化データ ---------- */
{
  const { check, finish } = failures(14, "本文のテキスト(要約を除く)と JSON-LD が変更前と一致");
  for (const slug of slugs) {
    const html = documents.get(slug);
    check(textOf(html, "col-check") === baseline[slug].bodyText, `${slug}: 本文が変わっている`);
    const now = JSON.stringify(jsonLdOf(html));
    check(now === JSON.stringify(baseline[slug].jsonLd), `${slug}: JSON-LD が変わっている`);
  }
  finish();
}

/* ---------- 15. 末尾「次にすること」 ---------- */
{
  const { check, finish } = failures(15, "末尾ブロックが47本にある(次に読む3本・道具1枚・固定文・道具の重複なし)");
  for (const slug of slugs) {
    const root = parse(documents.get(slug).replaceAll("<!-- -->", ""));
    const next = root.querySelectorAll(".col-next");
    check(next.length === 1, `${slug}: .col-next が ${next.length}個`);
    if (next.length !== 1) continue;
    check(next[0].querySelectorAll(".col-next-read li").length === 3, `${slug}: 次に読むが3本でない`);
    check(next[0].querySelector(".col-next-close")?.textContent === CLOSING, `${slug}: 末尾の固定文が違う`);
    check(next[0].querySelectorAll(".col-next-tool").length <= 1, `${slug}: 道具カードが2枚以上`);
    /* 同じ道具のカードが記事内で2枚出ていないこと。 */
    const hrefs = root.querySelectorAll(".mt-column-card a").map((a) => a.getAttribute("href")).filter((h) => h?.startsWith("/dougu/"));
    check(new Set(hrefs).size === hrefs.length, `${slug}: 同じ道具のカードが2枚(${hrefs.join(",")})`);
  }
  finish();
}

/* ---------- 19. 目次と FAQ の件数 ---------- */
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH });
{
  const { check, finish } = failures(19, "目次の項目と文言・FAQ の JSON-LD の件数が変更前と一致");
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  for (const slug of slugs) {
    const page = await context.newPage();
    await page.goto(`${origin}/columns/${slug}`, { waitUntil: "domcontentloaded" });
    /* 目次はブラウザ側で組み立てるので、項目が出るまで待つ(待たないと0件を拾う)。 */
    await page.waitForFunction(() => document.querySelectorAll(".article-toc ol a").length > 0, null, { timeout: 15000 });
    const toc = await page.evaluate(() => [...document.querySelectorAll(".article-toc ol a")].map((a) => a.textContent));
    check(JSON.stringify(toc) === JSON.stringify(baseline[slug].toc), `${slug}: 目次が変わっている`);
    await page.close();
    const faqNow = jsonLdOf(documents.get(slug)).find((d) => d["@type"] === "FAQPage")?.mainEntity?.length ?? 0;
    const faqWas = baseline[slug].jsonLd.find((d) => d["@type"] === "FAQPage")?.mainEntity?.length ?? 0;
    check(faqNow === faqWas, `${slug}: FAQ の件数 ${faqWas} → ${faqNow}`);
  }
  await context.close();
  finish();
}

/* ---------- 16. 目次の2つのモード ---------- */
{
  const { check, finish } = failures(16, "1280pxで目次が固定・現在地が動く / 1180px・390pxは従来どおり・横スクロールなし");
  for (const width of [1280, 1180, 390]) {
    const context = await browser.newContext({ viewport: { width, height: 900 } });
    for (const slug of SAMPLE) {
      const page = await context.newPage();
      await page.goto(`${origin}/columns/${slug}`, { waitUntil: "networkidle" });
      const state = await page.evaluate(() => {
        const toc = document.querySelector(".article-toc");
        return {
          position: getComputedStyle(toc).position,
          rail: toc.classList.contains("is-rail"),
          open: toc.open,
          hScroll: document.documentElement.scrollWidth > document.documentElement.clientWidth,
        };
      });
      check(!state.hScroll, `${slug} ${width}px: 横スクロールがある`);
      if (width >= 1181) {
        check(state.position === "sticky" && state.rail && state.open, `${slug} ${width}px: 目次が固定になっていない`);
        const before = await page.evaluate(() => document.querySelector('.article-toc a[aria-current="true"]')?.textContent ?? null);
        await page.evaluate(() => window.scrollTo(0, 4000));
        await page.waitForTimeout(400);
        const after = await page.evaluate(() => document.querySelector('.article-toc a[aria-current="true"]')?.textContent ?? null);
        check(after !== null && after !== before, `${slug}: スクロールしても現在地が動かない`);
      } else {
        check(state.position === "static" && !state.rail, `${slug} ${width}px: 従来の目次になっていない`);
        check(state.open === (width >= 761), `${slug} ${width}px: 目次の開閉が従来と違う`);
      }
      await page.close();
    }
    await context.close();
  }
  finish();
}

/* ---------- 17. 新しい部品のコントラスト ---------- */
{
  const { check, finish } = failures(17, "新しい部品の文字色と地のコントラストが4.5:1以上・--c-* 以外の色を書いていない");
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();
  await page.goto(`${origin}/columns/${SAMPLE[0]}`, { waitUntil: "networkidle" });
  const ratios = await page.evaluate(() => {
    const lum = ([r, g, b]) => {
      const f = (c) => { const s = c / 255; return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4; };
      return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
    };
    const rgb = (value) => value.match(/\d+/g).slice(0, 3).map(Number);
    /* 地の色は、透明でない祖先までさかのぼって決める。 */
    const background = (el) => {
      for (let node = el; node; node = node.parentElement) {
        const bg = getComputedStyle(node).backgroundColor;
        if (bg && !bg.includes("rgba(0, 0, 0, 0)")) return rgb(bg);
      }
      return [255, 255, 255];
    };
    const targets = [".col-check-title", ".col-check-body", ".col-check-rest",
      ".col-next h2", ".col-next-read-title", ".col-next-read a", ".col-next-close",
      ".article-toc.is-rail a", '.article-toc.is-rail a[aria-current="true"]', ".article-toc-next a",
      ".p-page-date"];
    return targets.map((selector) => {
      const el = document.querySelector(selector);
      if (!el) return { selector, ratio: null };
      const fg = rgb(getComputedStyle(el).color);
      const bg = background(el);
      const [a, b] = [lum(fg), lum(bg)].sort((x, y) => y - x);
      return { selector, ratio: Number(((a + 0.05) / (b + 0.05)).toFixed(2)) };
    });
  });
  for (const row of ratios) {
    if (row.ratio === null) continue;
    check(row.ratio >= 4.5, `${row.selector}: ${row.ratio}`);
  }
  /* 差分に --c-* 以外の色コードが入っていないこと。 */
  const diff = execFileSync("git", ["diff", "main...HEAD", "--", "app/columns/columns.css", "app/globals.css", "app/platform.css"], { encoding: "utf8" });
  const added = diff.split("\n").filter((line) => line.startsWith("+") && !line.startsWith("+++"));
  const hexes = added.flatMap((line) => line.match(/#[0-9a-fA-F]{3,8}\b/g) ?? []).filter((hex) => hex.toLowerCase() !== "#fff" && hex.toLowerCase() !== "#ffffff");
  check(hexes.length === 0, `新しい色コード: ${hexes.join(" ")}`);
  await context.close();
  finish();
  results[results.length - 1].ratios = ratios;
}

/* ---------- 18. 印刷 ---------- */
{
  const { check, finish } = failures(18, "印刷で左レールが出ない・要約は出る");
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  for (const slug of SAMPLE) {
    const page = await context.newPage();
    await page.goto(`${origin}/columns/${slug}`, { waitUntil: "networkidle" });
    await page.emulateMedia({ media: "print" });
    const state = await page.evaluate(() => ({
      toc: getComputedStyle(document.querySelector(".article-toc")).display,
      check: getComputedStyle(document.querySelector(".col-check")).display,
      next: getComputedStyle(document.querySelector(".col-next")).display,
    }));
    check(state.toc === "none", `${slug}: 印刷で目次が出ている`);
    check(state.check !== "none", `${slug}: 印刷で要約が消えている`);
    check(state.next !== "none", `${slug}: 印刷で末尾ブロックが消えている`);
    await page.close();
  }
  await context.close();
  finish();
}

await browser.close();

results.sort((a, b) => a.number - b.number);
writeFileSync(`${out}/results.json`, JSON.stringify({ origin, results }, null, 2) + "\n");
for (const result of results) {
  console.log(`${result.number}. ${result.ok ? "○" : "×"} ${result.label}${result.errors.length ? ` (${result.errors.length}件)` : ""}`);
  for (const error of result.errors.slice(0, 8)) console.log(`     - ${error}`);
}
if (results.some((result) => !result.ok)) process.exitCode = 1;
