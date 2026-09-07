// §2-3 の 2〜5: 3ページの FAQPage、shorui の静的本文の照合、kougin の表の値、道具の検算。
//   node --import ./scripts/lib/ts-alias.mjs docs/verification/dougu-seo-2026-09-07/check.mjs http://127.0.0.1:3000
import { chromium } from "playwright";
import { writeFileSync } from "node:fs";
import { SHORUI_DOCS, SHINDANSHO_FORMS, SHINDANSHO_NAIBU } from "../../../data/shorui.ts";
import { AMOUNTS_2026, KOUGIN_2026 as K } from "../../../data/amounts.ts";
import { calcKougin, emptyInput as emptyKougin, salaryDeduction } from "../../../lib/kougin.ts";
import { calcKoushin } from "../../../lib/koushin.ts";
const origin = process.argv[2] ?? "http://127.0.0.1:3000";
const dir = "docs/verification/dougu-seo-2026-09-07";
const chrome = process.env.CHROME_PATH || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const browser = await chromium.launch({ headless: true, executablePath: chrome });
const out = []; const say = (s) => { out.push(s); console.log(s); };
const yen = (n) => `${Math.round(n).toLocaleString("ja-JP")}円`;

for (const path of ["/dougu/shorui", "/dougu/kougin", "/dougu/koushin"]) {
  const ctx = await browser.newContext({ viewport: { width: 1400, height: 900 } }); const page = await ctx.newPage();
  await page.goto(`${origin}${path}`); await page.waitForLoadState("networkidle");
  const lds = (await page.locator('script[type="application/ld+json"]').allInnerTexts());
  const faqs = lds.map((t) => JSON.parse(t)).filter((j) => j["@type"] === "FAQPage");
  const screenFaq = path === "/dougu/shorui" ? await page.locator(".sr-static dt").count() : await page.locator('[aria-labelledby="kg-faq-heading"] details.kg-details summary').count();
  const text = await page.locator("main, body").first().innerText();
  const staticText = path === "/dougu/shorui" ? await page.locator(".sr-static").innerText() + await page.locator(".sr-lead").innerText() : await page.locator(".kg-static, .kg-main").first().innerText();
  say(`2. ${path}: FAQPage ${faqs.length}個 / JSON-LD の質問 ${faqs[0]?.mainEntity.length} = 画面の FAQ ${screenFaq} → ${faqs.length === 1 && faqs[0].mainEntity.length === screenFaq ? "一致" : "×"} / JSON-LD 全体に <a: ${lds.join("").includes("<a") ? "あり" : "0"} / ページ全体の「あなた」=${(text.match(/あなた/g) ?? []).length} 静的本文+リードの「あなた」=${(staticText.match(/あなた/g) ?? []).length}`);
  if (path === "/dougu/shorui") {
    const names = await page.locator(".sr-static-sec li b").allInnerTexts();
    const data = SHORUI_DOCS.map((d) => d.n);
    const forms = await page.locator('[aria-labelledby="sr-static-forms"] li a').evaluateAll((as) => as.map((a) => [a.textContent, a.getAttribute("href")]));
    const want = [...SHINDANSHO_FORMS, ...SHINDANSHO_NAIBU].map((f) => [f.name, f.url]);
    say(`3. 書類名 ${names.length}件 = SHORUI_DOCS ${data.length}件、1字一致(もらう場所ごとに並べ替えた順で比較)=${JSON.stringify([...names].sort()) === JSON.stringify([...data].sort())} / 様式 ${forms.length}件 = ${want.length}件、名前とURL一致=${JSON.stringify(forms) === JSON.stringify(want)} / 誰にでも要るもの ${await page.locator(".sr-static-tag", { hasText: "誰にでも要るもの" }).count()} 条件つき ${await page.locator(".sr-static-tag", { hasText: "条件つき" }).count()} / 節: ${(await page.locator(".sr-static h2").allInnerTexts()).join("・")}`);
    say(`3. リード: ${await page.locator(".sr-lead").innerText()}`);
  }
  if (path === "/dougu/kougin") {
    const cells = await page.locator(".kg-static table.kg-amounts td").allInnerTexts();
    const want = [yen(K.halfBeforeOctober), yen(K.halfFromOctober), yen(K.fullBeforeOctober), yen(K.fullFromOctober), yen(K.dependentAddition), yen(K.dependentElderlyAddition), yen(K.dependentSpecifiedAddition), yen(K.fullLineDependentAddition), `年収${AMOUNTS_2026.dependentDisabledIncomeLimit}万円未満(${yen(K.dependentLimitDisabled)}未満)`, `年収${AMOUNTS_2026.dependentGeneralIncomeLimit}万円未満(${yen(K.dependentLimitGeneral)}未満)`];
    say(`4. 線の一覧の表 ${cells.length}セル: ${cells.join(" / ")} → data と一致=${JSON.stringify(cells) === JSON.stringify(want)}`);
  }
  for (const w of [1400, 390]) {
    const c2 = await browser.newContext({ viewport: { width: w, height: 900 } }); const p2 = await c2.newPage();
    await p2.goto(`${origin}${path}`); await p2.waitForLoadState("networkidle");
    const over = await p2.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    say(`6. ${w}px ${path}: 横はみ出し ${over}px`);
    await p2.screenshot({ path: `${dir}/${path.split("/").pop()}-${w}.png`, fullPage: true });
    await c2.close();
  }
  await ctx.close();
}

// 5. 検算(9/6 の報告 §C-4・§C-5 と同じ入力)。lib を直接呼ぶ(道具の計算は lib にあり、今回は触っていない)
const kougin = (p) => calcKougin({ ...emptyKougin(), ...p });
const a1 = kougin({ shoshin: "after20", work: "kyuyo", income: 3000000 });
const a2 = kougin({ shoshin: "before20", work: "kougin", income: 300000, dependents: 0 });
const a3 = kougin({ shoshin: "before20", work: "kyuyo", income: 6000000, dependents: 0 });
const a4 = kougin({ shoshin: "before20", work: "kyuyo", income: 6000000, dependents: 2 });
const a5 = kougin({ shoshin: "after20", work: "kyuyo", income: 1000000, pension: "kiso2" });
say(`5. A① 20歳以降: applies=${a1.applies} / A② 20歳前・B型・30万・扶養0: ${a2.verdictBefore} 余裕=${a2.marginBefore ?? a2.margin ?? JSON.stringify(Object.fromEntries(Object.entries(a2).filter(([k]) => /margin|room|yoyuu/i.test(k))))} / A③ 給与600万: 控除=${salaryDeduction(6000000)} 所得=${a3.judged ?? a3.income ?? JSON.stringify(Object.fromEntries(Object.entries(a3).filter(([k]) => /judged|shotoku|income/i.test(k))))} 判定=${a3.verdictBefore} / A④ 扶養2人: 線=${a4.halfBefore} / ${a4.fullBefore} / A⑤ 2級+100万: 合計=${a5.fuyouTotal} 180万以上=${a5.overDisabledLimit}`);
const ko = (y, m, indefinite = false) => calcKoushin({ year: y, month: m, indefinite, today: "2026-09-06" });
const b1 = ko(2027, 3), b2 = ko(2026, 8), b3 = ko(2027, 3, true), b4 = ko(2028, 2);
say(`5. B①2027年3月: 期限=${b1.deadline} 用紙=${b1.formSent} 現症日=${b1.genshoStart}〜 準備=${b1.prepStart}(${b1.daysToPrep}日) / B②2026年8月: past=${b2.past} / B③無期限: kind=${b3.kind} / B④2028年2月: 期限=${b4.deadline} 用紙=${b4.formSent} 現症日=${b4.genshoStart}〜`);
await browser.close();
writeFileSync(`${dir}/checks.txt`, out.join("\n") + "\n");
