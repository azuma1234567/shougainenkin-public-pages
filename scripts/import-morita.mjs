// 森田療法の原稿(docs/morita-2026-10-06/articles/*.md)→ content/morita/<slug>.ts。
// scripts/import-columns.mjs を元にした別スクリプト(columns は 57 本固定の assert があるので触らない)。
//   node --import ./scripts/lib/ts-alias.mjs scripts/import-morita.mjs          生成
//   node --import ./scripts/lib/ts-alias.mjs scripts/import-morita.mjs --check  再現性の確認
// 原稿本文は変えない。パーサーの想定と違う箇所は assert で止める(docs/claude-code-morita-2026-10-06-instructions.md §0・§3)。
import assert from "node:assert/strict";
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
await import("./lib/ts-alias.mjs");
const { MORITA_ARTICLES, MORITA_PUBLISHED_PATHS } = await import("../lib/morita.ts");

const directory = new URL("../docs/morita-2026-10-06/articles/", import.meta.url);
const plain = value => value.replace(/\*\*(.*?)\*\*/g, "$1").replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");

/* 本文中の /morita/... リンクを検査し、未公開 path を置き換える。
   - `→ ラベル(/morita/…)` の行(段落として独立)         : 公開なら MarkdownArticle がそのまま矢印カードにする。未公開なら `→ ラベル(準備中)`
   - `- 文 → ラベル(/morita/…)` の箇条書き                : 公開なら `- 文 → [ラベル](/path)`(表示文字は同じ。素の path は出さない)。未公開なら `- 文 → ラベル(準備中)`
   - `[テキスト](/morita/…)`                               : 未公開ならテキストだけ
   - 文中の `「ラベル」(/morita/…)`                         : 公開なら `[「ラベル」](/path)`。未公開なら `「ラベル」(準備中)`
   - それ以外の文中の `(/morita/…)`                         : 未公開なら `(準備中)`
   置換した数を path ごとに数えて返す。 */
function rewriteLinks(slug, content) {
  const replaced = {};   // path -> 回数(未公開 → 準備中)
  const linked = {};     // 箇条書きの中で [ラベル](path) にした数
  const count = (bag, key) => { bag[key] = (bag[key] ?? 0) + 1; };
  const resolve = (href) => href;

  const lines = content.split("\n").map((line) => {
    // 1) [テキスト](/morita/…)
    line = line.replace(/\[([^\]]+)\]\((\/morita[^)]*)\)/g, (m, label, href) => {
      const to = resolve(href);
      if (MORITA_PUBLISHED_PATHS.has(to)) return `[${label}](${to})`;
      count(replaced, href); return label;
    });
    // 2) 独立した矢印行
    const arrow = line.match(/^→ (.+)\((\/morita[^()]*)\)$/);
    if (arrow) {
      const to = resolve(arrow[2]);
      if (MORITA_PUBLISHED_PATHS.has(to)) return `→ ${arrow[1]}(${to})`;
      count(replaced, arrow[2]); return `→ ${arrow[1]}(準備中)`;
    }
    // 3) 箇条書きの中の `→ ラベル(/morita/…)`
    const bullet = line.match(/^(- .*→ )(.+?)\((\/morita[^()]*)\)$/);
    if (bullet) {
      const to = resolve(bullet[3]);
      if (MORITA_PUBLISHED_PATHS.has(to)) { count(linked, to); return `${bullet[1]}[${bullet[2]}](${to})`; }
      count(replaced, bullet[3]); return `${bullet[1]}${bullet[2]}(準備中)`;
    }
    // 4) 文中の `「ラベル」(/morita/…)`: 公開なら [「ラベル」](/path)(素の path を本文に出さない。FAQ の JSON では plain() でラベルだけになる)
    line = line.replace(/(「[^「」]+」)\((\/morita[^()\s]*)\)/g, (m, label, href) => {
      const to = resolve(href);
      if (MORITA_PUBLISHED_PATHS.has(to)) { count(linked, to); return `[${label}](${to})`; }
      count(replaced, href); return `${label}(準備中)`;
    });
    // 5) それ以外の文中の (/morita/…)
    line = line.replace(/\((\/morita[^()\s]*)\)/g, (m, href) => {
      const to = resolve(href);
      if (MORITA_PUBLISHED_PATHS.has(to)) return `(${to})`;
      count(replaced, href); return "(準備中)";
    });
    return line;
  });
  const out = lines.join("\n");
  // 置換漏れ: 公開済み以外の /morita/ path が残っていないこと
  for (const m of out.matchAll(/\/morita\/[a-z0-9/-]+/g)) assert.ok(MORITA_PUBLISHED_PATHS.has(m[0]), `${slug}: 未公開 path が残っている ${m[0]}`);
  return { content: out, replaced, linked };
}

export function parseMorita() {
  const articles = {};
  const totals = { replaced: {}, linked: {} };
  for (const file of readdirSync(directory).filter(file => file.endsWith(".md")).sort()) {
    const input = readFileSync(new URL(file, directory), "utf8").replace(/\r\n/g, "\n");
    const match = input.match(/^---\nslug: ([^\n]+)\ndateModified: ([^\n]+)\nlead:\n((?:  - [^\n]+\n)+)---\n([\s\S]+)$/);
    assert.ok(match, `${file}: frontmatter`);
    const [, slug, dateModified, leadLines, raw] = match;
    assert.equal(file, `${slug}.md`);
    assert.ok(!articles[slug]);
    const meta = MORITA_ARTICLES.find((a) => a.slug === slug);
    assert.ok(meta, `${slug}: lib/morita.ts に無い`);
    assert.equal(meta.dateModified, dateModified, `${slug}: dateModified が lib/morita.ts と違う`);
    const lead = leadLines.trimEnd().split("\n").map(line => line.slice(4));
    assert.ok(lead.length >= 3 && lead.length <= 5, `${slug}: leadは3〜5項目`);
    const rawContent = raw.replace(/<!--\s*変更[\s\S]*?-->/g, "").trim();
    assert.ok(!rawContent.includes("<!--"), `${slug}: 未対応コメント`);
    assert.ok(!input.includes("【"), `${slug}: 加筆待ちの【 】が残っている`);
    assert.ok(!/^## 出典/m.test(rawContent), `${slug}: 「## 出典」節がある(方針: 出典欄は置かない)`);
    const { content, replaced, linked } = rewriteLinks(slug, rawContent);
    for (const [k, v] of Object.entries(replaced)) totals.replaced[k] = (totals.replaced[k] ?? 0) + v;
    for (const [k, v] of Object.entries(linked)) totals.linked[k] = (totals.linked[k] ?? 0) + v;
    const section = content.match(/^## [^\n]*よくある質問[^\n]*\n([\s\S]*?)(?=^## |$(?![\s\S]))/m)?.[1];
    assert.ok(section, `${slug}: FAQ節なし`);
    const faqs = [...section.matchAll(/^\*\*Q[.．]\s*(.+?)\*\*\s*\n([\s\S]*?)(?=^\*\*Q[.．]|$(?![\s\S]))/gm)].map(m => ({ question: plain(m[1]), answer: plain(m[2].trim().replace(/^A[.．]\s*/, "").replace(/\n+/g, " ")) }));
    assert.ok(faqs.length && faqs.every(faq => faq.answer), `${slug}: FAQ抽出`);
    assert.ok(/^## まとめ/m.test(content), `${slug}: 「## まとめ」節なし`);
    articles[slug] = { slug, dateModified, lead, content, faqs };
  }
  assert.deepEqual(Object.keys(articles).sort(), MORITA_ARTICLES.map(a => a.slug).sort(), "原稿の slug 集合が MORITA_ARTICLES と一致しない");
  return { articles, totals };
}

export function generatedMorita(article) {
  return `// scripts/import-morita.mjs で生成。直接編集しない。\n\nexport const lead = ${JSON.stringify(article.lead, null, 2)};\nexport const dateModified = ${JSON.stringify(article.dateModified)};\nexport const faqs = ${JSON.stringify(article.faqs, null, 2)};\n\nconst content = ${JSON.stringify(article.content)};\n\nexport default content;\n`;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const { articles, totals } = parseMorita();
  for (const article of Object.values(articles)) {
    const output = generatedMorita(article);
    const target = new URL(`../content/morita/${article.slug}.ts`, import.meta.url);
    if (process.argv.includes("--check")) assert.equal(readFileSync(target, "utf8"), output, `${article.slug}: 再現性`);
    else writeFileSync(target, output);
  }
  const sum = (bag) => Object.values(bag).reduce((s, n) => s + n, 0);
  console.log(`森田療法 ${Object.keys(articles).length} 本: lead・本文・FAQ 生成 OK`);
  console.log(`未公開リンクの置換(準備中): ${Object.keys(totals.replaced).length} path / ${sum(totals.replaced)} か所`);
  for (const [k, v] of Object.entries(totals.replaced).sort()) console.log(`  ${k} ×${v}`);
  console.log(`箇条書きの矢印・文中の「ラベル」をリンクにした: ${sum(totals.linked)} か所`);
}
