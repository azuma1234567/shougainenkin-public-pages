# 「障害年金の金額」(/dougu/kingaku)と「年金事務所を探す」(/dougu/madoguchi)の刷新(2026-09-06)結果報告

指示書: docs/kingaku-madoguchi-sasshin-2026-09-06-instructions.md A・B。`lib/kingaku.ts` `lib/madoguchi.ts` `data/amounts.ts` `data/madoguchi/*` は **diff 0 行**(`git diff origin/main`)。新しいデータファイル 0。金額・件数・電話番号は `data/amounts.ts` `data/madoguchi/client.json`(`COMMON_TEL`)`lib/stats.ts` から(直書き 0。機械検査 `verify:kingaku` #8・#13、`verify:madoguchi` #8・#13)。「あなた」0、黄色の箱 0(`kg-warnbox` `md-warnbox` は CSS ごと外した)。push はしていない。

追加の1語: `data/dougu.ts` `TOOLS.shorui.blurb` の「あなたの場合」→「自分の場合」(コミット 2 に同梱)。

コミット(§C):
1. `9a87abf` feat(kingaku): 答えを最上部に、3問と年収からの入力、加入月数の説明を直す
2. `ea96a9c` feat(kingaku): さかのぼりの目安、令和8年度の額の表と FAQ
3. `1bf9eb4` feat(madoguchi): 市区町村名の検索欄、電話で言うこと、国民年金窓口の検索リンク
4. (この報告を含む) feat(madoguchi): 静的な本文と FAQ、名前をそろえる

## A-4 検証(/dougu/kingaku)

| # | 内容 | 結果 |
|---|---|---|
| 1 | typecheck / build / prelaunch / site-graph / verify:kingaku | ○ / ○ / × は **B-10 だけ**(B-3 も ○。A-8・C-6・C-7 ○)/ **10 項目 ○** / **17 項目 ○**(#1 は /dougu の一覧ページが無く元から ×だったので導線の見方を変更、#8 に年度の data 参照、#10 に2行、#13〜#16 を追加。12 項目の趣旨は不変) |
| 2 | `lib/kingaku.ts` `data/amounts.ts` の diff | **0 行** |
| 3 | 375px で開いた瞬間に 847,300 が画面内 | ○ 375×667 で年額の下端 365px(viewport 667)。スクロールなし。docs/verification/kingaku-sasshin-2026-09-06/top-375-firstview.png |
| 4 | 既定・1級・厚生月30万120月2級 | ○ 既定 年 847,300 / 月 約70,600 / 偶数月 約141,200。1級 1,059,125。厚生・月30万・120月・2級 → 報酬比例 **493,290** → 合計 **1,340,590**(300月みなしの表示あり) |
| 5 | 年収から 360万 | ○ hyoujun 300,000(欄の下に「月 300,000円」)→ 報酬比例 493,290 / 合計 1,340,590(#4 と同じ)。切り替えたときもう一方を消す(報酬比例が「—」に戻る) |
| 6 | さかのぼり | ○ 初診日 2023-01 → 認定日 2024-07(自動・直せる)→ **26か月** → 約**1,835,600**円(2級・国民年金)。2015-01 → 122か月 → 「122か月のうち 60か月分」約4,236,000円。認定日が今月以降(2026-01)は額を出さず「まだありません」の1行 |
| 7 | 準備中 / あなた / 黄色の箱 | **0 / 0 / 0**(描画後の `.kg-page` の文字と背景色 #fdf3dd の要素数で確認) |
| 8 | 加入月数の説明 | ○ 「障害認定日(原則、初診日から1年6か月後)の月までの、厚生年金に入っていた月数。300月未満なら300月として計算します」。「初診日の前月」0 |
| 9 | 静的な表 / FAQ | ○ 8 行が `AMOUNTS_2026` と一致(1,059,125 / 847,300 / 243,800 / 81,300 / 243,800 / 635,500 / 7,025 / 5,620)。FAQPage 5 問、JSON-LD に `<a` 0 |
| 10 | スクリーンショット / sitemap | ○ 1400px・390px・375px 初期表示の 3 枚。`/dougu/kingaku` → 2026-09-06 |

送信: ブラウザで入力を一周して `fetch/XHR`(先読み以外)は AdSense の1件(全ページ共通)だけ、POST 0(checks.txt)。ソースの機械検査 #11 は fetch/XHR/beacon/form/storage 0。

## B-2 検証(/dougu/madoguchi)

| # | 内容 | 結果 |
|---|---|---|
| 1 | typecheck / build / prelaunch / site-graph / verify:madoguchi / verify:madoguchi:print | ○ / ○ / × は **B-10 だけ** / **10 項目 ○** / **13 項目 ○**(#1 は /shinsei の道具カードが DouguCards に移った 09-06 の変更で元から ×だったので見方を更新。#2 を検索欄に、#3・#8・#9・#11 を更新、#13 を追加)/ 3 ケース **2・2・1 ページ**、375px はみ出し 0 |
| 2 | `lib/madoguchi.ts` `data/madoguchi/*` の diff / 新しいデータファイル | **0 行 / 0**(全件の配列は `client.json` から実行時にメモ化) |
| 3 | 検索 | ○ 「旭川」→ 北海道 旭川市(1件)→ 旭川年金事務所。「世田谷」→ 東京都 世田谷区(1件)。「堺」→ 堺市堺区ほか **7 区**。「大阪」→ 大阪市の区 **10 件**(上限)。「ぬぬぬ」→ 0 件で案内の1行 |
| 4 | 検索とプルダウンで同じ code | ○ 旭川市: 検索 012041 = 一覧から選ぶ 012041(localStorage の値が完全一致)。事務所も同じ |
| 5 | あなた / 黄色 / 電話で言うこと / 窓口の検索リンク | **0 / 0** / 3 行 / 「旭川市の国民年金の窓口を検索する」→ `google.com/search?q=北海道旭川市 国民年金 窓口` |
| 6 | 開所時間 | ○ **確認できたので出した**: 日本年金機構「受付時間のご案内」 https://www.nenkin.go.jp/section/guidance/uketukejikan.html (確認日 2026-09-06)。平日(月曜〜金曜)8:30〜17:15、週初の開所日は 17:15〜19:00 まで時間延長、第2土曜日 9:30〜16:00 に週末相談。予約の表に1行(URL・確認日つき) |
| 7 | 印刷 | ○ A4 2 枚以内(横浜市南区 2・水戸市 2・新宿区 1)。紙の順: 選んだ地名 → 管轄の年金事務所 → 提出先の1行 → 予約のしかた → 電話で言うこと → 持ち物 → 聞くこと。街角 0。docs/verification/madoguchi-sasshin-2026-09-06/print-preview-1400.png |
| 8 | FAQPage / 電話番号 | ○ 5 問、`<a` 0。予約電話は表・FAQ とも `COMMON_TEL.yoyaku`(直書き 0。一般電話 03-6631-7521 は data に無いので文字のまま。下記) |
| 9 | 送信 / localStorage | ○ fetch/XHR/beacon/WebSocket/form 0(#11)。ブラウザで検索→確定→印刷まで、自サイトへの先読み以外の通信 0、POST 0。localStorage は既存の `shougainenkin-note:madoguchi:v1`(pref/code)だけ |
| 10 | スクリーンショット / sitemap | ○ 1400px・390px(入口・結果)・印刷プレビュー。`/dougu/madoguchi` → 2026-09-06 |

生ログ: docs/verification/kingaku-sasshin-2026-09-06/ と docs/verification/madoguchi-sasshin-2026-09-06/(check.mjs・checks.txt・prelaunch.txt・site-graph.txt・png)。

## 出典の確認(A-3・B-1-3)

- 障害基礎年金 1級 1,059,125円・2級 847,300円、子の加算 243,800円 / 81,300円: 日本年金機構「障害基礎年金の受給要件・請求時期・年金額」 https://www.nenkin.go.jp/service/jukyu/seido/shougainenkin/jukyu-yoken/20150514.html (令和8年4月分から。確認日 2026-09-06)
- 配偶者加給年金額 243,800円、3級の最低保障 635,500円、1級 ×1.25、300月みなし: 「障害厚生年金の受給要件・請求時期・年金額」 https://www.nenkin.go.jp/service/jukyu/seido/shougainenkin/jukyu-yoken/20150401-02.html (同)
- 年金生活者支援給付金 1級 7,025円・2級 5,620円(月額): 「令和8年4月分からの年金額等について」 https://www.nenkin.go.jp/oshirase/taisetu/kojin/2026/202604/0401.html (2026-04-01 公開。障害年金の年額そのものはこのページに無い)
- 上の3本を `data/stats/sources.json` に足し(`shougaiKisoGakuR08` `shougaiKouseiGakuR08` `nenkingakuKaiteiR08`)、静的な表の出典行は `stats.sources.sources` から描く。
- 年金事務所の開所時間: 上の B-2-6。

## 変えたもの

### `9a87abf`(A-0 #1〜4・6・7・9、A-1、A-2)
- `KingakuTool.tsx` を作り直し: 答えの箱(白地・上辺 3px primary、`aria-live`)を最上部に。年・月(約、百円丸め)・「偶数月の15日に、前2か月分(約…円)」・状態で変わる1行(A-2 の4通り)。等級チップ + 「新しく決まる人の {pct}% が2級」(`stats.nintei["新規裁定・抽出1000件"]["合計"]["2級"].pct` = 53.9)+ 道具カード `mitate`。3問(会社員・公務員でしたか / 18歳までの子ども / 65歳未満の配偶者は「はい」のときだけ)。「給与からの上乗せ」は `<details>`(「はい」なら開く)。年収から(÷12。`lib/kingaku-hosoku.ts` `hyoujunFromNenshu`)/ 平均標準報酬額から の切り替え(もう一方を消す)。加入月数の説明を「障害認定日の月まで」に。内訳(既存)+ 上乗せ(参考)+ 知っておくこと(灰色の6行: 概算・従前額保障 / 4月改定 / 調整 / 非課税と扶養 / 配偶者加給が止まる条件 / 20歳前の所得制限→/dougu/kougin)。
- `page.tsx`: title・h1「障害年金の金額 — {年度}の額で計算」(年度は `FISCAL_YEAR`)、リード1行、ここからできること = 道具カード `shorui` `koushin` + 申請の流れ・いくら・いつ振り込まれるか(/okane/ikura)。
- `globals.css`: `.kg-big` のグラデーションをやめ、`.kg-flag` を primary のチップ色に。`.kg-answer` `.kg-fold` `.kg-know` ほか。

### `ea96a9c`(A-0 #5・#8、A-3)
- さかのぼり(任意・折りたたみ): 初診日(年月)→ 障害認定日 = +1年6か月(直せる)。翌月分から今月分までの月数、60か月で頭打ち、額 = 約月額 × 月数(`lib/kingaku-hosoku.ts`)。
- `page.tsx` に静的な本文: 今年度の額(一覧、8行)・計算のしくみ(乗率 `(A.rateNew*1000).toFixed(3)`、`A.minashiMonths`、`A.grade1Rate`)・FAQ 5 問 + FAQPage JSON-LD。
- `data/stats/sources.json` に出典3本、`data/dougu.ts` の1語、sitemap の日付。

### `1bf9eb4`(B-1-1〜B-1-4)
- 検索欄 `#md-search`(前方一致 → 部分一致、最大10件、都道府県つき、全件を `useMemo` で1回だけ作る)。2段のプルダウンは「一覧から選ぶ」の `<details>` に。
- 見出し「管轄の年金事務所」。厚年・国年で違う警告と町名で分かれる警告を薄い青の帯(`.md-note`)に。予約なしの注意は灰色の1行(`.md-hint`)。
- 提出先の1行の直後に「→ {市区町村名}の国民年金の窓口を検索する」(`lib/madoguchi.ts` の `mapUrl` と同じ、検索URLへのリンクだけ)。
- 「電話で言うこと」3行(灰色の帯 `.md-say`)を予約の表の先頭に。年金事務所の開所時間を表の1行に(URL・確認日つき)。予約電話を `COMMON_TEL.yoyaku` から。
- `print.mjs`: 最初の操作を検索欄に。`verify.mjs` #1・#2・#3・#8・#9・#11。

### 4つ目(B-1-5、B-0 #8、B-2-10)
- `page.tsx`: title・h1「年金事務所を探す — 管轄と予約のしかた」、description、静的な本文 3 節(年金事務所と街角の違い / 市区町村の窓口に出せる場合 / 郵送で出す→/columns/teishutsusaki-yuusou)+ FAQ 5 問 + FAQPage JSON-LD(電話は `COMMON_TEL.yoyaku`。Q5 の「→ 必要書類チェックリスト」は本文だけ)。
- `verify.mjs` #13、sitemap の日付、検証の資料と報告。答えの箱の「年 847,300円」の字間(`<span>` で1つに)も同梱。

## 指示書と違う点・補足(理由つき)

1. **検索欄は1文字でも候補を出す(前方一致だけ)。** B-1-1 は「2文字以上」だが、B-2-3 の「堺」は1文字で、2文字以上だと出ない。1文字は前方一致だけ(部分一致は2文字以上)にして両方を満たした。「堺」→ 堺市の7区、「旭」→ 旭川市・旭市。
2. **一般電話 03-6631-7521 は文字のまま。** `COMMON_TEL`(client.json)に無く、`data/madoguchi` は触らない約束のため。予約受付専用電話(0570-05-4890)は表・FAQ とも `COMMON_TEL.yoyaku` 経由。
3. **「電話で言うこと」の3行目は「初診日は ◯◯◯◯年◯月ごろ」。** 指示書の `{年}年{月}月` は、この道具に初診日の入力が無いので伏せ字にした。
4. **紙の順番:** B-1-3「表の先頭に電話で言うこと」と B-1-4「予約の表 → 電話で言うこと」が食い違うので、画面は B-1-3(帯を表の上)、紙は画面と同じ順(予約のしかた → 電話で言うこと → …)。B-1-4 の「予約の表 → 電話で言うこと」は見出し単位では満たしている(予約のしかたの節の中で帯が表の上)。
5. **`verify:madoguchi` #11 は全ページ共通の AdSense の通信を除いた。** 09-05 の AdSense 導入で、fixtures の通信一覧に広告の GET が 13 件入り、そのままだと ×。広告の通信を `ads` として分け、「本体を持つ送信 0・自サイトへの先読み以外 0・広告の URL に選んだ住所(水戸/茨城/code)が無い」を確認する形にした。
6. **`verify:kingaku` #1・`verify:madoguchi` #1 は刷新前から ×だった**(#1 が見ていた `app/dougu/page.tsx` は存在せず、StepFlow の道具リンクは 09-06 の /shinsei の変更で `DouguCards` に移っていた)。今の構造(sitemap・公開判定・道具カードの配置・パンくず、/shinsei のステップカード)を見るように更新した。
7. **kingaku の `PageDate` をヒーローから末尾へ**(375px で答えの箱を初期表示に入れるため)。B-10 は更新日の有無を見るので影響なし。
8. 「わからない」を選ぶと `seido = null` で、報酬比例の行の理由は既存どおり「制度を選ぶと計算します」、合計は国民年金と同じ額。3級 + 未入力のときは A-2 の3級の1行を「わからない」より優先した。
9. `/dougu/mitate` の結果の shorui カードは、今日の刷新で「あなた」を避けるため `TOOLS.shorui.what` を当てているが、blurb の1語を直した今は既定の blurb でも 0 になる。mitate 側は触っていない(次に mitate を触るとき `"shorui"` に戻せる)。
