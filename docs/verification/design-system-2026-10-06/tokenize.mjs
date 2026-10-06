#!/usr/bin/env node
/* 第1段のトークン切り出し(1 回限りの移行スクリプト。記録のために残す)。
 * 1. app/globals.css の :root を、design-tokens.css のエイリアスに置き換える(@import を先頭に足す)
 * 2. app/platform.css の :root のうち、値が新トークンと完全一致するものをエイリアスにする
 * 3. 3 つの CSS の宣言値に直書きされた hex のうち、新トークンの値と完全一致するものだけ var() にする
 *    (カスタムプロパティの定義・url() の中・コメントは触らない)。描画は変わらない。 */
import { readFileSync, writeFileSync } from "node:fs";

const MAP = {
  "#1e3a4d": "--ink", "#4a6a80": "--ink-muted", "#6e8ba0": "--ink-faint",
  "#f7fbfe": "--paper", "#eef6fc": "--paper-deep", "#dcebf5": "--line", "#cfe6f5": "--line-strong",
  "#0273ad": "--primary", "#015d8c": "--primary-deep", "#e3f2fc": "--primary-wash",
  "#067647": "--ok", "#8b6a1f": "--warn", "#b3261e": "--danger",
  /* 既存トークンの値を直書きしている分(名前は旧のまま。第2段で --primary と統合するか決める) */
  "#0284c7": "--platform-primary",
};
const norm = (hex) => { let x = hex.slice(1).toLowerCase(); if (x.length === 3) x = [...x].map((c) => c + c).join(""); return "#" + x; };

function replaceDecls(css) {
  let n = 0;
  // コメントは退避
  const comments = [];
  css = css.replace(/\/\*[\s\S]*?\*\//g, (m) => { comments.push(m); return `\u0000${comments.length - 1}\u0000`; });
  css = css.replace(/([{;]\s*)([\w-]+)(\s*:\s*)([^;{}]+?)(?=\s*[;}])/g, (m, pre, prop, sep, value) => {
    if (prop.startsWith("--")) return m;
    const parts = value.split(/(url\([^)]*\))/g);
    const out = parts.map((part) => part.startsWith("url(") ? part : part.replace(/#[0-9a-fA-F]{3,8}\b/g, (hex) => {
      const t = MAP[norm(hex)];
      if (!t || hex.length === 5 || hex.length === 9) return hex;
      n++; return `var(${t})`;
    })).join("");
    return pre + prop + sep + out;
  });
  css = css.replace(/\u0000(\d+)\u0000/g, (_, i) => comments[Number(i)]);
  return [css, n];
}

/* 1. globals.css */
let g = readFileSync("app/globals.css", "utf8");
const rootStart = g.indexOf(":root {");
const rootEnd = g.indexOf("}", rootStart) + 1;
const newRoot = `@import "./design-tokens.css";

/*
 * 旧トークン(互換のため名前を残す)。値は app/design-tokens.css の意味トークンを指す。
 * 2026-10-06 デザインシステム第1段(docs/design-system.md)。旧名を新しく使わない。
 * ここに無い値(--card-warm・--accent・--gold-wash・--card-border 系)は新トークンと一致しないので、
 * 第2段で寄せるまで実体値のまま(docs/design-system.md 末尾の候補一覧)。
 */
:root {
  --bg: var(--paper);
  --bg-deep: var(--paper-deep);
  --card: var(--paper-card);
  --card-warm: #fbfdff;
  --green: var(--primary);
  --green-dark: var(--primary-deep);
  --green-deep: #14425e;
  --green-softer: rgba(2, 132, 199, 0.045);
  --green-tint: rgba(2, 132, 199, 0.06);
  --green-tint-2: rgba(2, 132, 199, 0.12);
  --text: var(--ink);
  --text-muted: var(--ink-muted);
  --border: var(--line);
  --card-border: rgba(2, 115, 173, 0.2);
  --card-border-strong: rgba(2, 115, 173, 0.36);
  --note-bg: var(--paper-deep);
  --green-pale: var(--primary-wash);
  --marker: var(--mark);
  --accent: #5b7a90;
  --accent-soft: #a8c9dd;
  --gold-wash: rgba(2, 132, 199, 0.05);

  /* --radius / --shadow / --content / --gutter / --ease は design-tokens.css で定義。--radius-xl だけ旧名 */
  --radius-xl: 12px;

  /* 見出し専用の明朝(layout.tsx で next/font から注入)。本文はシステムゴシックのまま。 */
  --font-display: "Zen Old Mincho", "Hiragino Mincho ProN", "Yu Mincho", serif;
}`;
// :root の直前のファイル先頭コメントは残し、:root ブロックだけ差し替える
g = g.slice(0, rootStart) + newRoot + g.slice(rootEnd);
// 先頭コメントの前に @import が来る必要がある(CSS の @import は他の規則より前)。コメント → @import の順でもよいが、確実に先頭へ。
g = g.replace(`@import "./design-tokens.css";\n\n`, "");
g = `@import "./design-tokens.css";\n\n` + g;
const [g2, gn] = replaceDecls(g);
writeFileSync("app/globals.css", g2);

/* 2. platform.css の :root */
let p = readFileSync("app/platform.css", "utf8");
const alias = {
  "--platform-bg": "var(--paper)", "--platform-surface": "var(--paper-card)", "--platform-band": "var(--paper-deep)",
  "--platform-link": "var(--primary)", "--platform-link-hover": "var(--primary-deep)", "--platform-chip": "var(--primary-wash)",
  "--platform-text": "var(--ink)", "--platform-muted": "var(--ink-muted)", "--platform-meta": "var(--ink-faint)", "--platform-border": "var(--line)",
};
let pn = 0;
for (const [name, value] of Object.entries(alias)) {
  const re = new RegExp(`(\\n  ${name}: )#[0-9a-f]{6};`);
  if (!re.test(p)) throw new Error(`platform.css: ${name} が見つからない`);
  p = p.replace(re, `$1${value};`); pn++;
}
p = p.replace("/* 2026-09 情報プラットフォーム共通トークン。\n * 既存コラムの本文レイアウトとは分離し、新設ハブと共通ナビだけへ適用する。 */",
  "/* 2026-09 情報プラットフォーム共通トークン。\n * 既存コラムの本文レイアウトとは分離し、新設ハブと共通ナビだけへ適用する。\n * 2026-10-06: 値が app/design-tokens.css と一致するものはエイリアスにした(描画は同じ)。--platform-primary(#0284c7)は\n * --primary(#0273ad)と値が違うので実体のまま。統合は第2段(docs/design-system.md)。 */");
const [p2, pn2] = replaceDecls(p);
writeFileSync("app/platform.css", p2);

/* 3. columns.css */
const [c2, cn] = replaceDecls(readFileSync("app/columns/columns.css", "utf8"));
writeFileSync("app/columns/columns.css", c2);

console.log(`globals.css: hex→var ${gn} 件 / platform.css: :root エイリアス ${pn}・hex→var ${pn2} 件 / columns.css: ${cn} 件`);
