#!/usr/bin/env node
/* デザイントークンの棚卸しとコントラスト検査。
 * docs/design-system-2026-09-05-instructions.md §6-1・§6-2。
 *
 *   node scripts/verify-design-tokens.mjs            いまの CSS を検査する
 *   node scripts/verify-design-tokens.mjs --ref main main の CSS と比べる
 *
 * 数えるのは app/globals.css と app/platform.css の 2 本だけ。
 * 目標: 色 ≤ 20 / font-size ≤ 12 / 角丸 ≤ 3 / 影 ≤ 1 / コントラスト 4.5 未満 0。
 */
import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";

const FILES = ["app/globals.css", "app/platform.css"];
const LIMITS = { colors: 20, fontSizes: 12, radii: 3, shadows: 1 };

const args = process.argv.slice(2);
const refIndex = args.indexOf("--ref");
const ref = refIndex >= 0 ? args[refIndex + 1] : null;

function read(file, from) {
  if (!from) return readFileSync(file, "utf8");
  return execFileSync("git", ["show", `${from}:${file}`], { encoding: "utf8" });
}

/* ---------- 色 ---------- */
const HEX = /#[0-9a-fA-F]{3,8}\b/g;
const FUNC = /\b(?:rgba?|hsla?)\([^)]*\)/g;

function normalizeHex(hex) {
  let h = hex.slice(1).toLowerCase();
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  if (h.length === 4) h = h.slice(0, 3).split("").map((c) => c + c).join("");
  if (h.length === 8) h = h.slice(0, 6);
  return `#${h}`;
}

function toRgb(value) {
  const v = value.trim().toLowerCase();
  if (v === "#fff" || v === "white") return [255, 255, 255];
  if (v.startsWith("#")) {
    const h = normalizeHex(v).slice(1);
    return [0, 2, 4].map((i) => Number.parseInt(h.slice(i, i + 2), 16));
  }
  const m = /rgba?\(([^)]+)\)/.exec(v);
  if (m) {
    const parts = m[1].split(/[,\s/]+/).filter(Boolean).map(Number);
    if (parts.length >= 3 && parts.every((n) => Number.isFinite(n))) return parts.slice(0, 3);
  }
  return null;
}

function luminance([r, g, b]) {
  const f = (c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}

function contrast(a, b) {
  const [x, y] = [luminance(a), luminance(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
}

/* 半透明の色は、白の上に重ねた結果で見る(その用途しかない)。 */
function flatten(value, onto = [255, 255, 255]) {
  const v = value.trim().toLowerCase();
  const rgb = toRgb(v);
  if (!rgb) return null;
  let alpha = 1;
  const hex = v.startsWith("#") ? v.slice(1) : "";
  if (hex.length === 8) alpha = Number.parseInt(hex.slice(6, 8), 16) / 255;
  const m = /rgba\(([^)]+)\)/.exec(v);
  if (m) {
    const parts = m[1].split(/[,\s/]+/).filter(Boolean);
    if (parts.length >= 4) alpha = Number.parseFloat(parts[3]);
  }
  if (!Number.isFinite(alpha)) alpha = 1;
  return rgb.map((c, i) => Math.round(c * alpha + onto[i] * (1 - alpha)));
}

/* ---------- 変数の解決 ---------- */
function varMap(css) {
  const map = new Map();
  for (const m of css.matchAll(/(--[\w-]+)\s*:\s*([^;{}]+);/g)) map.set(m[1], m[2].trim());
  return map;
}

function resolve(value, map, depth = 0) {
  if (depth > 12) return value;
  const m = /var\((--[\w-]+)(?:\s*,\s*([^)]+))?\)/.exec(value);
  if (!m) return value;
  const next = map.has(m[1]) ? map.get(m[1]) : (m[2] ?? "");
  return resolve(value.replace(m[0], next.trim()), map, depth + 1);
}

/* ---------- 棚卸し ---------- */
/* 申立書の印刷 CSS(@media print / @page / .mt-paper 系)は指示書 §5 で「触らない」と
 * 決めた領域なので、目標の判定からは外し、別に数える。 */
const PROTECTED = /@media\s+print|@page|mt-paper|mt-a3|mt-a4|mt-half|mt-measure|mt-print/;

function blocks(css) {
  const out = [];
  const stack = [];
  let buf = "";
  for (const ch of css) {
    if (ch === "{") { stack.push(buf.trim()); buf = ""; }
    else if (ch === "}") { if (buf.trim()) out.push({ stack: [...stack], body: buf }); buf = ""; stack.pop(); }
    else buf += ch;
  }
  return out;
}

const isColorProp = (prop) => /(^|-)color$/.test(prop) || /^(background|border|outline|box-shadow|fill|stroke)(-|$)/.test(prop);

function inventory(cssList) {
  const screen = { colors: new Set(), fontSizes: new Set(), radii: new Set(), shadows: new Set() };
  const print = { colors: new Set(), fontSizes: new Set(), radii: new Set(), shadows: new Set() };
  for (const css of cssList) {
    for (const block of blocks(css)) {
      const bucket = block.stack.some((s) => PROTECTED.test(s)) ? print : screen;
      for (const m of block.body.matchAll(/([-a-zA-Z]+)\s*:\s*([^;{}]+)/g)) {
        const prop = m[1].toLowerCase();
        const value = m[2].trim();
        if (prop.startsWith("--")) continue;
        if (isColorProp(prop)) {
          for (const hex of value.match(HEX) ?? []) bucket.colors.add(normalizeHex(hex));
          for (const fn of value.match(FUNC) ?? []) bucket.colors.add(fn.replace(/\s+/g, ""));
        }
        if (prop === "font-size") bucket.fontSizes.add(value.replace(/\s+/g, " "));
        if (prop === "border-radius" && value !== "inherit") {
          /* 片側だけ丸めた指定(0 var(--r-card) …)も、使っている半径の種類で数える。 */
          for (const atom of value.split(/\s+/)) {
            if (atom === "0" || atom === "0px" || atom === "/") continue;
            bucket.radii.add(atom);
          }
        }
        if (prop === "box-shadow" && value !== "none") bucket.shadows.add(value.replace(/\s+/g, " "));
      }
    }
  }
  return { screen, print };
}

/* ---------- コントラスト ---------- */
/* 文字が乗りうる面。白・帯は明るい面、主色・見出し色(フッターの地)は暗い面。
 * 明るい面で 4.5 を満たすか、暗い面で 4.5 を満たすかの、どちらかであれば通す。
 * 「白地では読めないが濃い地の上でだけ使う色」(フッターの文字)を誤判定しないため。 */
function surfaces(map) {
  const band = flatten(resolve("var(--c-band)", map)) ?? [238, 246, 252];
  const primary = flatten(resolve("var(--c-primary)", map)) ?? [2, 115, 173];
  const deep = flatten(resolve("var(--c-heading)", map)) ?? [20, 66, 94];
  return {
    light: [["白", [255, 255, 255]], ["帯", band]],
    dark: [["主色", primary], ["見出し色", deep]],
  };
}

function contrastCheck(cssList, map) {
  const css = cssList.join("\n");
  const rows = [];
  const seen = new Set();
  for (const m of css.matchAll(/(^|[;{\s])color\s*:\s*([^;{}]+)/gi)) {
    const raw = m[2].trim();
    if (/inherit|currentcolor|transparent|initial|unset/i.test(raw)) continue;
    const rgb = flatten(resolve(raw, map));
    if (!rgb) continue;
    if (seen.has(raw)) continue;
    seen.add(raw);
    rows.push({ raw, rgb });
  }
  const s = surfaces(map);
  const out = [];
  for (const row of rows) {
    const onWhite = contrast(row.rgb, [255, 255, 255]);
    if (onWhite >= 4.5) {
      /* 明るい面に置く文字。白と帯の両方で見る(帯のほうが厳しい)。 */
      const worst = s.light.map(([name, bg]) => [name, contrast(row.rgb, bg)]).sort((a, b) => a[1] - b[1])[0];
      out.push({ ...row, bg: worst[0], ratio: worst[1] });
    } else {
      /* 白地で読めない色は、濃い面に置く文字(フッターの地・主色の面)。 */
      const isWhite = row.rgb.every((c) => c > 250);
      const checked = isWhite ? s.dark : s.dark.filter(([name]) => name === "見出し色");
      const worst = checked.map(([name, bg]) => [name, contrast(row.rgb, bg)]).sort((a, b) => a[1] - b[1])[0];
      out.push({ ...row, bg: worst[0], ratio: worst[1] });
    }
  }
  return out;
}

/* ---------- 実行 ---------- */
const current = FILES.map((f) => read(f));
const map = varMap(current.join("\n"));
const now = inventory(current);
const fail = [];

let before = null;
if (ref) before = inventory(FILES.map((f) => read(f, ref)));

const KEYS = [["色", "colors", LIMITS.colors], ["font-size", "fontSizes", LIMITS.fontSizes],
  ["border-radius", "radii", LIMITS.radii], ["box-shadow", "shadows", LIMITS.shadows]];

console.log("# デザイントークンの棚卸し");
console.log("");
console.log("画面の CSS だけを数える。申立書の印刷 CSS(指示書 §5 で触らないと決めた領域)は別に出す。");
console.log("");
console.log(before ? `| 種類 | ${ref} | いま | 目標 | 判定 | 印刷CSS |` : "| 種類 | いま | 目標 | 判定 | 印刷CSS |");
console.log(before ? "|---|---:|---:|---:|---|---:|" : "|---|---:|---:|---|---:|");
for (const [label, key, limit] of KEYS) {
  const count = now.screen[key].size;
  const ok = count <= limit;
  if (!ok) fail.push(`${label} ${count} > ${limit}`);
  const prev = before ? before.screen[key].size : null;
  console.log(before
    ? `| ${label} | ${prev} | ${count} | ≤ ${limit} | ${ok ? "○" : "×"} | ${now.print[key].size} |`
    : `| ${label} | ${count} | ≤ ${limit} | ${ok ? "○" : "×"} | ${now.print[key].size} |`);
}
if (args.includes("--list")) {
  for (const [label, key] of KEYS) {
    console.log("");
    console.log(`### ${label}(画面 ${now.screen[key].size})`);
    console.log("");
    console.log([...now.screen[key]].sort().map((v) => `- \`${v}\``).join("\n"));
  }
}

const checks = contrastCheck(current, map);
const ng = checks.filter((r) => r.ratio < 4.5);
console.log("");
console.log(`## コントラスト(WCAG AA 4.5:1)`);
console.log("");
console.log(`検査した color の値 ${new Set(checks.map((r) => r.raw)).size} 種 ・ 組み合わせ ${checks.length} ・ 4.5 未満 ${ng.length}`);
if (ng.length > 0) {
  console.log("");
  console.log("| 値 | 解決後 | 背景 | 比 |");
  console.log("|---|---|---|---:|");
  for (const r of ng.sort((a, b) => a.ratio - b.ratio)) {
    console.log(`| \`${r.raw}\` | rgb(${r.rgb.join(",")}) | ${r.bg} | ${r.ratio.toFixed(2)} |`);
  }
  fail.push(`コントラスト 4.5 未満 ${ng.length}`);
}

/* 直接の色コードと廃止したトークンが残っていないか(§6-3)。 */
const banned = [["#0284c7", /#0284c7/gi], ["--jc-", /--jc-[\w-]+/g]];
console.log("");
console.log("## 廃止したもの");
console.log("");
console.log("| 対象 | 残り |");
console.log("|---|---:|");
for (const [label, re] of banned) {
  const count = FILES.reduce((sum, f) => sum + (read(f).match(re) ?? []).length, 0);
  console.log(`| ${label} | ${count} |`);
  if (count > 0) fail.push(`${label} が ${count} 箇所残っている`);
}

console.log("");
if (fail.length === 0) {
  console.log("すべて基準内。");
} else {
  console.log(`× ${fail.length} 件: ${fail.join(" / ")}`);
  process.exitCode = 1;
}
