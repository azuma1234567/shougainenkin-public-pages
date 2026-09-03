# 誤解カード48枚を記事本文つきにする — Claude Code 実装指示 (2026-09-03)

## 0. 前提と守ること

- 原稿は `docs/gokai/` の5ファイル(見本1枚 + batch1〜4 で計48枚)。**本文は一字も変えない**。誤字や事実の疑いを見つけたら、直さずに RESULT.md に「要確認」として書く。
- `data/gokai.ts` の既存フィールド(misconception/truth/why/when/next/sources/hubs/category/check/ask/figure)は変更しない。/gokai 一覧、ハブの HubGokai、OG画像(opengraph-image.tsx)は今の見た目のまま。
- 既存47記事(/columns 等)には触らない。`/columns/moushitatesho-a4-insatsu` は作業前後でバイト一致を確認する。
- 外部ライブラリ(markdownパーサ等)は追加しない。原稿の構造は決まっているので、小さな専用パーサで足りる。
- 本文中の裁決事例ID(例 `r06-03_01`)は `data/saiketsu-cases-2026-08-26.json` に存在するものだけ。存在しないIDが出たら止めて報告。
- ページ数は増えない(48枚は既に公開済み)。`npm run prelaunch:check` の期待ページ数は変えない。
- 調査元(Xアカウント・YouTube・note)がサイト出力に出ないこと。原稿には入っていないはずだが、verify で機械的に確認する。

## 1. 原稿の形式

各ファイルは先頭に1行の見出し、以降 `\n=====\n` でカードを区切る。カードは frontmatter と本文:

```
---
slug: koushin-maitoshi
title: 障害年金の更新は毎年ある？ — 更新は数年ごとで、時期は年金証書に書いてあります
description: (70〜200字)
checkedOn: 2026-09-03
---

## 結論
段落...

## なぜ「…」と思われているのか
段落...

## 制度ではこうなっている        ← 見出し文言はカードにより少し違う(「制度ではこうやって見ている」など)。h2はすべて原稿どおりに出す
### 小見出し                     ← h3 は任意
段落...

## 数字で見ると
段落...

## 同じ状況の人が、どうなったか   ← 裁決事例があるカードのみ
導入1段落
**病名・請求種別(年代、ID)** — 要旨...   ← 太字リード + " — " + 本文。1事例1段落
→ ほかの実例も読む(/jitsurei)

## 自分の場合を確かめる
- 3項目(= data/gokai.ts の check[] と完全一致)

## 窓口で聞く一言
1段落(= ask と完全一致)

## よくある質問
**Q. 質問**
A. 回答            ← 3組。Q行とA行は改行で隣接

## 次に読む
- ラベル(/path)    ← 2〜4行

## 出典
- 出典名・確認日 YYYY-MM-DD
```

ブロックの種類は次の6つだけ: 段落 / h3 / 箇条書き(`- `) / 事例(`**…** — …`) / FAQ(`**Q. …**`+`A. …`) / 矢印リンク(`→ ラベル(/path)`)。段落内の `**太字**` は「結論」等で使っていない(FAQのQと事例リードだけ)。これ以外の記法が出たらパーサはエラーで止める(黙って素通しにしない)。

## 2. データ生成: `scripts/import-gokai-bodies.mjs` → `data/gokai-bodies.ts`

入力: `docs/gokai/gokai-body-sample-techou-ga-nai.md`, `gokai-body-batch1〜4-2026-09-03.md`。
出力: `data/gokai-bodies.ts`(生成物。先頭に「scripts/import-gokai-bodies.mjs で生成。直接編集しない」を書く)。

```ts
export type GokaiBlock =
  | { type: "p"; text: string }
  | { type: "h3"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "case"; lead: string; text: string; caseId: string }   // lead から "(令和6年、r06-03_01)" の末尾IDを抜く
  | { type: "faq"; q: string; a: string }
  | { type: "link"; label: string; href: string };                  // 「→ ほかの実例も読む(/jitsurei)」と「次に読む」の各行
export type GokaiSection = { heading: string; blocks: GokaiBlock[] };
export type GokaiBody = { slug: string; title: string; description: string; checkedOn: string; sections: GokaiSection[] };
export const GOKAI_BODIES: Record<string, GokaiBody>;
export const GOKAI_BODIES_UPDATED = "2026-09-03";
```

パーサで必ず落とすこと(assert):
- 48 slug すべてが `data/gokai.ts` の slug と1対1。重複なし。
- 「自分の場合を確かめる」の3項目が `card.check` と、「窓口で聞く一言」の段落が `card.ask` と、それぞれ文字列完全一致(前後空白のみ許容)。不一致は止める。
- 「よくある質問」は Q/A ちょうど3組。
- 「次に読む」2〜4件、hrefは `/` 始まり。「出典」1件以上、各行に `確認日 20`。
- 見出しの順序: 結論 → なぜ… → 制度では… → (固有節0〜2) → 数字で見ると → (同じ状況の人が、どうなったか) → 自分の場合を確かめる → 窓口で聞く一言 → よくある質問 → 次に読む → 出典。固有節はカードごとに違うので「この並びに含まれない h2 は、制度では…の後ろ〜数字で見るとの前にのみ置ける」とする。

## 3. 表示: `app/gokai/[slug]/page.tsx` の差し替え

- `generateMetadata`: `title` = body.title、`description` = body.description に変更(OG/twitter の title・description も同じ値に)。canonical・robots は今のまま。opengraph-image.tsx は misconception/truth を使い続ける(変更しない)。
- hero: `<span className="p-label">よくある誤解</span>` の下に、誤解の一文 `card.misconception` を `<p class="gokai-detail-quote">` で出し、`<h1>` は body.title にする。Breadcrumb は今のまま。h1 の下に `<PageDate updated={GOKAI_BODIES_UPDATED} checked={body.checkedOn} />`。
- 本文: `components/platform/GokaiBody.tsx` を新設し、sections を順に h2 + blocks で描画。
  - `p` → `<p>`、`h3` → `<h3>`、`ul` → `<ul><li>`。
  - `case` → `<div class="gokai-case"><p><strong>{lead}</strong> — {text}</p></div>`。lead 内のIDは `lib/saiketsu.ts` の `SAIKETSU_CASES` から引き、見つかれば lead 末尾のID部分を `<a href={item.url} target="_blank" rel="noopener noreferrer">原文(厚労省PDF)</a>` の外部リンクに置き換える。見つからなければビルドを止める。
  - `faq` → `<div class="gokai-faq"><h3>Q. …</h3><p>A. …</p></div>`。
  - `link` → `<Link href>` 。ただし `isPublishedInternalPath(href)` が false のものは出さない(今の「次に読む」と同じ扱い)。
  - 「自分の場合を確かめる」「窓口で聞く一言」「数字で見ると」は本文側で描画するので、今の `gokai-check` / `gokai-ask` / `gokai-figure` ブロックは削除(内容は本文に同じ文が入っている)。既存の class 名(`gokai-block`, `gokai-check`, `gokai-ask`, `gokai-next`, `gokai-sources`)は該当 section に付け直して、platform.css の見た目を引き継ぐ。
  - `data-yougo-skip` は「出典」「同じ状況の人が、どうなったか」「よくある質問のQ」に付ける(用語の自動リンクが固有名詞や質問文を壊さないように)。
- JSON-LD: `<script type="application/ld+json">` を1本追加。`@graph` に `Article`(headline=body.title, description, datePublished=GOKAI_UPDATED, dateModified=body.checkedOn, author/publisher=SITE_NAME, mainEntityOfPage=canonical) と `FAQPage`(3組。`Q. `/`A. ` の接頭辞は外して name/text に入れる)。BreadcrumbList は Breadcrumb コンポーネントが既に出しているので重複させない。
- `/gokai/page.tsx` の一覧は変更なし。カードから詳細へのリンク文言もそのまま。

## 4. /jitsurei に事例アンカー(小変更)

`app/jitsurei/page.tsx` の `CaseCard` の外側要素に `id={item.id}` を付ける。誤解カード側の「→ ほかの実例も読む」は `/jitsurei` のまま(アンカーは将来用)。他は触らない。

## 5. `GOKAI_UPDATED` と sitemap

- `data/gokai.ts` の `GOKAI_UPDATED` は import-gokai.mjs の生成物なので触らない。sitemap の lastModified には `GOKAI_BODIES_UPDATED` を使うよう `app/sitemap.ts` の gokaiPages を1行変更。

## 6. verify: `scripts/verify-gokai.mjs` に追記(既存チェックは残す)

1. `GOKAI_BODIES` が48件、slug が `GOKAI` と一致。
2. 各 body: title に「 — 」を含む / description 70〜200字 / checkedOn が `2026-09-03` / 本文(空白除く)1,500字以上。
3. check[] と ask の完全一致(§2の assert を再度ここでも)。
4. 本文中の全 `/` 内部リンク(次に読む・矢印・本文内の `(/path)`)が `isPublishedInternalPath` で true、または `/gokai/<slug>` として存在。
5. 本文中の裁決ID(正規表現 `\b[hr]\d\d(?:_\d\d)?(?:_r\d\d)?-\d\d_\d\d\b`)がすべて `SAIKETSU_CASES` に存在し、verified: true。
6. 金額: 本文中の `\d{1,3}(,\d{3})+円` を `scripts/lib/amounts-derive.mjs` の explainAmount で説明できるか。説明できない値は一覧で出す(失敗にはしない。§7で人が見る)。想定される「説明できない」値: 生活保護・手当・特別障害給付金の令和7年度額(29,590/16,100/56,800/37,830/56,850/45,480)、繰上げ計算 643,948、法テラス等の電話番号。これらは RESULT.md に「amounts.ts 外・原稿の出典どおり」と記録。
7. 禁止文字列: `toip_hokkaido`, `youtube`, `note.com`, `x.com/`, `twitter` が本文に無い。
8. 「同じ状況の人が、どうなったか」がある body は case ブロック1件以上 + 末尾に `/jitsurei` link。
9. `next build` 後、生成HTMLで `/gokai/koushin-maitoshi` に `FAQPage` と `Article` の JSON-LD が1本ずつ、`<h1>` が title、`<meta name="description">` が description、`<title>` が `title｜サイト名` であること。
10. `/gokai/techou-ga-nai`(見本)の `curl` で本文の各 h2 が原稿の順に並ぶこと。
11. `git diff --stat` に `app/columns/` が含まれないこと。`moushitatesho-a4-insatsu` の HTML が作業前後で `sha256sum` 一致。
12. `npm run prelaunch:check` が作業前と同じ結果(ページ数不変)。

## 7. 手順とコミット

1. `git status` が clean であること(原稿のコミットが先)。作業前に `next build` して `.next/server/app/columns/moushitatesho-a4-insatsu.html` の sha256 を控える。
2. import スクリプト → data 生成 → コンポーネント → page → sitemap → jitsurei アンカー → verify 追記。
3. `npm run verify:gokai`(scripts/verify-gokai.mjs)、`npm run prelaunch:check`、`next build`。
4. 結果を `docs/verification/gokai-bodies-2026-09-03/RESULT.md` に。§6 の12項目を ○/× で、6の「説明できない金額」の一覧と、原稿の疑問点(あれば)を添える。
5. コミットは2つ: `feat(gokai): 誤解カード48枚に記事本文を追加(生成スクリプト・表示・JSON-LD)` と `test(gokai): 本文の検証を verify-gokai に追加`。push はしない(ユーザーが確認してから)。
