// /dougu/mitate 刷新の実ブラウザ検証(docs/mitate-sasshin-2026-09-06-instructions.md §5 の 4〜14・16)。
//   node docs/verification/mitate-sasshin-2026-09-06/check.mjs http://127.0.0.1:3000
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
const origin = process.argv[2] ?? "http://127.0.0.1:3000";
const dir = "docs/verification/mitate-sasshin-2026-09-06"; mkdirSync(dir, { recursive: true });
const chrome = process.env.CHROME_PATH || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const browser = await chromium.launch({ headless: true, executablePath: chrome });
const out = []; const say = (s) => { out.push(s); console.log(s); };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function open(width, mode = "") {
  const ctx = await browser.newContext({ viewport: { width, height: 900 } });
  const page = await ctx.newPage();
  const requests = [];
  page.on("request", (r) => requests.push({ url: r.url(), type: r.resourceType() }));
  await page.goto(`${origin}/dougu/mitate${mode}`); await page.waitForLoadState("networkidle");
  return { ctx, page, requests };
}
const text = (page, sel) => page.locator(sel).first().innerText();
async function answer(page, values, degree, diagnosisIndex = 0) {
  await page.getByRole("button", { name: "はじめる" }).click();
  for (const v of values) { if (v === null) await page.locator(".mi-quiet-action").click(); else await page.locator(".mi-answer-list button").nth(v - 1).click(); await sleep(40); }
  await page.locator(".mi-answer-list button").nth(degree - 1).click();
  if (diagnosisIndex === null) await page.locator(".mi-skip-large").click(); else await page.locator(".mi-answer-list button").nth(diagnosisIndex).click();
  await page.locator(".mi-gt").waitFor();
}
const resultText = (page) => page.locator(".mi-result").innerText();

// 13. 名前 / 12. 静的本文 / 10. あなた(入口)
{
  const { page, ctx } = await open(1400);
  const title = await page.title(), h1 = await text(page, "h1");
  const crumb = await page.locator('nav[aria-label="パンくず"], nav.breadcrumb, .p-breadcrumb, nav[aria-label="現在地"]').first().innerText().catch(() => "(パンくず不明)");
  say(`13. <title>=${title} / h1=${h1} / パンくず=${crumb.replace(/\s+/g, " ").trim()}`);
  const ld = await page.locator('script[type="application/ld+json"]').allInnerTexts();
  const faq = ld.map((s) => JSON.parse(s)).find((j) => j["@type"] === "FAQPage");
  say(`12. FAQPage: ${faq ? faq.mainEntity.length : 0}問 / JSON-LD 全体に <a: ${ld.join("").includes("<a") ? "あり" : "0"} / 静的本文の h2: ${(await page.locator(".mi-static h2").allInnerTexts()).join("・")}`);
  const staticCells = await page.locator(".mi-static table.mi-gt tbody td").allInnerTexts();
  say(`12. 静的目安表 セル数=${staticCells.length} 強調(mi-hit)=${await page.locator(".mi-static .mi-hit").count()} 本文の文字数=${(await page.locator(".mi-static").innerText()).length}`);
  const intro = await page.locator("main, .mi-main").first().innerText();
  say(`10. 入口の「あなた」=${(intro.match(/あなた/g) ?? []).length} / 入口のボタン: ${(await page.locator(".mi-start-row a, .mi-start-row button").allInnerTexts()).join(" / ")}`);
  await page.screenshot({ path: `${dir}/intro-1400.png`, fullPage: true });
  // 質問画面 + 前提の1行
  await page.getByRole("button", { name: "はじめる" }).click(); await sleep(300);
  say(`2-1. 質問1の前提の1行: ${await text(page, ".mi-premise")} / 静的本文は消える: ${await page.locator(".mi-static").count() === 0}`);
  await page.screenshot({ path: `${dir}/question-1400.png`, fullPage: true });
  // 全画面の「あなた」
  let anata = 0; const banned = [/あなたは[０-９0-9]級/, /[０-９0-9]級相当/, /通りそう/, /もらえそう/, /難しそう/, /厳しそう/, /可能性は[０-９0-9]+%/, /[０-９0-9]割が受給/];
  for (let i = 0; i < 7; i += 1) { const t = await page.locator(".mi-question-screen").innerText(); anata += (t.match(/あなた/g) ?? []).length; await page.locator(".mi-answer-list button").nth(i < 2 ? 1 : 2).click(); await sleep(40); }
  anata += ((await page.locator(".mi-question-screen").innerText()).match(/あなた/g) ?? []).length; await page.locator(".mi-answer-list button").nth(2).click();
  anata += ((await page.locator(".mi-question-screen").innerText()).match(/あなた/g) ?? []).length; await page.locator(".mi-answer-list button").first().click();
  await page.locator(".mi-gt").waitFor();
  // 4. 検算
  const rt = await resultText(page);
  anata += (rt.match(/あなた/g) ?? []).length;
  say(`4. 2,2,3,3,3,3,3+程度(3): 見出し=${await text(page, ".mi-result-heading h2")} / ${await text(page, ".mi-result-number")} / 該当セル=${await text(page, ".mi-hit")}`);
  say(`10. 全画面の「あなた」=${anata} / 結果の禁止語=${banned.filter((re) => re.test(rt)).length} / 静的本文の「あなた」=${(intro.match(/あなた/g) ?? []).length}`);
  say(`5-15. 数字で見る: ${(rt.match(/不支給になった事案のうち [0-9.]+%/) ?? ["(無し)"])[0]}`);
  // 12. 結果の目安表と静的表の30セル
  const resultCells = await page.locator(".mi-result table.mi-gt tbody td").allInnerTexts();
  say(`12. 結果の目安表 セル数=${resultCells.length} / 静的表と一致=${JSON.stringify(resultCells) === JSON.stringify(staticCells)}`);
  // 7. 総合評価
  const hitBefore = await text(page, ".mi-hit"), numBefore = await text(page, ".mi-result-number");
  say(`7. 総合評価の行数=${await page.locator(".mi-guide-btn").count()} 自動=${await page.locator(".mi-guide-row.is-auto").count()}`);
  for (let i = 0; i < 3; i += 1) await page.locator(".mi-guide-btn").nth(i).click();
  say(`7. 3行押した: is-on=${await page.locator(".mi-guide-row.is-on").count()} 原文=${await page.locator(".mi-guide-row.is-on blockquote").count()} 末尾の1行=${await page.locator(".mi-result-section", { hasText: "ガイドラインが、ほかに見るところ" }).locator("text=押したことが、診断書と申立書に事実として書かれているか").count()} / 該当セル 変化なし=${hitBefore === await text(page, ".mi-hit")} 平均の行 変化なし=${numBefore === await text(page, ".mi-result-number")}`);
  await page.locator(".mi-guide-btn").nth(0).click();
  say(`7. 1行を押し直す(解除): is-on=${await page.locator(".mi-guide-row.is-on").count()}`);
  // 印刷メディアで押した行だけ
  await page.emulateMedia({ media: "print" }); await sleep(200);
  say(`7/11. 印刷の一覧: ${(await page.locator(".mi-ds-line li").allInnerTexts()).join(" / ")} / 画面の結果が見える=${await page.locator(".mi-result-heading:visible").count()} / 紙の表 行=${await page.locator(".mi-ds-table tbody tr").count()} 程度=${await page.locator(".mi-ds-line").first().innerText()} / 等級の文字=${/[1-3]級|非該当/.test(await page.locator(".mi-doctor-sheet").innerText())}`);
  await page.screenshot({ path: `${dir}/print-preview-1400.png`, fullPage: true });
  await page.emulateMedia({ media: "screen" });
  await page.locator(".mi-print-opt input").check(); await page.emulateMedia({ media: "print" }); await sleep(100);
  say(`11. 「目安表の位置も載せる」オン: ${await page.locator(".mi-ds-grade").innerText()}`);
  await page.emulateMedia({ media: "screen" }); await page.locator(".mi-print-opt input").uncheck();
  // 8. 答えの一覧から戻る
  await page.locator(".mi-answer-row").nth(2).click(); await sleep(300);
  say(`8. 3行目を押した → 画面=${await text(page, ".mi-formal-name")} 進捗=${await text(page, ".mi-progress-text")}`);
  await page.locator(".mi-answer-list button").nth(3).click(); await page.locator(".mi-gt").waitFor();
  say(`8. 4を選び直す → 結果へ直行: 3行目=${(await page.locator(".mi-answer-row").nth(2).innerText()).replace(/\s+/g, " ")} / ${await text(page, ".mi-result-number")} / 見出し=${await text(page, ".mi-result-heading h2")}`);
  await page.screenshot({ path: `${dir}/result-1400.png`, fullPage: true });
  // 9. localStorage と通信
  const { requests } = { requests: [] };
  await ctx.close();
}

// 5. 区切り / 6. 偏り・空欄 / 9. localStorage・通信 / 答えなかった項目
{
  const { page, ctx, requests } = await open(1400);
  await answer(page, [2, 2, 2, 3, 3, 3, 2], 3);
  say(`5. 2,2,2,3,3,3,2+程度(3): ${await text(page, ".mi-result-number")} / 区切り: ${(await page.locator(".mi-answers-note").allInnerTexts()).join(" | ")}`);
  say(`9. 結果まで進めた時点の localStorage キー: ${JSON.stringify(await page.evaluate(() => Object.keys(localStorage)))}`);
  await page.getByRole("button", { name: "この結果を、この端末に残す" }).click(); await sleep(100);
  say(`9. 「残す」を押したあと: ${JSON.stringify(await page.evaluate(() => Object.keys(localStorage)))}`);
  const ext = requests.filter((r) => !r.url.startsWith(origin)).map((r) => new URL(r.url).host);
  const xhr = requests.filter((r) => ["xhr", "fetch", "websocket", "eventsource"].includes(r.type) && !r.url.includes("/_next/"));
  say(`9. 通信: 自サイト以外のホスト=${[...new Set(ext)].join(",") || "0"} / xhr・fetch(_next 以外)=${xhr.length} ${xhr.map((r) => r.url).join(" ")}`);
  await ctx.close();
}
{
  const { page, ctx } = await open(1400);
  await answer(page, [1, 1, 1, 4, 4, 1, 1], 2);
  const first = page.locator(".mi-guide-row").first();
  say(`6. 偏り 1,1,1,4,4,1,1+程度(2): ${await text(page, ".mi-result-number")} / 先頭の行 auto=${(await first.getAttribute("class"))} / ${(await first.innerText()).split("\n").slice(0, 2).join(" ")}`);
  await ctx.close();
}
{
  const { page, ctx } = await open(1400);
  await answer(page, [1, 1, 1, 1, 1, 1, 1], 5, null);
  const first = page.locator(".mi-guide-row").first();
  say(`6. 空欄 1×7+程度(5)・診断名なし: 見出し=${await text(page, ".mi-result-heading h2")} / 先頭の行 auto=${await first.getAttribute("class")} / ${(await first.innerText()).split("\n").slice(0, 2).join(" ")} / 押せる行数(共通のみ)=${await page.locator(".mi-guide-btn").count()}`);
  await ctx.close();
}
{
  const { page, ctx } = await open(1400);
  await answer(page, [2, null, 3, 3, null, 3, 3], 3);
  say(`2-3. 答えなかった項目: ${(await page.locator(".mi-answers-note").allInnerTexts()).join(" | ")} / ${await text(page, ".mi-result-number")} / 一覧の「—」=${(await page.locator(".mi-answer-row").allInnerTexts()).join(" ").split("—").length - 1}`);
  await ctx.close();
}
// 14. shindansho モード
{
  const { page, ctx } = await open(1400, "?mode=shindansho");
  say(`14. 入口(shindansho): 大きい1行=${await page.locator(".mi-big-line").count()} 診断書ボタン=${await page.locator(".mi-start-alt").count()} 見出し下=${await text(page, ".mi-shindansho-lead")}`);
  await page.getByRole("button", { name: "はじめる" }).click(); await sleep(200);
  say(`14. 質問1: 前提の1行=${await page.locator(".mi-premise").count()} / 選択肢1の大きい文=${await page.locator(".mi-answer-list strong").first().innerText()}`);
  for (const v of [2, 2, 3, 3, 3, 3, 3]) { await page.locator(".mi-answer-list button").nth(v - 1).click(); await sleep(40); }
  await page.locator(".mi-answer-list button").nth(2).click(); await page.locator(".mi-answer-list button").first().click(); await page.locator(".mi-gt").waitFor();
  say(`14. 結果の次に: ${(await page.locator(".mi-next-lines > a").allInnerTexts()).join(" / ")} / 道具カード=${(await page.locator(".mi-dougu a").evaluateAll((as) => as.map((a) => a.getAttribute("href")))).join(",")} / 静かな1行=${await text(page, ".mi-calm-note")}`);
  await ctx.close();
}
{
  const { page, ctx } = await open(1400);
  await answer(page, [2, 2, 3, 3, 3, 3, 3], 3);
  say(`14. 通常モードの道具カード=${(await page.locator(".mi-dougu a").evaluateAll((as) => as.map((a) => a.getAttribute("href")))).join(",")} / 記事リンク=${(await page.locator(".mi-next-lines > a").allInnerTexts()).slice(3).join(" / ")}`);
  await ctx.close();
}
// 16. 390px
{
  const { page, ctx } = await open(390);
  const over = async () => page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  say(`16. 390px 入口 はみ出し=${await over()}px`); await page.screenshot({ path: `${dir}/intro-390.png`, fullPage: true });
  await page.getByRole("button", { name: "はじめる" }).click(); await sleep(200);
  say(`16. 390px 質問 はみ出し=${await over()}px`); await page.screenshot({ path: `${dir}/question-390.png`, fullPage: true });
  for (const v of [2, 2, 3, 3, 3, 3, 3]) { await page.locator(".mi-answer-list button").nth(v - 1).click(); await sleep(40); }
  await page.locator(".mi-answer-list button").nth(2).click(); await page.locator(".mi-answer-list button").first().click(); await page.locator(".mi-gt").waitFor();
  for (let i = 0; i < 2; i += 1) await page.locator(".mi-guide-btn").nth(i).click();
  say(`16. 390px 結果 はみ出し=${await over()}px`); await page.screenshot({ path: `${dir}/result-390.png`, fullPage: true });
  await page.emulateMedia({ media: "print" }); await sleep(200);
  await page.screenshot({ path: `${dir}/print-preview-390.png`, fullPage: true });
  await ctx.close();
}
await browser.close();
import("node:fs").then(({ writeFileSync }) => writeFileSync(`${dir}/checks.txt`, out.join("\n") + "\n"));
