import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();
const sourceRoot = resolve(root, "../shougainenkin/docs");
const names = ["byoki-tougou", "byoki-chiteki", "byoki-tenkan", "byoki-jinzou-touseki", "byoki-gan", "byoki-shinzou", "byoki-tounyou", "byoki-shitai", "byoki-hattatsu", "byoki-tekiou-fuan", "erabu-jibun-ka-irai", "joukyou-hatachi-mae", "joukyou-hatarakinagara", "joukyou-hitorigurashi", "joukyou-shoubyou-teatekin-kara", "nayami-koushin", "nayami-shikyuu-teishi", "nayami-shindansho-komatta", "nayami-shoshinbi-karute", "nayami-sokyuu", "okane-ikura"];
const content = Object.fromEntries(names.map((name) => [`/${name.replace("-", "/")}`, JSON.parse(readFileSync(resolve(root, `data/hubs/${name}.json`), "utf8"))]));
const reserved = ["/suuji", "/gokai", "/okane/zeikin", "/okane/chousei", "/erabu/irai-subeki-case", "/erabu/hiyou-souba", "/erabu/erabikata", "/erabu/fushikyu-no-ato", "/senmonka"];
const failures = [];
for (const [path, item] of Object.entries(content)) {
  const counts = (text) => ({ h2: (text.match(/^## /gm) ?? []).length, h3: (text.match(/^### /gm) ?? []).length, faq: (text.match(/^\*\*Q[.．]/gm) ?? []).length });
  const name = path.slice(1).replaceAll("/", "-");
  const raw = readFileSync(resolve(sourceRoot, `hub-${name}-2026-09-02.md`), "utf8");
  const h1s = [...raw.matchAll(/^# .+$/gm)];
  const start = h1s[1].index;
  const memo = raw.indexOf("\n## 執筆メモ", start);
  const publicText = raw.slice(start, memo).trim().split("\n");
  publicText.shift();
  const breadcrumb = publicText.findIndex((line) => line.startsWith("パンくず:"));
  publicText.splice(breadcrumb, 1);
  const expected = publicText.join("\n").trim();
  if (item.source !== expected) failures.push(`${path}: 本文不一致`);
  if (JSON.stringify(counts(item.source)) !== JSON.stringify(counts(expected))) failures.push(`${path}: 見出し/FAQ数不一致`);
  for (const forbidden of ["執筆メモ", "x.com", "@", "いいね"]) if (item.source.includes(forbidden)) failures.push(`${path}: ${forbidden}`);
  for (const target of reserved) if (new RegExp(`\\[[^\\]]+\\]\\(${target.replaceAll("/", "\\/")}\\)`).test(item.source)) failures.push(`${path}: 予約URLがリンク`);
}
if (Object.keys(content).length !== 21) failures.push("本文ページ数が21ではありません");
if (failures.length) { console.error(failures.join("\n")); process.exit(1); }
console.log(`OK: 本文21ページ。本文一致、見出し/FAQ一致、非公開語0、予約URLリンク0。`);

/* 監査 §4-2: ハブの FAQ 構造化データが、画面に出ている Q/A と完全に一致すること。
   抽出は lib/hub-content.ts の extractHubFaqs、画面は MarkdownArticle の faqAccordion 分岐。
   両方が同じ規則で動いていることを、全ハブの本文で確かめる。 */
{
  const { HUB_CONTENT, extractHubFaqs } = await import("../lib/hub-content.ts");

  /* MarkdownArticle の faqAccordion 分岐と同じ手順で summary の文字列を作る(照合用の写し)。 */
  const summariesFromMarkdown = (source) => {
    const lines = source.split("\n").map((l) => l.trim());
    const out = [];
    let i = 0;
    while (i < lines.length) {
      const line = lines[i];
      i += 1;
      if (!/^\*\*Q[.．]/.test(line)) continue;
      const inline = /^\*\*(Q[.．][^*]*?)\*\*\s*(.*)$/.exec(line);
      out.push(inline ? inline[1] : line.replace(/^\*\*/, "").replace(/\*\*$/, ""));
      while (i < lines.length) {
        const next = lines[i];
        if (!next) { i += 1; break; }
        if (/^\*\*Q[.．]/.test(next) || next.startsWith("## ")) break;
        i += 1;
      }
    }
    return out;
  };
  const plain = (t) => t.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").replace(/\*\*(.+?)\*\*/g, "$1").replace(/\s+/g, " ").trim();

  const bad = [];
  let hubs = 0, faqs = 0, empty = [];
  for (const [path, content] of Object.entries(HUB_CONTENT)) {
    hubs += 1;
    const extracted = extractHubFaqs(content.source);
    const screen = summariesFromMarkdown(content.source).map(plain);
    faqs += extracted.length;
    if (!extracted.length) { empty.push(path); continue; }
    if (extracted.length !== screen.length) {
      bad.push(`${path}: 抽出 ${extracted.length} 件 / 画面 ${screen.length} 件`);
      continue;
    }
    extracted.forEach((f, i) => {
      if (f.question !== screen[i]) bad.push(`${path} #${i + 1}: 抽出「${f.question}」≠ 画面「${screen[i]}」`);
      if (!f.answer) bad.push(`${path} #${i + 1}: 答えが空`);
    });
  }
  if (bad.length) {
    console.error(`画面と JSON-LD の Q/A が食い違う ${bad.length} 件:\n${bad.slice(0, 5).join("\n")}`);
    process.exit(1);
  }
  console.log(`○ ハブの FAQ: ${hubs} 本中 ${hubs - empty.length} 本に計 ${faqs} 件。抽出と画面の質問が全件一致`);
  console.log(`  Q&A の無いハブ ${empty.length} 本は FAQPage を出さない: ${empty.join(", ")}`);
}
