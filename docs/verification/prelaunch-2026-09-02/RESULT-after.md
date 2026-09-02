# 公開前チェック 再実行結果 (2026-09-02, §1〜§8 + 追加対応3点の適用後 / HEAD 26ecc06)

origin: http://localhost:3107 / ページ数: 157 / 基準: git main

## A

| # | 判定 | 項目 | 件数 |
|---|---|---|---|
| A-1 | ○ | 既存記事のURLが1本も変わっていない | 47/47 が同一URLで200 |
| A-2 | ○ | 既存記事の本文が消えていない(公開前の8割未満・本文なしを×) | 本文が消えた/8割未満 0、方針上の削除で減ったもの 26(いずれも8割以上を維持)、46 記事を比較<br>※main ブランチの本文文字列と比較。減少分は docs/verification/prelaunch-2026-09-02/RESULT.md 末尾に一覧 |
| A-3 | ○ | 404が出るリンクがゼロ | リンク先 157 件を検査、破損 0 |
| A-4 | ○ | 未公開ページへのリンクがゼロ | 予約slug 4 件へのリンク 0 |
| A-5 | ○ | noindex が残っていない | noindex 0 / 157 |
| A-6 | ○ | canonical が自分自身を指している | 自己参照 157 / 157 |
| A-7 | ○ | robots.txt が全ページを許可している | Disallow 0 件、公開対象の該当 0<br>※User-Agent: * / Allow: / /  / Host: https://shougainenkin-note.net / Sitemap: https://shougainenkin-note.net/sitemap.xml |
| A-8 | ○ | 金額が全ページで一致している(data/amounts.ts から導出できる) | 10万円以上の金額 23 種のうち説明済み 23、未説明 0(参考: 直書きのあるファイル 23)<br>※説明済みの式は末尾の付記に全件 |
| A-9 | ○ | 「執筆メモ」「x.com」「@」が出力に含まれていない | 執筆メモ/x.com 0、@ 0(連絡先メールの @ 5 件は除外) |
| A-10 | ○ | 調査元(X/YouTube/note等)への言及がゼロ | ドメイン名・アカウント名・X固有語 0 |

## B

| # | 判定 | 項目 | 件数 |
|---|---|---|---|
| B-1 | ○ | 孤立ページがゼロ(本文からの内部リンクが最低1本) | 孤立 0 / 157(除外 5)<br>※ヘッダー・フッターのリンクは数えない。法務・案内ページ(about/privacy/terms/quality/support)はフッターのみで可 |
| B-2 | ○ | 被内部リンクが50本を超えるページがゼロ | 50本超 0<br>※パンくずと誤解カードの「一覧へ戻る」由来のリンクは数えない |
| B-3 | ○ | 500字未満のページの一覧 | 500字未満 0(うち誤解カード 0)。実例の個別ページ 0 件<br>※実例94件の個別ページはサイトマップに無い(未実装) |
| B-4 | ○ | h1が1ページに1つだけ | 複数/なし 0 |
| B-5 | ○ | titleとmeta descriptionが全ページにある | 空 0、description重複 0組 |
| B-6 | ○ | titleの重複がない | 重複 0組 |
| B-7 | ○ | OGP画像が全ページにある | og:image なし 0。誤解カードの自動生成画像 48/48 |
| B-8 | ○ | 構造化データが妥当 | 型別件数 WebSite:1 BreadcrumbList:156 undefined:48 HowTo:2 FAQPage:47 DefinedTermSet:1 Article:47 ItemList:1、エラー 0<br>※スキーマ必須項目の静的検査。Google のリッチリザルトテストは公開URLで別途実施 |
| B-9 | ○ | パンくずが全ページにある(BreadcrumbList を含む・二重なし) | 表示なし 0、BreadcrumbList(構造化データ)なし 0、2つ以上 0<br>※表示のパンくずはあるが構造化データが無いページと、二重に出ているページを別に数える |
| B-10 | ○ | 更新日が全ページに表示されている | 更新日/確認日の表示なし 0 |

## C

| # | 判定 | 項目 | 件数 |
|---|---|---|---|
| C-1 | ○ | sitemap.xml: 全公開ページが入り、未公開ページが入っていない | 収録 157、リンクはあるが未収録 0、予約slugの混入 0、200以外 0 |
| C-2 | 手動 | sitemapの分割 | 対象外(157ページ・単一 sitemap.xml で十分。50,000 URL 超で再検討)<br>※Google の分割要件は 50,000 URL または 50MB。2026-09-02 に対象外とした |
| C-3 | 手動 | Search Console にサイトマップを送信 | 手動作業(スクリプト対象外)<br>※sitemap.xml を送る |
| C-4 | 手動 | 主要10ページの URL検査(インデックス登録リクエスト) | 10ページとも200: ○(送信自体は手動) |
| C-5 | ○ | 旧URLからのリダイレクトが必要な変更がない | 公開前URL 59 件のうち200以外 0<br>※main ブランチの sitemap 静的ページ + 記事URL |

## D(人が見る): 確認用の一覧

全ページの URL・タイトル・文字数は `docs/verification/prelaunch-2026-09-02/pages.tsv` に出力。

| URL | タイトル | 文字数 |
|---|---|---|
| /columns/moushitatesho-a4-insatsu | 障害年金の申立書をA4で印刷する方法｜PDF・コンビニ印刷も解説｜障害年金申請サポート | 10529 |
| /columns/moushitatesho-kikan-kugiri | 障害年金の申立書は期間をどう区切る？通院・就労・症状変化の書き方｜障害年金申請サポート | 10409 |
| /columns/teishutsusaki-yuusou | 障害年金の書類はどこに提出する?｜年金事務所・市役所・郵送｜障害年金申請サポート | 8530 |

## A-8 付記: 金額の検算(data/amounts.ts からの導出)

- 説明済み: 111,242円 = (basicGrade2(847,300) + childFirstSecond(243,800) + childFirstSecond(243,800)) ÷ 12 ≒ 111,242
- 説明済み: 135,669円 = (basicGrade1(1,059,125) + childFirstSecond(243,800) + childFirstSecond(243,800) + childThird(81,300)) ÷ 12 ≒ 135,669
- 説明済み: 141,200円 = (basicGrade2(847,300)) ÷ 12 × 2 ≒ 141,200
- 説明済み: 243,800円 = childFirstSecond(243,800)
- 説明済み: 487,600円 = childFirstSecond(243,800) + childFirstSecond(243,800)
- 説明済み: 633,700円 = employeesGrade3MinimumOld(633,700)
- 説明済み: 635,500円 = employeesGrade3Minimum(635,500)
- 説明済み: 831,700円 = 前年度額(本文に明示)
- 説明済み: 844,900円 = basicGrade2Old(844,900)
- 説明済み: 847,300円 = basicGrade2(847,300)
- 説明済み: 914,740円 = basicGrade2(847,300) + supportGrade2Monthly×12(67,440)
- 説明済み: 1,056,125円 = basicGrade1Old(1,056,125)
- 説明済み: 1,059,125円 = basicGrade1(1,059,125)
- 説明済み: 1,091,100円 = basicGrade2(847,300) + childFirstSecond(243,800)
- 説明済み: 1,271,000円 = disabilityAllowanceMinimum(1,271,000)
- 説明済み: 1,334,900円 = basicGrade2(847,300) + childFirstSecond(243,800) + childFirstSecond(243,800)
- 説明済み: 1,546,725円 = basicGrade1(1,059,125) + childFirstSecond(243,800) + childFirstSecond(243,800)
- 説明済み: 1,628,025円 = basicGrade1(1,059,125) + childFirstSecond(243,800) + childFirstSecond(243,800) + childThird(81,300)
- 説明済み: 3,761,000円 = incomeHalfBeforeOctober(3,761,000)
- 説明済み: 3,761,001円 = incomeHalfBeforeOctober(3,761,000) + 1(「超」の整数表現)
- 説明済み: 3,858,000円 = incomeHalfFromOctober(3,858,000)
- 説明済み: 4,794,000円 = incomeFullBeforeOctober(4,794,000)
- 説明済み: 4,918,000円 = incomeFullFromOctober(4,918,000)

参考: amounts.ts の値を直書きしているファイル 23 件(判定には使わない): components/ApplicationFlowPage.tsx (14), components/platform/ShinseiRestyled.tsx (4), content/columns/hikazei-shuunyuu.ts (2), content/columns/ikura-moraeru.ts (65), content/columns/jukyuugo-tetsuduki.ts (13), content/columns/kiso-kousei-chigai.ts (9), content/columns/ninteibi-jigojusho.ts (7), content/columns/shikyuu-teishi-fukkatsu.ts (4), content/columns/shoubyou-teatekin.ts (4), content/columns/sokyuu-seikyuu.ts (1), content/columns/techou-to-nenkin.ts (5), lib/columns.ts (4), lib/hub-index.tsx (6), data/gokai.ts (20), data/hubs/byoki-chiteki.json (2), data/hubs/byoki-jinzou-touseki.json (1), data/hubs/byoki-shinzou.json (3), data/hubs/byoki-shitai.json (2), data/hubs/byoki-tounyou.json (1), data/hubs/byoki-utsu-soukyoku.json (2), data/hubs/joukyou-hatachi-mae.json (4), data/hubs/joukyou-hitorigurashi.json (1), data/hubs/okane-ikura.json (14)

## 参考: 公開前より本文が減った既存記事(8割以上は維持)

- /columns/shoshinbi-wakaranai (10825 → 10791字, 100%)
- /columns/shindansho-jittai-chigau (9036 → 9024字, 100%)
- /columns/shindansho-kaitekurenai (9266 → 9120字, 98%)
- /columns/hatarakinagara (11499 → 11107字, 97%)
- /columns/hitorigurashi-furi (9266 → 9209字, 99%)
- /columns/fushikyuu-shinsa-seikyu (9215 → 9192字, 100%)
- /columns/taishou-shoubyou-kyoukai (9351 → 9240字, 99%)
- /columns/shinsei-shindoi (10350 → 10344字, 100%)
- /columns/shindansho-tanomikata (9200 → 9178字, 100%)
- /columns/shindansho-ishi-ni-tsutaeru (9237 → 9202字, 100%)
- /columns/tekio-shogai-shogai-nenkin (10528 → 10465字, 99%)
- /columns/moushitatesho-mijushin-kikan (9459 → 9403字, 99%)
- /columns/nenkin-jimusho-soudan (13023 → 12540字, 96%)
- /columns/shindansho-irai-timing (9291 → 9260字, 100%)
- /columns/moushitatesho-kikan-kugiri (11442 → 11396字, 100%)
- /columns/sokyuu-seikyuu (8825 → 8766字, 99%)
- /columns/shougaisha-koyou-nenkin (8984 → 8830字, 98%)
- /columns/nichijo-seikatsu-7koumoku (12361 → 12283字, 99%)
- /columns/tokyu-hantei-guideline (9195 → 9071字, 99%)
- /columns/koushin-kakuninhodo (9106 → 9066字, 100%)
- /columns/hatachi-mae (5191 → 5006字, 96%)
- /columns/shoshinbi-karute-nashi (9395 → 9376字, 100%)
- /columns/shoshinbi-haiin (9412 → 9399字, 100%)
- /columns/moushitatesho-kakikata (8659 → 7471字, 86%)
- /columns/moushitatesho-a4-insatsu (11943 → 11568字, 97%)
- /columns/shinsatsu-mae-memo (8461 → 7828字, 93%)

## 期待値との照合(追加対応後)

| 項目 | 期待 | 結果 |
|---|---|---|
| A-1〜A-10 | すべて○ | ○(A-3 は `/dougu` を非公開にして解消。A-8 は説明済み23・未説明0) |
| B-1 / B-2 / B-9 / B-10 | ○ | ○(孤立0・除外5 / 50本超0 / なし0・二重0 / 表示なし0) |
| B-3 | 「実例の個別ページ未実装」の注記のみ | ○ 500字未満0。注記のみ |
| B-4〜B-8 | ○ | ○ |
| C-1 | ○ | ○(収録157、未収録0) |
| C-2 | 対象外 | 対象外 |
| C-4 / C-5 | 手動 / ○ | 手動 / ○ |

期待と違う項目はなし。

## 追加対応の記録(2026-09-02)

1. `/dougu` は道具が1本実装されるまで非公開: `app/sitemap.ts` から外し、`metadata.robots = { index: false, follow: false }`、`lib/published-links.ts` の `UNPUBLISHED_PATHS` で本文からのリンクを止める。ページ自体は残し、先頭コメントに戻し方を記載。コミット済みの内部リンクは sitemap の1件のみだった(ヘッダー・フッター・トップ・ハブJSONには無し)。
2. 500字未満だった3ページに指定の段落をそのまま追加: `/nayami`(不支給の審査請求の期限)、`/okane`(初回振込までの目安)、`/about`(金額と統計の見直し方針)。3ページとも500字以上になった。
3. 前回の差分だった `/dougu` 由来の4件(A-3・B-1・B-10・C-1)は 1. で解消。

注意: 作業ツリーには別エージェントの未コミット変更(`components/ColumnArticle.tsx` に `/dougu/moushitatesho` へのリンク、`app/dougu/moushitatesho/`・`components/tools/` の新規ファイル)がある。これらがコミットされると `/dougu/moushitatesho` が実在するページになるので、そのときに `/dougu` の非公開を戻す判断をする。
