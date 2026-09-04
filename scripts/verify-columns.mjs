// node scripts/verify-columns.mjs http://localhost:3107
// 10項目をすべて実行し、失敗をまとめて報告する。失敗時は exit 1。
// 結論の箱は47本共通のデザイン要素で、記事の厚みではないため、字数の判定対象は本文に限る。
import assert from "node:assert/strict";
import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { parse } from "node-html-parser";
import ts from "typescript";
import { chromium } from "playwright";
import { parseColumns, generatedColumn } from "./import-columns.mjs";
import { explainAmount, paragraphAround } from "./lib/amounts-derive.mjs";
await import("./lib/ts-alias.mjs");
const { COLUMNS } = await import("../lib/columns.ts");
const { AMOUNTS_2026 } = await import("../data/amounts.ts");
const { SAIKETSU_CASES } = await import("../lib/saiketsu.ts");
const { isPublishedInternalPath } = await import("../lib/published-links.ts");
const { GOKAI } = await import("../data/gokai.ts");

const origin = process.argv[2] ?? process.env.VERIFY_ORIGIN ?? "http://localhost:3107";
// 計算例の仮定値。制度の額ではなく記事が「〜なら」と置いた入力なので、
// amounts.ts からは導けない。ここに挙げたものだけを説明済みとして扱い、
// 一覧には必ず「仮定値」と明示して出す(黙って消さない)。
const ASSUMED_EXAMPLE_AMOUNTS = {
  300000: "shoubyou-teatekin: 標準報酬月額の平均(「30万円なら」)",
  600000: "shoubyou-teatekin: 報酬比例部分(「報酬比例60万円」)",
  1800000: "shoubyou-teatekin: 年金の合計(「年180万円なら」)",
  1447300: "shoubyou-teatekin: 600,000 + basicGrade2(847,300)",
};
const assumedAmounts = [];
const out = "docs/verification/columns-rewrite-2026-09-04";
mkdirSync(out, { recursive: true });
const baseline = JSON.parse(readFileSync(`${out}/baseline.json`, "utf8"));
const articles = Object.values(parseColumns());
const results = [];
const extra = [];
const failures = (number, label) => {
  const errors = [];
  const check = (condition, message) => { if (!condition) errors.push(message); };
  const finish = () => results.push({ number, label, ok: !errors.length, errors });
  return { check, finish };
};
const documents = new Map();
for (const a of articles) {
  const response = await fetch(`${origin}/columns/${a.slug}`);
  assert.equal(response.status, 200, a.slug);
  documents.set(a.slug, parse(await response.text()));
}

{
  const { check, finish } = failures(1, "47記事すべてにlead 3〜5項目・原稿との完全一致");
  check(articles.length === 47, "記事数");
  for (const a of articles) {
    check(a.lead.length >= 3 && a.lead.length <= 5, a.slug);
    check(readFileSync(`content/columns/${a.slug}.ts`, "utf8") === generatedColumn(a), `${a.slug}: 生成結果に差異`);
    const lead = documents.get(a.slug).querySelectorAll(".column-conclusion p").map(p => p.textContent);
    check(JSON.stringify(lead) === JSON.stringify(a.lead), `${a.slug}: 結論の表示`);
  }
  finish();
}
{
  const { check, finish } = failures(2, "本文の文中太字0（段落頭・表・Q・裁決リードのみ）");
  for (const a of articles) for (const line of a.content.split("\n")) {
    if (!line.includes("**") || line.startsWith("|")) continue;
    check(/^\*\*[^*]+\*\*[^*]*$/.test(line), `${a.slug}: ${line}`);
  }
  finish();
}
{
  const { check, finish } = failures(3, "道具リンク1本以上（指定3記事を除く）");
  for (const a of articles) if (!baseline.special[a.slug]) check(documents.get(a.slug).querySelectorAll('.column-body a[href^="/dougu/"]').length > 0, a.slug);
  finish();
}
{
  const { check, finish } = failures(4, "裁決IDはverifiedのみ・PDFリンクとして表示");
  for (const a of articles) {
    for (const [id] of a.content.matchAll(/\b[hr]\d\d(?:_\d\d)?(?:_r\d\d)?-\d\d_\d\d\b/g)) check(SAIKETSU_CASES.some(item => item.id === id && item.verified), `${a.slug}: 未確認ID ${id}`);
    const cases = [...a.content.matchAll(/^\*\*[^*]*?\b([hr]\d\d(?:_\d\d)?(?:_r\d\d)?-\d\d_\d\d)\b[^*]*\*\*\s*—/gm)].map(match => match[1]);
    const pdfs = documents.get(a.slug).querySelectorAll(".column-body .gokai-case a").map(link => link.getAttribute("href"));
    for (const id of cases) {
      const item = SAIKETSU_CASES.find(item => item.id === id);
      check(Boolean(item?.verified), `${a.slug}: ${id}`);
      check(item && pdfs.includes(item.url), `${a.slug}: ${id} のPDFリンクなし`);
    }
  }
  finish();
}
{
  const { check, finish } = failures(5, "本文の内部リンクが公開済み・誤解カードの文言一致");
  const routes = new Set([
    ...Object.keys(JSON.parse(readFileSync(".next/prerender-manifest.json", "utf8")).routes),
    ...Object.keys(JSON.parse(readFileSync(".next/server/app-paths-manifest.json", "utf8"))).filter(path => !path.includes("[")).map(path => path.replace(/\/page$/, "")),
  ]);
  for (const a of articles) {
    for (const link of documents.get(a.slug).querySelectorAll('.column-body a[href^="/"]')) {
      const href = link.getAttribute("href");
      check(isPublishedInternalPath(href), `${a.slug}: 非公開判定 ${href}`);
      const pathname = href.split(/[?#]/)[0];
      check(routes.has(pathname), `${a.slug}: 実在しないパス ${pathname}`);
    }
    for (const m of a.content.matchAll(/^→ 「(.+)」は誤解です\(\/gokai\/([^()]+)\)$/gm)) check(GOKAI.some(card => card.slug === m[2] && card.misconception === `「${m[1]}」`), `${a.slug}: 誤解の文言 ${m[2]}`);
  }
  finish();
}
{
  const { check, finish } = failures(6, "10万円以上の金額がamounts-deriveまたは宣言済み仮定値で説明できる");
  const explained = [];
  const usedAssumptions = new Set();
  let unexplainedCount = 0;
  for (const a of articles) {
    const text = a.lead.join("\n") + "\n" + a.content;
    // 仕上げ指示§1の10万円以上。式中の円が省略された数も拾う。
    // 万円表記は入力値の宣言利用を検出する（約○万円などの丸め表示は重複検算しない）。
    const amounts = [...text.matchAll(/\d{1,3}(?:,\d{3})+(?:円)?/g)].map(m => ({ text: m[0], value: Number(m[0].replace(/[,円]/g, "")), index: m.index }));
    for (const [value, reason] of Object.entries(ASSUMED_EXAMPLE_AMOUNTS)) {
      if (!reason.startsWith(`${a.slug}:`)) continue;
      const inYen = amounts.some(amount => amount.value === Number(value));
      const inMan = text.includes(`${Number(value) / 10000}万円`);
      if (inYen || inMan) usedAssumptions.add(Number(value));
    }
    for (const amount of amounts.filter(amount => amount.value >= 100000)) {
      const context = paragraphAround(text, amount.index);
      const reason = ASSUMED_EXAMPLE_AMOUNTS[amount.value];
      const assumption = reason?.startsWith(`${a.slug}:`) ? reason : null;
      const expression = assumption ? `仮定値: ${assumption}` : explainAmount(amount.value, AMOUNTS_2026, context);
      if (!expression) unexplainedCount += 1;
      check(Boolean(expression), `${a.slug}: ${amount.text} / ${context}`);
      if (expression) explained.push({ slug: a.slug, amount: amount.text, expression });
    }
    if (a.amounts) check(/const rawContent =/.test(readFileSync(`content/columns/${a.slug}.ts`, "utf8")) && /const content = apply2026Amounts\(rawContent\)/.test(readFileSync(`content/columns/${a.slug}.ts`, "utf8")), `${a.slug}: apply2026Amounts維持`);
  }
  for (const [value, reason] of Object.entries(ASSUMED_EXAMPLE_AMOUNTS)) {
    const used = usedAssumptions.has(Number(value));
    assumedAmounts.push({ value: Number(value), reason, used });
    console.log(`仮定値: ${Number(value).toLocaleString("en-US")}(${reason})`);
    if (!used) console.warn(`警告: 使われていない宣言 ${value} (${reason})`);
  }
  writeFileSync(`${out}/amounts.json`, JSON.stringify(explained, null, 2) + "\n");
  console.log(`未説明額: ${unexplainedCount}件`);
  finish();
}
{
  const { check, finish } = failures(7, "禁止文字列・変更コメントなし");
  const forbidden = /toip_hokkaido|youtube|note\.com|x\.com\/|twitter|経験として語られています|現場の肌感|<!--|\{\{[a-zA-Z]/i;
  for (const a of articles) check(!forbidden.test(a.content), a.slug);
  finish();
}
{
  const { check, finish } = failures(8, "URL・slug・h1・title・metaTitleが作業前と一致");
  for (const previous of baseline.columns) {
    const column = COLUMNS.find(column => column.slug === previous.slug);
    const dom = documents.get(previous.slug);
    check(Boolean(column), `${previous.slug}: slug`);
    check(column?.title === previous.title && (column?.metaTitle ?? null) === previous.metaTitle, `${previous.slug}: title/metaTitle`);
    check(dom.querySelectorAll("h1").length === 1 && dom.querySelector("h1").textContent === previous.h1, `${previous.slug}: h1`);
    check(dom.querySelector("title").textContent === previous.htmlTitle, `${previous.slug}: HTML title`);
    check(dom.querySelector('link[rel="canonical"]').getAttribute("href") === previous.canonical, `${previous.slug}: canonical`);
  }
  finish();
}
{
  const { check, finish } = failures(9, "47記事のFAQPageと画面のQ/Aが本文に一致");
  const compact = text => text.replace(/\s/g, "");
  for (const a of articles) {
    const dom = documents.get(a.slug);
    const schemas = dom.querySelectorAll('script[type="application/ld+json"]').map(el => JSON.parse(el.textContent)).flatMap(item => item["@graph"] ?? [item]);
    const faqs = schemas.filter(item => item["@type"] === "FAQPage");
    check(faqs.length === 1, `${a.slug}: FAQPage数`);
    check(JSON.stringify(faqs[0]?.mainEntity.map(q => ({ question: q.name, answer: q.acceptedAnswer.text }))) === JSON.stringify(a.faqs), `${a.slug}: FAQPageと本文`);
    const qs = dom.querySelectorAll(".column-faq-question");
    check(qs.length === a.faqs.length, `${a.slug}: Q数`);
    for (const [i, q] of qs.entries()) {
      check(compact(q.textContent.replace(/^Q[.．]\s*/, "")) === compact(a.faqs[i]?.question ?? ""), `${a.slug}: Q${i + 1}`);
      const answerParts = [];
      let answer = q.nextElementSibling;
      while (answer && answer.tagName !== "H2" && answer.tagName !== "H3") {
        answerParts.push(answer.textContent);
        answer = answer.nextElementSibling;
      }
      check(compact(answerParts.join(" ").replace(/^A[.．]\s*/, "")) === compact(a.faqs[i]?.answer ?? ""), `${a.slug}: A${i + 1}`);
    }
  }
  finish();
}
{
  const { check, finish } = failures(10, "375pxでページ横スクロールなし・目次は閉じた状態");
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 375, height: 812 }, deviceScaleFactor: 1 });
    for (const a of articles) {
      await page.goto(`${origin}/columns/${a.slug}`, { waitUntil: "networkidle" });
      const rejectAnalytics = page.getByRole("button", { name: "拒否する", exact: true });
      if (await rejectAnalytics.isVisible()) await rejectAnalytics.click();
      await page.locator(".article-toc").waitFor();
      const measurements = await page.evaluate(() => ({
        viewport: innerWidth, width: document.documentElement.scrollWidth,
        tocOpen: document.querySelector(".article-toc").open,
        tables: [...document.querySelectorAll(".column-body table")].map(table => ({ width: table.scrollWidth, container: table.parentElement.clientWidth, overflow: getComputedStyle(table.parentElement).overflowX })),
      }));
      check(measurements.width <= measurements.viewport, `${a.slug}: ${JSON.stringify(measurements)}`);
      check(!measurements.tocOpen, `${a.slug}: 目次が開いている`);
      check(measurements.tables.every(table => table.overflow === "auto"), `${a.slug}: 表のスクロール容器`);
      if (["shoshinbi-wakaranai", "nichijo-seikatsu-7koumoku", "moushitatesho-a4-insatsu", "jibun-de-shinsei"].includes(a.slug)) {
        await page.screenshot({ path: `${out}/${a.slug}-375.png` });
        const table = page.locator(".column-body .article-table-figure").first();
        if (await table.count()) { await table.scrollIntoViewIfNeeded(); await page.screenshot({ path: `${out}/${a.slug}-table-375.png` }); }
      }
    }
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto(`${origin}/columns/shoshinbi-wakaranai`, { waitUntil: "networkidle" });
    await page.screenshot({ path: `${out}/shoshinbi-wakaranai-1280.png` });
    const width = await page.locator(".column-body").evaluate(el => el.getBoundingClientRect().width);
    check(width >= 680 && width <= 720, `デスクトップ本文幅: ${width}`);
    await page.locator(".gokai-case").first().scrollIntoViewIfNeeded();
    await page.screenshot({ path: `${out}/shoshinbi-wakaranai-case-1280.png` });
  } finally { await browser.close(); }
  finish();
}

// §3-8 / §6: ★3記事。新しい見出しとリンクの追加は許可する。
for (const [slug, before] of Object.entries(baseline.special)) {
  const dom = documents.get(slug).querySelector("article");
  const after = dom.querySelectorAll("h2").map(el => el.textContent);
  let cursor = 0;
  const missingHeadings = before.h2.filter(heading => {
    const index = after.indexOf(heading, cursor);
    if (index < 0) return true;
    cursor = index + 1;
    return false;
  });
  const links = new Set(dom.querySelectorAll('a[href^="/"]').map(el => el.getAttribute("href")));
  const missingLinks = before.links.filter(href => !links.has(href));
  const cta = dom.querySelectorAll(".app-cta").map(el => el.textContent.replace(/\s/g, ""));
  const ctaOk = before.cta.every(text => cta.includes(text));
  const oldSource = execFileSync("git", ["show", `${baseline.baseRef}:content/columns/${slug}.ts`], { encoding: "utf8" });
  const ast = ts.createSourceFile("article.ts", oldSource, ts.ScriptTarget.Latest, true);
  let original = "";
  const visit = node => {
    if (ts.isVariableDeclaration(node) && ["content", "rawContent"].includes(node.name.getText(ast)) && node.initializer && (ts.isStringLiteral(node.initializer) || ts.isNoSubstitutionTemplateLiteral(node.initializer))) original = node.initializer.text;
    ts.forEachChild(node, visit);
  };
  visit(ast);
  // 指示書§2と同じ測定: Markdown記法は残し、空白だけ除く。
  const length = text => text.replace(/\s/g, "").length;
  const article = articles.find(article => article.slug === slug);
  const current = article.rawContent;
  const ratio = length(current) / length(original);
  const leadCharacters = length(article.lead.join("\n"));
  const withLeadCharacters = length(current) + leadCharacters;
  extra.push({ slug, ok: !missingHeadings.length && !missingLinks.length && ctaOk && ratio >= .9 && ratio <= 1.1, missingHeadings, missingLinks, ctaOk, oldCharacters: length(original), newCharacters: length(current), ratio, leadCharacters, withLeadCharacters, withLeadRatio: withLeadCharacters / length(original) });
}
const report = { origin, baseline: baseline.baseRef, results, assumedAmounts, special: extra };
writeFileSync(`${out}/results.json`, JSON.stringify(report, null, 2) + "\n");
for (const result of results) console.log(`${result.number}. ${result.ok ? "○" : "×"} ${result.label}${result.errors.length ? ` (${result.errors.length}件)` : ""}`);
for (const result of extra) console.log(`★ ${result.ok ? "○" : "×"} ${result.slug}: ${JSON.stringify(result)}`);
if (results.some(result => !result.ok) || extra.some(result => !result.ok)) process.exitCode = 1;
