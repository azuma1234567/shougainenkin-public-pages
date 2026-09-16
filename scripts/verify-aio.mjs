// node --import ./scripts/lib/ts-alias.mjs scripts/verify-aio.mjs
import assert from "node:assert/strict";
import { COLUMNS, columnJsonLd, extractColumnFaqs } from "../lib/columns.ts";
import { ABOUT_PERSON_ID, ABOUT_PUBLISHER_ID } from "../lib/seo.ts";
import { SITE_URL } from "../lib/constants.ts";
import { HUBS } from "../lib/hubs.ts";
import { extractHubFaqs, getHubContent } from "../lib/hub-content.ts";
import { hubJsonLd } from "../lib/hub-jsonld.ts";

const references = [{ label: "資料名", href: "https://www.nenkin.go.jp/" }];
const ids = new Set();
for (const column of COLUMNS) {
  const article = columnJsonLd(column, references)["@graph"][0];
  assert.equal(article.headline, column.title);
  assert.equal(article.url, `${SITE_URL}/columns/${column.slug}`);
  assert.equal(article.mainEntityOfPage, article.url);
  assert.equal(article.author["@id"], ABOUT_PERSON_ID);
  assert.equal(article.publisher["@id"], ABOUT_PUBLISHER_ID);
  assert.equal(article.dateModified, column.dateModified);
  assert.deepEqual(article.citation, [{
    "@type": "CreativeWork", name: references[0].label, url: references[0].href,
  }]);
  assert.equal(columnJsonLd(column, [])["@graph"][0].citation, undefined);
  assert.equal(columnJsonLd(column)["@graph"][0].citation, undefined);
  assert.ok(!ids.has(article["@id"]));
  ids.add(article["@id"]);
}
console.log(`PASS: ${COLUMNS.length}記事の識別子・著者・発行元・引用・既存メタデータ`);

/* docs/seo-aio-2026-09-16-instructions.md §4-2: コラム57本の FAQPage の Question 数が本文の FAQ 見出し数と一致し、
   content/columns/<slug>.ts の faqs 書き出しとも同じ内容であること。@graph の Person は1つで @id が著者と同じ。 */
{
  const { readdirSync } = await import("node:fs");
  let count = 0;
  for (const file of readdirSync("content/columns")) {
    const slug = file.replace(/\.ts$/, "");
    const column = COLUMNS.find((c) => c.slug === slug);
    assert.ok(column, `${slug}: lib/columns.ts に無い`);
    const mod = await import(`../content/columns/${file}`);
    const source = mod.default;
    const headings = (source.match(/^\*\*Q[.．]/gm) ?? []).length;
    assert.ok(headings > 0, `${slug}: 本文に FAQ が無い`);
    const graph = columnJsonLd(column, [], { source })["@graph"];
    const faq = graph.filter((n) => n["@type"] === "FAQPage");
    assert.equal(faq.length, 1, `${slug}: FAQPage が1つでない`);
    assert.equal(faq[0].mainEntity.length, headings, `${slug}: Question 数 ${faq[0].mainEntity.length} ≠ 本文の見出し ${headings}`);
    assert.deepEqual(extractColumnFaqs(source), mod.faqs, `${slug}: 本文から取り出した FAQ と faqs 書き出しが違う`);
    for (const q of faq[0].mainEntity) assert.ok(!/\*\*|\]\(/.test(q.name + q.acceptedAnswer.text), `${slug}: 太字記号やリンクが残っている`);
    const persons = graph.filter((n) => n["@type"] === "Person");
    assert.equal(persons.length, 1); assert.equal(persons[0]["@id"], ABOUT_PERSON_ID);
    assert.equal(graph.filter((n) => n["@type"] === "Article").length, 1);
    assert.equal(graph.filter((n) => n["@type"] === "BreadcrumbList").length, 1);
    count += 1;
  }
  console.log(`PASS: ${count}記事の FAQPage の Question 数が本文と一致`);
}

/* ハブ: Article ＋ BreadcrumbList ＋(FAQ があれば)FAQPage ＋ Person。Question 数は本文の `**Q.` の数。 */
{
  let count = 0, withFaq = 0;
  for (const hub of HUBS.filter((h) => h.published && h.kind !== "existing")) {
    const content = getHubContent(hub.path);
    if (!content) continue;
    const graph = hubJsonLd(hub, content)["@graph"];
    const article = graph.find((n) => n["@type"] === "Article");
    assert.ok(article, hub.path);
    assert.equal(article.headline, content.title);
    assert.equal(article.author["@id"], ABOUT_PERSON_ID);
    assert.equal(article.publisher["@id"], ABOUT_PUBLISHER_ID);
    assert.equal(article.dateModified, content.dateModified);
    assert.equal(article.mainEntityOfPage, `${SITE_URL}${hub.path}`);
    assert.ok(!JSON.stringify(graph).includes("道具"), `${hub.path}: JSON-LD に「道具」`);
    assert.equal(graph.filter((n) => n["@type"] === "BreadcrumbList").length, 1);
    assert.equal(graph.filter((n) => n["@type"] === "Person").length, 1);
    const headings = (content.source.match(/^\*\*Q[.．]/gm) ?? []).length;
    const faq = graph.filter((n) => n["@type"] === "FAQPage");
    assert.equal(faq.length, headings > 0 ? 1 : 0, `${hub.path}: FAQPage の有無`);
    if (headings > 0) { withFaq += 1; assert.equal(faq[0].mainEntity.length, headings, `${hub.path}: Question 数`); assert.equal(extractHubFaqs(content.source).length, headings); }
    count += 1;
  }
  console.log(`PASS: ハブ${count}本の Article・パンくず・FAQPage(FAQ あり ${withFaq}本)`);
}

// URLを指定した場合は、実際に配信されるHTMLも検証する。
if (process.argv[2]) {
  const { parse } = await import("node-html-parser");
  const origin = new URL(process.argv[2]).origin;
  for (const column of COLUMNS) {
    const response = await fetch(`${origin}/columns/${column.slug}`);
    assert.equal(response.status, 200, column.slug);
    const html = parse(await response.text());
    const scripts = html.querySelectorAll('script[type="application/ld+json"]');
    assert.equal(scripts.length, 1, `${column.slug}: ld+json が ${scripts.length} 個(1つだけにする)`);
    const nodes = scripts
      .flatMap((script) => {
        const data = JSON.parse(script.textContent);
        return data["@graph"] ?? [data];
      });
    const article = nodes.find((node) => node["@type"] === "Article");
    assert.ok(article, column.slug);
    assert.equal(article["@id"], `${SITE_URL}/columns/${column.slug}#article`);
    assert.equal(article.author["@id"], ABOUT_PERSON_ID);
    assert.equal(article.publisher["@id"], ABOUT_PUBLISHER_ID);
    assert.equal(html.querySelector("h1").textContent, column.title);
    assert.equal(html.querySelector('link[rel="canonical"]').getAttribute("href"), article.url);
    const visibleReferences = html.querySelectorAll(".references li a").map((link) => ({
      "@type": "CreativeWork", name: link.textContent, url: link.getAttribute("href"),
    }));
    assert.deepEqual(article.citation ?? [], visibleReferences, column.slug);
  }
  console.log(`PASS: ${origin} の${COLUMNS.length}記事の配信HTML・参考リンク一致・ld+json は1つ`);
  let hubCount = 0;
  for (const hub of HUBS.filter((h) => h.published && h.kind !== "existing")) {
    const response = await fetch(`${origin}${hub.path}`);
    assert.equal(response.status, 200, hub.path);
    const html = parse(await response.text());
    const scripts = html.querySelectorAll('script[type="application/ld+json"]');
    assert.equal(scripts.length, 1, `${hub.path}: ld+json が ${scripts.length} 個`);
    const graph = JSON.parse(scripts[0].textContent)["@graph"];
    assert.ok(graph.some((n) => n["@type"] === "Article") && graph.some((n) => n["@type"] === "BreadcrumbList"), hub.path);
    const visibleFaq = html.querySelectorAll("details.hub-faq-item").length;
    const faq = graph.find((n) => n["@type"] === "FAQPage");
    assert.equal(faq ? faq.mainEntity.length : 0, visibleFaq, `${hub.path}: 画面の FAQ ${visibleFaq} と JSON-LD`);
    hubCount += 1;
  }
  console.log(`PASS: ${origin} のハブ${hubCount}本は ld+json が1つで、FAQ が画面と一致`);
}
