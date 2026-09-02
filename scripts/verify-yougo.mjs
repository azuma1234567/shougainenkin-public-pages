import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { YOUGO } from "../data/yougo.ts";
import { findFirstYougoTerm, isYougoExcludedTag } from "../lib/yougo-linker.mjs";

const origin = process.env.VERIFY_ORIGIN;
const expectedCounts = { "初診日まわり": 9, "書類": 8, "審査": 8, "お金・要件": 9, "受給後": 6 };
assert.equal(YOUGO.length, 40, "用語は40語");
assert.equal(new Set(YOUGO.map(({ slug }) => slug)).size, 40, "slug重複なし");
for (const item of YOUGO) assert.match(item.slug, /^[a-z0-9-]+$/, `${item.slug}: ASCII slug`);
for (const [category, count] of Object.entries(expectedCounts)) assert.equal(YOUGO.filter((item) => item.category === category).length, count, `${category}: ${count}語`);
assert.equal(YOUGO.some((item) => /実装メモ|執筆メモ|x\.com\/@/.test(JSON.stringify(item))), false, "非公開メモを除外");

const firstLinked = new Set();
const sample = "障害認定日請求では障害認定日を確認する。障害認定日請求を再度確認する。";
let rest = sample;
const matches = [];
let match;
while ((match = findFirstYougoTerm(rest, YOUGO, firstLinked))) {
  matches.push(match.entry.term);
  firstLinked.add(match.entry.slug);
  rest = rest.slice(match.index + match.entry.term.length);
}
assert.equal(matches.filter((term) => term === "障害認定日請求").length, 1, "同じ語の2回目はリンクしない");
assert.equal(matches[0], "障害認定日請求", "長い語を先にリンクする");
for (const tag of ["h1", "H2", "h3"]) assert.equal(isYougoExcludedTag(tag), true, `${tag}はリンク対象外`);
assert.equal(findFirstYougoTerm("初診日", YOUGO, new Set(), "shoshinbi"), null, "個票は自己リンクしない");

const layout = await readFile(new URL("../components/YougoAutoLinker.tsx", import.meta.url), "utf8");
assert.match(layout, /closest\(`a, h1, h2, h3, code, pre,/, "リンク・見出し・コードを除外");
assert.match(layout, /\.p-source/, "出典ブロックを除外");
const markdown = await readFile(new URL("../components/MarkdownArticle.tsx", import.meta.url), "utf8");
assert.match(markdown, /sourcesHeadingIndex/, "本文の出典見出し以降に印を付ける");
assert.match(markdown, /"data-yougo-skip": ""/, "出典ブロックを自動リンク対象外にする");
const homepage = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
assert.match(homepage, /searchableYomi/, "検索インデックスによみを登録");

if (origin) {
  const fetchHtml = async (path) => {
    const response = await fetch(new URL(path, origin));
    assert.equal(response.status, 200, `${path}: HTTP 200`);
    return response.text();
  };
  const list = await fetchHtml("/yougo");
  assert.equal([...list.matchAll(/data-yougo-slug=/g)].length, 40, "一覧に40語");
  for (const item of YOUGO) {
    assert.match(list, new RegExp(`href="/yougo/${item.slug}"`), `${item.slug}: 一覧から到達可能`);
    const detail = await fetchHtml(`/yougo/${item.slug}`);
    assert.ok(detail.includes(item.term) && detail.includes(item.paraphrase) && detail.includes(item.body), `${item.slug}: 原稿を表示`);
  }
  for (const category of Object.keys(expectedCounts)) {
    const page = await fetchHtml(`/yougo?category=${encodeURIComponent(category)}`);
    assert.equal([...page.matchAll(/data-yougo-slug=/g)].length, expectedCounts[category], `${category}: カテゴリから到達`);
  }
  for (const item of YOUGO) {
    const yomi = item.yomi || (item.slug === "tenpu-dekinai-moushitatesho" ? "じゅしんじょうきょうとうしょうめいしょがてんぷできないもうしたてしょ" : "");
    const first = yomi.charAt(0);
    const group = /^[あいうえお]$/.test(first) ? "あ" : /^[かきくけこがぎぐげご]$/.test(first) ? "か" : /^[さしすせそざじずぜぞ]$/.test(first) ? "さ" : /^[たちつてとだぢづでど]$/.test(first) ? "た" : /^[なにぬねの]$/.test(first) ? "な" : /^[はひふへほばびぶべぼぱぴぷぺぽ]$/.test(first) ? "は" : /^[まみむめも]$/.test(first) ? "ま" : /^[やゆよ]$/.test(first) ? "や" : /^[らりるれろ]$/.test(first) ? "ら" : "わ";
    const page = await fetchHtml(`/yougo?kana=${encodeURIComponent(group)}`);
    assert.match(page, new RegExp(`data-yougo-slug="${item.slug}"`), `${item.slug}: 五十音から到達`);
  }
  const fee = await fetchHtml("/yougo/bunshoryou");
  assert.match(fee, /href="\/erabu\/hiyou-souba"/, "公開済みの費用ページをリンク");
  const review = await fetchHtml("/yougo/shinsa-seikyuu");
  assert.match(review, /href="\/erabu\/fushikyu-no-ato"/, "公開済みの不支給後ページをリンク");
  const criteria = await fetchHtml("/yougo/nintei-kijun");
  assert.match(criteria, /href="\/suuji"/, "公開済みの数字ページをリンク");
  const hub = await fetchHtml("/nayami/koushin");
  const sources = hub.slice(hub.indexOf("出典"));
  assert.match(hub, /data-yougo-skip/, "ハブ本文の出典ブロックに印が付く");
  assert.doesNotMatch(sources, /yougo-auto-link/, "出典ブロックは自動リンクしない");
  const home = await fetchHtml("/");
  assert.ok(home.includes("げんしょうび"), "検索インデックス: げんしょうび");
  assert.ok(home.includes("しょうがいじょうたいかくにんとどけ"), "検索インデックス: しょうがいじょうたいかくにんとどけ");
}

console.log(`用語辞典検証: 40語、slug、分類、自動リンク単体条件${origin ? "、全URL・2軸到達・検索・公開リンク" : ""} OK`);
