#!/usr/bin/env node
/* デザイン第2段 候補 7: font-size を 6 段(13/15/17/19/24/30〜34px)、line-height を 2 値(1.4 / 1.85)に寄せる 1 回限りの変換
   (docs/design-system.md §2-2、docs/site-audit-2026-10-13.md §7-3)。
   対象: app/globals.css・app/platform.css・app/columns/columns.css・app/morita/morita.css の宣言値。
   触らないもの(理由つき):
   - @media print の中と、申立書・見立ての紙面(.mt-paper* / .mt-measure / .mi-ds* など pt 単位の指定): 用紙の実寸に合わせた値
   - font-size: inherit / 0 / smaller 等のキーワード、em 単位(親に対する比率で、アイコンや sr-only 用)、var() 参照
   - line-height の px / em / normal / inherit(高さ合わせの指定)
   変換の規則(px 換算。rem は html 17px):
   - font-size: <14 → 13、14〜<16 → 15、16〜<18 → 17、18〜<21 → 19、21〜<27 → 24、27 以上 → var(--text-h1)(30px、761px 以上で 34px)
     clamp()/calc() は最大値で判定して固定値にする
   - line-height(単位なし): <=1.6 → 1.4(見出し・UI)、>1.6 → 1.85(本文)
   - font: ショートハンドの size/line-height も同じ規則
   出力: 置換した一覧を typescale-map.md に書く。  node docs/verification/design-system-2026-10-13/typescale.mjs [--dry] */
import { readFileSync, writeFileSync } from "node:fs";

const FILES = ["app/globals.css", "app/platform.css", "app/columns/columns.css", "app/morita/morita.css"];
const dry = process.argv.includes("--dry");
const REM = 17;
const toPx = (v) => {
  const m = /^(-?[\d.]+)(px|rem)$/.exec(v);
  if (!m) return null;
  return m[2] === "px" ? Number(m[1]) : Number(m[1]) * REM;
};
const sizeToken = (px) => (px < 14 ? "13px" : px < 16 ? "15px" : px < 18 ? "17px" : px < 21 ? "19px" : px < 27 ? "24px" : "var(--text-h1)");
const lhToken = (n) => (n <= 1.6 ? "1.4" : "1.85");
/* clamp(a, b, c) / calc は最大値で判定 */
const sizePx = (value) => {
  const v = value.trim();
  const direct = toPx(v);
  if (direct !== null) return direct;
  const clamp = /^clamp\(\s*([^,]+),\s*[^,]+,\s*([^)]+)\)$/.exec(v);
  if (clamp) { const hi = toPx(clamp[2].trim()); const lo = toPx(clamp[1].trim()); return hi ?? lo; }
  return null;
};

const rows = [];
let total = 0;
for (const file of FILES) {
  let css = readFileSync(file, "utf8");
  /* コメントと @media print ブロックは退避 */
  const stash = [];
  const keep = (m) => { stash.push(m); return `\u0000${stash.length - 1}\u0000`; };
  css = css.replace(/\/\*[\s\S]*?\*\//g, keep);
  css = css.replace(/@media\s*print\s*\{(?:[^{}]*\{[^{}]*\})*[^{}]*\}/g, keep);
  /* 紙面の規則(セレクタに .mt-paper / .mt-measure / .mi-ds / .mi-print / .mi-doctor / .mt-print を含む)は退避 */
  css = css.replace(/(^|[}\n;])([^{}\n]*(?:\.mt-paper|\.mt-measure|\.mi-ds|\.mi-print|\.mi-doctor|\.mt-print-controls fieldset)[^{}]*)\{([^{}]*)\}/g, (m, pre, sel, body) => pre + keep(sel + "{" + body + "}"));

  const seen = new Set();
  const lineOf = (idx) => css.slice(0, idx).split("\n").length;
  css = css.replace(/([{;]\s*)(font-size|line-height|font)(\s*:\s*)([^;{}]+?)(?=\s*[;}])/g, (m, pre, prop, sep, value, offset) => {
    const v = value.trim();
    if (/var\(|inherit|initial|unset|smaller|larger|^0$|!important/.test(v) && prop !== "font") return m;
    let out = null;
    if (prop === "font-size") {
      if (/pt$|em$|%$/.test(v) && !/rem$/.test(v)) return m;
      const px = sizePx(v);
      if (px === null) return m;
      out = sizeToken(px);
    } else if (prop === "line-height") {
      if (!/^[\d.]+$/.test(v)) return m;
      out = lhToken(Number(v));
    } else if (prop === "font") {
      if (v === "inherit") return m;
      /* [style] [weight] size[/line-height] family */
      const f = /^(.*?)(\d[\d.]*(?:px|rem)|clamp\([^)]*\))(?:\s*\/\s*([\d.]+))?(\s+.+)$/.exec(v);
      if (!f) return m;
      const px = sizePx(f[2]);
      if (px === null) return m;
      out = `${f[1]}${sizeToken(px)}${f[3] ? "/" + lhToken(Number(f[3])) : ""}${f[4]}`;
    }
    if (out === null || out === v) return m;
    total += 1;
    rows.push([file.replace("app/", ""), lineOf(offset), prop, v, out]);
    return pre + prop + sep + out;
  });
  css = css.replace(/\u0000(\d+)\u0000/g, (_, i) => stash[Number(i)]);
  if (!dry) writeFileSync(file, css);
}
const md = [`# 候補 7 の置換一覧(${new Date().toISOString().slice(0, 10)})`, "", `${total} 宣言。font-size は 6 段、line-height は 1.4 / 1.85。印刷・紙面・pt/em/% 指定は対象外。`, "", "| ファイル | 行 | プロパティ | 前 | 後 |", "|---|---|---|---|---|", ...rows.map((r) => `| ${r.join(" | ")} |`), ""];
writeFileSync("docs/verification/design-system-2026-10-13/typescale-map.md", md.join("\n"));
const byProp = {};
for (const r of rows) byProp[r[2]] = (byProp[r[2]] ?? 0) + 1;
console.log(`${dry ? "(dry) " : ""}置換 ${total} 件`, byProp);
