# 新記事「不支給になった85人が教えること」(/columns/fushikyu-85ken)+ /erabu 5ページの導線 結果報告

指示書: docs/fushikyu-85ken-2026-09-08-instructions.md A・B・C。原稿 `docs/columns-rewrite-2026-09-03/articles/fushikyu-85ken.md` から `scripts/import-columns.mjs` で `content/columns/fushikyu-85ken.ts` を生成(手で書いていない。`--check` ○)。push はしていない。作業日 2026-09-08。

コミット:
1. `feat(erabu): 5ページの関連記事に「社労士に頼んでも変わらないこと」を出す`
2. `content(columns): 不支給になった85人が教えること(49本目)`(この報告を含む)

## 数字・裁決 id の照合(B-1-4・B-1-5)

| 記事の数字 | data の値 | 出所 |
|---|---|---|
| 85 / 32(37.6%) / 32(37.6%) / 11(12.9%) / 10(11.8%) / 75.3 | 85 / 32・37.6 / 32・37.6 / 11・12.9 / 10・11.8 / 75.3 | nintei-chousa-r06 診断書種類別・新規裁定 > 精神障害 > 非該当 件数 / 精神障害・不支給事案 > 目安より下位等級 / 目安が2等級にまたがり下位 / 目安どおりの不支給 / その他 / 上記2区分の合計 |
| 13.0 / 12.1 / 10.8 / 20.6 | 13.0 / 12.1 / 10.8 / 20.6 | 同 新規裁定・抽出1000件 > 合計 > 非該当 pct / 精神障害 / 外部障害 / 内部障害 の 非該当 pct |
| 推移 8.0 / 7.8 / 7.7 / 8.4 / 13.0 | 8.0 / 7.8 / 7.7 / 8.4 / 13.0 | gyoumu-toukei-r02〜r06 新規裁定・合計 > 非該当 pct |
| 推移 令和元年度 12.4 | (repo に無かった)→ **`nintei-chousa-r06.json` に `"非該当率の推移(報告書 別添1)"` として令和元〜6年度の6値を追加**。`sources.json` の `ninteiChousaR06.notes` に転記の1行 | 報告書 別添1 |
| 14,841 / 444 / 3.0 | 14841 / 444 / 3.0 | tenken 不支給事案 > 令和8年3月31日現在 |
| 146,225 / 87%(= 100 − 13.0) | 146225 / 13.0 | gyoumu-toukei-r06 新規裁定・合計 |
| 裁決 91 / 障害の重さ 57 件 / 取り消し 40 件 | 91 / 57 / 40 | `SAIKETSU_CASES`(verified・excluded でない)の全件 / soten に「障害の程度・等級該当性」を含む件数 / うち `ketsuron === "容認"`(一部容認 4 件は含めない) |

すべて一致(原稿の数字は変えていない)。4 つの id `r04_05-11_07` `r06-03_05` `r04_05-11_08` `h30_r01-07_01` は `SAIKETSU_CASES` に含まれる(容認 3・棄却 1)。`verify:stats` に推移の検査を足した(令和元年度 12.4、令和2〜6年度は業務統計の JSON と一致すること)→ failures 0。

## B-2 検証

| # | 内容 | 結果 |
|---|---|---|
| 1 | typecheck / build / verify:columns / verify:stats / prelaunch / site-graph | ○ / ○ / **10 項目 + ★3記事 ○(49本)** / **failures 0** / × は **B-10 だけ**(C-6 は下記の日付修正で ○)/ **10 項目 ○** |
| 2 | `import-columns.mjs --check` / lead 4 行 / FAQ 6 問 / JSON-LD / `<a` | ○ / 4 / 6(JSON-LD の Q と `faqs` 一致、verify:columns #9 ○)/ 0 |
| 3 | 本文の内部リンク全部 200。`/jitsurei?case=` 4本が開いた直後に画面内 | ○ 17 種類すべて 200。4 本とも 1400px / 390px で該当事案がヘッダー直下(4/8・2/8・4/8・6/8 ページ目) |
| 4 | 「あなた」/ 禁止語 / 「道具」/ X・アカウント名 / 「執筆メモ」 | **すべて 0** |
| 5 | B-1-5 の数字 | 一致(上の表) |
| 6 | ColumnThemeBlock、/nayami/fushikyu・/erabu/fushikyu-no-ato の関連記事、A の5ページ | ○ 記事末尾: /nayami/fushikyu, /erabu/fushikyu-no-ato, /nayami/shindansho-komatta。/nayami/fushikyu・/erabu/fushikyu-no-ato の関連記事に新記事あり。**A: 「社労士に頼んでも…」が出るのは /erabu/jibun-ka-irai と /erabu/irai-subeki-case の2ページのまま**(erabikata・hiyou-souba・fushikyu-no-ato は 0。下記) |
| 7 | 表が横スクロールの枠、矢印カード(機能カード2枚)が崩れない | ○ 表は **2 個**(指示書は「3つ」だが原稿の表は2つ)とも `.article-table-wrap`(390px は枠内で横スクロール)。矢印カード 13 枚(機能カード /dougu/mitate・/dougu/shorui)、幅超え 0、横はみ出し 0px。スクリーンショット 2 枚 |
| 8 | sitemap に 2026-09-08 | ○ |

生ログ: docs/verification/fushikyu-85ken-2026-09-08/(check.mjs / checks.txt / verify-columns.txt / prelaunch.txt / site-graph.txt / png)。

## 変えたもの

### コミット1(A)
- `lib/hubs.ts`: `/erabu/erabikata` `/erabu/hiyou-souba` `/erabu/fushikyu-no-ato` の `relatedSlugs` に `"sharoushi-kawaranai-koto"`(配列を新設)。ハブ本文・`COLUMN_HUB_ASSIGNMENTS` の secondary は不変。

### コミット2(B)
- 原稿 → `content/columns/fushikyu-85ken.ts`(生成)、`app/columns/fushikyu-85ken/page.tsx`(`relatedSlugs` = fushikyuu-shinsa-seikyu / shindansho-jittai-chigau / nichijo-seikatsu-7koumoku)と `opengraph-image.tsx`。
- `lib/columns.ts`: `COLUMNS` に追加(title / metaTitle / description / 2026-09-08 / application / 結果を待つ・不支給のとき)。カテゴリの3本に `orderInCategory` 10・20・40(今の表示順のまま)、新記事を 30 にして「fushikyuu-shinsa-seikyu の直前」(審査のしくみ → 申請期間 → **この記事(理由)** → 審査請求(手続き))。
- `lib/hubs.ts`: `COLUMN_HUB_ASSIGNMENTS["fushikyu-85ken"] = assignment("/nayami/fushikyu", "promote", ["/erabu/fushikyu-no-ato", "/nayami/shindansho-komatta"])`。`/nayami/fushikyu` の `relatedSlugs` 先頭と `/erabu/fushikyu-no-ato` の `relatedSlugs` に `"fushikyu-85ken"`。
- `data/stats/nintei-chousa-r06.json`: `"非該当率の推移(報告書 別添1)"`(令和元〜6年度、`{value, unit:"%", pct}`)。`data/stats/sources.json`: `ninteiChousaR06.notes` に転記の1行。`scripts/verify-stats.mjs`: 推移の検査。
- `scripts/import-columns.mjs` `scripts/verify-columns.mjs`: 48 → 49。`docs/verification/columns-rewrite-2026-09-04/baseline.json`: 新 slug と、★3記事の「あわせて読みたい」の入れ替え(a4-insatsu・kikan-kugiri の /columns/sharoushi-kawaranai-koto、teishutsusaki-yuusou の /columns/hikazei-shuunyuu が新記事に押し出された)を `intentionalUpdates["2026-09-08-fushikyu-85ken"]` に記録。
- `lib/sitemap-static-dates.ts`: `/jitsurei` を 2026-09-08 に(今朝の `?case=` の変更で prelaunch C-6 が ×になっていた)。

## 指示書と違う点・気づいたこと

1. **A は指示どおり `relatedSlugs` に足したが、3ページ(erabikata・hiyou-souba・fushikyu-no-ato)の関連記事には出ない。** `HubDefinition.relatedSlugs` は現状どの部品からも読まれておらず(`grep` で使用箇所 0)、ハブの関連記事は `hubColumnSlugs()`(= `COLUMN_HUB_ASSIGNMENTS` の primary/secondary の逆引き)だけで描かれる。出すには `HubLanding` が `hub.relatedSlugs` も読む変更が要るが、その場合 **19 ハブに 33 枚の関連記事が新たに増える**(既存の `relatedSlugs` が生きるため。例: /jukyuugo/sagyousho +4、/jukyuugo/a-gata-heisa +4)。サイト全体に及ぶので、今回は実装せず判断を仰ぐ。代案: secondary の上限(3)を1つ空けて `/erabu/fushikyu-no-ato` だけ足す、または `HubLanding` で「`relatedSlugs` のうち assignments に無いものを末尾に足す」を採用する(33 枚の一覧は必要なら出す)。
2. **原稿の `**`(文中太字)を3か所外した**(文字は不変。verify:columns #2「文中太字0」のため): 「①と②を足すと75.3%。**落ちた人の4人に3人は…**」「…**同じ「働いている」「ひとり暮らし」でも、援助の中身が…動きます。**」「つまりこの型は、**診断書の1項目の書かれ方で、2級と不支給が分かれた人たち**です。」。前の記事と同じ扱い。
3. 表は原稿に 2 つ(指示書 B-2-7 は「3つ」)。
4. 裁決の「取り消し 40 件」は `ketsuron === "容認"` の件数(指示書のとおり)。一部容認 4 件を足すと 44 件になるが、原稿の 40 のまま。
5. `/jitsurei` の sitemap 日付を 2026-09-08 に(C-6)。
