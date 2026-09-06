# 「等級の目安をしらべる」(/dougu/mitate)の刷新(2026-09-06)結果報告

指示書: docs/mitate-sasshin-2026-09-06-instructions.md §1〜§6。`lib/mitate.ts` と `data/mitate.ts` は **diff 0 行**(未使用だった `isNearBoundary` / `hasBias` / `mitateGuideHits` を使った)。画面の順番(0 入口 → 1〜7 → 8 程度 → 9 診断名 → 10 結果)と「判定しない・送らない」は変えていない。push はしていない。

コミット(§6): `484b8b5` feat(mitate): 質問に「ひとりで暮らすとしたら」の前提、結果に答えの一覧と区切りの表示 / `732f717` feat(mitate): 総合評価を選ぶ形に戻し、主治医に見せる1枚を印刷 / 3つ目(この報告を含む): feat(mitate): 名前をそろえ、静的な本文と FAQ を足す

## §5 検証

| # | 内容 | 結果 |
|---|---|---|
| 1 | typecheck / build / prelaunch / verify:site-graph | ○ / ○ / × は **B-10 だけ**(**B-3 は ○ になった**: 静的本文で 500 字を超えた。C-6・C-7 ○)/ **10 項目 ○** |
| 2 | `npm run verify:mitate` 全項目 | **16 項目 ○**。#7・#10・#12・#13 の照合パターンを更新(下記)。`verify:mitate:print` で fixtures を作り直した(3 ケース) |
| 3 | `lib/mitate.ts` `data/mitate.ts` の diff | **0 行**(`git diff origin/main`) |
| 4 | 2・2・3・3・3・3・3 + 程度(3) | ○ 見出し「国の目安表では、この組み合わせは「2級又は3級」のところにあります。」/ 「7項目の平均 2.71(表の行「2.5以上3.0未満」)× 全体の程度(3)」/ 該当セル 2級又は3級 |
| 5 | 2・2・2・3・3・3・2 + 程度(3) | ○ 平均 2.43・行「2.0以上2.5未満」・「平均 2.43 は、表の行の区切り(2.5) に近い位置です。1項目の答えが1段階変わると、行が変わります。」 |
| 6 | 偏り 1・1・1・4・4・1・1 + 程度(2) / 空欄 1×7 + 程度(5) | ○ 先頭の行が `is-auto`「答えから自動で当たりました 特定の項目に著しい偏りがある」/ ○ 見出し「目安が定められていません」+ 先頭に「判定と程度に開きがある」。診断名を飛ばすと押せる行は共通の 8 |
| 7 | 総合評価の行 | ○ 12 行(共通8 + 精神4)。3 行押す → `is-on` 3・原文(blockquote)3・末尾の1行あり。該当セルと平均の行は**変化なし**。押し直すと解除。印刷の一覧は押した行だけ(2 行押した状態で 2 件。7 行押すと 6 件 = 最大6) |
| 8 | 答えの一覧の行 | ○ 3 行目を押す → 「金銭管理と買い物」(3/8)へ。4 を選ぶ → 結果へ直行。一覧 3 行目が 4、平均 2.71 → 2.86 に更新 |
| 9 | localStorage / 通信 | ○ 結果まで進めた時点のキー **[]**、「残す」を押したあと `shougainenkin-note:mitate:v1`。`fetch( XMLHttpRequest sendBeacon WebSocket <form` はソース 5 ファイルで 0。ブラウザの通信は Next.js のリンク先読み(`?_rsc=`)と AdSense(全ページ共通)だけで、道具からの送信は 0 |
| 10 | 「あなた」/ 禁止語 | **0 / 0**(入口・質問1〜7・程度・診断名・結果の全画面 + 静的本文の innerText。ソースも #12 で 0) |
| 11 | 主治医に見せる1枚 | ○ **A4 1枚**(3 ケース 146.5 / 174.7 / 201.7mm)。7 項目の正式文言・程度・押した項目・出典が載る。画面の結果は印刷に出ない(0)。チェックオフで等級の文字(`[1-3]級|非該当`)が紙に**出ない**、オンで「国の目安表では「2級又は3級」の位置(本人の答えを当てはめたもの。等級の判定ではない)」 |
| 12 | 静的本文の目安表 / FAQ | ○ 30 セルが結果の表と**完全一致**(`data/mitate.ts` から描画。強調 0)。FAQPage 5 問、JSON-LD に `<a` 0 |
| 13 | 名前 | ○ `<title>`「等級の目安をしらべる｜国の目安表に、毎日の生活を当てはめる｜障害年金申請サポート」/ h1「等級の目安をしらべる」/ パンくず末尾・道具カード(`TOOLS.mitate.name`)同じ |
| 14 | `mode=shindansho` | ○ 前提の1行 0、選択肢の大きい文が「できる」、「診断書を持っている」ボタン無し、結果の次に 3 リンク(現行どおり)+ 道具カード moushitatesho・madoguchi。通常モードは shorui・moushitatesho |
| 15 | 75.3 | ○ `stats.nintei["精神障害・不支給事案"]["上記2区分の合計"]["割合"].value` から「75.3%」。ソースに `75.3` の直書き 0(#12 で機械検査) |
| 16 | スクリーンショット / sitemap | ○ 1400px・390px で入口・質問・結果・印刷プレビューの 8 枚を docs/verification/mitate-sasshin-2026-09-06/ に。横はみ出し 0px(390px の 3 画面)。`lib/sitemap-static-dates.ts` の `/dougu/mitate` → 2026-09-06 |

生ログ: 同フォルダの checks.txt(check.mjs の出力)/ prelaunch.txt / site-graph.txt。`scripts/verify-mitate/fixtures/print.json` は最終ビルドで再生成。

## 変えたもの

### `484b8b5`(§2-1・§2-2・§2-3-1・2・§2-4)
- `MitateTool.tsx`: 質問 1〜7 の正式名の直下に `.mi-premise`「ひとりで暮らすとしたら、を前提に。…」(shindansho では出さない)。結果の見出し下の1行を差し替え。「7項目に、こう答えました」(`role="table"` の押せる行。`revisit` で `move(index+1)` → 選ぶと `move(10)`)。平均(小数第2位)・行・程度の1行、答えなかった項目の注記、`isNearBoundary` の1行(`nearest` は `MITATE_AVERAGE_BANDS` の min で最も近いもの)。診断名の説明を差し替え。「あなた」を全画面から外した。
- `globals.css`: `.mi-premise` `.mi-answers*` `.mi-answer-row`(13px 灰色 / 押せる行。色は primary と灰色だけ)。
- `verify.mjs` #7: 静かな1行の照合文を「本人の答え」に。

### `732f717`(§2-3-5〜9)
- 「ガイドラインが、ほかに見るところ」: `mitateGuideSet(state.kind)` を押せる行(`aria-pressed`、左枠線 3px primary)。押すと `state.guide[id]=true` と原文(`GuideBlock`)。自動の2件(`lookup.kind==="blank"` → gap、`hasBias` → bias)を先頭に、押せない行として原文を開いた形で。押した項目があれば末尾の1行。
- 「数字で見る」(`lib/stats.ts` から)、「次に」の下に `DouguCards variant="grid"`(`.dougu-band` の既存グリッド)と記事リンク 2 本。
- 「主治医に見せる1枚」`.mi-doctor-sheet`(画面 `display:none`、印刷で表示。`.mi-result>*:not(.mi-doctor-sheet)` を印刷で非表示、`.mi-printhead` は残す)。7 項目 × 正式文言・程度・`mitateGuideHits`(最大6)の `question`・任意の等級の1行・出典。ボタン「主治医に見せる用に印刷する」+ チェック「目安表の位置も載せる」(既定オフ)。
- 出典に「日本年金機構 診断書(精神の障害用)様式第120号の4 記載要領(単身で生活するとしたら可能かどうかで判断)」。
- `print.mjs`: 新しい紙を測る(押した行数・チェック・PDF の文字)。`verify.mjs` #12(「あなた」0・75.3 直書き0・stats 経由)#13(1枚・画面の結果 0・7行・押した項目 = min(押した数,6)・等級の文字 = チェック)。目安表の `break-inside` の規則は残した。

### 3つ目(§2-0・§3・§5-16)
- `page.tsx`: title / description を §2-0 に。`FAQ` 5 問(本文 `<dl>` と `faqJsonLd`。Q5 の「→ 病気別」リンクは本文だけ)。`StaticBody`(国の目安表とは + 静的な目安表 `table.mi-gt`・7項目と4段階・全体の程度・よくある質問。すべて `data/mitate.ts` から)を `<MitateTool>` の children で渡す。`UPDATED` 2026-09-06。
- `MitateTool.tsx`: h1「等級の目安をしらべる」、大きめの1行、リード 3 文、「はじめる」+「診断書を持っている」(白地・枠線、`?mode=shindansho`)。`children` は `step === 0` のときだけ道具の下に描く(SSR の HTML に載る。入口の本文 1,379 字)。
- `globals.css`: `.mi-start-row` `.mi-start-alt` `.mi-big-line` `.mi-static*`。
- `verify.mjs` #10: 静的本文の目安表(全行全列・`data/mitate.ts` 経由・強調なし)、FAQ 5 問・JSON-LD に `<a` 無し・children、名前 4 か所の一致を追加。
- `lib/sitemap-static-dates.ts`: `/dougu/mitate` → 2026-09-06。
- 検証の資料: docs/verification/mitate-sasshin-2026-09-06/(check.mjs・checks.txt・prelaunch.txt・site-graph.txt・png 8 枚)。

## 指示書と違う点・補足

1. **shorui の道具カードの一言を `TOOLS.shorui.what` に差し替えた**(通常モードの結果)。既定の `blurb`「7つの質問に答えると、あなたの場合に要る書類だけが出ます。…」に「あなた」があり、§5-10 の「道具の全画面で 0」に引っかかったため。新しい文は書かず、同じ道具の既存の `what`「7つの質問に答えると、自分の場合に必要な書類だけが並びます。…」を `Placement.blurb` で当てた(`data/dougu.ts` は変えていない。他のページの shorui カードは従来どおり)。
2. `verify.mjs` は指示の #10・#12・#13 に加えて **#7** も更新した(静かな1行の「あなた自身の答え」→「本人の答え」は指示 §2-3-9 の変更で、旧パターンのままだと × になる)。
3. 「診断書を持っている」ボタンと大きめの1行、静的本文の節の CSS(`.mi-start-row` `.mi-start-alt` `.mi-big-line` `.mi-static*`)は §4 の列挙に無いが、§2-0「小さいリンクをボタンに格上げ」と §3 に要るので足した。色は primary と灰色だけ。
4. 総合評価の行は押し直すと解除できるようにした(指示は「押すと true」のみ。押し間違いを戻せないと紙に載ってしまうため)。
5. 自動で当たる2件は押せない行(表示のみ)にした。`mitateGuideHits` が自動で紙に含めるので、押す必要が無い。
6. 結果の目安表の下にあった「7項目の平均 2.7 × 程度(3)」は、答えの一覧の下の1行(小数第2位・行つき)に移した(重複を避けた)。
7. §5-9 の通信: ブラウザでは Next.js の `<Link>` 先読み(`?_rsc=`、自サイト)と AdSense(全ページ共通)の通信が見えるが、道具の入力・結果を送るものは無い(ソースの機械検査 #11 も 0)。
8. `verify:site-graph` 検査 2 の未達 2 件(`/gokai/gennin-ga-aru` `/gokai/counseling`)は既知(内部リンクの指示書のとき報告済み)。
