import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { parse } from "node-html-parser";
import { GOKAI_BODIES } from "../data/gokai-bodies.ts";
import { GOKAI, GOKAI_UPDATED } from "../data/gokai.ts";
import { SITE_NAME, SITE_URL } from "../lib/constants.ts";
import { parseManuscripts, generatedSource, CASE_ID } from "./import-gokai-bodies.mjs";
import { explainAmount } from "./lib/amounts-derive.mjs";
import { AMOUNTS_2026 } from "../data/amounts.ts";
await import("./lib/ts-alias.mjs");
const { isPublishedInternalPath } = await import("../lib/gokai.ts");
const { SAIKETSU_CASES } = await import("../lib/saiketsu.ts");

export const stripBold = text => text.replace(/\*\*([^*\n]+)\*\*/g, "$1");
export function blockText(block) {
  switch (block.type) {
    case "ul": return block.items.join("\n");
    case "case": return `${block.lead} — ${block.text}`;
    case "faq": return `Q. ${block.q}\nA. ${block.a}`;
    case "link": return `${block.label}(${block.href})`;
    default: return block.text;
  }
}
const forbidden = /toip_hokkaido|youtube|note\.com|x\.com\/|twitter/i;

export async function verifyBodies() {
  assert.equal(Object.keys(GOKAI_BODIES).length, 48);
  assert.deepEqual(Object.keys(GOKAI_BODIES).sort(), GOKAI.map(card => card.slug).sort());
  assert.deepEqual(GOKAI_BODIES, parseManuscripts(), "原稿との全フィールド一致");
  assert.equal(await readFile(new URL("../data/gokai-bodies.ts", import.meta.url), "utf8"), generatedSource(GOKAI_BODIES), "生成結果の再現性");
  const unknownAmounts = new Map();
  let minChars = Infinity;
  let caseCount = 0;
  for (const body of Object.values(GOKAI_BODIES)) {
    const card = GOKAI.find(card => card.slug === body.slug);
    assert.ok(body.title.includes(" — "), `${body.slug}: title`);
    assert.ok(body.description.length >= 70 && body.description.length <= 200, `${body.slug}: description`);
    assert.equal(body.checkedOn, "2026-09-03");
    const blocks = body.sections.flatMap(section => section.blocks);
    const text = body.sections.map(section => `${section.heading}\n${section.blocks.map(blockText).join("\n")}`).join("\n");
    const chars = stripBold(text).replace(/\s/g, "").length;
    minChars = Math.min(minChars, chars);
    assert.ok(chars >= 1500, `${body.slug}: ${chars}文字`);
    assert.doesNotMatch(text, forbidden, `${body.slug}: 禁止語`);
    const get = heading => body.sections.find(section => section.heading === heading).blocks;
    assert.deepEqual(get("自分の場合を確かめる"), [{ type: "ul", items: card.check }]);
    assert.deepEqual(get("窓口で聞く一言"), [{ type: "p", text: card.ask }]);
    const faqs = get("よくある質問");
    assert.equal(faqs.length, 3);
    assert.ok(faqs.every(block => block.type === "faq"));
    const paths = [...text.matchAll(/\((\/[^\s()]*)\)/g)].map(m => m[1]);
    for (const href of paths) {
      assert.ok(isPublishedInternalPath(href), `${body.slug}: 非公開リンク ${href}`);
      if (href.startsWith("/gokai/")) assert.ok(GOKAI_BODIES[href.slice(7)], `${body.slug}: 不明なカード ${href}`);
    }
    for (const [id] of text.matchAll(CASE_ID)) {
      assert.ok(SAIKETSU_CASES.some(item => item.id === id && item.verified), `${body.slug}: 裁決ID ${id}`);
      caseCount++;
    }
    for (const block of blocks) {
      const context = blockText(block);
      for (const [amount] of context.matchAll(/\d{1,3}(,\d{3})+円/g)) {
        if (!explainAmount(amount, AMOUNTS_2026, context)) {
          if (!unknownAmounts.has(amount)) unknownAmounts.set(amount, new Set());
          unknownAmounts.get(amount).add(body.slug);
        }
      }
    }
    const examples = body.sections.find(section => section.heading === "同じ状況の人が、どうなったか");
    if (examples) {
      assert.ok(examples.blocks.some(block => block.type === "case"));
      assert.equal(examples.blocks.at(-1).type, "link");
      assert.equal(examples.blocks.at(-1).href, "/jitsurei");
    }
  }
  console.log(`本文検証1〜8: 48枚、最短${minChars}文字、裁決ID ${caseCount}件、原稿完全一致 OK`);
  console.log("amounts.tsで説明できない金額（非致命的・原稿確認対象）:");
  for (const [amount, slugs] of unknownAmounts) console.log(`- ${amount}: ${[...slugs].join(", ")}`);
  return unknownAmounts;
}

export function verifyBodyHtml(html, slug) {
  const body = GOKAI_BODIES[slug];
  const dom = parse(html);
  assert.equal(dom.querySelector("h1").textContent, body.title, `${slug}: h1`);
  assert.equal(dom.querySelector("title").textContent, `${body.title}｜${SITE_NAME}`, `${slug}: title`);
  assert.equal(dom.querySelector('meta[name="description"]').getAttribute("content"), body.description);
  for (const selector of ['meta[property="og:description"]', 'meta[name="twitter:description"]']) assert.equal(dom.querySelector(selector).getAttribute("content"), body.description);
  for (const selector of ['meta[property="og:title"]', 'meta[name="twitter:title"]']) assert.equal(dom.querySelector(selector).getAttribute("content"), `${body.title}｜${SITE_NAME}`);
  assert.equal(dom.querySelector('link[rel="canonical"]').getAttribute("href"), `${SITE_URL}/gokai/${slug}`);
  const graph = dom.querySelectorAll('script[type="application/ld+json"]').flatMap(script => {
    const node = JSON.parse(script.textContent);
    return node["@graph"] ?? [node];
  });
  for (const type of ["Article", "FAQPage", "BreadcrumbList"]) assert.equal(graph.filter(node => node["@type"] === type).length, 1, `${slug}: ${type}は1つ`);
  const article = graph.find(node => node["@type"] === "Article");
  assert.equal(article.headline, body.title);
  assert.equal(article.description, body.description);
  assert.equal(article.datePublished, GOKAI_UPDATED);
  assert.equal(article.dateModified, body.checkedOn);
  assert.equal(article.author.name, SITE_NAME);
  assert.equal(article.publisher.name, SITE_NAME);
  assert.equal(article.mainEntityOfPage, `${SITE_URL}/gokai/${slug}`);
  const faq = graph.find(node => node["@type"] === "FAQPage");
  assert.deepEqual(faq.mainEntity, body.sections.flatMap(section => section.blocks).filter(block => block.type === "faq").map(block => ({
    "@type": "Question", name: block.q, acceptedAnswer: { "@type": "Answer", text: block.a },
  })));
  const sections = dom.querySelectorAll("article.gokai-detail > section");
  assert.ok(sections.map(section => section.textContent).join("").replace(/\s/g, "").length >= 1500, `${slug}: 表示本文1,500字以上`);
  assert.deepEqual(sections.map(section => section.querySelector("h2").textContent), body.sections.map(section => section.heading), `${slug}: 原稿の節順序`);
  body.sections.forEach((section, index) => {
    const rendered = sections[index];
    if (["出典", "同じ状況の人が、どうなったか"].includes(section.heading)) assert.ok(rendered.hasAttribute("data-yougo-skip"));
    const expected = section.blocks.map(block => {
      if (block.type === "case") return blockText(block).replace(block.caseId, "原文(厚労省PDF)");
      if (block.type === "link") return isPublishedInternalPath(block.href) ? `${section.heading !== "次に読む" ? "→ " : ""}${block.label}` : "";
      return blockText(block);
    }).join("");
    const actual = rendered.childNodes.slice(1).map(node => node.textContent).join("");
    assert.equal(actual.replace(/\s/g, ""), stripBold(expected).replace(/\s/g, ""), `${slug}/${section.heading}: 表示本文の全字一致（空白・記法除く）`);
    for (const block of section.blocks.filter(block => block.type === "case")) {
      const item = SAIKETSU_CASES.find(item => item.id === block.caseId);
      assert.ok(rendered.querySelectorAll("a").some(a => a.getAttribute("href") === item.url && a.getAttribute("target") === "_blank" && a.getAttribute("rel") === "noopener noreferrer"));
    }
  });
  for (const q of dom.querySelectorAll(".gokai-faq h3")) assert.ok(q.hasAttribute("data-yougo-skip"));
  assert.doesNotMatch(dom.querySelector("article.gokai-detail").textContent, forbidden);
}

export async function verifyBuiltBodies() {
  for (const slug of Object.keys(GOKAI_BODIES)) {
    verifyBodyHtml(await readFile(new URL(`../.next/server/app/gokai/${slug}.html`, import.meta.url), "utf8"), slug);
  }
  console.log("生成HTML: 全48枚のメタ情報・JSON-LD・原稿本文・見出し順・PDFリンク OK");
}

// 2026-09-04仕上げ指示§3: ビルド識別子を含む全文でなく、main要素の生バイトを比較する。
export async function verifyIntegration() {
  const baseline = JSON.parse(await readFile(new URL("../docs/verification/gokai-bodies-2026-09-03/baseline.json", import.meta.url), "utf8"));
  const changed = execFileSync("git", ["diff", "--name-only", baseline.baseRef, "--", "app/columns", "content/columns", "data/gokai.ts", "app/gokai/page.tsx", "components/platform/HubGokai.tsx", "app/gokai/[slug]/opengraph-image.tsx", "app/platform.css"], { encoding: "utf8" }).trim();
  assert.equal(changed, "", "既存記事・既存カード・一覧・ハブ・OG・CSSは変更なし");
  const manuscriptPath = "docs/gokai/gokai-body-batch4-2026-09-03.md";
  const changedManuscripts = execFileSync("git", ["diff", "--name-only", baseline.baseRef, "--", "docs/gokai"], { encoding: "utf8" }).trim().split("\n");
  assert.deepEqual(changedManuscripts, [manuscriptPath], "許可された原稿ファイルだけを変更");
  const oldParagraph = "老齢基礎年金の満額は年847,300円です(令和8年度)。60歳で繰り上げると24%減の643,948円になり、この額が一生続きます。";
  const newParagraph = "老齢基礎年金の満額は年847,300円です(令和8年度)。60歳で繰り上げると、1か月あたり0.4%・60か月で24%減り、643,948円になります(昭和37年4月2日以後生まれの場合)。この額が一生続きます。";
  const oldManuscript = execFileSync("git", ["show", `${baseline.baseRef}:${manuscriptPath}`], { encoding: "utf8" });
  assert.equal(oldManuscript.split(oldParagraph).length, 2);
  assert.equal(await readFile(new URL(`../${manuscriptPath}`, import.meta.url), "utf8"), oldManuscript.replace(oldParagraph, newParagraph), "kuriageの指定1段落だけを変更");
  const protectedSlugs = ["moushitatesho-a4-insatsu", "moushitatesho-kikan-kugiri", "teishutsusaki-yuusou"];
  assert.deepEqual(Object.keys(baseline.mainSha256).sort(), [...protectedSlugs].sort());
  let sameHtml = true;
  for (const slug of protectedSlugs) {
    const html = await readFile(new URL(`../.next/server/app/columns/${slug}.html`, import.meta.url), "utf8");
    const main = html.match(/<main(?:\s[^>]*)?>[\s\S]*?<\/main>/g);
    assert.equal(main?.length, 1, `${slug}: mainは1つ`);
    const hash = createHash("sha256").update(main[0]).digest("hex");
    const same = hash === baseline.mainSha256[slug];
    sameHtml &&= same;
    console.log(`11. ${same ? "○" : "×"} ${slug} main SHA-256: ${hash}`);
  }
  const before = await readFile(new URL("../docs/verification/prelaunch-2026-09-02/RESULT-gokai-bodies-before.md", import.meta.url), "utf8");
  const after = await readFile(new URL("../docs/verification/prelaunch-2026-09-02/RESULT-gokai-bodies-shiage.md", import.meta.url), "utf8");
  const decisions = report => [...report.matchAll(/^\| ([ABC]-\d+) \| ([○×]) \|/gm)].map(m => `${m[1]} ${m[2]}`);
  const pageCount = Number(after.match(/ページ数: (\d+)/)?.[1]);
  const sameChecks = JSON.stringify(decisions(before)) === JSON.stringify(decisions(after)) && pageCount === baseline.pageCount;
  console.log(`12. ${sameChecks ? "○" : "×"} prelaunch作業前後の判定一致 / ページ数 ${pageCount}`);
  if (!sameChecks) console.log(`before: ${decisions(before).join(", ")}\nafter: ${decisions(after).join(", ")}`);
  if (!sameHtml || !sameChecks) process.exitCode = 1;
}
