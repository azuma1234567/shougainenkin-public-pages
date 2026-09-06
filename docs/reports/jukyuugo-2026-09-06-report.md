# 幹10「受給が始まってから」入れ直し(2026-09-06)結果報告

指示書: docs/jukyuugo-saitounyuu-2026-09-06-instructions.md(載せ方)/ 内容と検証: `shougainenkin/docs/codex-jukyuugo-2026-09-05-instructions.md` と原稿 `jukyuugo-2026-09-05/*.md`
枝 `jukyuugo-0906`(`main` = `4043de3` から)に 4 コミット(`0275300` `93ecccc` `828ed71` `6253b95`)を cherry-pick し、衝突は復元後のデザインに読み替えた。**`main` には fast-forward で載せた。push はしていない。**

```
git log --oneline -6 main   ← 下の「載せた後」参照
```

## §3 検証

| # | 内容 | 結果 |
|---|---|---|
| A | `git diff --name-only main jukyuugo-0906` が §2 の表のファイルだけ | ○(下記の一覧)。表に無いのは `docs/verification/seo-aio-2026-09-04.md` 1 件だけで、これは同じ checkout で**別セッションが枝に置いたコミット `afa202f`**(docs のみ、幹10と無関係)。取り除かずに載せた |
| B | `app/platform.css` に `--c-` が 0 件 | 0 |
| C | `/byoki` `/joukyou` `/nayami` の一言・件数が復元後と同じ | ○ 本番(復元後の main)と枝のカードの文言を比べて 21 / 9 / 6 枚とも完全一致。`lib/hub-index.tsx` の差分は import・`Kind`・`inlineLinks`・`jukyuugo` の項目と `hint`/`nextSteps` だけで、既存 spec の文は触っていない |
| D | `/jukyuugo` と 5 ページが 1400px / 390px で崩れない | ○ 12 枚を docs/verification/jukyuugo-2026-09-06/ に。年表 9 行、縦線 2px、時点の列 150px(390px では 1 列 328px)、横はみ出し 0px |
| E | 入口 8 か所が 200・`/jukyuugo` への被リンク | ○ トップ(状況ブロック末尾)/ フッター / `/shinsei` ステップ8 / `/joukyou` 索引 / `/gokai/hataraitara-make` / `/nayami/koushin` / `/nayami/shikyuu-teishi` / `/joukyou/hatarakinagara` / `/okane` のすべてにリンクがあり、先は 200。`/jukyuugo` への被リンクはナビ込み 172、本文(ヘッダー・フッター・パンくず以外)だけで 15 ページ |
| F | JSON-LD に `<a` が無い・5 ページの BreadcrumbList | ○ prelaunch C-7 ○。5 ページとも「トップ / 受給が始まってから / ページ名」 |
| G | 「あなた」0・伏せ字 0 | 0 / 0(6 ページの本文。`{{` は描画後 0) |
| H | prelaunch の × が B-3・B-10 だけ | ○(C-6 は日付を 2026-09-06 にそろえて解消。下記) |

### codex-jukyuugo §6(scripts/verify-jukyuugo.mjs、生ログ: docs/verification/jukyuugo-2026-09-06/verify-jukyuugo.txt)

| # | 内容 | 結果 |
|---|---|---|
| 1 | typecheck / build / prelaunch / site-graph | ○ / ○ / × は B-3・B-10 のみ / 10 項目 ○ |
| 2 | 7 URL が 200・sitemap・h1 1 つ | ○ 7/7 |
| 3 | 本文が原稿の文集合と一致 | ○ 8/8(実装に無い文 0) |
| 4 | 数字の照合 | ○ 出ない数字 0・原稿に無い数字 0 |
| 5 | `{{` `[金額]` が残らない | ○ 0 |
| 6 | 描画後の ld+json | ○ 7/7 |
| 7 | リンク切れ 0・`/dougu/kougin` 無し | ○ |
| 8 | 各ページが索引以外から 2 本以上 | ○ hataraku 8・sagyousho 5・nukedasu 7・okane 3・a-gata-heisa 2 |
| 9 | 390px で横スクロールなし | ○ 3/3 |
| 10 | 棚卸し | 対象外(午後のトークン検査 `verify-design-tokens.mjs` は復元で外れている)。代わりに B(`--c-` 0)で、土台の変数だけで書いたことを確認 |
| 11 | schema.org バリデータ | 09-05 に同じ JSON-LD(CollectionPage・ItemList 9・BreadcrumbList / FAQPage・BreadcrumbList)でエラー 0 を確認済み。今回は構造を変えていない |

## 衝突を解いた箇所と読み替え

### 変数の対応表(復元コミット `01d88ef` と同じ)

| 午後(`--c-*`) | 土台 | 使った所 |
|---|---|---|
| `--c-heading` | `--platform-heading` | `.hub-index-hint` `.hub-index-h2` `.p-timeline-when` |
| `--c-text` | `--platform-text` | `.hub-index-note-p` `.p-timeline-what` |
| `--c-primary` | `--platform-primary` | 年表の点・リンク |
| `--c-border` | `--platform-border` | 年表の縦線 |
| `--c-primary-deep`(#015d8c) | `--platform-link-hover`(同じ値) | `.p-find-tail a` |
| `--fs-small` | `14.5px` | 各所 |
| `--fs-meta` | `13px` | `.p-timeline-link` |
| `--fs-h2` | `27px`(700px 以下 `23px`。土台の `.p-section h2` と同じ) | `.hub-index-h2` |
| `--font-heading` / `--lh-heading` | `var(--font-platform-heading), "Hiragino Kaku Gothic ProN", sans-serif` / `1.45`(土台の見出しと同じ) | `.hub-index-h2` |
| `--r-pill` | `999px` | 年表の点 |

### コミットごと

| コミット | ファイル | したこと |
|---|---|---|
| 0275300 | `app/platform.css` | 衝突の「向こう側」に 5f1d9c1 由来の `.column-gokai-link` が含まれていたので入れず、幹10 のブロック(`.hub-index-hint/-h2/-note-p/-sources`・`.p-timeline*`)だけを上の表で読み替えて入れた |
| 0275300 | `lib/hub-index.tsx` | 土台のチップ(`<b>件数</b>`)と検索なしの並びをそのまま残し、`spec.hint` の 1 行と `HUBS` の import だけ足した。午後の `hub-index-controls` / `HubIndexSearch` は入れない |
| 0275300 | `lib/sitemap-static-dates.ts` | `/erabu` は土台の 09-02 のまま。`/jukyuugo` は 2026-09-06 |
| 93ecccc | — | 衝突なし |
| 828ed71 | `app/platform.css` | 衝突の「向こう側」が午後の大きなブロック(1部品1実装・/hajimete・/jitsurei・/shinsei の固定目次 など)だったので入れず、828ed71 の 4 行(`.p-find-tail`)だけ読み替えて末尾に足した。`.p-stats-note`(f38114e 由来)は入れない |
| 828ed71 | `lib/hub-index.tsx` | 土台側を残し、`{spec.hint}` → `{inlineLinks(spec.hint)}` だけ当てた(/joukyou の「受給中の人はこちら →」をリンクにするため) |
| 828ed71 | `data/hubs/nayami-shikyuu-teishi.json` | インデント違いの衝突。828ed71 の版を採用。本文の差はリンク行 1 行の追加だけ(消えた行 0)で確認 |
| 828ed71 | `lib/sitemap-static-dates.ts` | `/gokai` を 2026-09-06 |
| 828ed71 | `app/page.tsx` `components/SiteFooter.tsx` `components/platform/ShinseiRestyled.tsx` `app/gokai/[slug]/page.tsx` | 自動で当たった(状況ブロック末尾の 1 行・フッター末尾・ステップ8 の links 先頭・FAQ 無しのカードで FAQPage を出さない) |
| 6253b95 | — | 衝突なし(原稿の数字 96.7% / 1.1% / 「令和6年度決定分」、2 本目のリンク変換、`**…**` の太字) |

### 入れなかった行

- `.column-gokai-link`(5f1d9c1)、`.p-stats-note`(f38114e)、午後の 1 部品 1 実装ブロック、`hub-index-controls` / `HubIndexSearch`(午後の /byoki の板)。いずれも復元で外したもの。
- 原稿と違う文は生じていない(§6-3 で原稿 ⊆ 実装、消えた文 0)。

### 追加で直したもの(枝の中の 2 コミット)

- `5f8060d` 日付: cherry-pick が今日の日付になるため prelaunch C-6 が `/` と data/hubs 9 本(幹10 の 5 本・65歳・働きながら・更新・支給停止)を指摘した。§2 のとおり 2026-09-06 にそろえた。あわせて `scripts/verify-jukyuugo.mjs` を、復元後のハブが FAQ を `<details>` で畳むため答えの文が innerText に入らず検査 3 が誤って × になっていたのを、開いてから読むように直した(文の有無を見る検査なので畳まれているかは問わない)。
- `a889b76` `scripts/verify-site-graph.mjs` の検査 4 の期待値(フッター「申請の進め方」)に `/jukyuugo` を足した(codex-jukyuugo §3 の入口)。

## 載せた後

```
git log --oneline -6 main
9f3b64a docs(verify): 幹10 入れ直しの検証記録(2026-09-06)
a889b76 test(structure): フッター「申請の進め方」の期待値に /jukyuugo を足す
5f8060d chore(jukyuugo): 入れ直しで触ったページの日付を 2026-09-06 に、検証は畳んだ FAQ も読む
afa202f docs: Phase D 2026-09-06 の結果を追記(2件送信、拡張の接続断で中断)   ← 別セッションの docs コミット
490b9f2 fix(jukyuugo): 原稿の数字に戻し、2本目のリンクを描くようにする(§6 の検証)
294a876 feat(jukyuugo): 幹10 への入口を8か所に足す(§3)
```
(この報告のコミットがこの上に 1 つ乗る)

### §3-A の差分一覧(docs 除く)

app/gokai/[slug]/page.tsx, app/jukyuugo/[slug]/page.tsx, app/jukyuugo/page.tsx, app/page.tsx, app/platform.css, app/sitemap.ts, components/SiteFooter.tsx, components/platform/ShinseiRestyled.tsx, data/gokai-bodies.ts, data/gokai.ts, data/hubs/joukyou-65sai-ijou.json, data/hubs/joukyou-hatarakinagara.json, data/hubs/jukyuugo-{hataraku,sagyousho,nukedasu,okane,a-gata-heisa}.json, data/hubs/nayami-koushin.json, data/hubs/nayami-shikyuu-teishi.json, lib/hub-content.ts, lib/hub-index.tsx, lib/hubs.ts, lib/sitemap-static-dates.ts, scripts/verify-jukyuugo.mjs, scripts/verify-site-graph.mjs

## そのほか

- 索引の「最終確認日 2026年9月5日」は原稿の確認日(`latestHubCheckedDate`)で、sitemap の lastModified(09-06)とは別のもの。原稿どおり。
- 未追跡のまま残しているもの: `docs/jukyuugo-saitounyuu-2026-09-06-instructions.md` `docs/naibu-link-2026-09-06-instructions.md`(指示書。コードではないので触っていない)。
