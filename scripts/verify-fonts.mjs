// 見出し用フォントの検査(docs/perf-fonts-2026-09-15-instructions.md §1-4)。
//
//   node scripts/verify-fonts.mjs http://localhost:3200
//
// 1. public/fonts/ の woff2 4本と charset*.txt があり、app/layout.tsx が next/font/local で参照する woff2 が存在する
// 2. sitemap の全ページで、見出しフォント(Zen Old Mincho / Zen Kaku Gothic New の自前サブセット)で描かれる要素の文字が、
//    すべてその書体の charset(charset-mincho.txt / charset-gothic.txt)に含まれる。含まれない文字はシステムフォントに落ちるので、
//    新しい記事を足したときにここで気づく(直すのは npm run build:fonts)
// 3. 各ページで読み込まれるフォントファイルが 4 本以下
import { existsSync, readFileSync, statSync } from "node:fs";
import { chromium } from "playwright";

const origin = (process.argv[2] ?? process.env.VERIFY_ORIGIN ?? "http://localhost:3200").replace(/\/$/, "");
const failures = [];

const WOFF2 = ["zen-old-mincho-600.woff2", "zen-old-mincho-700.woff2", "zen-kaku-gothic-new-500.woff2", "zen-kaku-gothic-new-700.woff2"];
for (const f of [...WOFF2, "charset.txt", "charset-mincho.txt", "charset-gothic.txt"]) if (!existsSync(`public/fonts/${f}`)) failures.push(`public/fonts/${f} が無い(npm run build:fonts)`);
/* コメント(next/font/google をやめた経緯を書いてある)は検査から外す */
const layout = readFileSync("app/layout.tsx", "utf8").replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
for (const m of layout.matchAll(/path:\s*"\.\.\/public\/fonts\/([^"]+)"/g)) if (!existsSync(`public/fonts/${m[1]}`)) failures.push(`layout.tsx が参照する public/fonts/${m[1]} が無い`);
if (!/next\/font\/local/.test(layout)) failures.push("app/layout.tsx が next/font/local を使っていない");
if (/next\/font\/google/.test(layout)) failures.push("app/layout.tsx に next/font/google が残っている");

/* 書体ごとの集合(scripts/build-font-subset.mjs が書く)。明朝は .platform でないページの h1/h2、ゴシックは .platform のページの見出し */
const readSet = (name) => new Set(existsSync(`public/fonts/${name}`) ? [...readFileSync(`public/fonts/${name}`, "utf8").replace(/\n/g, "")] : []);
const charset = { mincho: readSet("charset-mincho.txt"), gothic: readSet("charset-gothic.txt") };
const sizes = WOFF2.filter((f) => existsSync(`public/fonts/${f}`)).map((f) => [f, statSync(`public/fonts/${f}`).size]);

const sitemap = await (await fetch(`${origin}/sitemap.xml`)).text();
const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].replace(/^https?:\/\/[^/]+/, "") || "/");

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
const missingByPage = [];
let maxFonts = 0, maxFontsPage = "", headingChars = 0, styledPages = 0;
for (const url of urls) {
  await page.goto(origin + url, { waitUntil: "load" });
  const r = await page.evaluate(async () => {
    await document.fonts.ready;
    /* 見出しフォントで描かれる要素 = 算出 font-family の先頭が Zen の書体(本番は "Zen Old Mincho" などの名前、dev は __zen… の生成名) */
    const family = (el) => {
      const ff = getComputedStyle(el).fontFamily;
      if (/^\s*['"]?(zen[ _-]?old[ _-]?mincho|__zenOldMincho)/i.test(ff)) return "mincho";
      if (/^\s*['"]?(zen[ _-]?kaku|__zenKakuGothic)/i.test(ff)) return "gothic";
      return null;
    };
    const chars = { mincho: new Set(), gothic: new Set() };
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) {
      const el = node.parentElement;
      if (!el || ["SCRIPT", "STYLE", "NOSCRIPT", "TEXTAREA", "INPUT"].includes(el.tagName)) continue;
      const k = family(el);
      if (!k) continue;
      for (const ch of node.textContent) if (!/\s/.test(ch)) chars[k].add(ch);
    }
    const fonts = performance.getEntriesByType("resource").filter((e) => /\.woff2?(\?|$)/.test(e.name)).map((e) => e.name.split("/").pop());
    return { chars: { mincho: [...chars.mincho], gothic: [...chars.gothic] }, fonts };
  });
  const count = r.chars.mincho.length + r.chars.gothic.length;
  if (count) styledPages += 1;
  headingChars += count;
  for (const k of ["mincho", "gothic"]) {
    const missing = r.chars[k].filter((c) => !charset[k].has(c));
    if (missing.length) missingByPage.push(`${url} (${k}): ${missing.join("")}`);
  }
  if (r.fonts.length > maxFonts) { maxFonts = r.fonts.length; maxFontsPage = `${url} (${r.fonts.join(", ")})`; }
  if (r.fonts.length > 4) failures.push(`${url}: フォントの読み込みが ${r.fonts.length} 本`);
}
await browser.close();
if (missingByPage.length) failures.push(`書体の charset に無い見出しの文字 ${missingByPage.length} 件:\n  ${missingByPage.join("\n  ")}`);

console.log(`フォント: ${sizes.map(([f, s]) => `${f} ${(s / 1024).toFixed(0)}KB`).join(" / ")}、charset 明朝 ${charset.mincho.size} 字 / ゴシック ${charset.gothic.size} 字`);
console.log(`${urls.length} ページ中 ${styledPages} ページに見出しフォントの要素、文字の延べ ${headingChars}。読み込みが最多のページ: ${maxFonts} 本 ${maxFontsPage}`);
if (failures.length) { console.error(`×\n${failures.join("\n")}`); process.exit(1); }
console.log("○ verify:fonts: 見出しの文字はすべて書体ごとの charset にあり、フォントの読み込みは全ページ 4 本以下");
