import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { YOUGO } from "../data/yougo.ts";
import { findFirstYougoTerm, isYougoExcludedTag } from "../lib/yougo-linker.mjs";

// 用語辞典は1ページ+アンカー構成(docs/codex-phase2-yougo-revision-2026-09-02.md)。
const origin = process.env.VERIFY_ORIGIN;
const expectedCounts = { "初診日まわり": 9, "書類": 8, "審査": 8, "お金・要件": 9, "受給後": 6 };
const CATEGORY_IDS = { "初診日まわり": "cat-shoshinbi", "書類": "cat-shorui", "審査": "cat-shinsa", "お金・要件": "cat-okane", "受給後": "cat-jukyugo" };
const KANA = ["あ", "か", "さ", "た", "な", "は", "ま", "や", "ら", "わ"];
const yomiOf = (item) => item.yomi || (item.slug === "tenpu-dekinai-moushitatesho" ? "じゅしんじょうきょうとうしょうめいしょがてんぷできないもうしたてしょ" : "");
const kanaOf = (item) => {
  const first = yomiOf(item).charAt(0);
  return /^[あいうえお]$/.test(first) ? "あ" : /^[かきくけこがぎぐげご]$/.test(first) ? "か" : /^[さしすせそざじずぜぞ]$/.test(first) ? "さ" : /^[たちつてとだぢづでど]$/.test(first) ? "た" : /^[なにぬねの]$/.test(first) ? "な" : /^[はひふへほばびぶべぼぱぴぷぺぽ]$/.test(first) ? "は" : /^[まみむめも]$/.test(first) ? "ま" : /^[やゆよ]$/.test(first) ? "や" : /^[らりるれろ]$/.test(first) ? "ら" : "わ";
};

assert.equal(YOUGO.length, 40, "用語は40語");
assert.equal(new Set(YOUGO.map(({ slug }) => slug)).size, 40, "slug重複なし");
for (const item of YOUGO) assert.match(item.slug, /^[a-z0-9-]+$/, `${item.slug}: ASCII slug(全角・キリル文字なし)`);
for (const [category, count] of Object.entries(expectedCounts)) assert.equal(YOUGO.filter((item) => item.category === category).length, count, `${category}: ${count}語`);
assert.equal(YOUGO.some((item) => /実装メモ|執筆メモ|x\.com\/@/.test(JSON.stringify(item))), false, "非公開メモを除外");

// 自動リンクの単体条件
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

const linker = await readFile(new URL("../components/YougoAutoLinker.tsx", import.meta.url), "utf8");
assert.match(linker, /closest\(`a, h1, h2, h3, code, pre,/, "リンク・見出し・コードを除外");
assert.match(linker, /\.p-source/, "出典ブロックを除外");
assert.match(linker, /anchor\.href = `\/yougo#\$\{match\.entry\.slug\}`/, "自動リンクの飛び先はアンカー");
assert.match(linker, /pathname === "\/yougo"\) return/, "用語辞典ページでは自動リンクを動かさない");
const markdown = await readFile(new URL("../components/MarkdownArticle.tsx", import.meta.url), "utf8");
assert.match(markdown, /"data-yougo-skip": ""/, "出典ブロックを自動リンク対象外にする");
const homepage = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
assert.match(homepage, /searchableYomi/, "検索インデックスによみを登録");
assert.match(homepage, /href: `\/yougo#\$\{item\.slug\}`/, "検索結果もアンカーへ");
const sitemap = await readFile(new URL("../app/sitemap.ts", import.meta.url), "utf8");
assert.doesNotMatch(sitemap, /\/yougo\/\$\{/, "サイトマップに個票URLを出さない");
const css = await readFile(new URL("../app/platform.css", import.meta.url), "utf8");
assert.match(css, /\.yougo-term:target \{ animation: yougo-flash/, "着地した語をハイライトする");

if (origin) {
  const fetchStatus = async (path) => (await fetch(new URL(path, origin))).status;
  const fetchHtml = async (path) => {
    const response = await fetch(new URL(path, origin));
    assert.equal(response.status, 200, `${path}: HTTP 200`);
    return response.text();
  };
  const page = await fetchHtml("/yougo");
  // 1. 40語すべてが1ページに載る / 2. id が付く
  for (const item of YOUGO) {
    assert.match(page, new RegExp(`<section class="yougo-term" id="${item.slug}"`), `${item.slug}: section id`);
    assert.ok(page.includes(item.term) && page.includes(item.paraphrase), `${item.slug}: 用語名と言い換え`);
    for (const paragraph of item.body.split("\n")) assert.ok(page.includes(paragraph), `${item.slug}: 定義文`);
    if (item.note) assert.ok(page.includes(item.note), `${item.slug}: 注意`);
  }
  assert.equal([...page.matchAll(/<section class="yougo-term"/g)].length, 40, "用語カードは40");
  // 1. 個票URLは存在しない
  for (const item of YOUGO) assert.equal(await fetchStatus(`/yougo/${item.slug}`), 404, `/yougo/${item.slug} は存在しない`);
  // 3. カテゴリタブと五十音から到達できる
  for (const [category, id] of Object.entries(CATEGORY_IDS)) {
    assert.match(page, new RegExp(`href="#${id}"`), `${category}: タブ`);
    assert.match(page, new RegExp(`id="${id}"`), `${category}: 飛び先`);
  }
  for (const group of KANA) {
    const first = YOUGO.find((item) => kanaOf(item) === group);
    if (first) assert.match(page, new RegExp(`href="#${first.slug}" data-yougo-kana="${group}"`), `${group}行: 最初の語へ`);
    else assert.match(page, new RegExp(`<span aria-disabled="true" data-yougo-kana="${group}"`), `${group}行: 語なし`);
  }
  // 5. リンクをコピー
  assert.equal([...page.matchAll(/data-yougo-copy="/g)].length, 40, "リンクをコピーは40個");
  // 6. DefinedTermSet
  const ld = [...page.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => JSON.parse(m[1]));
  const set = ld.find((item) => item["@type"] === "DefinedTermSet");
  assert.ok(set, "DefinedTermSet がある");
  assert.equal(set.hasDefinedTerm.length, 40, "DefinedTerm は40件");
  for (const term of set.hasDefinedTerm) assert.ok(term["@type"] === "DefinedTerm" && term.name && term.description && /\/yougo#[a-z0-9-]+$/.test(term["@id"]), `DefinedTerm: ${term.name}`);
  // 8. 未公開ページへのリンクを出さない(公開状況は lib/hubs.ts に従う)
  const { HUBS } = await import("../lib/hubs.ts");
  for (const item of YOUGO) for (const link of item.related) {
    const published = /^\/(columns|gokai)\//.test(link.href) || link.href === "/jitsurei" || HUBS.find((hub) => hub.path === link.href)?.published === true;
    const has = new RegExp(`href="${link.href.replace(/[/#]/g, (c) => "\\" + c)}"`).test(page);
    if (published) assert.ok(has, `${item.slug}: 公開済みの関連(${link.href})をリンク`);
    else assert.ok(!has, `${item.slug}: 未公開の関連(${link.href})はリンクしない`);
  }
  assert.match(page, /href="\/#site-search-input"/, "サイト内検索への導線");
  // 4. 出典ブロックの除外(ハブ)
  const hub = await fetchHtml("/nayami/koushin");
  assert.match(hub, /data-yougo-skip/, "ハブ本文の出典ブロックに印が付く");
  const home = await fetchHtml("/");
  assert.ok(home.includes("げんしょうび"), "検索インデックス: げんしょうび");
  assert.ok(home.includes("しょうがいじょうたいかくにんとどけ"), "検索インデックス: しょうがいじょうたいかくにんとどけ");
}

console.log(`用語辞典検証: 40語、slug、分類、自動リンク単体条件${origin ? "、1ページ40語・個票404・タブ/五十音・コピー・DefinedTermSet・公開リンク" : ""} OK`);
