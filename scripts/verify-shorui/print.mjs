// 結果を実際に印刷して A4 何枚か測る(§8-8)。あわせて 375px の横スクロールと
// ネットワーク送信(§8-11)、チェックが空欄で印刷されること、最終確認の文が印刷面に出ることを見る。
//   npm run build && node scripts/verify-shorui/print.mjs
import { chromium } from "playwright";
import { execFileSync, spawn } from "node:child_process";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

const PORT = process.env.SHORUI_PORT ?? "3220";
const PY = process.env.PYTHON ?? "python3";
const chrome = process.env.CHROME_PATH || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const out = path.join(process.cwd(), "scripts/verify-shorui/fixtures/print.json");
const work = mkdtempSync(path.join(tmpdir(), "shorui-print-"));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const A4_CONTENT_MM = 297 - 14 * 2;

const server = spawn("npm", ["run", "start", "--", "-p", PORT], { cwd: process.cwd(), stdio: "ignore" });
let ready = false;
for (let i = 0; i < 60; i += 1) {
  try { if ((await fetch(`http://127.0.0.1:${PORT}/dougu/shorui`)).ok) { ready = true; break; } } catch { /* まだ */ }
  await sleep(1000);
}
if (!ready) { server.kill("SIGTERM"); throw new Error("検証用サーバーが起動しない"); }

const browser = await chromium.launch({ headless: true, executablePath: chrome, args: ["--font-render-hinting=none"] });
const url = `http://127.0.0.1:${PORT}/dougu/shorui`;

// 選択肢はラベルで押す(質問ごとに1つずつ)
async function answer(page, labels) {
  for (const l of labels) { await page.getByRole("button", { name: l, exact: true }).click(); await sleep(80); }
}

async function run(name, labels, checkAll) {
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto(url);
  await page.locator(".sr-doc").first().waitFor();
  await answer(page, labels);
  await sleep(250);
  if (checkAll) { // 全部チェックしてから印刷 → 印刷面では空欄になること
    const boxes = page.locator(".sr-doc input");
    const n = await boxes.count();
    for (let i = 0; i < n; i += 1) { await boxes.nth(i).check(); await sleep(30); }
    await sleep(400);
  }
  await page.emulateMedia({ media: "print" });
  await page.evaluate(() => document.fonts?.ready);
  await sleep(300);
  const layout = await page.evaluate(() => {
    const main = document.querySelector(".sr-main");
    const text = main.innerText;
    const inputs = [...document.querySelectorAll(".sr-doc input")];
    const boxes = [...document.querySelectorAll(".sr-box")];
    const drawn = boxes.filter((b) => {
      const cs = getComputedStyle(b, "::before");
      return b.offsetParent !== null && parseFloat(cs.borderTopWidth) > 0;
    });
    const ticked = boxes.filter((b) => {
      const c = getComputedStyle(b, "::before").content;
      return c && c !== "none" && c.replace(/"/g, "") === "\u2713";
    });
    return {
      contentMm: +(main.getBoundingClientRect().height / (96 / 25.4)).toFixed(1),
      // 印刷では input そのものは出さない(::before の枠線で描く)
      rawInputsVisible: inputs.filter((i) => i.offsetParent !== null).length,
      checkedOnScreen: inputs.filter((i) => i.checked).length,
      boxesDrawn: drawn.length,
      boxesTicked: ticked.length,
      // 箱は背景色ではなく枠線で描く(背景グラフィックをオフにしても残る)
      boxUsesBackground: boxes.some((b) => {
        const bg = getComputedStyle(b, "::before").backgroundColor;
        return bg && bg !== "rgba(0, 0, 0, 0)" && bg !== "transparent";
      }),
      finalCheckOnPrint: text.includes("最後は年金事務所で確認してください"),
      mochimonoOnPrint: text.includes("年金事務所へ行く日の持ち物"),
      askOnPrint: text.includes("窓口で聞くこと"),
      printHead: !!document.querySelector(".sr-printhead") && document.querySelector(".sr-printhead").offsetParent !== null,
      moneyOnPrint: /[0-9０-９][ ,]*円/.test(text),
      // 各項目の本文まるごと。1ページの本文の中に丸ごと入っていれば、割れていない。
      items: [...document.querySelectorAll(".sr-doc, ul.sr-ask li")]
        .map((el) => el.innerText.replace(/\s+/g, ""))
        .filter(Boolean),
    };
  });
  const file = path.join(work, `${name}.pdf`);
  await page.pdf({ path: file, format: "A4", printBackground: true, preferCSSPageSize: true, margin: { top: "0", right: "0", bottom: "0", left: "0" } });
  const pdf = JSON.parse(execFileSync(PY, ["-c",
    "import fitz,sys,json,re;d=fitz.open(sys.argv[1]);print(json.dumps({'pages':d.page_count,'text':[re.sub(r'\\s+','',p.get_text()) for p in d]}))",
    file], { encoding: "utf8" }).trim());
  const norm = (s) => s.replace(/\s+/g, "");
  // 項目の本文が、どのページにも丸ごと入っていなければ、改ページで割れている
  const splitItems = layout.items.filter((full) => !pdf.text.some((page) => page.includes(norm(full))))
    .map((s) => s.slice(0, 24));
  await context.close();
  return { name, labels, pages: pdf.pages, splitItems, itemCount: layout.items.length, ...layout, items: undefined };
}

const cases = [];
cases.push(await run("未回答(共通のみ)", [], false));
cases.push(await run("最大(全分岐)", ["国民年金", "20歳より前", "遡及", "内部(心臓・腎臓・肝臓・呼吸器・糖尿病)", "違ううえ、カルテが残っていないと言われた", "18歳の年度末までの子がいる", "65歳未満の配偶者がいる", "はい"], false));
cases.push(await run("最大+全チェック", ["厚生年金", "20歳より前", "遡及", "精神", "違ううえ、カルテが残っていないと言われた", "18歳の年度末までの子がいる", "65歳未満の配偶者がいる", "はい"], true));

// 375px と 送信
const mobileCtx = await browser.newContext({ viewport: { width: 375, height: 900 } });
const mp = await mobileCtx.newPage();
const network = [];
// 入力を載せた送信と、Next.js の画面遷移プリフェッチを分けて数える。
mp.on("request", (r) => {
  const u = r.url();
  if (/\/_next\/static\//.test(u) || u === url) return;
  const prefetch = /[?&]_rsc=/.test(u) || /\/icon\.png/.test(u) || /favicon/.test(u);
  network.push({ method: r.method(), url: u, prefetch, hasBody: !!r.postData() });
});
await mp.goto(url);
await mp.locator(".sr-doc").first().waitFor();
await answer(mp, ["厚生年金", "20歳より前", "遡及", "内部(心臓・腎臓・肝臓・呼吸器・糖尿病)", "違ううえ、カルテが残っていないと言われた", "18歳の年度末までの子がいる", "65歳未満の配偶者がいる", "はい"]);
await sleep(500);
const mobile = await mp.evaluate(() => {
  const de = document.documentElement;
  return { scrollWidth: de.scrollWidth, clientWidth: de.clientWidth,
    overflowing: [...document.querySelectorAll(".sr-page *")].filter((el) => el.getBoundingClientRect().right > de.clientWidth + 1).length };
});
await mobileCtx.close();
await browser.close();
server.kill("SIGTERM");

writeFileSync(out, `${JSON.stringify({ generatedAt: new Date().toISOString(), a4ContentMm: A4_CONTENT_MM, cases, mobile, network }, null, 1)}\n`);
for (const c of cases) console.log(`${c.name}: ${c.pages}ページ / 内容 ${c.contentMm}mm / 箱 ${c.boxesDrawn}(印つき ${c.boxesTicked} / 画面のチェック ${c.checkedOnScreen}) / 生のinput ${c.rawInputsVisible} / 背景色 ${c.boxUsesBackground} / 持ち物 ${c.mochimonoOnPrint} / 窓口 ${c.askOnPrint} / 最終確認 ${c.finalCheckOnPrint} / 金額 ${c.moneyOnPrint} / 項目 ${c.itemCount} 割れた項目 ${c.splitItems.length}${c.splitItems.length?'('+c.splitItems.join(',')+')':''}`);
console.log(`375px: scrollWidth ${mobile.scrollWidth} / clientWidth ${mobile.clientWidth} / はみ出し ${mobile.overflowing}`);
const sending = network.filter((n) => !n.prefetch || n.method !== "GET" || n.hasBody);
console.log(`入力を載せうる送信: ${sending.length}件 / 画面遷移のプリフェッチ・アイコン: ${network.length - sending.length}件`);
for (const n of network) console.log(`   ${n.prefetch ? "prefetch" : "SEND"} ${n.method} ${n.url}`);
