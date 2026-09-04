# 公開前チェック 実行結果 (2026-09-04)

origin: http://localhost:3195 / ページ数: 166 / 基準: git main

## A

| # | 判定 | 項目 | 件数 |
|---|---|---|---|
| A-1 | ○ | 既存記事のURLが1本も変わっていない | 47/47 が同一URLで200 |
| A-2 | ○ | 既存記事の本文が消えていない(公開前の8割未満・本文なしを×) | 本文が消えた/8割未満 0、方針上の削除で減ったもの 0(いずれも8割以上を維持)、46 記事を比較<br>※main ブランチの本文文字列と比較。減少分は docs/verification/prelaunch-2026-09-02/RESULT.md 末尾に一覧 |
| A-3 | ○ | 404が出るリンクがゼロ | リンク先 167 件を検査、破損 0 |
| A-4 | ○ | 未公開ページへのリンクがゼロ | 予約slug 4 件へのリンク 0 |
| A-5 | ○ | noindex が残っていない | noindex 0 / 166 |
| A-6 | ○ | canonical が自分自身を指している | 自己参照 166 / 166 |
| A-7 | ○ | robots.txt が全ページを許可している | Disallow 0 件、公開対象の該当 0<br>※User-Agent: * / Allow: / /  / Host: https://shougainenkin-note.net / Sitemap: https://shougainenkin-note.net/sitemap.xml |
| A-8 | ○ | 金額が全ページで一致している(data/amounts.ts から導出できる) | 10万円以上の金額 26 種のうち説明済み 26、未説明 0(参考: 直書きのあるファイル 24)<br>※説明済みの式は末尾の付記に全件 |
| A-9 | ○ | 「執筆メモ」「x.com」「@」が出力に含まれていない | 執筆メモ/x.com 0、@ 0(連絡先メールの @ 9 件は除外) |
| A-10 | ○ | 調査元(X/YouTube/note等)への言及がゼロ | ドメイン名・アカウント名・X固有語 0 |

## B

| # | 判定 | 項目 | 件数 |
|---|---|---|---|
| B-1 | × | 孤立ページがゼロ(本文からの内部リンクが最低1本) | 孤立 1 / 166(除外 5)<br>※ヘッダー・フッターのリンクは数えない。法務・案内ページ(about/privacy/terms/quality/support)はフッターのみで可 |
| B-2 | ○ | 宣言済みハブ以外で被内部リンクが50本を超えるページがゼロ | 50本超 0<br>※パンくずと誤解カードの「一覧へ戻る」由来のリンクは数えない。宣言済みハブは上限の対象外（件数・理由は付記） |
| B-3 | × | 500字未満のページの一覧 | 500字未満 2(うち誤解カード 0)。実例の個別ページ 0 件<br>※実例94件の個別ページはサイトマップに無い(未実装) |
| B-4 | ○ | h1が1ページに1つだけ | 複数/なし 0 |
| B-5 | ○ | titleとmeta descriptionが全ページにある | 空 0、description重複 0組 |
| B-6 | ○ | titleの重複がない | 重複 0組 |
| B-7 | ○ | OGP画像が全ページにある | og:image なし 0。誤解カードの自動生成画像 48/48 |
| B-8 | ○ | 構造化データが妥当 | 型別件数 WebSite:1 BreadcrumbList:165 undefined:97 HowTo:2 FAQPage:95 Person:1 Organization:1 MobileApplication:1 DefinedTermSet:1 Article:95 ItemList:1、エラー 0<br>※スキーマ必須項目の静的検査。Google のリッチリザルトテストは公開URLで別途実施 |
| B-9 | ○ | パンくずが全ページにある(BreadcrumbList を含む・二重なし) | 表示なし 0、BreadcrumbList(構造化データ)なし 0、2つ以上 0<br>※表示のパンくずはあるが構造化データが無いページと、二重に出ているページを別に数える |
| B-10 | × | 更新日が全ページに表示されている | 更新日/確認日の表示なし 3 |

### B-1 の該当一覧(1件)

- /app

### B-3 の該当一覧(2件)

- /dougu/moushitatesho (220字)
- /dougu/mitate (323字)

### B-10 の該当一覧(3件)

- /app
- /app/privacy
- /app/terms

## C

| # | 判定 | 項目 | 件数 |
|---|---|---|---|
| C-1 | ○ | sitemap.xml: 全公開ページが入り、未公開ページが入っていない | 収録 166、リンクはあるが未収録 0、予約slugの混入 0、200以外 0、意図的な除外 1(noindexでない 0)<br>※意図的な除外は lib/sitemap-excluded.ts の明示リスト。リストに無いのに未収録なら×。リストにあるのに noindex でなくても×。<br>/tokushoho — 有料掲載を受け付けるまで未確定の項目が残るため noindex。app/tokushoho/page.tsx の DRAFT を false にするとき、ここと app/sitemap.ts から外す(有料掲載の受付を始めるとき) |
| C-2 | 手動 | sitemapの分割 | 対象外(166ページ・単一 sitemap.xml で十分。50,000 URL 超で再検討)<br>※Google の分割要件は 50,000 URL または 50MB。2026-09-02 に対象外とした |
| C-3 | 手動 | Search Console にサイトマップを送信 | 手動作業(スクリプト対象外)<br>※sitemap.xml を送る |
| C-4 | 手動 | 主要10ページの URL検査(インデックス登録リクエスト) | 10ページとも200: ○(送信自体は手動) |
| C-5 | ○ | 旧URLの維持または301リダイレクト | 公開前URL 76 件のうち /dougu → /shinsei 301: ○、その他200以外 0<br>※main ブランチの sitemap 静的ページ + 記事URL |

## B-2 付記: 宣言済みハブの被内部リンク

- /jitsurei (57本・宣言済み: 裁決事例集。裁決を引用した記事・誤解カードが文末で戻す導線)

## D(人が見る): 確認用の一覧

全ページの URL・タイトル・文字数は `docs/verification/prelaunch-2026-09-02/pages.tsv` に出力。

| URL | タイトル | 文字数 |
|---|---|---|
| /columns/moushitatesho-a4-insatsu | 障害年金の申立書をA4で印刷する方法｜PDF・コンビニ印刷も解説｜障害年金申請サポート | 10594 |
| /columns/moushitatesho-kikan-kugiri | 障害年金の申立書は期間をどう区切る？通院・就労・症状変化の書き方｜障害年金申請サポート | 10479 |
| /columns/teishutsusaki-yuusou | 障害年金の書類はどこに提出する?｜年金事務所・市役所・郵送｜障害年金申請サポート | 8604 |

## A-8 付記: 金額の検算(data/amounts.ts からの導出)

- 説明済み: 111,242円 = (basicGrade2(847,300) + childFirstSecond(243,800) + childFirstSecond(243,800)) ÷ 12 ≒ 111,242
- 説明済み: 135,669円 = (basicGrade1(1,059,125) + childFirstSecond(243,800) + childFirstSecond(243,800) + childThird(81,300)) ÷ 12 ≒ 135,669
- 説明済み: 141,200円 = (basicGrade2(847,300)) ÷ 12 × 2 ≒ 141,200
- 説明済み: 141,217円 = (basicGrade2(847,300)) ÷ 12 × 2 ≒ 141,217
- 説明済み: 243,800円 = childFirstSecond(243,800)
- 説明済み: 487,600円 = childFirstSecond(243,800) + childFirstSecond(243,800)
- 説明済み: 545,760円 = ((childThird(81,300) + employeesGrade3MinimumOld(633,700) + employeesGrade3MinimumOld(633,700) + disabilityAllowanceMinimum(1,271,000)) × 1.25) ÷ 12 × 2 ≒ 545,760
- 説明済み: 633,700円 = employeesGrade3MinimumOld(633,700)
- 説明済み: 635,500円 = employeesGrade3Minimum(635,500)
- 説明済み: 643,948円 = basicGrade2(847,300) × (1 − 0.004 × 60)(繰上げ減額)
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

参考: amounts.ts の値を直書きしているファイル 24 件(判定には使わない): components/ApplicationFlowPage.tsx (14), components/platform/ShinseiRestyled.tsx (4), content/columns/hikazei-shuunyuu.ts (2), content/columns/ikura-moraeru.ts (65), content/columns/jukyuugo-tetsuduki.ts (13), content/columns/kiso-kousei-chigai.ts (9), content/columns/ninteibi-jigojusho.ts (7), content/columns/shikyuu-teishi-fukkatsu.ts (4), content/columns/shoubyou-teatekin.ts (4), content/columns/sokyuu-seikyuu.ts (1), content/columns/techou-to-nenkin.ts (5), lib/columns.ts (4), lib/hub-index.tsx (6), data/gokai-bodies.ts (83), data/gokai.ts (20), data/hubs/byoki-chiteki.json (2), data/hubs/byoki-jinzou-touseki.json (1), data/hubs/byoki-shinzou.json (3), data/hubs/byoki-shitai.json (2), data/hubs/byoki-tounyou.json (1), data/hubs/byoki-utsu-soukyoku.json (2), data/hubs/joukyou-hatachi-mae.json (4), data/hubs/joukyou-hitorigurashi.json (1), data/hubs/okane-ikura.json (14)
