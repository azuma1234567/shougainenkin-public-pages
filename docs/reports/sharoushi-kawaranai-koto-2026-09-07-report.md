# 新記事「社労士に頼んでも変わらないこと、頼むと変わること」(/columns/sharoushi-kawaranai-koto)結果報告

指示書: docs/sharoushi-kawaranai-koto-2026-09-07-instructions.md §1〜§3。原稿 `docs/columns-rewrite-2026-09-03/articles/sharoushi-kawaranai-koto.md` から `scripts/import-columns.mjs` で `content/columns/sharoushi-kawaranai-koto.ts` を生成(手で書いていない。`--check` で再現性 ○)。push はしていない。作業日 2026-09-08。

コミット: `content(columns): 社労士に頼んでも変わらないこと、頼むと変わること(48本目)`

## 数字・裁決 id の照合(§1-5・§1-6)

| 記事の数字 | data の値 | 出所 |
|---|---|---|
| 70.3% | 70.3 | nintei-chousa-r06 診断書種類別・新規裁定 > 精神障害 > 件数 pct |
| 13.0% / 12.1% / 20.6% | 13.0 / 12.1 / 20.6 | 同 新規裁定 合計 非該当 pct(業務統計の新規裁定 非該当 pct も 13.0)/ 精神障害 非該当 / 内部障害 非該当 |
| 75.3% | 75.3 | 同 精神障害・不支給事案 > 上記2区分の合計 > 割合 |
| 96.7% / 304,456 / 1.1% | 96.7 / 304456 / 1.1 | gyoumu-toukei-r06 再認定・合計 継続 pct / 計 / 支給停止 pct |
| 14,841 / 444 / 3.0% | 14841 / 444 / 3.0 | tenken 不支給事案 > 令和8年3月31日現在 > 点検済 / 支給へ変更 |
| 146,225(FAQ の「約87%」= 100−13.0) | 146225 | gyoumu-toukei-r06 新規裁定・合計 計 |
| 裁決91件: 57 / 35 / 15 / 10 | 91: 57 / 35 / 15 / 10 | `SAIKETSU_CASES` の soten「障害の程度・等級該当性」「初診日」「診断書の信頼性・整合性」「納付要件」(`/jitsurei` の表示と同じ計算) |

すべて一致。原稿の数字は変えていない。4つの id(`r04_05-06_04` `r06-07_01` `r07-07_02` `r06-03_05`)は `SAIKETSU_CASES`(verified・excluded でない)に含まれる(容認 4 件)。

## §2 検証

| # | 内容 | 結果 |
|---|---|---|
| 1 | typecheck / build / verify:columns / prelaunch / site-graph | ○ / ○ / **10 項目 + ★3記事 すべて ○(48本)** / × は **B-10 だけ** / **10 項目 ○**(検査2の未達は変更前と同じ2件) |
| 2 | `import-columns.mjs --check` / lead 4行 / FAQ 6問 / FAQPage と画面 / `<a` | ○ / 4 / 6 / verify:columns #9 ○(JSON-LD の Q と `faqs` 一致)/ `<a` 0 |
| 3 | 本文の内部リンク 20 種類が 200、`/jitsurei#id` 4本のアンカー先 | ○ 200 でないもの 0。id は `/jitsurei` に存在(**ただしページ分割の 1〜3 ページ目に分かれる**。下記) |
| 4 | 「あなた」/ 禁止語 / 「道具」/ X・アカウント名 / 「執筆メモ」 | **すべて 0**(本文 `.column-body` と `<main>` 全体) |
| 5 | 数字が data と一致 | 一致(上の表) |
| 6 | `ColumnThemeBlock` に /erabu/jibun-ka-irai + secondary 2本。4ハブの関連記事 | ○ 記事末尾: /erabu/jibun-ka-irai, /erabu/irai-subeki-case, /nayami/shindansho-komatta。関連記事に出るのは **/erabu/jibun-ka-irai と /erabu/irai-subeki-case の2ハブ**(/erabu/erabikata と /erabu/hiyou-souba には出ない。下記) |
| 7 | 1400px / 390px で表2つが横スクロールの枠、矢印カードが崩れない | ○ 表 2 個とも `.article-table-wrap`(overflow auto。390px では枠内で横スクロール)。矢印カード 16 枚(機能カード /dougu/mitate・/dougu/moushitatesho を含む)、幅超え 0、横はみ出し 0px。docs/verification/sharoushi-kawaranai-koto-2026-09-07/ に 2 枚 |
| 8 | sitemap に 2026-09-07 | ○ `<lastmod>2026-09-07</lastmod>`(`article:modified_time` も 2026-09-07) |

生ログ: 同フォルダの check.mjs / checks.txt / verify-columns.txt / prelaunch.txt / site-graph.txt。

## 変えたもの

- `docs/columns-rewrite-2026-09-03/articles/sharoushi-kawaranai-koto.md`(原稿。下記の `**` 2か所を除きそのまま)→ `content/columns/sharoushi-kawaranai-koto.ts`(生成)。
- `app/columns/sharoushi-kawaranai-koto/page.tsx`(他の記事と同じ形。`relatedSlugs` = jibun-de-shinsei / shindansho-ishi-ni-tsutaeru / fushikyuu-shinsa-seikyu)と `opengraph-image.tsx`(他の記事と同じ自動生成。無いと prelaunch B-7 が ×)。
- `lib/columns.ts`: `COLUMNS` に追加(title / metaTitle / description / 2026-09-07 / application / 相談・進め方)。**相談・進め方の3本に `orderInCategory` 10・20・30(いまの表示順のまま)を付け、新記事を 40** にして「jibun-de-shinsei の直後」にした(未指定だと新しい順で先頭に出てしまうため)。**全記事の `dateModified` を "2026-09-03" に固定していた上書きを、「2026-09-03 より新しい記事は自分の日付」に**(新記事の sitemap・modified_time を 2026-09-07 にするため。既存47本は 2026-09-03 のまま)。
- `lib/hubs.ts`: `COLUMN_HUB_ASSIGNMENTS["sharoushi-kawaranai-koto"] = assignment("/erabu/jibun-ka-irai", "promote", ["/erabu/irai-subeki-case", "/nayami/shindansho-komatta"])`。`/erabu/jibun-ka-irai` と `/erabu/irai-subeki-case` の `relatedSlugs` に追加。
- `lib/published-links.ts`: `ALWAYS_PUBLISHED_PREFIXES` に `/jitsurei#`(記事本文からの裁決アンカー。無いと verify:columns #5 が「非公開判定」で ×)。
- `app/columns/jibun-de-shinsei/page.tsx`: `relatedSlugs` の先頭に新記事(本文は触っていない)。
- `scripts/import-columns.mjs` `scripts/verify-columns.mjs`: 47 → 48。verify:columns #2 は「箇条書き・番号つきの項目の頭の太字(`1. **記録を始める。** …`)」を段落頭と同じ扱いに。
- `docs/verification/columns-rewrite-2026-09-04/baseline.json`: 新 slug の title / metaTitle / h1 / htmlTitle / canonical を追加(48本目)。★3記事の `special.links` で、「あわせて読みたい」(同じクラスタの自動補充)に新記事が入って押し出された /columns/hikazei-shuunyuu(a4-insatsu・kikan-kugiri)と /columns/jukyuugo-tetsuduki(teishutsusaki-yuusou)を新記事に置き換え、`intentionalUpdates["2026-09-08"]` に記録。

## 指示書と違う点・気づいたこと

1. **原稿は、最初に読んだあとで書き直されていた**(本文 約6,700字 → 7,035字。表の列、リード、FAQ の文など 174 行の差)。生成・検証は最新の原稿で行った。数字・id・リンクは書き直し後も同じ。
2. **原稿の `**`(太字)を2か所外した**(文は1字も変えていない)。verify:columns #2「本文の文中太字0(段落頭・表・Q・裁決リードのみ)」に当たるため: 「社労士は診察室にいません。**頼んでも、診断書の中身を変える力は社労士にはありません。** この記事で…」と「つまり、**落ちた理由は書類の不備ではなく、診断書に書かれた姿**です。」。戻すなら原稿の `**` を戻して #2 の規則を決め直す。
3. **`/jitsurei#id` のアンカーは、ページ分割のため 1 ページ目に無い id がある**: r07-07_02 は 1 ページ目、r06-07_01 と r06-03_05 は 2 ページ目、r04_05-06_04 は 3 ページ目(`/jitsurei` は 12 件ずつ)。`/jitsurei#r04_05-06_04` を開いても 1 ページ目にその事案は無く、スクロールしない。直すなら `/jitsurei?page=3#id` にする(原稿のリンクを変える)か、`/jitsurei` 側で id 指定のとき該当ページへ回す。今回は原稿のとおりにしている。
4. **4ハブのうち /erabu/erabikata と /erabu/hiyou-souba の関連記事には出ない**。ハブの関連記事は `COLUMN_HUB_ASSIGNMENTS` の primary/secondary から逆引きしていて(`hubColumnSlugs`)、指示書 §1-3 の secondary は irai-subeki-case と shindansho-komatta の2本。erabikata・hiyou-souba にも出すなら secondary に足す(上限3なので1本だけ)か、`relatedSlugs` を関連記事に使う仕組みが要る。
5. `lib/columns.ts` の `dateModified` の固定上書き(2026-09-03)は、新記事も 09-03 にしてしまう作りだったので、上のとおり「新しい記事は自分の日付」に直した。既存47本の日付は変わらない。
6. `ColumnFooter` の「あわせて読みたい」に新記事が自動で入ったことで、★3記事の末尾のリンク1本が入れ替わった(上記 baseline の更新)。本文は変わっていない。
