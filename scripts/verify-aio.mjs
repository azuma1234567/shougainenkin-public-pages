// node --import ./scripts/lib/ts-alias.mjs scripts/verify-aio.mjs
import assert from "node:assert/strict";
import { COLUMNS, columnJsonLd } from "../lib/columns.ts";
import { ABOUT_PERSON_ID, ABOUT_PUBLISHER_ID } from "../lib/seo.ts";
import { SITE_URL } from "../lib/constants.ts";

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

// URLを指定した場合は、実際に配信されるHTMLも検証する。
if (process.argv[2]) {
  const { parse } = await import("node-html-parser");
  const origin = new URL(process.argv[2]).origin;
  for (const column of COLUMNS) {
    const response = await fetch(`${origin}/columns/${column.slug}`);
    assert.equal(response.status, 200, column.slug);
    const html = parse(await response.text());
    const nodes = html.querySelectorAll('script[type="application/ld+json"]')
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
  console.log(`PASS: ${origin} の47記事の配信HTML・参考リンク一致`);
}
