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
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { SAMPLES } from "./verify-moushitatesho/samples.mjs";
import { CONT_BACK, CONT_FRONT, MAIN_BACK, MAIN_FRONT } from "../data/moushitatesho/layout.ts";

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
        out.push({ sheet: sheet.dataset.sheet, sheetIndex, kind, box, ink,
                   text: (el.textContent ?? "").slice(0, 40) });
      });
    });
    return out;
  });
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

/* max は「わざと入りきらない量」を入れるサンプルなので、はみ出しの判定からは外す
   (§10-8 が別に「縮小されず、入力画面で知らせ、印刷は止まらない」を見る)。 */
check(1, "文字がスロットの内側に収まっている(max を除く4サンプル)", () => {
  const bad = [];
  let n = 0;
  for (const [name, list] of Object.entries(measured)) {
    if (name === "max") continue;
    for (const m of list) {
      if (!m.ink) continue;
      n += 1;
      const ok = m.kind === "digits"
        /* digits のスロットは幅しか持たない。左右にはみ出していないかだけ見る */
        ? m.ink.x0 >= m.box.x0 - 0.15 && m.ink.x1 <= m.box.x1 + 0.15
        : inside(m.ink, m.box);
      if (!ok) bad.push(`${name}/${m.sheet}/${m.kind} "${m.text}" ink(${R(m.ink.x0)},${R(m.ink.y0)})-(${R(m.ink.x1)},${R(m.ink.y1)}) box(${R(m.box.x0)},${R(m.box.y0)})-(${R(m.box.x1)},${R(m.box.y1)})`);
    }
  }
  if (bad.length) fail(`${bad.length}件はみ出し: ${bad.slice(0, 3).join(" / ")}`);
  return `${n}個の文字がすべてスロットの内側`;
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

/* 公式PDFの実文字。01.pdf は元号・年月日だけが実文字で、他はアウトライン。
   実文字があるところはそれを正にする(いちばん確か)。無いところは楕円の中のインクで代用する。 */
function officialWord(sheet, cx, cy, rx, ry) {
  const glyphs = (GLYPHS[sheet] ?? []).filter((g) => g.t
    && g.x0 >= cx - rx - 0.6 && g.x1 <= cx + rx + 0.6 && g.y0 >= cy - ry - 0.9 && g.y1 <= cy + ry + 0.9);
  if (!glyphs.length) return null;
  return { x0: Math.min(...glyphs.map((g) => g.x0)), x1: Math.max(...glyphs.map((g) => g.x1)),
           y0: Math.min(...glyphs.map((g) => g.y0)), y1: Math.max(...glyphs.map((g) => g.y1)), n: glyphs.length };
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
      const word = officialWord(s.sheet, s.slot.cx, s.slot.cy, s.slot.rx, s.slot.ry);
      const box = word ?? r.bbox;
      if (!box) { empty += 1; bad.push(`${r.id}: 囲む文字が見つからない`); continue; }
      if (word) byChar += 1;
      const cx = (box.x0 + box.x1) / 2, cy = (box.y0 + box.y1) / 2;
      const dx = Math.abs(cx - s.slot.cx), dy = Math.abs(cy - s.slot.cy);
      /* 楕円が字を丸ごと含むか。長方形を含むには rx≥半幅×√2、ry≥半高×√2 が要る */
      const needRx = ((box.x1 - box.x0) / 2) * Math.SQRT2, needRy = ((box.y1 - box.y0) / 2) * Math.SQRT2;
      containment.push({ id: r.id, src: word ? "実文字" : "描画インク", rx: s.slot.rx, ry: s.slot.ry,
        needRx: R(needRx), needRy: R(needRy), contains: s.slot.rx >= needRx && s.slot.ry >= needRy });
      if (dx > 0.5 || dy > 0.5) bad.push(`${r.id}: 中心のずれ x${R(dx)} y${R(dy)}mm`);
      else { ok += 1; rows.push({ field: r.id, kind: "circle", expect: `${R(cx)},${R(cy)}`, got: `${s.slot.cx},${s.slot.cy}`, diff: `x${R(s.slot.cx - cx)} y${R(s.slot.cy - cy)}` }); }
    }
  }
  if (bad.length) fail(`${bad.length}件: ${bad.slice(0, 4).join(" / ")}`);
  return `${ok}個が ±0.5mm 以内(うち ${byChar}個は公式PDFの実文字と照合、残りは描画インク)`;
});

check(6, "楕円が囲む文字を丸ごと含む(設計 §9-2 の4の後半)", () => {
  const short = containment.filter((c) => !c.contains);
  if (short.length) {
    const worst = short.slice().sort((a, b) => (b.needRx - b.rx) - (a.needRx - a.rx))[0];
    fail(`${short.length}/${containment.length}件で楕円が小さい。例 ${worst.id}: rx ${worst.rx}(必要 ${worst.needRx}) ry ${worst.ry}(必要 ${worst.needRy})`);
  }
  return `${containment.length}件とも楕円が文字を含む`;
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
  + `長方形の字を楕円で丸ごと囲むには rx ≧ 半幅×√2、ry ≧ 半高×√2 が要る。\n\n`
  + `| 欄 | 出典 | rx | 必要rx | ry | 必要ry | 含む |\n|---|---|---|---|---|---|---|\n`
  + containment.map((c) => `| ${c.id} | ${c.src} | ${c.rx} | ${c.needRx} | ${c.ry} | ${c.needRy} | ${c.contains ? "○" : "×"} |`).join("\n") + "\n");

const ok = results.every((r) => r.ok);
console.log("# 申立書 記入位置の検証(設計 §9-2)\n");
for (const r of results.sort((a, b) => a.id - b.id)) console.log(`${r.ok ? "○" : "×"} ${r.id}. ${r.label}\n   ${r.note}`);
if (!ok) process.exitCode = 1;
