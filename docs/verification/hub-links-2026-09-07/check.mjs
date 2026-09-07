// §2 の 3〜7: テキストノードの「(/path」0、変換したリンクが 200、[[ 無し、被リンクが増える方向、矢印行の見た目、スクリーンショット。
//   node docs/verification/hub-links-2026-09-07/check.mjs http://127.0.0.1:3000 <before-dir>
import { chromium } from "playwright";
import { parse } from "node-html-parser";
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
const origin = process.argv[2] ?? "http://127.0.0.1:3000";
const before = process.argv[3];
const dir = "docs/verification/hub-links-2026-09-07";
const out = []; const say = (s) => { out.push(s); console.log(s); };
const PREFIXES = ["(/columns/", "(/byoki/", "(/nayami/", "(/joukyou/", "(/okane/", "(/erabu/", "(/gokai/", "(/dougu/", "(/jukyuugo/", "(/shinsei", "(/hajimete", "(/jitsurei", "(/suuji", "(/yougo"];
const paths = readFileSync(`${before}/paths.txt`, "utf8").trim().split("\n");
const fileOf = (p) => p.replace(/^\//, "").replaceAll("/", "_") + ".html";

/* main の中のテキストノードだけを集める(href の中は数えない) */
const textNodes = (root) => { const acc = []; const walk = (n) => { for (const c of n.childNodes) { if (c.nodeType === 3) acc.push(c.rawText); else walk(c); } }; walk(root.querySelector("main")); return acc.join("\n"); };
const inChrome = (node) => { for (let el = node.parentNode; el; el = el.parentNode) { const cls = String(el.classNames ?? ""); const tag = String(el.rawTagName ?? "").toLowerCase(); if (tag === "header" && cls.includes("site-header")) return true; if (tag === "footer" && cls.includes("site-footer")) return true; if (cls.split(/\s+/).some((n) => n === "breadcrumb" || n === "p-breadcrumb")) return true; } return false; };
const bodyLinks = (root) => root.querySelectorAll("a[href^='/']").filter((a) => !inChrome(a)).map((a) => a.getAttribute("href").split("#")[0]);

let textHits = 0; const hitLines = []; const inboundBefore = new Map(), inboundAfter = new Map(); const allNewLinks = new Set(); let dbl = 0;
for (const p of paths) {
  const htmlB = readFileSync(`${before}/${fileOf(p)}`, "utf8");
  const htmlA = await (await fetch(`${origin}${p}`)).text();
  const rootB = parse(htmlB.replaceAll("<!-- -->", "")), rootA = parse(htmlA.replaceAll("<!-- -->", ""));
  const txt = textNodes(rootA);
  for (const pre of PREFIXES) { const n = txt.split(pre).length - 1; textHits += n; if (n) hitLines.push(`${p}: ${pre} ×${n}`); }
  if (txt.includes("[[")) dbl += 1;
  const lb = bodyLinks(rootB), la = bodyLinks(rootA);
  for (const l of lb) inboundBefore.set(l, (inboundBefore.get(l) ?? 0) + 1);
  for (const l of la) { inboundAfter.set(l, (inboundAfter.get(l) ?? 0) + 1); }
  const setB = new Set(lb); for (const l of la) if (!setB.has(l)) allNewLinks.add(l);
}
say(`3. ハブ49本 + /jukyuugo の <main> のテキストノードにある「(/columns/」などの残り: ${textHits}${hitLines.length ? " → " + hitLines.join(" / ") : ""} / 「[[」を含むページ ${dbl}`);
// 4. 変換したリンクが 200
const codes = []; for (const l of [...allNewLinks].sort()) { const r = await fetch(`${origin}${l}`); codes.push([l, r.status]); }
const bad = codes.filter(([, c]) => c !== 200);
say(`4. 変更前に無く変更後に本文に現れたリンク先 ${codes.length} 種類 → 200 でないもの ${bad.length}${bad.length ? ": " + bad.map(([l, c]) => `${l} ${c}`).join(", ") : ""}`);
// 7. 被リンク(本文からのぶん、ハブ50ページ発)が減った先が無いこと
const targets = new Set([...inboundBefore.keys(), ...inboundAfter.keys()]);
const decreased = [...targets].filter((t) => (inboundAfter.get(t) ?? 0) < (inboundBefore.get(t) ?? 0));
const totalB = [...inboundBefore.values()].reduce((a, b) => a + b, 0), totalA = [...inboundAfter.values()].reduce((a, b) => a + b, 0);
say(`7. ハブ50ページの本文リンク(ナビ・パンくず除く) 合計 ${totalB} → ${totalA}(+${totalA - totalB}) / 減った先 ${decreased.length}${decreased.length ? ": " + decreased.join(", ") : ""} / 増えた先 ${[...targets].filter((t) => (inboundAfter.get(t) ?? 0) > (inboundBefore.get(t) ?? 0)).length} 種類`);
// 6. /nayami/fushikyu の矢印カードが変わっていない
{
  const rb = parse(readFileSync(`${before}/${fileOf("/nayami/fushikyu")}`, "utf8")), ra = parse(await (await fetch(`${origin}/nayami/fushikyu`)).text());
  /* ハブの「→ 」行は <p>→ <a …>…</a></p> で描かれる。href と文字が変更前後で同じことを見る */
  const arrows = (r) => r.querySelectorAll("main p").filter((p) => p.textContent.trim().startsWith("→")).map((p) => p.outerHTML.replace(/<!-- -->/g, ""));
  const cb = arrows(rb), ca = arrows(ra);
  say(`6. /nayami/fushikyu の「→ 」の段落 ${cb.length} → ${ca.length} / outerHTML 一致=${JSON.stringify(cb) === JSON.stringify(ca)}`);
}
// 5. 4ページで関連記事の箇条書きがリンクになっていて、(/columns/ の文字が見えない + スクリーンショット
const browser = await chromium.launch({ headless: true, executablePath: process.env.CHROME_PATH || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" });
for (const p of ["/byoki/utsu-soukyoku", "/joukyou/hatarakinagara", "/nayami/fushikyu", "/okane/ikura"]) {
  for (const w of [1400, 390]) {
    const ctx = await browser.newContext({ viewport: { width: w, height: 900 } }); const page = await ctx.newPage();
    await page.goto(`${origin}${p}`); await page.waitForLoadState("networkidle");
    const r = await page.evaluate(() => {
      const main = document.querySelector("main"); const t = main.innerText;
      const lis = [...main.querySelectorAll("li")].filter((li) => li.querySelector("a[href^='/columns/']"));
      const color = lis[0] ? getComputedStyle(lis[0].querySelector("a")).color : "";
      return { visible: (t.match(/\(\/columns\//g) ?? []).length, liLinks: lis.length, color, over: document.documentElement.scrollWidth - document.documentElement.clientWidth };
    });
    say(`5. ${w}px ${p}: 「(/columns/」の文字 ${r.visible} / 記事リンクつき li ${r.liLinks} / リンク色 ${r.color} / はみ出し ${r.over}px`);
    await page.screenshot({ path: `${dir}/${p.slice(1).replaceAll("/", "_")}-${w}.png`, fullPage: true });
    await ctx.close();
  }
}
await browser.close();
writeFileSync(`${dir}/checks.txt`, out.join("\n") + "\n");
