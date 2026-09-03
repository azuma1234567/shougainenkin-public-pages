// 実際に印刷して A4 何枚か測る(§8-10)。375px の横スクロール(§8-12)と通信(§8-11)も見る。
//   npm run build && node scripts/verify-madoguchi/print.mjs
import { chromium } from "playwright";
import { execFileSync, spawn } from "node:child_process";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

const PORT = process.env.MADOGUCHI_PORT ?? "3230";
const PY = process.env.PYTHON ?? "python3";
const chrome = process.env.CHROME_PATH || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const out = path.join(process.cwd(), "scripts/verify-madoguchi/fixtures/print.json");
const work = mkdtempSync(path.join(tmpdir(), "madoguchi-print-"));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const url = `http://127.0.0.1:${PORT}/dougu/madoguchi`;

/* 前回の残骸が同じポートに居ると、古いビルドに繋がって測り間違える。先に落とす。 */
try { execFileSync("bash", ["-c", `lsof -ti tcp:${PORT} | xargs -r kill`], { stdio: "ignore" }); } catch { /* 居なければよい */ }
await sleep(500);
const server = spawn("npm", ["run", "start", "--", "-p", PORT], { cwd: process.cwd(), stdio: "ignore" });
let ready = false;
for (let i = 0; i < 60; i += 1) {
  try { if ((await fetch(url)).ok) { ready = true; break; } } catch { /* まだ */ }
  await sleep(1000);
}
if (!ready) { server.kill("SIGTERM"); throw new Error("検証用サーバーが起動しない"); }

const browser = await chromium.launch({ headless: true, executablePath: chrome, args: ["--font-render-hinting=none"] });

async function pick(page, pref, city) {
  /* ハイドレーション前に選ぶと onChange が付いておらず市区町村が埋まらない。埋まるまで選び直す。 */
  for (let i = 0; i < 20; i += 1) {
    await page.selectOption("#md-pref", pref);
    await sleep(300);
    if (await page.locator("#md-city option").count() > 1) break;
  }
  const value = await page.locator("#md-city option").filter({ hasText: new RegExp(`^${city}$`) }).first().getAttribute("value");
  if (!value) throw new Error(`${pref} に ${city} が無い`);
  await page.selectOption("#md-city", value);
  await page.locator(".md-office").first().waitFor();
  await sleep(300);
}

async function run(name, { pref, city }) {
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto(url);
  await page.locator("#md-pref").waitFor();
  await sleep(600);
  /* 2026-09-03 の作り直しで、制度と20歳前の設問は消えた。最初の操作は住所だけ(指示書 B-3)。 */
  await pick(page, pref, city);
  await page.emulateMedia({ media: "print" });
  await page.evaluate(() => document.fonts?.ready);
  await sleep(300);
  const layout = await page.evaluate(() => {
    const main = document.querySelector(".md-main");
    const t = main.innerText;
    return {
      contentMm: +(main.getBoundingClientRect().height / (96 / 25.4)).toFixed(1),
      office: /年金事務所|街角の年金相談センター/.test(t),
      yoyaku: t.includes("予約受付専用電話"),
      mochimono: t.includes("行く日の持ち物"),
      ask: t.includes("窓口で聞くこと"),
      printHead: document.querySelector(".md-printhead")?.offsetParent !== null,
      /* 印刷で消える要素(街角の一覧)は数えない */
      items: [...document.querySelectorAll(".md-office, ul.md-list li")]
        .filter((e) => e.offsetParent !== null)
        .map((e) => e.innerText.replace(/\s+/g, "")).filter(Boolean),
      machikadoOnPrint: [...document.querySelectorAll(".md-screen-only")].some((e) => e.offsetParent !== null),
    };
  });
  const file = path.join(work, `${name}.pdf`);
  await page.pdf({ path: file, format: "A4", printBackground: true, preferCSSPageSize: true, margin: { top: "0", right: "0", bottom: "0", left: "0" } });
  const pdf = JSON.parse(execFileSync(PY, ["-c",
    "import fitz,sys,json,re;d=fitz.open(sys.argv[1]);print(json.dumps({'pages':d.page_count,'text':[re.sub(r'\\s+','',p.get_text()) for p in d]}))", file], { encoding: "utf8" }).trim());
  const splitItems = layout.items.filter((f) => !pdf.text.some((pg) => pg.includes(f))).map((s) => s.slice(0, 24));
  await context.close();
  return { name, pages: pdf.pages, splitItems, itemCount: layout.items.length, ...layout, items: undefined };
}

const cases = [];
cases.push(await run("横浜市南区(厚年と国年で違う)", { pref: "神奈川県", city: "横浜市南区" }));
cases.push(await run("水戸市(分かれる市)", { pref: "茨城県", city: "水戸市" }));
cases.push(await run("東京都新宿区", { pref: "東京都", city: "新宿区" }));

const mobileCtx = await browser.newContext({ viewport: { width: 375, height: 900 } });
const mp = await mobileCtx.newPage();
const network = [];
mp.on("request", (r) => {
  const u = r.url();
  if (/\/_next\/static\//.test(u) || u === url) return;
  network.push({ method: r.method(), url: u, prefetch: /[?&]_rsc=/.test(u) || /\/icon\.png|favicon/.test(u), hasBody: !!r.postData() });
});
await mp.goto(url);
await mp.locator("#md-pref").waitFor();
await sleep(600);
await pick(mp, "茨城県", "水戸市");
await sleep(500);
const mobile = await mp.evaluate(() => {
  const de = document.documentElement;
  return { scrollWidth: de.scrollWidth, clientWidth: de.clientWidth,
    overflowing: [...document.querySelectorAll(".md-page *")].filter((el) => el.getBoundingClientRect().right > de.clientWidth + 1).length };
});
await mobileCtx.close();
await browser.close();
server.kill("SIGTERM");

writeFileSync(out, `${JSON.stringify({ generatedAt: new Date().toISOString(), cases, mobile, network }, null, 1)}\n`);
for (const c of cases) console.log(`${c.name}: ${c.pages}ページ / ${c.contentMm}mm / 窓口${c.office} 予約${c.yoyaku} 持ち物${c.mochimono} 聞くこと${c.ask} / 割れた項目 ${c.splitItems.length}`);
console.log(`375px: ${mobile.scrollWidth}/${mobile.clientWidth} はみ出し ${mobile.overflowing}`);
console.log(`通信: 先読み以外 ${network.filter((n) => !n.prefetch).length} / 先読み・アイコン ${network.filter((n) => n.prefetch).length}`);
