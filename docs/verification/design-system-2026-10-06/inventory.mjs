#!/usr/bin/env node
/* デザインシステム第1段の棚卸し(docs/design-system-2026-10-06-instructions.md §1)。
 * app/globals.css・app/platform.css・app/columns/columns.css の宣言を読み、色・書体・余白・角丸・影・動きの分布を
 * docs/verification/design-system-2026-10-06/inventory.md に書き出す。描画には関与しない。
 *   node docs/verification/design-system-2026-10-06/inventory.mjs */
import { existsSync, readFileSync, writeFileSync } from "node:fs";

/* ROOT=<dir> で別のツリー(git の HEAD を書き出した場所など)を読める。OUT で出力名を変える。
   第1段の棚卸し(inventory.md)はトークン切り出し前の状態、inventory-after.md は切り出し後。 */
const ROOT = process.env.ROOT ?? ".";
const OUT = process.env.OUT ?? "inventory.md";
const FILES = ["app/design-tokens.css", "app/globals.css", "app/platform.css", "app/columns/columns.css"].filter((f) => existsSync(`${ROOT}/${f}`));
const decls = []; // { file, media, selector, prop, value, line }
const rootVars = {}; // name -> { value, file }

function parse(file) {
  let css = readFileSync(`${ROOT}/${file}`, "utf8");
  // コメントを同じ長さの空白に(行番号を保つ)
  css = css.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " "));
  const stack = [];
  let buf = "";
  let line = 1;
  let declStart = 1;
  for (let i = 0; i < css.length; i++) {
    const ch = css[i];
    if (ch === "\n") line++;
    if (ch === "{") {
      stack.push(buf.trim().replace(/\s+/g, " "));
      buf = "";
      declStart = line;
    } else if (ch === "}") {
      flush(file, stack, buf, declStart);
      buf = "";
      stack.pop();
      declStart = line;
    } else if (ch === ";") {
      flush(file, stack, buf, declStart);
      buf = "";
      declStart = line;
    } else buf += ch;
  }
}
function flush(file, stack, text, line) {
  const t = text.trim();
  if (!t || !t.includes(":")) return;
  const idx = t.indexOf(":");
  const prop = t.slice(0, idx).trim();
  const value = t.slice(idx + 1).trim();
  const media = stack.filter((s) => s.startsWith("@")).join(" ");
  const selector = stack.filter((s) => !s.startsWith("@")).join(" ");
  decls.push({ file, media, selector, prop, value, line });
  if (prop.startsWith("--") && /^(:root|\.mt-redesign|\.platform|html)$/.test(selector) && !media) {
    rootVars[prop] = rootVars[prop] ?? { value, file, selector };
  }
}
FILES.forEach(parse);

const count = (arr) => { const m = new Map(); for (const a of arr) m.set(a, (m.get(a) ?? 0) + 1); return [...m.entries()].sort((a, b) => b[1] - a[1] || String(a[0]).localeCompare(String(b[0]))); };
const short = (s, n = 70) => (s.length > n ? s.slice(0, n - 1) + "…" : s);
const md = [];
const h = (t) => md.push("", `## ${t}`, "");
const table = (head, rows) => { md.push(`| ${head.join(" | ")} |`, `|${head.map(() => "---").join("|")}|`); for (const r of rows) md.push(`| ${r.map((c) => String(c).replace(/\|/g, "\\|")).join(" | ")} |`); };

md.push(`# デザインシステム棚卸し(2026-10-06${OUT.includes("after") ? "・トークン切り出し後" : "・切り出し前 = 第1段の基準"})`, "", `対象: ${FILES.join("・")}。宣言 ${decls.length} 件。生成: inventory.mjs(手で直さない。ROOT=<HEAD を書き出した場所> で切り出し前を再現)。`);

/* ---- 1. 色 ---- */
const colorRe = /#[0-9a-fA-F]{3,8}\b|rgba?\([^)]*\)|hsla?\([^)]*\)|\b(?:white|black|transparent|currentColor)\b/g;
const normHex = (c) => {
  if (!c.startsWith("#")) return c.replace(/\s+/g, "");
  let x = c.slice(1).toLowerCase();
  if (x.length === 3 || x.length === 4) x = [...x].map((ch) => ch + ch).join("");
  return "#" + x;
};
const colorUses = new Map(); // color -> { n, selectors:Set, props:Set, files:Set, inRoot:bool }
for (const d of decls) {
  for (const raw of d.value.match(colorRe) ?? []) {
    if (raw === "currentColor" || raw === "transparent") continue;
    const c = normHex(raw);
    const u = colorUses.get(c) ?? { n: 0, selectors: new Set(), props: new Set(), files: new Set(), vars: new Set() };
    u.n++; u.selectors.add(d.selector || d.media); u.props.add(d.prop); u.files.add(d.file.replace("app/", ""));
    if (d.prop.startsWith("--")) u.vars.add(d.prop);
    colorUses.set(c, u);
  }
}
const colorRows = [...colorUses.entries()].sort((a, b) => b[1].n - a[1].n);
const hexOnly = colorRows.filter(([c]) => c.startsWith("#"));
const tokenColors = colorRows.filter(([, u]) => u.vars.size);
const orphanColors = colorRows.filter(([, u]) => !u.vars.size);
h("1. 色");
md.push(`- 異なる色の値: **${colorRows.length}**(hex ${hexOnly.length}、rgba/hsl ${colorRows.length - hexOnly.length})。うちトークン(カスタムプロパティ)として定義されている値 ${tokenColors.length}、どのトークンにも無い「孤立色」 **${orphanColors.length}**。`);
md.push(`- 孤立色の出現回数の合計 ${orphanColors.reduce((s, [, u]) => s + u.n, 0)}(第1段で置換できるのは、既存トークンと完全一致する値だけ。それは下の表の「=トークン」欄に出る)。`);
md.push("", "### 1-1. 名前と実体のずれ", "");
const misnamed = Object.entries(rootVars).filter(([n, v]) => /green/.test(n) && /#0[0-9a-f]{5}|rgba\(2,/.test(v.value) || /gold|marker|accent|warm/.test(n));
table(["トークン", "値", "定義元", "備考"], misnamed.map(([n, v]) => [`\`${n}\``, `\`${v.value}\``, v.file.replace("app/", ""), /green/.test(n) ? "名前は緑、実体は青" : "旧・金色アクセントの名残(値は青系・中立色)"]));
md.push("", "### 1-2. 色の全一覧(出現回数順)", "");
const varByValue = new Map();
for (const [n, v] of Object.entries(rootVars)) { const c = (v.value.match(colorRe) ?? [])[0]; if (c && v.value.trim() === c) { const k = normHex(c); varByValue.set(k, [...(varByValue.get(k) ?? []), n]); } }
table(["色", "回数", "=トークン", "prop", "使うセレクタ(抜粋)", "ファイル"], colorRows.map(([c, u]) => [`\`${c}\``, u.n, (varByValue.get(c) ?? []).map((v) => `\`${v}\``).join(" ") || "(無し)", [...u.props].slice(0, 4).join(", "), short([...u.selectors].slice(0, 3).join(" / ")), [...u.files].join(", ")]));

/* ---- 2. 書体 ---- */
h("2. 書体");
const fs = decls.filter((d) => d.prop === "font-size");
const lh = decls.filter((d) => d.prop === "line-height");
const fw = decls.filter((d) => d.prop === "font-weight");
const fontShort = decls.filter((d) => d.prop === "font");
md.push(`- font-size の宣言 ${fs.length} 件、異なる値 **${count(fs.map((d) => d.value)).length}**。line-height ${lh.length} 件 / ${count(lh.map((d) => d.value)).length} 種。font-weight ${fw.length} 件 / ${count(fw.map((d) => d.value)).length} 種。font ショートハンド ${fontShort.length} 件。`);
md.push("", "### 2-1. font-size の値(回数順)", "");
table(["font-size", "回数"], count(fs.map((d) => d.value)).map(([v, n]) => [`\`${v}\``, n]));
md.push("", "### 2-2. line-height の値", "");
table(["line-height", "回数"], count(lh.map((d) => d.value)).map(([v, n]) => [`\`${v}\``, n]));
md.push("", "### 2-3. font-weight の値", "");
table(["font-weight", "回数"], count(fw.map((d) => d.value)).map(([v, n]) => [`\`${v}\``, n]));
md.push("", "### 2-4. 同じセレクタ内の font-size × line-height × font-weight の組み合わせ", "");
const combos = new Map();
const bySel = new Map();
for (const d of decls) { if (["font-size", "line-height", "font-weight"].includes(d.prop)) { const k = `${d.file}|${d.media}|${d.selector}`; const o = bySel.get(k) ?? {}; o[d.prop] = d.value; bySel.set(k, o); } }
for (const o of bySel.values()) { const k = `${o["font-size"] ?? "-"} / ${o["line-height"] ?? "-"} / ${o["font-weight"] ?? "-"}`; combos.set(k, (combos.get(k) ?? 0) + 1); }
md.push(`組み合わせ **${combos.size}** 種(セレクタ単位 ${bySel.size})。上位 40:`, "");
table(["font-size / line-height / font-weight", "セレクタ数"], [...combos.entries()].sort((a, b) => b[1] - a[1]).slice(0, 40).map(([k, n]) => [`\`${k}\``, n]));
md.push("", "### 2-5. font-family", "");
table(["font-family", "回数"], count(decls.filter((d) => d.prop === "font-family").map((d) => d.value)).map(([v, n]) => [`\`${short(v, 90)}\``, n]));
md.push("", "### 2-6. letter-spacing / font-variant-numeric", "");
table(["prop", "値", "回数"], [...count(decls.filter((d) => d.prop === "letter-spacing").map((d) => d.value)).map(([v, n]) => ["letter-spacing", `\`${v}\``, n]), ...count(decls.filter((d) => d.prop === "font-variant-numeric").map((d) => d.value)).map(([v, n]) => ["font-variant-numeric", `\`${v}\``, n])]);

/* ---- 3. 余白 ---- */
h("3. 余白(margin / padding / gap)");
const spaceProps = /^(margin|padding|gap|row-gap|column-gap|margin-(top|bottom|left|right|block|inline)|padding-(top|bottom|left|right|block|inline))$/;
const spaceVals = [];
for (const d of decls.filter((d) => spaceProps.test(d.prop))) for (const v of d.value.split(/\s+/)) if (/^-?[\d.]+(px|rem|em)$|^0$|^auto$|^clamp\(|^var\(/.test(v) || v.startsWith("clamp(")) spaceVals.push(v);
const unitDist = count(spaceVals.map((v) => (v.match(/px|rem|em|clamp|var|auto|^0$/) ?? ["other"])[0]));
md.push(`- 余白の宣言 ${decls.filter((d) => spaceProps.test(d.prop)).length} 件、値 ${spaceVals.length} 個、異なる値 **${count(spaceVals).length}**。単位の分布: ${unitDist.map(([u, n]) => `${u} ${n}`).join("、")}。`);
const px = (v) => { const m = v.match(/^(-?[\d.]+)(px|rem|em)$/); if (!m) return null; const n = Number(m[1]); return m[2] === "px" ? n : n * 17; };
const on8 = spaceVals.filter((v) => { const p = px(v); return p !== null && p !== 0 && Math.abs(p / 4 - Math.round(p / 4)) < 1e-6; }).length;
const measurable = spaceVals.filter((v) => px(v) !== null && px(v) !== 0).length;
md.push(`- 8px 単位の格子(4px 刻み含む)に乗る値: ${on8} / ${measurable}(html 17px 換算)。`);
md.push("", "### 3-1. 値の分布(回数順・上位 60)", "");
table(["値", "回数", "px 換算"], count(spaceVals).slice(0, 60).map(([v, n]) => [`\`${v}\``, n, px(v) === null ? "-" : Math.round(px(v) * 100) / 100]));

/* ---- 4. 角丸・影 ---- */
h("4. border-radius / box-shadow");
table(["border-radius", "回数"], count(decls.filter((d) => d.prop === "border-radius").map((d) => d.value)).map(([v, n]) => [`\`${v}\``, n]));
md.push("");
table(["box-shadow", "回数"], count(decls.filter((d) => d.prop === "box-shadow").map((d) => d.value)).map(([v, n]) => [`\`${short(v, 100)}\``, n]));

/* ---- 5. 動き ---- */
h("5. transition / animation");
const tr = decls.filter((d) => /^transition/.test(d.prop));
const an = decls.filter((d) => /^animation/.test(d.prop));
const durations = [];
for (const d of tr) for (const m of d.value.match(/\b[\d.]+m?s\b/g) ?? []) durations.push(m);
md.push(`- transition 系の宣言 **${tr.length}** 件(異なる値 ${count(tr.map((d) => d.value)).length})、animation 系 **${an.length}** 件、@keyframes ${decls.length ? [...new Set(FILES.flatMap((f) => readFileSync(`${ROOT}/${f}`, "utf8").match(/@keyframes\s+[\w-]+/g) ?? []))].length : 0} 個。`);
md.push(`- 時間の分布: ${count(durations).map(([v, n]) => `${v} ×${n}`).join("、")}。`);
md.push(`- イージング: ${count(tr.flatMap((d) => d.value.match(/var\(--ease\)|ease(-in-out|-in|-out)?|linear|cubic-bezier\([^)]*\)/g) ?? [])).map(([v, n]) => `\`${v}\` ×${n}`).join("、")}。`);
const rm = FILES.flatMap((f) => { const src = readFileSync(`${ROOT}/${f}`, "utf8"); return (src.match(/@media \(prefers-reduced-motion[^)]*\)/g) ?? []).map((m) => `${f.replace("app/", "")}: ${m}`); });
md.push(`- prefers-reduced-motion: ${rm.length ? rm.join(" / ") : "無し"}。globals.css は reduce で animation/transition を 0.01ms に、no-preference でだけ scroll-behavior: smooth。`);
md.push("", "### 5-1. transition の全一覧", "");
table(["値", "回数", "セレクタ(抜粋)"], count(tr.map((d) => d.value)).map(([v, n]) => [`\`${short(v, 90)}\``, n, short(tr.filter((d) => d.value === v).map((d) => d.selector).slice(0, 3).join(" / "))]));
md.push("", "### 5-2. animation", "");
table(["prop", "値", "セレクタ"], an.map((d) => [d.prop, `\`${d.value}\``, short(d.selector)]));

/* ---- 6. トークン一覧 ---- */
h("6. :root のカスタムプロパティ(定義順)");
table(["名前", "値", "定義元", "参照回数"], Object.entries(rootVars).map(([n, v]) => [`\`${n}\``, `\`${short(v.value, 60)}\``, `${v.file.replace("app/", "")} ${v.selector}`, decls.filter((d) => !d.prop.startsWith("--") && d.value.includes(`var(${n})`)).length]));

/* ---- 7. 部品(手で書いた対応表。コンポーネント → クラス → 定義場所) ---- */
h("7. 部品の一覧(コンポーネント・クラス・定義場所・重複)");
const PARTS = [
  ["結論の箱(lead)", "components/ColumnArticle.tsx", ".column-conclusion", "app/columns/columns.css", "—"],
  ["次に読む", "components/ColumnArticle.tsx", ".column-next .column-next-label", "columns.css", "—"],
  ["誤解カード(一覧)", "app/gokai/page.tsx / components/platform/HubGokai.tsx", ".gokai-card .gokai-card-category / .hub-gokai-card", "platform.css 831-836", "一覧用とハブ用の 2 系統(b の札だけ共通)"],
  ["誤解カード(本文)", "components/platform/GokaiBody.tsx", ".gokai-truth .gokai-block .gokai-check .gokai-ask .gokai-figure .gokai-next .gokai-sources .gokai-faq", "platform.css", "FAQ は .gokai-faq(h3+p)で、コラムの .column-faq-question とも hub の .hub-faq-item とも別"],
  ["裁決リード(記事中・カード中)", "components/platform/CaseLead.tsx(GokaiBody / MarkdownArticle から)", ".gokai-case", "columns.css(コラム用上書き)+ platform.css", "同じクラスをコラムと誤解カードで共有。コラム側だけ columns.css で padding を上書き"],
  ["裁決カード(jitsurei 一覧)", "components/platform/Platform.tsx CaseCard / OutcomeBadge", ".p-card .p-case .p-case-head .p-label-success .p-label-warning", "platform.css 522-565", "札の色 #067647 / #8b6a1f は意味色だが、ツールの .mi-dir-up・.kg-warnbox でも同じ hex を装飾として直書き"],
  ["表(横スクロール)", "components/MarkdownArticle.tsx", ".article-table-figure .article-table-wrap .article-table-hint", "globals.css 301-430 + columns.css(コラム用に display:table を戻す)", "globals.css 側はスマホで縦積み(td::before)、columns.css が横スクロールへ戻す 2 段構え"],
  ["FAQ", "MarkdownArticle(columnStyle)/ MarkdownArticle(faqAccordion)/ GokaiBody / ApplicationFlowPage", ".column-faq-question / details.hub-faq-item / .gokai-faq / .guide-faq-item", "globals.css + platform.css 58-60", "4 系統。hub と guide は details(開閉あり)、コラムと誤解カードは開閉なし"],
  ["出典", "components/ColumnFooter.tsx / GokaiBody(出典)", ".references .small-note / .gokai-sources", "globals.css 1076-1096 / platform.css", "2 系統。文字サイズは本文と同じ(13px の規則は第2段)"],
  ["CTA(App Store)", "components/AppCta.tsx / AppStoreBadge.tsx", ".app-cta .app-cta-title .app-store-badge-link", "globals.css 1057-1074, 801", "—"],
  ["Breadcrumb", "components/Breadcrumb.tsx(コラム)/ Platform.tsx Breadcrumb(ハブ・道具)/ MitateTool(.mi-breadcrumb-wrap)", ".breadcrumb ol li / .p-breadcrumb / .mi-breadcrumb-wrap", "globals.css 816-855 / platform.css", "3 系統。構造(ol/li と span)も違う"],
  ["ArticleToc", "components/ArticleToc.tsx", "details.article-toc", "globals.css 856-985", "—"],
  ["SiteHeader / SiteFooter", "components/SiteHeader.tsx / SiteFooter.tsx", ".site-header .site-header-inner .site-nav … / .site-footer .footer-links …", "globals.css 435-560(旧・濃紺)→ platform.css 180-350(白地)が上書き", "同じクラスを 2 ファイルで定義し、後勝ちで platform.css が効いている。globals.css 側は死んだ定義"],
  ["ボタン", "ApplicationFlowPage(.guide-btn)/ 各ツール(.mt-* .mi-start .kg-* .sr-* .md-*)/ platform(.p-chip .p-more .gokai-filters a)", ".guide-btn(-primary/-secondary)ほか", "globals.css 1294-1335 ほか", "primary/secondary/text の 3 種に相当するものがツールごとに別実装(最低 6 系統)"],
  ["ツール類(dougu)", "components/tools/*.tsx / components/platform/DouguCard.tsx", ".mt-* .mi-* .kg-* .sr-* .md-* .ko-* / .mt-column-card .dougu-band-card .dougu-hub-card", "globals.css 後半(ほぼ 1 行 1 ツールの圧縮 CSS)", ".mt-redesign は申立書ツール内だけの別トークン(--mt-primary/--mt-soft/--mt-border)"],
  ["jitsurei の一覧カード", "app/jitsurei/page.tsx + Platform.tsx CaseCard", ".p-card .p-case .p-chip .p-filter-panel", "platform.css", "ページ側に style 属性で #f7fbfe を直書き(CSS 外)"],
  ["hub の章カード", "components/platform/HubIndexList.tsx / HubLanding.tsx", ".hub-card .hub-card-meta / .p-card", "platform.css 1187-1192, 522-535", "カード系は .p-card / .gokai-card / .hub-card / .columns-card / .column-card / .dougu-band-card / .jc の 7 系統"],
];
table(["部品", "コンポーネント", "クラス", "定義場所", "重複・備考"], PARTS);
md.push("", "### 7-1. .mt-redesign と platform.css の役割", "",
  "- `app/platform.css`(1,235 行)は 2026-09 の情報プラットフォーム(トップ・ハブ・一覧・道具・ヘッダー/フッター)用。`.platform` を全幅シェルにして、コラム本文(globals.css の `main` 42rem)と別の世界を作っている。トークンは `--platform-*` で、globals.css の旧トークンと値が同じもの 10 個を 2026-10-06 にエイリアス化した。`--platform-primary`(#0284c7)だけは `--primary`(#0273ad)と値が違う第 2 の青。",
  "- `.mt-redesign`(globals.css 3087-3144)は申立書ツール(/dougu/moushitatesho)の中だけで効く別デザイン。`--mt-primary: #0284c7`・`--mt-soft: #e8f4fc`・`--mt-border: #d5e3ec` を持ち、ボタン・入力欄・パネルを platform 風に塗り替えている。範囲はそのページ内の `.mt-redesign` 配下のみ。",
  "- 未定義のまま参照されているトークン: `--platform-navy`・`--platform-blue`・`--platform-blue-soft`(platform.css 53-62 の .hub-content)、`--platform-line`(.columns-toc)、`--heading`・`--muted`(代替値つき)。代替値の無いものは宣言が無効になり、親の色を継承している(= いまの見た目はその継承結果)。直すと見た目が変わるので第2段。",
  "- ページ側の style 属性に色を直書きしている箇所: app/jitsurei/page.tsx(`background: #f7fbfe`)。CSS の棚卸しには出ない。");

writeFileSync(`docs/verification/design-system-2026-10-06/${OUT}`, md.join("\n") + "\n");
console.log(`colors=${colorRows.length} orphan=${orphanColors.length} fontSizeValues=${count(fs.map((d) => d.value)).length} combos=${combos.size} transitions=${tr.length} decls=${decls.length}`);
