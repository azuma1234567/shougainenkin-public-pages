# Claude Code 作業指示 — 作業3「初診日がわからない」系の検索を取りにいく（2026-09-13）

対象リポジトリ: `shougainenkin-public-pages`

## 前提（Cowork が Search Console を精査した結果）
直近90日、「初診日」を含む検索語の表示は 282回・クリック 0・平均 70位。内訳は「障害年金 初診日 わからない」98、「初診日 不明」52、「わからない 不明」43、「初診日 証明 調べ方」24、「初診日証明」20、「初診日 証明 依頼」20、「初診日 証明」14。
表示のほぼ全部（271/282）は `/columns/shoshinbi-wakaranai` 1本に付いていて、他の3本（karute-nashi / haiin / daisansha-shomei）は競合していない。**記事の統合はしない。** 記事本文（13,000字）も書き直さない。
足りないのは本文ではなく、(a)「証明・依頼」の検索語を受ける title が無いこと、(b) サイト内で一番読まれているページ群からこの記事へのリンクが無いこと、の2つ。作業は下の3つだけ。

---

## 3-1. `jushinjokyo-shomeisho` の title に「初診日」を入れる（lib/columns.ts 426行）
「初診日 証明」「初診日 証明 依頼」「初診日証明」（合計54表示）を受けるページが無い。受診状況等証明書の記事がその答えなのに、title に「初診日」が無い。

現在:
```
metaTitle: "受診状況等証明書の郵送での依頼方法｜遠方の病院からの取り寄せ手順",
```
変更後:
```
metaTitle: "初診日の証明（受診状況等証明書）を病院に依頼する方法｜郵送・遠方・文書料",
```
- 「郵送」は残す（「受診状況等証明書 郵送」で 9位・クリックが付いている語なので落とさない）。
- description は現状のまま。h1・本文は変えない。
- `/columns` 一覧のカード文言が変わるのは前回と同じで、そのままでよい。

## 3-2. 読まれている記事の relatedSlugs に `shoshinbi-wakaranai` を足す
GA 直近5日で表示が多い順に、診断書・申立書の記事が読まれている。どれも「初診日」に触れていないので、初診日の記事への導線が無い。次の4本の `relatedSlugs` に `"shoshinbi-wakaranai"` を **末尾に1つ追加**する（既存の並びは変えない。上限があるなら末尾の1つと入れ替える）。

| ファイル | 現在の relatedSlugs |
|---|---|
| app/columns/nichijo-seikatsu-7koumoku/page.tsx | shinsatsu-mae-memo, shindansho-kakunin, tokyu-hantei-guideline, shindansho-ishi-ni-tsutaeru, shindansho-jittai-chigau |
| app/columns/shindansho-ishi-ni-tsutaeru/page.tsx | shinsatsu-mae-memo, nichijo-seikatsu-7koumoku, shindansho-kakunin, shindansho-jittai-chigau |
| app/columns/moushitatesho-a4-insatsu/page.tsx | moushitatesho-kikan-kugiri, moushitatesho-mijushin-kikan, moushitatesho-kakikata, shindansho-kakunin |
| app/columns/shinsatsu-mae-memo/page.tsx | moushitatesho-kakikata, moushitatesho-a4-insatsu, shindansho-kakunin, shindansho-ishi-ni-tsutaeru |

`verify:columns` に relatedSlugs の件数や重複のチェックがあれば、それに従う。

## 3-3. トップページの「申請の流れ」カードから、初診日の記事へ直接リンクする（app/page.tsx 42〜43行）
現在のカード:
```
title: "障害年金の申請の流れと必要書類",
description: "初診日の確認から提出、結果が届くまでを8ステップで案内します。",
```
このカードの下（または同じカード内の補助リンクとして）、次の1行リンクを足す。既存のカード部品に「補助リンク」の枠が無ければ、カードの description の直後に `<a>` を1つ置く形でよい。デザインは既存のリンク文字の見た目に合わせ、新しいスタイルは作らない。
```
初診日がわからないときの探し方 → /columns/shoshinbi-wakaranai
```
アンカーテキストは「初診日がわからないときの探し方」で固定。

---

## 検証・反映
- `npm run build`、`verify:columns`、prelaunch の該当項目。
- コミット: `content(seo): 初診日の証明記事の title に「初診日」を入れ、読まれている4記事とトップから初診日の記事へ導線を足す`
- push 後、Search Console で `/columns/jushinjokyo-shomeisho` と `/columns/shoshinbi-wakaranai` の URL 検査 → インデックス登録をリクエスト（ユーザーが手動）。

## やらないこと
- 4本の初診日記事の統合・本文の書き直し・URL 変更。
- `/nayami/shoshinbi-karute` ハブの title 変更（9/6 に第2稿にしたばかりで、「証明できない・カルテがない」と記事の「わからない」で役割が分かれている）。
- 新しい記事の追加（作業4で「結果待ち」記事を別に扱う）。
