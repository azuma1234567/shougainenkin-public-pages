import assert from "node:assert/strict";
import { readFileSync, writeFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { GOKAI } from "../data/gokai.ts";

export const INPUTS = ["gokai-body-sample-techou-ga-nai.md", ...[1, 2, 3, 4].map(n => `gokai-body-batch${n}-2026-09-03.md`)];
export const CASE_ID = /\b[hr]\d\d(?:_\d\d)?(?:_r\d\d)?-\d\d_\d\d\b/g;
const cases = JSON.parse(readFileSync(new URL("../data/saiketsu-cases-2026-08-26.json", import.meta.url), "utf8")).cases;
// ユーザー承認済み: この8枚のみ原稿の固有節位置を固定して許可する。
const ORDER_EXCEPTIONS = {
  "shindan-ga-tsuita-hi": ["受診歴を、どう洗い出すか", "数字で見ると"],
  "karute-ga-nai-owari": ["家の中を、どこから探すか", "数字で見ると"],
  "koushin-de-henkin": ["更新で、何を準備するか", "数字で見ると"],
  "jikou-de-muri": ["初診日が古い人が、最初にやること", "数字で見ると"],
  "omoku-misenai-to": ["「盛る」と「伝える」の違い", "数字で見ると"],
  "nyuuin-shitenai": ["通院だけの人が、何を書くか", "数字で見ると"],
  "amae": ["迷いが止めているときに、できること", "数字で見ると"],
  "tenin-shitabakari": ["新しい主治医に、何を渡すか", "同じ状況の人が、どうなったか"],
};

// 原稿は保持。ユーザー承認済みの **太字** のみインライン記法として許可する。
function text(value) {
  assert.ok(value.length > 0, "空のテキスト");
  const plain = value.replace(/\*\*[^*\n]+\*\*/g, "");
  assert.doesNotMatch(plain, /[*`<>]|!\[|\[[^\]]*\]\(|^\s*(?:#{1,6} |\d+[.)] |[-+>] )|~~|\|/, `未対応の記法: ${value}`);
  return value;
}
function link(line) {
  const match = line.match(/^(?:→ |- )(.+)\((\/[^\s()]*)\)$/);
  assert.ok(match && !match[2].startsWith("//"), `不正なリンク: ${line}`);
  return { type: "link", label: text(match[1]), href: match[2] };
}
function blocks(source, heading) {
  const lines = source.trim().split("\n");
  const result = [];
  for (let i = 0; i < lines.length;) {
    const line = lines[i];
    if (!line.trim()) { i++; continue; }
    if (line.startsWith("### ")) { result.push({ type: "h3", text: text(line.slice(4)) }); i++; }
    else if (line.startsWith("**Q. ")) {
      const q = line.match(/^\*\*Q\. (.+)\*\*$/);
      assert.ok(q && lines[i + 1]?.startsWith("A. "), `FAQが隣接するQ/Aでない: ${line}`);
      result.push({ type: "faq", q: text(q[1]), a: text(lines[i + 1].slice(3)) }); i += 2;
    } else if (line.startsWith("**")) {
      const m = line.match(/^\*\*(.+)\*\* — (.+)$/);
      assert.ok(m, `不正な事例: ${line}`);
      const ids = [...m[1].matchAll(CASE_ID)];
      assert.equal(ids.length, 1, "事例リードのIDは1つ");
      assert.ok(m[1].endsWith(`${ids[0][0]})`), "事例IDはリード末尾");
      result.push({ type: "case", lead: text(m[1]), text: text(m[2]), caseId: ids[0][0] }); i++;
    } else if (line.startsWith("→ ") || (heading === "次に読む" && line.startsWith("- "))) {
      result.push(link(line)); i++;
    } else if (line.startsWith("- ")) {
      const items = [];
      while (lines[i]?.startsWith("- ")) items.push(text(lines[i++].slice(2)));
      result.push({ type: "ul", items });
    } else {
      const paragraph = [text(line)]; i++;
      while (i < lines.length && lines[i].trim() && !/^(?:### |\*\*|→ |- )/.test(lines[i])) paragraph.push(text(lines[i++]));
      result.push({ type: "p", text: paragraph.join("\n") });
    }
  }
  return result;
}

export function parseManuscripts() {
  const bodies = {};
  for (const file of INPUTS) {
    const chunks = readFileSync(new URL(`../docs/gokai/${file}`, import.meta.url), "utf8").split("\n=====\n");
    if (!chunks[0].startsWith("---\n")) {
      assert.ok(chunks[0].startsWith("# ") && !chunks[0].includes("slug:"), `${file}: 前書き`);
      chunks.shift();
    }
    for (const chunk of chunks) {
      const match = chunk.trim().match(/^---\nslug: ([^\n]+)\ntitle: ([^\n]+)\ndescription: ([^\n]+)\ncheckedOn: ([^\n]+)\n---\n+([\s\S]+)$/);
      assert.ok(match, `${file}: frontmatterの形式`);
      const [, slug, title, description, checkedOn, source] = match;
      assert.ok(!Object.hasOwn(bodies, slug), `${slug}: 重複`);
      const parts = source.split(/^## /m);
      assert.equal(parts.shift().trim(), "", `${slug}: h2より前に本文がある`);
      const sections = parts.map(part => {
        const end = part.indexOf("\n");
        assert.ok(end > 0, `${slug}: 空の節`);
        const heading = text(part.slice(0, end));
        return { heading, blocks: blocks(part.slice(end + 1), heading) };
      });
      const headings = sections.map(s => s.heading);
      assert.equal(new Set(headings).size, headings.length, `${slug}: h2重複`);
      assert.equal(headings[0], "結論");
      assert.ok(headings[1].startsWith("なぜ") && headings[2].startsWith("制度では"), `${slug}: 冒頭の節順序`);
      const numberIndex = headings.indexOf("数字で見ると");
      assert.ok(numberIndex >= 3 && numberIndex <= 5, `${slug}: 固有節は0〜2個`);
      const tail = headings.slice(numberIndex);
      const expectedTail = ["数字で見ると", ...(tail.includes("同じ状況の人が、どうなったか") ? ["同じ状況の人が、どうなったか"] : []), "自分の場合を確かめる", "窓口で聞く一言", "よくある質問", "次に読む", "出典"];
      if (ORDER_EXCEPTIONS[slug]) {
        assert.equal(numberIndex, 3, `${slug}: 例外の前に固有節を増やさない`);
        const [heading, after] = ORDER_EXCEPTIONS[slug];
        expectedTail.splice(expectedTail.indexOf(after) + 1, 0, heading);
      }
      assert.deepEqual(tail, expectedTail, `${slug}: 節順序`);
      const get = heading => sections.find(s => s.heading === heading).blocks;
      const card = GOKAI.find(c => c.slug === slug);
      assert.ok(card, `${slug}: 既存カードなし`);
      assert.deepEqual(get("自分の場合を確かめる"), [{ type: "ul", items: card.check }], `${slug}: check完全一致`);
      assert.deepEqual(get("窓口で聞く一言"), [{ type: "p", text: card.ask }], `${slug}: ask完全一致`);
      assert.ok(get("よくある質問").length === 3 && get("よくある質問").every(b => b.type === "faq"), `${slug}: FAQは3組`);
      assert.ok(get("次に読む").length >= 2 && get("次に読む").length <= 4 && get("次に読む").every(b => b.type === "link"), `${slug}: 次に読むは2〜4件`);
      assert.ok(get("出典").length === 1 && get("出典")[0].type === "ul" && get("出典")[0].items.length > 0 && get("出典")[0].items.every(s => /確認日 20/.test(s)), `${slug}: 出典と確認日`);
      for (const [id] of source.matchAll(CASE_ID)) assert.ok(cases.some(c => c.id === id && c.verified && !c.excluded), `${slug}: 不明・未検証の裁決ID ${id}`);
      bodies[slug] = { slug, title, description, checkedOn, sections };
    }
  }
  assert.equal(Object.keys(bodies).length, 48);
  assert.deepEqual(Object.keys(bodies).sort(), GOKAI.map(c => c.slug).sort());
  return bodies;
}

export function generatedSource(bodies) {
  return `// scripts/import-gokai-bodies.mjs で生成。直接編集しない\nexport type GokaiBlock =\n  | { type: "p"; text: string }\n  | { type: "h3"; text: string }\n  | { type: "ul"; items: string[] }\n  | { type: "case"; lead: string; text: string; caseId: string }\n  | { type: "faq"; q: string; a: string }\n  | { type: "link"; label: string; href: string };\nexport type GokaiSection = { heading: string; blocks: GokaiBlock[] };\nexport type GokaiBody = { slug: string; title: string; description: string; checkedOn: string; sections: GokaiSection[] };\nexport const GOKAI_BODIES: Record<string, GokaiBody> = ${JSON.stringify(bodies, null, 2)};\nexport const GOKAI_BODIES_UPDATED = "2026-09-03";\n`;
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const output = generatedSource(parseManuscripts());
  const target = new URL("../data/gokai-bodies.ts", import.meta.url);
  if (process.argv.includes("--check")) assert.equal(readFileSync(target, "utf8"), output, "生成物と原稿が一致");
  else writeFileSync(target, output);
  console.log("誤解カード本文: 48枚・原稿の整合性 OK");
}
