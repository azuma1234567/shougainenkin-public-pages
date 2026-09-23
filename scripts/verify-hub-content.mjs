import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();
const sourceRoot = resolve(root, "../shougainenkin/docs");
const names = ["byoki-tougou", "byoki-chiteki", "byoki-tenkan", "byoki-jinzou-touseki", "byoki-gan", "byoki-shinzou", "byoki-tounyou", "byoki-shitai", "byoki-hattatsu", "byoki-tekiou-fuan", "erabu-jibun-ka-irai", "joukyou-hatachi-mae", "joukyou-hatarakinagara", "joukyou-hitorigurashi", "joukyou-shoubyou-teatekin-kara", "nayami-koushin", "nayami-shikyuu-teishi", "nayami-shindansho-komatta", "nayami-shoshinbi-karute", "nayami-sokyuu", "okane-ikura"];
const content = Object.fromEntries(names.map((name) => [`/${name.replace("-", "/")}`, JSON.parse(readFileSync(resolve(root, `data/hubs/${name}.json`), "utf8"))]));
/* 第2稿(2026-09-08)は公開サイト repo の docs/ にある原稿が正。frontmatter を除いた「## リード(直答)」以降を比較する
   (docs/jukyuugo-links-2026-09-08/README §A-1・§D-1)。それ以外はアプリ repo の hub-*-2026-09-02.md。 */
const secondDrafts = {
  "nayami-koushin": "docs/jukyuugo-links-2026-09-08/nayami-koushin.md",
  "nayami-shikyuu-teishi": "docs/jukyuugo-links-2026-09-08/nayami-shikyuu-teishi.md",
  "joukyou-65sai-ijou": "docs/jukyuugo-links-2026-09-08/joukyou-65sai-ijou.md",
};
const expectedSource = (name) => {
  if (secondDrafts[name]) {
    const md = readFileSync(resolve(root, secondDrafts[name]), "utf8");
    return md.slice(md.indexOf("## リード(直答)")).trim();
  }
  const raw = readFileSync(resolve(sourceRoot, `hub-${name}-2026-09-02.md`), "utf8");
  const h1s = [...raw.matchAll(/^# .+$/gm)];
  const start = h1s[1].index;
  const memo = raw.indexOf("\n## 執筆メモ", start);
  const publicText = raw.slice(start, memo).trim().split("\n");
  publicText.shift();
  const breadcrumb = publicText.findIndex((line) => line.startsWith("パンくず:"));
  publicText.splice(breadcrumb, 1);
  return publicText.join("\n").trim();
};
const reserved = ["/suuji", "/gokai", "/okane/zeikin", "/okane/chousei", "/erabu/irai-subeki-case", "/erabu/hiyou-souba", "/erabu/erabikata", "/erabu/fushikyu-no-ato", "/senmonka"];
const failures = [];
for (const [path, item] of Object.entries(content)) {
  const counts = (text) => ({ h2: (text.match(/^## /gm) ?? []).length, h3: (text.match(/^### /gm) ?? []).length, faq: (text.match(/^\*\*Q[.．]/gm) ?? []).length });
  const name = path.slice(1).replaceAll("/", "-");
  const expected = expectedSource(name);
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

/* metaTitle・metaDescription に含まれる数字のうち、本文に無いもの。数字は後ろの単位までをひとまとまりで照合する
   (「4か所」が本文の「4か月」で通らないように)。本文は **強調** と [文字](リンク) を外して見る。 */
const numbersMissingFromBody = (text, source) => {
  const plain = (t) => t.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").replace(/\*\*(.+?)\*\*/g, "$1");
  const UNIT = /^(?:か所|か月|項目|段階|デシベル|[級つ年歳号件回日割%万円人])/;
  const escape = (t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const body = plain(source);
  return [...text.matchAll(/\d+(?:[,.]\d+)*/g)]
    .map((m) => m[0] + (UNIT.exec(text.slice(m.index + m[0].length))?.[0] ?? ""))
    .filter((token) => !new RegExp(`(?<![\\d,.])${escape(token)}`).test(body));
};

/* SEO 2026-09-15 §1: metaTitle(<title> 用。h1 は title のまま)は 28〜40 字、「道具」を使わない、
   含まれる数字は本文にも出てくる。 */
{
  const { HUB_CONTENT, prepareHubSource } = await import("../lib/hub-content.ts");
  const bad = [];
  let count = 0;
  for (const [path, content] of Object.entries(HUB_CONTENT)) {
    const title = content.metaTitle;
    if (title === undefined) continue;
    count += 1;
    const length = [...title].length;
    if (length < 28 || length > 40) bad.push(`${path}: metaTitle が ${length} 字(28〜40 字)`);
    if (title.includes("道具")) bad.push(`${path}: metaTitle に「道具」`);
    for (const token of numbersMissingFromBody(title, prepareHubSource(content.source))) bad.push(`${path}: metaTitle の「${token}」が本文に無い`);
  }
  if (bad.length) {
    console.error(`ハブの metaTitle ${bad.length} 件:\n${bad.join("\n")}`);
    process.exit(1);
  }
  console.log(`○ ハブの metaTitle: ${count} 本。28〜40 字、「道具」0、数字はすべて本文にある`);
}

/* SEO・AIO 2026-09-23 §2-4: meta description(og:description・Article.description も同じ文)。
   実際に使われる文を lib/hub-jsonld.ts の hubDescription で作る(metaDescription があればそれ、なければ本文1行目から
   インラインの Markdown を外した文)。49 本すべて 80〜160 字、* ` [ ]( を含まない、「道具」「個人で運営」「紹介料」を含まない。
   metaDescription を持つハブは、その数字が本文にも出てくる(metaTitle と同じ規則)。 */
{
  const { HUB_CONTENT, getHubContent, prepareHubSource } = await import("../lib/hub-content.ts");
  const { HUBS } = await import("../lib/hubs.ts");
  const { hubDescription } = await import("../lib/hub-jsonld.ts");
  const bad = [];
  const lengths = [];
  let withMeta = 0;
  for (const [path, raw] of Object.entries(HUB_CONTENT)) {
    const hub = HUBS.find((item) => item.path === path);
    if (!hub) { bad.push(`${path}: lib/hubs.ts に無い`); continue; }
    const description = hubDescription(hub, getHubContent(path));
    const length = [...description].length;
    lengths.push(length);
    if (length < 80 || length > 160) bad.push(`${path}: description が ${length} 字(80〜160 字)「${description}」`);
    for (const mark of ["*", "`", "[", "]("]) if (description.includes(mark)) bad.push(`${path}: description に「${mark}」`);
    for (const word of ["道具", "個人で運営", "紹介料"]) if (description.includes(word)) bad.push(`${path}: description に「${word}」`);
    if (raw.metaDescription === undefined) continue;
    withMeta += 1;
    for (const token of numbersMissingFromBody(raw.metaDescription, prepareHubSource(raw.source))) bad.push(`${path}: metaDescription の「${token}」が本文に無い`);
  }
  if (lengths.length !== 49) bad.push(`ハブが ${lengths.length} 本(49 本のはず)`);
  if (bad.length) {
    console.error(`ハブの description ${bad.length} 件:\n${bad.join("\n")}`);
    process.exit(1);
  }
  console.log(`○ ハブの description: ${lengths.length} 本すべて 80〜160 字(最短 ${Math.min(...lengths)} 字・最長 ${Math.max(...lengths)} 字)、Markdown 記号0、「道具」「個人で運営」「紹介料」0`);
  console.log(`  metaDescription を持つ ${withMeta} 本は、数字がすべて本文にある`);
}

/* SEO 2026-09-15 §2: AI の回答は冒頭を抜くので、「リード(直答)」の1段落目は最初の句点(。を含む)までを80字以内にする。
   コラムの lead 1行目と同じ規則(scripts/verify-columns.mjs の11)。 */
{
  const { HUB_CONTENT, prepareHubSource } = await import("../lib/hub-content.ts");
  const plain = (t) => t.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").replace(/\*\*(.+?)\*\*/g, "$1");
  const bad = [];
  let longest = 0;
  for (const [path, content] of Object.entries(HUB_CONTENT)) {
    const lead = /^## リード\(直答\)\n+([^\n]+)/m.exec(prepareHubSource(content.source));
    if (!lead) { bad.push(`${path}: 「## リード(直答)」の1段落目が無い`); continue; }
    const first = plain(lead[1]);
    const sentence = first.includes("。") ? first.slice(0, first.indexOf("。") + 1) : first;
    const length = [...sentence].length;
    longest = Math.max(longest, length);
    if (length > 80) bad.push(`${path}: ${length} 字「${sentence}」`);
  }
  if (bad.length) {
    console.error(`リード1文目が80字を超える ${bad.length} 件:\n${bad.join("\n")}`);
    process.exit(1);
  }
  console.log(`○ ハブのリード1文目: ${Object.keys(HUB_CONTENT).length} 本すべて80字以内(最長 ${longest} 字)`);
}
