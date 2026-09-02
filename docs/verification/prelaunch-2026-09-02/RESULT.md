# 公開前チェック 実行結果 (2026-09-02)

origin: http://localhost:3105 / ページ数: 157 / 基準: git main

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
| A-8 | × | 金額が全ページで一致している(data/amounts.ts 経由・直書き0) | 直書きのあるファイル 21、amounts.ts に無い10万円以上の金額 18<br>※値そのものは data/amounts.ts と同じ数字が使われているかを「未登録額」で確認 |
| A-9 | ○ | 「執筆メモ」「x.com」「@」が出力に含まれていない | 執筆メモ/x.com 0、@ 0(連絡先メールの @ 5 件は除外) |
| A-10 | ○ | 調査元(X/YouTube/note等)への言及がゼロ | ドメイン名・アカウント名・X固有語 0 |

### A-8 の該当一覧(39件)

- 直書き: components/ApplicationFlowPage.tsx (11)
- 直書き: components/platform/ShinseiRestyled.tsx (4)
- 直書き: content/columns/hikazei-shuunyuu.ts (2)
- 直書き: content/columns/ikura-moraeru.ts (61)
- 直書き: content/columns/jukyuugo-tetsuduki.ts (13)
- 直書き: content/columns/kiso-kousei-chigai.ts (8)
- 直書き: content/columns/ninteibi-jigojusho.ts (7)
- 直書き: content/columns/shikyuu-teishi-fukkatsu.ts (4)
- 直書き: content/columns/shoubyou-teatekin.ts (4)
- 直書き: content/columns/sokyuu-seikyuu.ts (1)
- 直書き: content/columns/techou-to-nenkin.ts (5)
- 直書き: lib/columns.ts (4)
- 直書き: data/hubs/byoki-chiteki.json (2)
- 直書き: data/hubs/byoki-jinzou-touseki.json (1)
- 直書き: data/hubs/byoki-shinzou.json (3)
- 直書き: data/hubs/byoki-shitai.json (2)
- 直書き: data/hubs/byoki-tounyou.json (1)
- 直書き: data/hubs/byoki-utsu-soukyoku.json (2)
- 直書き: data/hubs/joukyou-hatachi-mae.json (4)
- 直書き: data/hubs/joukyou-hitorigurashi.json (1)
- 直書き: data/hubs/okane-ikura.json (14)
- 未登録額: /okane/ikura: 141,200円
- 未登録額: /okane/ikura: 1,091,100円
- 未登録額: /columns/hikazei-shuunyuu: 1,091,100円
- 未登録額: /columns/hikazei-shuunyuu: 1,546,725円
- 未登録額: /columns/jukyuugo-tetsuduki: 3,761,001円
- 未登録額: /columns/ikura-moraeru: 1,056,125円
- 未登録額: /columns/ikura-moraeru: 844,900円
- 未登録額: /columns/ikura-moraeru: 831,700円
- 未登録額: /columns/ikura-moraeru: 1,334,900円
- 未登録額: /columns/ikura-moraeru: 111,242円
- 未登録額: /columns/ikura-moraeru: 1,628,025円
- 未登録額: /columns/ikura-moraeru: 135,669円
- 未登録額: /columns/ikura-moraeru: 633,700円
- 未登録額: /columns/ikura-moraeru: 1,271,000円
- 未登録額: /columns/ikura-moraeru: 914,740円
- 未登録額: /columns/kiso-kousei-chigai: 1,271,000円
- 未登録額: /columns/kiso-kousei-chigai: 487,600円
- 未登録額: /columns/ninteibi-jigojusho: 111,300円

## B

| # | 判定 | 項目 | 件数 |
|---|---|---|---|
| B-1 | × | 孤立ページがゼロ(本文からの内部リンクが最低1本) | 孤立 5 / 157<br>※ヘッダー・フッターのリンクは数えない |
| B-2 | × | 被内部リンクが50本を超えるページがゼロ | 50本超 2 |
| B-3 | × | 500字未満のページの一覧 | 500字未満 54(うち誤解カード 48)。実例の個別ページ 0 件<br>※実例94件の個別ページはサイトマップに無い(未実装) |
| B-4 | ○ | h1が1ページに1つだけ | 複数/なし 0 |
| B-5 | ○ | titleとmeta descriptionが全ページにある | 空 0、description重複 0組 |
| B-6 | ○ | titleの重複がない | 重複 0組 |
| B-7 | ○ | OGP画像が全ページにある | og:image なし 0。誤解カードの自動生成画像 48/48 |
| B-8 | ○ | 構造化データが妥当 | 型別件数 WebSite:1 undefined:48 HowTo:2 FAQPage:47 BreadcrumbList:53 DefinedTermSet:1 Article:47 ItemList:1、エラー 0<br>※スキーマ必須項目の静的検査。Google のリッチリザルトテストは公開URLで別途実施 |
| B-9 | × | パンくずが全ページにある(BreadcrumbList を含む) | 表示なし 0、BreadcrumbList(構造化データ)なし 103<br>※表示のパンくずはあるが構造化データが無いページを別に数える |
| B-10 | × | 更新日が全ページに表示されている | 更新日/確認日の表示なし 9 |

### B-1 の該当一覧(5件)

- /about
- /privacy
- /terms
- /quality
- /byoki/shikaku

### B-2 の該当一覧(2件)

- / (151本)
- /gokai (59本)

### B-3 の該当一覧(54件)

- /okane (113字)
- /nayami (154字)
- /erabu (185字)
- /joukyou (189字)
- /gokai/chokin-ga-aru (247字)
- /byoki (269字)
- /gokai/oya-no-shuunyuu (283字)
- /gokai/sashiosae (285字)
- /gokai/koushin-de-henkin (286字)
- /gokai/koushin-maitoshi (288字)
- /gokai/shindan-ga-tsuita-hi (290字)
- /gokai/kounin-daikou (290字)
- /gokai/kiso-ni-haiguusha (290字)
- /gokai/kyuufukin-atokara (291字)
- /gokai/jikou-de-muri (294字)
- /gokai/tesuuryou (295字)
- /gokai/wakai-kara (296字)
- /gokai/ko-no-kasan-zutto (296字)
- /gokai/tenin-shitabakari (297字)
- /gokai/techou-shindansho (301字)
- /gokai/omoku-misenai-to (306字)
- /gokai/gennin-ga-aru (308字)
- /gokai/kusuri-nashi (314字)
- /gokai/tekiou-shougai-taishougai (315字)
- /gokai/toukyuu-wa-kachi (316字)
- /gokai/kenshin-no-hi (317字)
- /gokai/ishoku-uchikiri (322字)
- /gokai/kaisha-ni-shirareru (323字)
- /gokai/moraainagara-harau (323字)
- /gokai/counseling (324字)
- /gokai/munenkin-owari (325字)
- /gokai/karute-ga-nai-owari (328字)
- /gokai/hataraitetara-muri (330字)
- /gokai/hikazei-shuunyuu-zero (330字)
- /gokai/nyuuin-shitenai (332字)
- /gokai/techou-ga-nai (334字)
- /gokai/nenkin-dake (336字)
- /gokai/dokkyo-furi (336字)
- /gokai/kuriage (339字)
- /gokai/kekkon-shitara (340字)
- /gokai/hitorigurashi-jiritsu (341字)
- /gokai/byoumei-bunsan (344字)
- /gokai/seikatsuhogo-son (346字)
- /gokai/shinseki-ni-tanomu (346字)
- /gokai/kiso-ka-kousei-nitaku (348字)
- /gokai/mukashi-minou (349字)
- /gokai/ryouhou-dasenai (349字)
- /gokai/kensa-mada (354字)
- /gokai/amae (360字)
- /gokai/65sai-sugita (360字)
- /gokai/kikan-de-tokutei (360字)
- /gokai/utagawareru (368字)
- /gokai/shufu-mushoku (387字)
- /about (479字)

### B-9 の該当一覧(103件)

- BreadcrumbListなし: /hajimete
- BreadcrumbListなし: /shinsei
- BreadcrumbListなし: /byoki/utsu-soukyoku
- BreadcrumbListなし: /jitsurei
- BreadcrumbListなし: /nayami/fushikyu
- BreadcrumbListなし: /yougo
- BreadcrumbListなし: /gokai
- BreadcrumbListなし: /suuji
- BreadcrumbListなし: /byoki
- BreadcrumbListなし: /nayami
- BreadcrumbListなし: /joukyou
- BreadcrumbListなし: /okane
- BreadcrumbListなし: /erabu
- BreadcrumbListなし: /byoki/tekiou-fuan
- BreadcrumbListなし: /byoki/hattatsu
- BreadcrumbListなし: /byoki/tougou
- BreadcrumbListなし: /byoki/chiteki
- BreadcrumbListなし: /byoki/tenkan
- BreadcrumbListなし: /byoki/jinzou-touseki
- BreadcrumbListなし: /byoki/gan
- BreadcrumbListなし: /byoki/shinzou
- BreadcrumbListなし: /byoki/tounyou
- BreadcrumbListなし: /byoki/shitai
- BreadcrumbListなし: /byoki/ninchishou
- BreadcrumbListなし: /byoki/koujinou
- BreadcrumbListなし: /byoki/izon
- BreadcrumbListなし: /byoki/kanzou
- BreadcrumbListなし: /byoki/kokyuuki
- BreadcrumbListなし: /byoki/ketsueki
- BreadcrumbListなし: /byoki/shikaku
- BreadcrumbListなし: /byoki/choukaku
- BreadcrumbListなし: /byoki/gengo
- BreadcrumbListなし: /byoki/nanbyou
- BreadcrumbListなし: /joukyou/hatarakinagara
- BreadcrumbListなし: /joukyou/hatachi-mae
- BreadcrumbListなし: /joukyou/hitorigurashi
- BreadcrumbListなし: /joukyou/shoubyou-teatekin-kara
- BreadcrumbListなし: /joukyou/65sai-ijou
- BreadcrumbListなし: /joukyou/shufu-mushoku
- BreadcrumbListなし: /joukyou/gakusei
- BreadcrumbListなし: /joukyou/kazoku-ga-tetsudau
- BreadcrumbListなし: /joukyou/seikatsu-hogo
- BreadcrumbListなし: /nayami/shindansho-komatta
- BreadcrumbListなし: /nayami/shoshinbi-karute
- BreadcrumbListなし: /nayami/koushin
- BreadcrumbListなし: /nayami/shikyuu-teishi
- BreadcrumbListなし: /nayami/sokyuu
- BreadcrumbListなし: /okane/ikura
- BreadcrumbListなし: /okane/zeikin
- BreadcrumbListなし: /okane/chousei
- BreadcrumbListなし: /erabu/jibun-ka-irai
- BreadcrumbListなし: /erabu/irai-subeki-case
- BreadcrumbListなし: /erabu/hiyou-souba
- BreadcrumbListなし: /erabu/erabikata
- BreadcrumbListなし: /erabu/fushikyu-no-ato
- BreadcrumbListなし: /gokai/techou-ga-nai
- BreadcrumbListなし: /gokai/hataraitetara-muri
- BreadcrumbListなし: /gokai/hitorigurashi-jiritsu
- BreadcrumbListなし: /gokai/tekiou-shougai-taishougai
- BreadcrumbListなし: /gokai/hikazei-shuunyuu-zero
- BreadcrumbListなし: /gokai/chokin-ga-aru
- BreadcrumbListなし: /gokai/oya-no-shuunyuu
- BreadcrumbListなし: /gokai/shindan-ga-tsuita-hi
- BreadcrumbListなし: /gokai/karute-ga-nai-owari
- BreadcrumbListなし: /gokai/koushin-de-henkin
- BreadcrumbListなし: /gokai/jikou-de-muri
- BreadcrumbListなし: /gokai/omoku-misenai-to
- BreadcrumbListなし: /gokai/nyuuin-shitenai
- BreadcrumbListなし: /gokai/wakai-kara
- BreadcrumbListなし: /gokai/amae
- BreadcrumbListなし: /gokai/tenin-shitabakari
- BreadcrumbListなし: /gokai/mukashi-minou
- BreadcrumbListなし: /gokai/kekkon-shitara
- BreadcrumbListなし: /gokai/65sai-sugita
- BreadcrumbListなし: /gokai/kiso-ka-kousei-nitaku
- BreadcrumbListなし: /gokai/toukyuu-wa-kachi
- BreadcrumbListなし: /gokai/gennin-ga-aru
- BreadcrumbListなし: /gokai/shufu-mushoku
- BreadcrumbListなし: /gokai/kaisha-ni-shirareru
- BreadcrumbListなし: /gokai/kensa-mada
- BreadcrumbListなし: /gokai/kounin-daikou
- BreadcrumbListなし: /gokai/tesuuryou
- BreadcrumbListなし: /gokai/kusuri-nashi
- BreadcrumbListなし: /gokai/kenshin-no-hi
- BreadcrumbListなし: /gokai/counseling
- BreadcrumbListなし: /gokai/byoumei-bunsan
- BreadcrumbListなし: /gokai/ishoku-uchikiri
- BreadcrumbListなし: /gokai/koushin-maitoshi
- BreadcrumbListなし: /gokai/sashiosae
- BreadcrumbListなし: /gokai/seikatsuhogo-son
- BreadcrumbListなし: /gokai/moraainagara-harau
- BreadcrumbListなし: /gokai/kikan-de-tokutei
- BreadcrumbListなし: /gokai/shinseki-ni-tanomu
- BreadcrumbListなし: /gokai/utagawareru
- BreadcrumbListなし: /gokai/ryouhou-dasenai
- BreadcrumbListなし: /gokai/ko-no-kasan-zutto
- BreadcrumbListなし: /gokai/kiso-ni-haiguusha
- BreadcrumbListなし: /gokai/kyuufukin-atokara
- BreadcrumbListなし: /gokai/techou-shindansho
- BreadcrumbListなし: /gokai/nenkin-dake
- BreadcrumbListなし: /gokai/munenkin-owari
- BreadcrumbListなし: /gokai/kuriage
- BreadcrumbListなし: /gokai/dokkyo-furi

### B-10 の該当一覧(9件)

- /columns
- /about
- /support
- /gokai
- /byoki
- /nayami
- /joukyou
- /okane
- /erabu

## C

| # | 判定 | 項目 | 件数 |
|---|---|---|---|
| C-1 | ○ | sitemap.xml: 全公開ページが入り、未公開ページが入っていない | 収録 157、リンクはあるが未収録 0、予約slugの混入 0、200以外 0 |
| C-2 | × | sitemapを4本に分割する | 分割sitemap 0/4<br>※未実装なら公開当日までに作る |
| C-3 | 手動 | Search Console にサイトマップを送信(既存47本を最初に) | 手動作業(スクリプト対象外)<br>※C-2 の分割後に sitemap-columns.xml から送る |
| C-4 | 手動 | 主要10ページの URL検査(インデックス登録リクエスト) | 10ページとも200: ○(送信自体は手動) |
| C-5 | ○ | 旧URLからのリダイレクトが必要な変更がない | 公開前URL 59 件のうち200以外 0<br>※main ブランチの sitemap 静的ページ + 記事URL |

### C-2 の該当一覧(4件)

- /sitemap-columns.xml (404)
- /sitemap-hubs.xml (404)
- /sitemap-jitsurei.xml (404)
- /sitemap-gokai.xml (404)

## D(人が見る): 確認用の一覧

全ページの URL・タイトル・文字数は `docs/verification/prelaunch-2026-09-02/pages.tsv` に出力。

| URL | タイトル | 文字数 |
|---|---|---|
| /columns/moushitatesho-a4-insatsu | 障害年金の申立書をA4で印刷する方法｜PDF・コンビニ印刷も解説｜障害年金申請サポート | 10529 |
| /columns/moushitatesho-kikan-kugiri | 障害年金の申立書は期間をどう区切る？通院・就労・症状変化の書き方｜障害年金申請サポート | 10409 |
| /columns/teishutsusaki-yuusou | 障害年金の書類はどこに提出する?｜年金事務所・市役所・郵送｜障害年金申請サポート | 8530 |

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

## 2026-09-02 判定基準の変更

`docs/codex-prelaunch-fix-2026-09-02-instructions.md` に従い、次の項目の判定基準を変えた(`scripts/prelaunch-check.mjs` の冒頭コメントにも同じ内容を記載)。

| # | 変更前 | 変更後 |
|---|---|---|
| A-8 | `data/amounts.ts` の値の直書きが0件であること | 出力HTMLの10万円以上の金額が `amounts.ts` の値から導出できること(値そのもの / 年額2〜4個の和 / ×1.25 / ÷12・÷12×2 は±100円 / 本文に明示した前年度額 / 「超」の+1)。直書きの件数は参考として付記に出すだけ。既裁定者の3額と障害手当金の最低保障を `amounts.ts` に登録 |
| B-1 | 本文からの内部リンクが0のページはすべて孤立 | 法務・案内ページ(about/privacy/terms/quality/support)はフッターからのリンクが正常な設計なので除外 |
| B-2 | `<main>` 内のすべてのリンクを被リンク数に数える | パンくずと誤解カードの「一覧へ戻る」由来は数えない |
| B-9 | BreadcrumbList の有無だけ | 2つ以上あるページ(二重出力)も数える |
| C-2 | 4本に分割した sitemap があること | 対象外。Google の分割要件は 50,000 URL または 50MB で、157ページでは効果がなく管理対象が増えるだけ。50,000 URL 超で再検討 |

唯一の本文修正: `content/columns/ninteibi-jigojusho.ts` の「月約111,300円」→「月約111,242円」(`ikura-moraeru` と同じ 1,334,900÷12)。
