/* 記入した文字が様式のどこに入ったかを測る(設計 §9-2)。
     npm run build && node scripts/verify-moushitatesho-layout.mjs
   前回の検証は背景の罫線しか測っていなかった。ここで測るのは「自分たちが描いた文字」。

   1. 文字の矩形が layout.ts のスロットの内側にある(はみ出し 0)
   2. 文字の矩形が公式PDFの印字と交差しない
   3. digits の中心が、印字された「年」「月」「日」の左隣の空欄の中央から ±1.0mm
   4. circle の中心が、囲む文字の中心から ±0.5mm。楕円が文字を完全に含む
   5. 期間の状況の本文が、枠の右端(本紙 279.1 / 続紙 188.9)を超えない
   0. (2026-09-04 指示書 §4) 背景SVG 4枚が整形式で、合計 2MB 未満 */
import { chromium } from "playwright";
import { execFileSync, spawn } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { SAMPLES } from "./verify-moushitatesho/samples.mjs";
import { CONT_BACK, CONT_FRONT, MAIN_BACK, MAIN_FRONT, PAPER } from "../data/moushitatesho/layout.ts";

const PORT = process.env.MT_PORT ?? "3260";
const CHROME = process.env.CHROME_PATH || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const OUT = "docs/verification/moushitatesho-youshiki-2026-09-04";
const SVGS = ["main-1", "main-2", "cont-1", "cont-2"].map((n) => `public/forms/moushitatesho/${n}.svg`);
const GLYPHS = JSON.parse(readFileSync(`${OUT}/official-glyphs.json`, "utf8"));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const R = (v) => Math.round(v * 100) / 100;

const results = [];
const check = (id, label, fn) => {
  try { results.push({ id, label, ok: true, note: fn() ?? "" }); }
  catch (e) { results.push({ id, label, ok: false, note: e.message.split("\n")[0] }); }
};
const fail = (m) => { throw new Error(m); };

/* ---- 実際に描いた文字を測る ---- */
const server = spawn("npm", ["run", "start", "--", "-p", PORT], { stdio: "ignore" });
let ready = false;
for (let i = 0; i < 90; i += 1) {
  try { if ((await fetch(`http://127.0.0.1:${PORT}/dougu/moushitatesho/insatsu`)).ok) { ready = true; break; } } catch { /* まだ */ }
  await sleep(1000);
}
if (!ready) { server.kill("SIGTERM"); throw new Error("検証用サーバーが起動しない"); }

const browser = await chromium.launch({ headless: true, executablePath: CHROME });

/* ---- 0. 背景SVG(指示書 §4)。Chrome 自身の XML パーサで見る ---- */
{
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  const sources = SVGS.map((f) => ({ f, src: existsSync(f) ? readFileSync(f, "utf8") : null }));
  const bad = await page.evaluate((list) => list.map(({ f, src }) => {
    if (src === null) return `${f} が無い`;
    const doc = new DOMParser().parseFromString(src, "image/svg+xml");
    const err = doc.querySelector("parsererror");
    if (err) return `${f}: ${err.textContent.replace(/\s+/g, " ").slice(0, 120)}`;
    if (doc.documentElement.tagName.toLowerCase() !== "svg") return `${f}: ルートが svg でない`;
    return null;
  }).filter(Boolean), sources);
  await ctx.close();
  const total = sources.reduce((n, s) => n + (s.src ? Buffer.byteLength(s.src) : 0), 0);
  check(0, "背景SVG 4枚が Chrome の XML パーサを通り、合計 2MB 未満", () => {
    if (bad.length) fail(bad.join(" / "));
    if (total >= 2 * 1024 * 1024) fail(`合計 ${(total / 1024 / 1024).toFixed(2)}MB(2MB以上)`);
    return `4枚とも整形式 / 合計 ${(total / 1024 / 1024).toFixed(2)}MB`;
  });
}

const measured = {};
const SHOT = mkdtempSync(path.join(tmpdir(), "mt-chroma-"));
const shots = [];
const pdfs = [];

for (const [name, data] of Object.entries(SAMPLES)) {
  const ctx = await browser.newContext({ viewport: { width: 1400, height: 1000 } });
  const page = await ctx.newPage();
  await page.addInitScript((v) => { window.name = `moushitatesho:${JSON.stringify(v)}`; }, data);
  await page.goto(`http://127.0.0.1:${PORT}/dougu/moushitatesho/insatsu`);
  await page.getByLabel("A3原寸").check();
  await page.locator("[data-sheet]").first().waitFor();
  await page.emulateMedia({ media: "print" });
  await page.evaluate(() => document.fonts?.ready);
  await sleep(500);

  measured[name] = await page.evaluate(() => {
    const PX = 96 / 25.4;                       // 1mm = 96/25.4 px
    const out = [];
    document.querySelectorAll("[data-sheet]").forEach((sheet, sheetIndex) => {
      const base = sheet.getBoundingClientRect();
      const mm = (r) => ({ x0: (r.left - base.left) / PX, y0: (r.top - base.top) / PX,
                           x1: (r.right - base.left) / PX, y1: (r.bottom - base.top) / PX });
      sheet.querySelectorAll("[data-slot]").forEach((el) => {
        const kind = el.dataset.slot;
        const box = mm(el.getBoundingClientRect());
        const pxPt = parseFloat(getComputedStyle(el).fontSize) || 0;
        let ink = null;
        if (kind !== "circle") {
          const t = el.textContent ?? "";
          if (t.trim()) {
            const range = document.createRange();
            range.selectNodeContents(el);
            const r = range.getBoundingClientRect();
            if (r.width > 0) {
              ink = mm(r);
              if (kind === "digits") {
                /* 行ボックスは字より上下に広い。数字が乗る帯(cap height)だけを見る */
                const cy = (ink.y0 + ink.y1) / 2, half = (pxPt / PX) * 0.36;
                ink = { ...ink, y0: cy - half, y1: cy + half };
              }
            }
          }
        }
        const cs = getComputedStyle(el);
        out.push({ sheet: sheet.dataset.sheet, sheetIndex, kind, box, ink,
                   overflowing: el.scrollHeight > el.clientHeight + 1 || el.scrollWidth > el.clientWidth + 1,
                   clipped: cs.overflow === "hidden" || cs.overflowY === "hidden",
                   text: (el.textContent ?? "").slice(0, 40) });
      });
    });
    return out;
  });
  /* 検査9用: 紙まるごとを 300dpi で撮る + 本物の印刷経路(page.pdf)も出す */
  const dpiCtx = await browser.newContext({ viewport: { width: 1400, height: 1000 }, deviceScaleFactor: 300 / 96 });
  const dpiPage = await dpiCtx.newPage();
  await dpiPage.addInitScript((v) => { window.name = `moushitatesho:${JSON.stringify(v)}`; }, data);
  await dpiPage.goto(`http://127.0.0.1:${PORT}/dougu/moushitatesho/insatsu`);
  await dpiPage.getByLabel("A3原寸").check();
  await dpiPage.locator("[data-sheet]").first().waitFor();
  await dpiPage.emulateMedia({ media: "print" });
  await dpiPage.evaluate(() => document.fonts?.ready);
  await sleep(600);
  const sheetEls = await dpiPage.locator("[data-sheet]").all();
  for (let i = 0; i < sheetEls.length; i += 1) {
    const kind = await sheetEls[i].getAttribute("data-sheet");
    const f = path.join(SHOT, `${name}-${i + 1}-${kind}.png`);
    await sheetEls[i].screenshot({ path: f });
    shots.push({ file: f, name, kind });
  }
  const pdf = path.join(SHOT, `${name}.pdf`);
  await dpiPage.pdf({ path: pdf, format: "A3", printBackground: true, preferCSSPageSize: true,
    margin: { top: "0", right: "0", bottom: "0", left: "0" } });
  pdfs.push({ file: pdf, name });
  await dpiCtx.close();

  await ctx.close();
}

await browser.close();
server.kill("SIGTERM");

/* ---- 判定 ---- */
const overlaps = (a, b) => a.x0 < b.x1 - 0.05 && b.x0 < a.x1 - 0.05 && a.y0 < b.y1 - 0.05 && b.y0 < a.y1 - 0.05;
const inside = (ink, box, tol = 0.15) =>
  ink.x0 >= box.x0 - tol && ink.x1 <= box.x1 + tol && ink.y0 >= box.y0 - tol && ink.y1 <= box.y1 + tol;
/* .mt-slot-text は overflow:hidden。紙に出るのは箱で切った分だけ。 */
const clip = (ink, box) => ({ x0: Math.max(ink.x0, box.x0), y0: Math.max(ink.y0, box.y0),
                              x1: Math.min(ink.x1, box.x1), y1: Math.min(ink.y1, box.y1) });
const visible = (m) => {
  if (!m.ink) return null;
  if (m.kind === "digits") return m.ink;          // digits は箱で切らない(高さを持たないスロット)
  const c = clip(m.ink, m.box);
  return c.x1 > c.x0 && c.y1 > c.y0 ? c : null;
};

const rows = [];   // 欄ごとの表(§10-4)
const containment = [];
/* 半径換算で3%の余裕(指示書2 §1-1)。
   指示書は「≤ 0.94」と書いているが、同じ §1-1 の k = 1.03·√q で広げた楕円は
   ちょうど q = 1/1.03² = 0.9426 に着地するので、0.94 だと k を当てても永遠に届かない。
   「半径換算で約3%」を素直に数式にした 1/1.03² を使う(差は 0.0026)。 */
const CONTAIN_Q = 1 / 1.03 ** 2;

/* 紙に出るインクは、スロットの矩形の内側だけであること(指示書2 §2)。
   .mt-slot-text は overflow:hidden なので、枠に入りきらない字は**描かれない**。
   だから max も対象にできる。判定は
     (a) 枠に収まっている欄  … 字の外接矩形が枠の内側にある(幾何で見る)
     (b) 収まらない欄        … overflow:hidden でクリップされている(枠の外にインクが出ない)
   のどちらかを満たすこと。 */
check(1, "スロットの外にインクが出ない(5サンプルすべて)", () => {
  const bad = [];
  let n = 0, clipped = 0;
  for (const [name, list] of Object.entries(measured)) {
    for (const m of list) {
      if (!m.ink) continue;
      n += 1;
      if (m.kind === "digits") {
        /* digits のスロットは幅しか持たない。左右にはみ出していないかだけ見る */
        if (!(m.ink.x0 >= m.box.x0 - 0.15 && m.ink.x1 <= m.box.x1 + 0.15)) {
          bad.push(`${name}/${m.sheet}/digits "${m.text}" が左右にはみ出す`);
        }
        continue;
      }
      if (m.overflowing) {
        if (!m.clipped) bad.push(`${name}/${m.sheet} "${m.text}" が枠に入らないのにクリップされていない`);
        else clipped += 1;
        continue;
      }
      if (!inside(m.ink, m.box)) {
        bad.push(`${name}/${m.sheet} "${m.text}" ink(${R(m.ink.x0)},${R(m.ink.y0)})-(${R(m.ink.x1)},${R(m.ink.y1)}) box(${R(m.box.x0)},${R(m.box.y0)})-(${R(m.box.x1)},${R(m.box.y1)})`);
      }
    }
  }
  if (bad.length) fail(`${bad.length}件: ${bad.slice(0, 3).join(" / ")}`);
  return `${n}個。うち ${clipped}個は入りきらず overflow:hidden で切られている(max の欄)`;
});

/* 公式PDFの「描画される画素」に問い合わせる。
   オブジェクト一覧で見ると、クリップされて描かれない図形まで拾って偽の衝突が出る
   (01.pdf は年・月・日の空欄の中にも黒い塗り図形の記述を持っている)。 */
function askInk(payload) {
  const out = execFileSync(process.env.PYTHON ?? "python3",
    ["scripts/verify-moushitatesho/ink.py"], { input: JSON.stringify(payload), encoding: "utf8", maxBuffer: 64 << 20 });
  return JSON.parse(out);
}

check(2, "文字が公式様式の印字と重ならない", () => {
  const req = {};
  const index = new Map();
  for (const [name, list] of Object.entries(measured)) {
    list.forEach((m, i) => {
      const v = visible(m);
      if (!v) return;
      const id = `${name}#${i}`;
      (req[m.sheet] ??= []).push({ id, mode: "ink", ...v });
      index.set(id, { name, m });
    });
  }
  const res = askInk(req);
  const bad = [];
  for (const [sheet, list] of Object.entries(res)) {
    for (const r of list) {
      if (r.ink > 0) {
        const { name, m } = index.get(r.id);
        bad.push(`${name}/${sheet} "${m.text}" が印字と重なる(${r.ink}画素)`);
      }
    }
  }
  if (bad.length) fail(`${bad.length}件が印字と重なる: ${bad.slice(0, 4).join(" / ")}`);
  const n = [...index.keys()].length;
  return `${n}個の文字とも印字と重ならない(300dpiの描画で判定)`;
});

/* ---- 3・4 は layout.ts のスロットそのものを、様式の印字と突き合わせる ---- */
const SHEET_SLOTS = {
  "main-front": MAIN_FRONT, "main-back": MAIN_BACK, "cont-front": CONT_FRONT, "cont-back": CONT_BACK,
};
function collectSlots(node, sheet, out, trail = []) {
  if (!node || typeof node !== "object") return out;
  if (Array.isArray(node)) { node.forEach((v, i) => collectSlots(v, sheet, out, [...trail, String(i)])); return out; }
  if (node.kind === "digits" || node.kind === "circle") { out.push({ sheet, path: trail.join("."), slot: node }); return out; }
  for (const [k, v] of Object.entries(node)) collectSlots(v, sheet, out, [...trail, k]);
  return out;
}
const ALL_SLOTS = Object.entries(SHEET_SLOTS).flatMap(([sheet, root]) => collectSlots(root, sheet, []));
/* text スロットだけを集める(検査9で「自分たちの文字が入ってよい枠」に使う) */
function collectTextSlots(node, out) {
  if (!node || typeof node !== "object") return out;
  if (Array.isArray(node)) { node.forEach((v) => collectTextSlots(v, out)); return out; }
  if (node.kind === "text") { out.push(node); return out; }
  for (const v of Object.values(node)) collectTextSlots(v, out);
  return out;
}

check(3, "digits の中心が、印字の間の空欄の中央から ±1.0mm", () => {
  const req = {}; const index = new Map();
  for (const s of ALL_SLOTS.filter((x) => x.slot.kind === "digits")) {
    const hMm = (s.slot.pt * 25.4) / 72;
    const id = `${s.sheet}:${s.path}`;
    (req[s.sheet] ??= []).push({ id, mode: "gap", cx: s.slot.cx,
      x0: s.slot.cx - 14, x1: s.slot.cx + 14, y0: s.slot.cy - hMm * 0.30, y1: s.slot.cy + hMm * 0.30 });
    index.set(id, s);
  }
  const res = askInk(req);
  const bad = []; let ok = 0, unbounded = 0;
  for (const list of Object.values(res)) {
    for (const r of list) {
      const s = index.get(r.id);
      if (!r.gap) { bad.push(`${r.id}: 中心の位置に印字がある`); continue; }
      /* 両側が探索窓の端で切れている=区切る印字が無い欄(No. など)は対象外 */
      if (r.gap.from <= s.slot.cx - 13.9 && r.gap.to >= s.slot.cx + 13.9) { unbounded += 1; continue; }
      const d = Math.abs(r.gap.center - s.slot.cx);
      if (d > 1.0) bad.push(`${r.id}: cx ${s.slot.cx} と空欄の中央 ${R(r.gap.center)} の差 ${R(d)}mm`);
      else { ok += 1; rows.push({ field: r.id, kind: "digits", expect: R(r.gap.center), got: s.slot.cx, diff: R(s.slot.cx - r.gap.center) }); }
    }
  }
  if (bad.length) fail(`${bad.length}件: ${bad.slice(0, 4).join(" / ")}`);
  return `${ok}個が ±1.0mm 以内(区切る印字が無く判定外 ${unbounded}個)`;
});

/* 公式PDFの実文字を「語」にまとめておく。01.pdf は元号・年月日だけが実文字で、他はアウトライン。
   語の切れ目は 0.6mm 以上の隙間と、区切り記号(・とかっこ)。
   **楕円の大きさに依存させない**(半径を広げると隣の字まで拾ってしまうため)。 */
const SEP = new Set(["・", "（", "）", "(", ")", "「", "」", "　", "、", "。"]);
const WORDS = {};
for (const [sheet, glyphs] of Object.entries(GLYPHS)) {
  const chars = glyphs.filter((g) => g.t).sort((a, b) => (a.y0 - b.y0) || (a.x0 - b.x0));
  const words = [];
  let cur = null;
  for (const g of chars) {
    const sameRow = cur && Math.abs(g.y0 - cur.y0) < 0.6;
    const gap = g.x0 - cur?.x1;
    /* 隙間は「0以上0.6mm未満」。負を許すと行をまたいで左へ戻るときにつながってしまう
       (発病日の行と初診日の行は y がほぼ同じで、x だけ 160mm 戻る)。字の重なりぶんの -0.5 までは許す。 */
    if (cur && sameRow && gap > -0.5 && gap < 0.6 && !SEP.has(g.t) && !SEP.has(cur.last)) {
      cur.x1 = Math.max(cur.x1, g.x1); cur.y1 = Math.max(cur.y1, g.y1); cur.t += g.t; cur.last = g.t;
    } else {
      if (cur) words.push(cur);
      cur = { x0: g.x0, y0: g.y0, x1: g.x1, y1: g.y1, t: g.t, last: g.t };
    }
  }
  if (cur) words.push(cur);
  WORDS[sheet] = words.filter((w) => !SEP.has(w.t));
}

/* スロットの中心にいちばん近い語。中心から 1.5mm 以上離れていたら「無い」とみなす。 */
function officialWord(sheet, cx, cy) {
  let best = null, bestD = Infinity;
  for (const w of WORDS[sheet] ?? []) {
    const wx = (w.x0 + w.x1) / 2, wy = (w.y0 + w.y1) / 2;
    const d = Math.hypot(wx - cx, wy - cy);
    if (d < bestD) { bestD = d; best = w; }
  }
  return best && bestD <= 1.5 ? best : null;
}

check(4, "circle の中心が囲む文字の中心から ±0.5mm", () => {
  const req = {}; const index = new Map();
  for (const s of ALL_SLOTS.filter((x) => x.slot.kind === "circle")) {
    const id = `${s.sheet}:${s.path}`;
    (req[s.sheet] ??= []).push({ id, mode: "ellipse",
      cx: s.slot.cx, cy: s.slot.cy, rx: s.slot.rx, ry: s.slot.ry });
    index.set(id, s);
  }
  const res = askInk(req);
  const bad = []; let ok = 0, empty = 0, byChar = 0;
  containment.length = 0;
  for (const list of Object.values(res)) {
    for (const r of list) {
      const s = index.get(r.id);
      const word = officialWord(s.sheet, s.slot.cx, s.slot.cy);
      const box = word ?? r.bbox;
      if (!box) { empty += 1; bad.push(`${r.id}: 囲む文字が見つからない`); continue; }
      if (word) byChar += 1;
      const cx = (box.x0 + box.x1) / 2, cy = (box.y0 + box.y1) / 2;
      const dx = Math.abs(cx - s.slot.cx), dy = Math.abs(cy - s.slot.cy);
      /* 中心を共有する楕円が長方形を含む条件は、角の1点だけで決まる:
         (a/rx)² + (b/ry)² ≤ 1  (a=字の半幅, b=字の半高)。
         rx≥a√2 かつ ry≥b√2 は十分条件にすぎず、実際より約1.4倍厳しい(指示書2 §1)。 */
      const a = (box.x1 - box.x0) / 2, b = (box.y1 - box.y0) / 2;
      const q = (a / s.slot.rx) ** 2 + (b / s.slot.ry) ** 2;
      containment.push({ id: r.id, src: word ? "実文字" : "描画インク", a: R(a), b: R(b),
        rx: s.slot.rx, ry: s.slot.ry, q: R(q), contains: q <= CONTAIN_Q,
        k: R(1.03 * Math.sqrt(q)) });
      if (dx > 0.5 || dy > 0.5) bad.push(`${r.id}: 中心のずれ x${R(dx)} y${R(dy)}mm`);
      else { ok += 1; rows.push({ field: r.id, kind: "circle", expect: `${R(cx)},${R(cy)}`, got: `${s.slot.cx},${s.slot.cy}`, diff: `x${R(s.slot.cx - cx)} y${R(s.slot.cy - cy)}` }); }
    }
  }
  if (bad.length) fail(`${bad.length}件: ${bad.slice(0, 4).join(" / ")}`);
  return `${ok}個が ±0.5mm 以内(うち ${byChar}個は公式PDFの実文字と照合、残りは描画インク)`;
});

check(6, "楕円が囲む文字を丸ごと含む((a/rx)²+(b/ry)² ≤ 1/1.03²)", () => {
  const short = containment.filter((c) => !c.contains);
  if (short.length) {
    const worst = short.slice().sort((x, y) => y.q - x.q)[0];
    fail(`${short.length}/${containment.length}件が不足。いちばん足りない ${worst.id}: (a/rx)²+(b/ry)² = ${worst.q} → k ${worst.k}(rx ${worst.rx}→${R(worst.rx * worst.k)}, ry ${worst.ry}→${R(worst.ry * worst.k)})`);
  }
  return `${containment.length}件とも含む(いちばん際どいところで ${R(Math.max(...containment.map((c) => c.q)))})`;
});

check(5, "期間の状況の本文が枠の右端を超えない", () => {
  const RIGHT = { "main-front": 279.1, "cont-front": 188.87, "cont-back": 188.87 };
  const bad = [];
  for (const [name, list] of Object.entries(measured)) {
    for (const m of list) {
      const limit = RIGHT[m.sheet];
      const v = visible(m);
      if (!limit || !v) continue;
      if (v.x1 > limit + 0.1) bad.push(`${name}/${m.sheet} "${m.text}" 右端 ${R(v.x1)} > ${limit}`);
    }
  }
  if (bad.length) fail(bad.slice(0, 3).join(" / "));
  return "本紙 279.1mm / 続紙 188.87mm を超えたものは無い";
});

writeFileSync(path.join(OUT, "measured.json"), JSON.stringify(measured, null, 1));

/* 欄ごとの表(§10-4)。期待=公式様式から測った位置、実測=layout.ts の値。 */
const head = "| 欄 | 種類 | 期待(様式) | 実測(layout.ts) | 差 |\n|---|---|---|---|---|";
writeFileSync(path.join(OUT, "fields.md"),
  `# 欄ごとの位置(設計 §10-4)\n\n測り方は scripts/verify-moushitatesho-layout.mjs。\n`
  + `digits は「印字の間の空欄の中央」、circle は「囲む文字の中心」を期待値にしている。\n\n`
  + `${head}\n${rows.map((r) => `| ${r.field} | ${r.kind} | ${r.expect} | ${r.got} | ${r.diff} |`).join("\n")}\n`);

/* 楕円の大きさの一覧(検査6が落ちたときに何が足りないかを見る) */
writeFileSync(path.join(OUT, "circles.md"),
  `# 楕円が文字を丸ごと含むか(設計 §9-2 の4の後半)\n\n`
  + `中心を共有する楕円が長方形を含む条件は角の1点で決まる: (a/rx)²+(b/ry)² ≤ 1。\n`
  + `rx≧a√2 かつ ry≧b√2 は十分条件にすぎず、約1.4倍厳しい(指示書2 §1)。判定は ≤ 1/1.03² = 0.9426(半径換算で3%の余裕)。\n`
  + `※ 元号の楕円は「昭和」を囲むと、左右の「・」に縁がかかる。9.2mm 間隔に 9.15mm 幅の字が並んでいるので、\n`
  + `字を丸ごと含む楕円は幾何的に必ず隣の中黒にかかる。手で○を書いたときと同じなので直していない(指示書3 §4)。\n\n`
  + `| 欄 | 出典 | a(半幅) | b(半高) | rx | ry | (a/rx)²+(b/ry)² | 含む | 足りなければ k |\n|---|---|---|---|---|---|---|---|---|\n`
  + containment.map((c) => `| ${c.id} | ${c.src} | ${c.a} | ${c.b} | ${c.rx} | ${c.ry} | ${c.q} | ${c.contains ? "○" : "×"} | ${c.contains ? "" : c.k} |`).join("\n") + "\n");

/* 指示書2 §1-1 の3。楕円を広げたあと、隣とぶつかっていないか。 */
/* 5サンプルで実際に紙に出た文字の矩形(シートごと)。クリップ後の見える分だけ。 */
const drawn = {};
for (const list of Object.values(measured)) {
  for (const m of list) {
    const v = visible(m);
    if (!v) continue;
    (drawn[m.sheet] ??= []).push({ ...v, text: (m.text || "").slice(0, 12) });
  }
}

check(7, "広げた楕円が、同じ組の他の選択肢の中心・自分たちが書く欄と重ならない", () => {
  const bad = [];
  for (const [sheet, root] of Object.entries(SHEET_SLOTS)) {
    const all = collectSlots(root, sheet, []);
    const circles = all.filter((x) => x.slot.kind === "circle");
    const boxes = all.filter((x) => x.slot.kind === "digits");
    for (const c of circles) {
      const { cx, cy, rx, ry } = c.slot;
      /* (a) 同じ組(パスの最後の要素だけ違う)の他の選択肢の中心が楕円の中に入っていないか */
      const group = c.path.replace(/\.[^.]+$/, "");
      for (const o of circles) {
        if (o === c || o.path.replace(/\.[^.]+$/, "") !== group) continue;
        if (((o.slot.cx - cx) / rx) ** 2 + ((o.slot.cy - cy) / ry) ** 2 < 1) {
          bad.push(`${sheet}:${c.path} の楕円が ${o.path} の中心を含む`);
        }
      }
      /* (b) 実際に紙に出た文字(5サンプルぶん)と重ならないか。
         スロットの枠ではなく描いた字で見る。枠は字より広く取ってあるので、
         枠で見ると楕円の先端(高さがほぼ0のところ)が枠にかすっただけで落ちる。 */
      for (const m of drawn[sheet] ?? []) {
        const dy = Math.max(0, Math.max(cy - m.y1, m.y0 - cy));
        if (dy >= ry) continue;
        const half = rx * Math.sqrt(1 - (dy / ry) ** 2);
        if (m.x0 < cx + half - 0.05 && m.x1 > cx - half + 0.05) {
          bad.push(`${sheet}:${c.path} の楕円が「${m.text}」(${R(m.x0)}–${R(m.x1)})と重なる`);
        }
      }
    }
  }
  if (bad.length) fail(`${bad.length}件: ${bad.slice(0, 4).join(" / ")}`);
  return "同じ組の他の選択肢の中心を含まず、紙に出た文字とも重ならない";
});

/* 検査9: 紙の上に、様式の線と自分たちの文字以外のインクが無い(指示書3 §3)。
   許すのは白と無彩色だけ。position:fixed の画面用の飾りが焼き込まれると、ここで落ちる。 */
function askChroma(payload) {
  /* chroma.py は numpy を使う。この環境では anaconda の numpy が壊れているので
     既定を /usr/bin/python3 にしてある(PYTHON_CHROMA で変えられる)。 */
  const out = execFileSync(process.env.PYTHON_CHROMA ?? "/usr/bin/python3",
    ["scripts/verify-moushitatesho/chroma.py"], { input: JSON.stringify(payload), encoding: "utf8", maxBuffer: 256 << 20 });
  return JSON.parse(out);
}

check(9, "紙の上に、様式の線と自分たちの文字以外のインクが無い(300dpi・全画素)", () => {
  /* 「自分たちの文字」= text スロットの中。利用者が絵文字を打てば色が付くが、それは
     こちらが足した飾りではなく利用者の字なので、枠の中と外を分けて数える(§12「文章を書き換えない」)。
     落とすのは**枠の外**の有彩色。画面用の飾りが焼き込まれるのはここに出る。 */
  const allow = {};
  for (const [sheet, root] of Object.entries(SHEET_SLOTS)) {
    allow[sheet] = collectTextSlots(root, []).map((t) => ({ x0: t.x, y0: t.y, x1: t.x + t.w, y1: t.y + t.h }));
  }
  const paperOf = (kind) => (kind.startsWith("main") ? PAPER.main.width : PAPER.cont.width);
  const pdfSheets = {};
  for (const p of pdfs) pdfSheets[p.file] = shots.filter((s2) => s2.name === p.name).map((s2) => s2.kind);
  const res = askChroma({
    files: shots.map((s2) => ({ file: s2.file, sheet: s2.kind, paperMm: paperOf(s2.kind) })),
    pdfs: pdfs.map((p) => p.file), pdfSheets, allow,
  });
  const bad = []; let inSlots = 0;
  for (const s2 of shots) {
    const r = res[s2.file]; if (!r) continue;
    inSlots += r.inSlots ?? 0;
    if (r.total > 0) {
      const c = r.colors[0];
      bad.push(`${s2.name}/${s2.kind}: 枠の外に有彩色 ${r.total}画素 rgb(${c.color}) x${c.x0}–${c.x1} y${c.y0}–${c.y1}`);
    }
  }
  for (const p of pdfs) {
    const r = res[p.file]; if (!r) continue;
    inSlots += r.inSlots ?? 0;
    if (r.total > 0) {
      const worst = r.pages.map((pg, i) => ({ i, ...pg })).filter((pg) => pg.total).sort((a, b) => b.total - a.total)[0];
      const c = worst.colors[0];
      bad.push(`${p.name} の印刷PDF p${worst.i + 1}: 枠の外に有彩色 ${worst.total}画素 rgb(${c.color})`);
    }
  }
  if (bad.length) fail(`${bad.length}件: ${bad.slice(0, 5).join(" / ")}`);
  return `紙 ${shots.length}枚と印刷PDF ${pdfs.length}本、枠の外は全画素が白か無彩色`
    + (inSlots ? ` / 枠の中に有彩色 ${inSlots}画素(max の絵文字。利用者が打った字なので消さない)` : "");
});

const ok = results.every((r) => r.ok);
console.log("# 申立書 記入位置の検証(設計 §9-2)\n");
for (const r of results.sort((a, b) => a.id - b.id)) console.log(`${r.ok ? "○" : "×"} ${r.id}. ${r.label}\n   ${r.note}`);
if (!ok) process.exitCode = 1;
