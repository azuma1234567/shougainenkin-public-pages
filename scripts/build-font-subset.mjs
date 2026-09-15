// 見出し用フォント(Zen Old Mincho 600/700・Zen Kaku Gothic New 500/700)を、サイトの見出しに出る文字だけの
// woff2 に作り直す(docs/perf-fonts-2026-09-15-instructions.md §1)。
//
//   npm run build:fonts
//
// 元フォント: Google Fonts の GitHub(OFL)から scripts/fonts-src/ に置く(.gitignore 済み。無ければこのスクリプトが取りに行く)。
// 出力: public/fonts/*.woff2 4本と、入れた文字の一覧 public/fonts/charset.txt。
// 本文の文字は入れない(本文はシステムフォント)。見出しに無い文字が出たときはシステムフォントに落ちる。
// 見出しの文字が増えたら再実行する。scripts/verify-fonts.mjs が「見出しに出る文字がすべて charset.txt にある」ことを見る。
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

const root = process.cwd();
const srcDir = resolve(root, "scripts/fonts-src");
const outDir = resolve(root, "public/fonts");
mkdirSync(srcDir, { recursive: true });
mkdirSync(outDir, { recursive: true });

const FONTS = [
  ["zenoldmincho/ZenOldMincho-SemiBold.ttf", "zen-old-mincho-600.woff2", "mincho"],
  ["zenoldmincho/ZenOldMincho-Bold.ttf", "zen-old-mincho-700.woff2", "mincho"],
  ["zenkakugothicnew/ZenKakuGothicNew-Medium.ttf", "zen-kaku-gothic-new-500.woff2", "gothic"],
  ["zenkakugothicnew/ZenKakuGothicNew-Bold.ttf", "zen-kaku-gothic-new-700.woff2", "gothic"],
];
const GOOGLE_FONTS_RAW = "https://raw.githubusercontent.com/google/fonts/main/ofl/";

/* ---------- 文字を集める ---------- */
/* 明朝(--font-display)は .platform でないページ(コラム記事・法務ページ)の h1/h2、
   ゴシック(--font-platform-heading)は .platform のページ(トップ・ハブ・誤解・道具・一覧)の h1〜h3 とラベルに使う。
   書体ごとに要る文字が違うので、集合も分けて作る(1本に全部入れると明朝が 150KB を大きく超える)。 */
const mincho = new Set();
const gothic = new Set();
let chars = mincho;
const add = (text) => { for (const ch of text ?? "") if (!/\s/.test(ch)) chars.add(ch); };
const both = (fn) => { chars = mincho; fn(); chars = gothic; fn(); };
const walk = (dir, test) => readdirSync(dir).flatMap((name) => {
  const p = join(dir, name);
  if (name === "node_modules" || name.startsWith(".")) return [];
  return statSync(p).isDirectory() ? walk(p, test) : test(p) ? [p] : [];
});
const unescape = (s) => s.replace(/\\n/g, " ").replace(/\\(.)/g, "$1");
/* `key: "…"` / `key="…"` の形の文字列(見出し・ラベルに使われるキーだけ) */
const KEYS = ["title", "metaTitle", "h1", "heading", "label", "shortLabel", "name", "question", "term", "misconception", "eyebrow"];
const keyed = (text) => {
  for (const key of KEYS) {
    for (const m of text.matchAll(new RegExp(`(?:^|[\\s{,(])"?${key}"?\\s*[:=]\\s*(?:"((?:[^"\\\\]|\\\\.)*)"|'((?:[^'\\\\]|\\\\.)*)'|\`([^\`]*)\`)`, "g"))) add(unescape(m[1] ?? m[2] ?? m[3]));
  }
};
/* JSX の <h1>〜<h3> の中身(タグと {式} を落とす) */
const jsxHeadings = (text) => {
  for (const m of text.matchAll(/<h[1-3][^>]*>([\s\S]*?)<\/h[1-3]>/g)) add(m[1].replace(/<[^>]+>/g, " ").replace(/\{[^}]*\}/g, " "));
  for (const m of text.matchAll(/const TITLE\s*=\s*"((?:[^"\\]|\\.)*)"/g)) add(unescape(m[1]));
};
const sources = [];
const note = (label, before) => sources.push([label, chars.size - before]);

/* 1. コラム: title / metaTitle と、原稿の見出し行 */
let n = mincho.size; both(() => keyed(readFileSync(resolve(root, "lib/columns.ts"), "utf8"))); note("lib/columns.ts の title/metaTitle ほか(両方)", n);
n = mincho.size; chars = mincho;
for (const f of readdirSync(resolve(root, "docs/columns-rewrite-2026-09-03/articles")).filter((f) => f.endsWith(".md"))) {
  for (const line of readFileSync(resolve(root, "docs/columns-rewrite-2026-09-03/articles", f), "utf8").split("\n")) if (/^#{1,2} /.test(line)) add(line.replace(/^#+ /, "").replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").replace(/\*\*/g, ""));
}
note("コラム原稿の h1/h2 行(明朝)", n);
/* 2. ハブ: title / metaTitle と、本文の見出し行 */
n = gothic.size; chars = gothic;
for (const f of readdirSync(resolve(root, "data/hubs")).filter((f) => f.endsWith(".json"))) {
  const hub = JSON.parse(readFileSync(resolve(root, "data/hubs", f), "utf8"));
  add(hub.title); add(hub.metaTitle); add(hub.breadcrumb?.join(""));
  for (const line of hub.source.split("\n")) if (/^#{1,6} /.test(line)) add(line.replace(/^#+ /, "").replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").replace(/\*\*/g, ""));
}
note("data/hubs の title と見出し行(ゴシック)", n);
/* 3. 誤解カード・用語・道具・ハブ一覧などのデータ */
n = gothic.size; chars = gothic;
for (const f of ["data/gokai.ts", "data/gokai-bodies.ts", "data/yougo.ts", "data/dougu.ts", "lib/hubs.ts", "lib/hub-index.tsx", "lib/saiketsu.ts", "lib/jukyuugo-index.ts"]) {
  if (existsSync(resolve(root, f))) keyed(readFileSync(resolve(root, f), "utf8"));
}
note("data/gokai・yougo・dougu・lib/hubs ほかのラベル(ゴシック)", n);
/* 3b. 誤解カードの本文の小見出し(h3)と FAQ の質問(h3 で描く)、実例カードの見出し(傷病名 ── 要旨の1文目)、アプリの法務ページの節見出し */
n = gothic.size; chars = gothic;
{
  const bodies = readFileSync(resolve(root, "data/gokai-bodies.ts"), "utf8");
  for (const m of bodies.matchAll(/"type": "h3",\s*"text": "((?:[^"\\]|\\.)*)"/g)) add(unescape(m[1]));
  for (const m of bodies.matchAll(/"type": "faq",\s*"q": "((?:[^"\\]|\\.)*)"/g)) add(unescape(m[1]));
  for (const f of readdirSync(resolve(root, "data")).filter((f) => /^saiketsu-cases-.*\.json$/.test(f))) {
    const json = JSON.parse(readFileSync(resolve(root, "data", f), "utf8"));
    for (const item of Array.isArray(json) ? json : json.cases ?? []) { add(item.shobyo); add((item.youshi ?? "").split("。")[0]); }
  }
}
note("誤解カードの h3・FAQ、実例カードの見出し(ゴシック)", n);
n = mincho.size; both(() => keyed(readFileSync(resolve(root, "lib/app-legal.ts"), "utf8"))); note("lib/app-legal.ts の節見出し(両方)", n);
/* 4. app/**.tsx と components/**.tsx の TITLE・h1〜h3・見出し系のキー */
n = mincho.size;
for (const f of [...walk(resolve(root, "app"), (p) => p.endsWith(".tsx")), ...walk(resolve(root, "components"), (p) => p.endsWith(".tsx")), ...walk(resolve(root, "lib"), (p) => p.endsWith(".tsx"))]) {
  const text = readFileSync(f, "utf8");
  both(() => {
    jsxHeadings(text); keyed(text);
    for (const m of text.matchAll(/^\s*\["((?:[^"\\]|\\.)*)", "/gm)) add(unescape(m[1]));
    for (const m of text.matchAll(/className="(?:kg-n|kg-y|md-n|sr-sec|mi-qtitle)"[^>]*>([^<{]+)</g)) add(m[1]);
  });
}
note("app/components/lib の TITLE・h1〜h3・title 属性(両方)", n);
/* 5. 固定の集合: 英数字・記号(ASCII)、ひらがな、カタカナ、よく使う約物・全角英数 */
n = mincho.size;
both(() => {
for (let c = 0x20; c <= 0x7e; c++) chars.add(String.fromCharCode(c));
for (let c = 0x3041; c <= 0x309f; c++) chars.add(String.fromCharCode(c));
for (let c = 0x30a0; c <= 0x30ff; c++) chars.add(String.fromCharCode(c));
for (let c = 0xff10; c <= 0xff19; c++) chars.add(String.fromCharCode(c));
add("「」『』（）、。・…→←↑↓％〜～！？：；｜＆＋－＝＊＃＠￥°※々〆〇①②③④⑤⑥⑦⑧⑨⑩“”‘’〈〉《》【】［］－―‐−–—・￥¥×÷≒≠≧≦≥≤≪≫√∞℃");
});
note("固定の集合(英数字・かな・約物・両方)", n);
mincho.delete(" "); gothic.delete(" ");

const toText = (set) => [...set].sort((a, b) => a.codePointAt(0) - b.codePointAt(0)).join("");
const charsets = { mincho: toText(mincho), gothic: toText(gothic) };
/* charset.txt は2書体の和(何が入っているかの一覧)。書体ごとの集合は charset-mincho.txt / charset-gothic.txt。verify:fonts は書体ごとに見る */
writeFileSync(join(outDir, "charset.txt"), toText(new Set([...mincho, ...gothic])) + "\n");
writeFileSync(join(outDir, "charset-mincho.txt"), charsets.mincho + "\n");
writeFileSync(join(outDir, "charset-gothic.txt"), charsets.gothic + "\n");

/* ---------- サブセットを作る ---------- */
const pyftsubset = process.env.PYFTSUBSET ?? (existsSync(`${process.env.HOME}/.local/bin/pyftsubset`) ? `${process.env.HOME}/.local/bin/pyftsubset` : "pyftsubset");
const results = [];
for (const [remote, out, set] of FONTS) {
  const src = join(srcDir, remote.split("/").pop());
  if (!existsSync(src)) {
    console.log(`取得: ${GOOGLE_FONTS_RAW}${remote}`);
    execFileSync("curl", ["-sfL", "-o", src, `${GOOGLE_FONTS_RAW}${remote}`]);
  }
  const target = join(outDir, out);
  execFileSync(pyftsubset, [src, `--text-file=${join(outDir, `charset-${set}.txt`)}`, "--flavor=woff2", `--output-file=${target}`, "--layout-features=kern,palt,liga,vert,vrt2", "--no-hinting", "--desubroutinize", "--name-IDs=0,1,2,4,6,13,14"]);
  results.push([out, statSync(target).size]);
}

console.log(`文字数 明朝 ${charsets.mincho.length} / ゴシック ${charsets.gothic.length}(増分の内訳: ${sources.map(([l, c]) => `${l} +${c}`).join(" / ")})`);
for (const [out, size] of results) console.log(`${out}: ${(size / 1024).toFixed(1)} KB${size > 150 * 1024 ? "  ← 150KB 超" : ""}`);
