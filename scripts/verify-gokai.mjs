import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { GOKAI, GOKAI_CATEGORIES } from "../data/gokai.ts";
import { HUBS } from "../lib/hubs.ts";
import { SITE_NAME } from "../lib/constants.ts";
import { decodePng, colHasInk, rowHasInk } from "./lib/png.mjs";

const origin = process.env.VERIFY_ORIGIN;
const PAGE_BACKGROUND = [0xf7, 0xfb, 0xfe];

// docs/gokai-cards-batch3 / batch4 のハブ別配分表(batch4で更新された後の姿)。
const DISTRIBUTION = {
  "/hajimete": [1, 13, 14, 15, 21],
  "/nayami/shoshinbi-karute": [8, 9, 28, 29, 30, 37, 38, 39],
  "/nayami/shindansho-komatta": [12, 16],
  "/nayami/koushin": [10, 21, 33, 44],
  "/nayami/sokyuu": [11, 40],
  "/joukyou/hatarakinagara": [2, 24, 36],
  "/joukyou/hitorigurashi": [3, 48],
  "/joukyou/hatachi-mae": [7, 14],
  "/joukyou/shoubyou-teatekin-kara": [24],
  "/byoki/tekiou-fuan": [4, 31],
  "/byoki/hattatsu": [1, 25, 31],
  "/byoki/chiteki": [25, 45],
  "/byoki/utsu-soukyoku": [13, 15, 22],
  "/byoki/jinzou-touseki": [32],
  "/byoki/gan": [32],
  "/byoki/tounyou": [29],
  "/okane/ikura": [5, 6, 18, 19, 20, 34, 35, 41, 42, 43, 45, 47],
  "/shinsei": [17, 23, 27, 46],
  "/erabu/jibun-ka-irai": [26, 27],
};

assert.equal(GOKAI.length, 48, "誤解カードは48枚");
assert.equal(new Set(GOKAI.map(({ slug }) => slug)).size, 48, "slug重複なし");
for (const card of GOKAI) {
  assert.match(card.slug, /^[a-z0-9-]+$/, `${card.slug}: ASCII slug`);
  assert.ok(GOKAI_CATEGORIES.includes(card.category), `${card.slug}: 5カテゴリのいずれか`);
  assert.ok(card.truth && card.why && card.when, `${card.slug}: 固定型の3欄がそろう`);
  assert.ok(card.next.length > 0, `${card.slug}: 次に読むがある`);
  assert.ok(card.sources.length > 0, `${card.slug}: 出典がある`);
  assert.ok(card.hubs.length > 0, `${card.slug}: 対応ハブがある`);
}
assert.equal(
  GOKAI.some((card) => /執筆メモ|実装メモ|x\.com|いいね|@/.test(JSON.stringify(card))),
  false,
  "非公開メモ・参照元をデータに含めない",
);

// 配分表と一致するか(カード番号は原稿の並び順 = data/gokai.ts の並び順)。
const slugByNumber = GOKAI.map(({ slug }) => slug);
for (const [hubPath, numbers] of Object.entries(DISTRIBUTION)) {
  const expected = numbers.map((number) => slugByNumber[number - 1]).sort();
  const actual = GOKAI.filter((card) => card.hubs.includes(hubPath)).map(({ slug }) => slug).sort();
  assert.deepEqual(actual, expected, `${hubPath}: 配分表と一致`);
}
const assignedHubs = new Set(GOKAI.flatMap((card) => card.hubs));
assert.deepEqual([...assignedHubs].sort(), Object.keys(DISTRIBUTION).sort(), "配分表にないハブへ配らない");
for (const hubPath of assignedHubs) {
  assert.ok(HUBS.find((hub) => hub.path === hubPath)?.published, `${hubPath}: 公開済みハブ`);
}

// 配分表が触れていない公開ハブ。0枚のまま公開する場合は検証記録に理由を残す。
const contentHubs = HUBS.filter((hub) => hub.published && ["byoki", "joukyou", "nayami", "okane", "erabu"].includes(hub.kind));
const uncoveredHubs = contentHubs.filter((hub) => !assignedHubs.has(hub.path)).map((hub) => hub.path);

const listPage = await readFile(new URL("../app/gokai/page.tsx", import.meta.url), "utf8");
assert.match(listPage, /GOKAI_CATEGORIES\.map/, "一覧に5カテゴリのタブがある");
const ogTemplate = await readFile(new URL("../lib/gokai-og.tsx", import.meta.url), "utf8");
assert.match(ogTemplate, /本当は/, "OGPに「本当は」を入れる");
assert.match(ogTemplate, /width: 1200, height: 630/, "OGPは1200x630");
assert.match(ogTemplate, /NotoSansJP-Regular\.ttf/, "OGPは同梱フォントを使う");

// 同梱フォントに、OG画像へ載せる文字がすべて入っているか(なければ豆腐になる)。
for (const file of ["NotoSansJP-Regular.ttf", "NotoSansJP-Bold.ttf"]) {
  const stat = await readFile(new URL(`../lib/fonts/${file}`, import.meta.url));
  assert.ok(stat.length > 10_000, `${file}: フォントが同梱されている`);
}
const coverage = new Set(JSON.parse(await readFile(new URL("../lib/fonts/coverage.json", import.meta.url), "utf8")));
const ogTexts = [SITE_NAME, "よくある誤解", "本当は", ...GOKAI.flatMap((card) => [card.misconception, card.truth])];
const uncovered = [...new Set(ogTexts.join("").split("").filter((ch) => !coverage.has(ch.codePointAt(0))))];
assert.deepEqual(uncovered, [], `OG画像の文字がフォントに未収録: ${uncovered.join("")}(scripts/build-og-font.py を再実行)`);
const hubBlock = await readFile(new URL("../components/platform/HubGokai.tsx", import.meta.url), "utf8");
assert.match(hubBlock, /HUB_GOKAI_LIMIT/, "ハブ欄は最大3枚");
assert.match(hubBlock, /もっと見る/, "4枚以上は「もっと見る」で/gokaiへ");

if (origin) {
  const fetchHtml = async (path) => {
    const response = await fetch(new URL(path, origin));
    assert.equal(response.status, 200, `${path}: HTTP 200`);
    return response.text();
  };
  // 本文の可視テキストだけを取り出す。Next.jsのフライトペイロード(script内)は
  // フレームワークの内部文字列を含むので、禁止語の検査対象から外す。
  const visibleText = (html) => (html.match(/<main[^>]*>([\s\S]*?)<\/main>/)?.[1] ?? "")
    .replace(/<script[\s\S]*?<\/script>/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&");
  const list = await fetchHtml("/gokai");
  assert.equal([...list.matchAll(/data-gokai-slug=/g)].length, 48, "一覧に48枚");
  assert.doesNotMatch(visibleText(list), /執筆メモ|実装メモ|x\.com|いいね|@/, "一覧に執筆メモ・参照元を出さない");
  for (const category of GOKAI_CATEGORIES) {
    const page = await fetchHtml(`/gokai?category=${encodeURIComponent(category)}`);
    const expected = GOKAI.filter((card) => card.category === category).length;
    assert.ok(expected > 0, `${category}: 1枚以上`);
    assert.equal([...page.matchAll(/data-gokai-slug=/g)].length, expected, `${category}: カテゴリから到達`);
  }
  for (const card of GOKAI) {
    assert.match(list, new RegExp(`href="/gokai/${card.slug}"`), `${card.slug}: 一覧から到達可能`);
    const detail = await fetchHtml(`/gokai/${card.slug}`);
    for (const text of [card.misconception, card.truth, card.why, card.when, ...card.sources]) {
      assert.ok(detail.includes(text.replace(/&/g, "&amp;")), `${card.slug}: 原稿を表示(${text.slice(0, 12)}…)`);
    }
    assert.doesNotMatch(visibleText(detail), /執筆メモ|実装メモ|x\.com|いいね|@/, `${card.slug}: 執筆メモ・参照元を出さない`);
    const og = await fetch(new URL(`/gokai/${card.slug}/opengraph-image`, origin));
    assert.equal(og.status, 200, `${card.slug}: OGP画像`);
    assert.equal(og.headers.get("content-type"), "image/png", `${card.slug}: OGPはPNG`);
    const image = decodePng(Buffer.from(await og.arrayBuffer()));
    assert.equal(image.width, 1200, `${card.slug}: OGP幅1200`);
    assert.equal(image.height, 630, `${card.slug}: OGP高さ630`);
    // 枠(padding 44px)の外に文字がはみ出していないこと。上下左右の余白帯を検査する。
    for (const y of [20, 610]) {
      assert.equal(rowHasInk(image, y, PAGE_BACKGROUND), false, `${card.slug}: OGPが枠内に収まる(y=${y})`);
    }
    for (const x of [20, 1180]) {
      assert.equal(colHasInk(image, x, PAGE_BACKGROUND), false, `${card.slug}: OGPが枠内に収まる(x=${x})`);
    }
  }
  for (const [hubPath, numbers] of Object.entries(DISTRIBUTION)) {
    const page = await fetchHtml(hubPath);
    assert.doesNotMatch(visibleText(page), /執筆メモ|実装メモ|x\.com|いいね/, `${hubPath}: 差し込み後も執筆メモを出さない`);
    const shown = [...page.matchAll(/data-hub-gokai-slug="([^"]+)"/g)].map((match) => match[1]);
    // 意思決定ページは中立性を保つため、誤解カードの差し込み対象外。
    const expected = hubPath.startsWith("/erabu/") ? [] : numbers.map((number) => slugByNumber[number - 1]).slice(0, 3);
    assert.deepEqual(shown, expected, `${hubPath}: 上位3枚を差し込む`);
    if (!hubPath.startsWith("/erabu/") && numbers.length > 3) assert.match(page, /もっと見る/, `${hubPath}: もっと見るを出す`);
  }
}

console.log(`誤解カード検証: 48枚、5カテゴリ、配分表19ハブ一致、OGP・ハブ差し込み${origin ? "(実URL)" : "(静的)"} OK`);
if (uncoveredHubs.length > 0) console.log(`配分表が触れていない公開ハブ(0枚): ${uncoveredHubs.join(", ")}`);
