# 申立書ツール — 様式の全欄が入力できるかの精査と直し(2026-09-06)結果報告

指示書: docs/moushitatesho-kinyuu-ran-2026-09-06-instructions.md §1〜§3。`data/moushitatesho/layout.ts` の座標と `MoushitateshoSheet.tsx` の描画の仕組みは変えていない。push はしていない。

コミット(§3): `b39b1fc` fix(moushitatesho): 発病日・初診日を年月日にし、「1日」固定の印字をなくす(v3)/ 2つ目(この報告を含む): feat(moushitatesho): 傷病名を最初の画面へ、「その他」欄を1・2に、「あとで決める」でも現在を印字

## §2 検証

| # | 内容 | 結果 |
|---|---|---|
| 1 | typecheck / build / test:moushitatesho / verify:moushitatesho:layout / prelaunch | ○ / ○ / **23 件 ○**(v2→v3 の3件を含む)/ **9 項目 ○**(座標を触っていないので変化なし)/ × は **B-3・B-10 だけ**(C-6・C-7 ○) |
| 2 | 様式の全欄に入力画面の欄が対応 | ○ 下の対応表 |
| 3 | 傷病名がステップ1の先頭にあり、本紙・続紙の `傷病名` に出る | ○ ステップ1「まず、3つだけ教えてください」の先頭の欄「傷病名(診断書に書かれている名前)」。印刷は `MAIN_FRONT.byoumei` `CONT_FRONT.byoumei`(変更なし) |
| 4 | 発病日 2020-01-15・初診日 2020-06-15 → 紙に 令和2年1月15日 / 令和2年6月15日。「日は分からない」→ 日欄が空欄 | ○ 紙の digits: 発病日 {年 2, 月 1, 日 15} 初診日 {年 2, 月 6, 日 15}。日不明(2020-01 / 2020-06)→ 日 "" / ""。**「1」が勝手に印字されるケース 0**(日は YYYY-MM-DD のときだけ描く) |
| 5 | v2 の下書き(`hatsubyou: "2020-01-01"`)を読むと `"2020-01"` になり、紙の日欄が空欄 | ○ v2 のキーに置いた下書きを印刷ページで読むと 発病日 {2, 1, ""} 初診日 {2, 6, ""}。`migrateV2` で "-01" → 年月、"-15" はそのまま(テストで確認) |
| 6 | 「その他」を認定日頃・現在で別々の文にして、紙の1・2にそれぞれ出る | ○ 紙の 1「認定日頃の不便」・2「現在の不便」(`MAIN_BACK.sections[0/1].sonota` の位置で読み取り) |
| 7 | 「あとで決める」→ 2 だけ / 「書く」→ 1・2 / 「書かない」→ 2 だけ | ○ 3 通りとも期待どおり(裏の text 6 / 7 / 6 個、1 の「その他」は あとで決める・書かない で空)。「あとで決める」では印刷画面に「認定日頃も書くかを決めていません。いまの状態だけで印刷します」 |
| 8 | 送信 0 | ○ 入力を1周(ステップ 1→8)して `/api/` と外部への通信 0(広告・フォントの読み込みを除く)。該当ソースに `fetch(` `XMLHttpRequest` `sendBeacon` `WebSocket` `<form` 0(Print.tsx の1件は「書かない」というコメント) |
| 9 | 「あなた」0・判定語 0 | 0 / 0 |
| 10 | 1400px / 390px | ○ 入力画面 はみ出し 0px、印刷プレビュー 0px(用紙は横スクロール枠の中)。docs/verification/moushitatesho-kinyuu-ran-2026-09-06/*.png(4枚) |

生ログ: 同フォルダの checks.txt / layout.txt / prelaunch.txt。

## §0 の対応表(様式の欄 → 画面のステップ・ラベル → layout のスロット)

| 様式の欄 | 画面 | layout | 判定 |
|---|---|---|---|
| No. ― 枚中 | 自動(`planSheets`) | `MAIN_FRONT.no` `.total`、続紙 `CONT_FRONT.no` | ○ |
| 傷病名 | **1「まず、3つだけ教えてください」先頭「傷病名(診断書に書かれている名前)」**(旧ステップ7「病名」から移した) | `MAIN_FRONT.byoumei`、`CONT_FRONT.byoumei` | ○ |
| 発病日 年月日 | 1「発病日(自覚症状が現れた日)」`type="date"` + 「日は分からない」 | `MAIN_FRONT.hatsubyou`(年・月・日) | ○ 日不明は日欄空欄 |
| 初診日 年月日 | 1「初診日(その症状で初めて診療を受けた日)」`type="date"` + 「日は分からない」 | `MAIN_FRONT.shoshin` | ○ |
| 期間1〜5 から/まで 年月日 | 2「期間分け」(年月)。日は空欄(§1-5 は見送り) | `MAIN_FRONT.rows[i].from/to`(`showDay={false}`) | ○ |
| 受診した/していない・医療機関名・状況 | 3 各期間「病院に行きましたか」「病院の名前」「どんな治療…」「仕事の内容…」 | `rows[i].jushin/hospital/body` | ○ |
| 期間6〜(続紙)・続紙裏の請求者欄 | 自動 | `CONT_FRONT.rows` `CONT_BACK.rows` | ○ |
| 裏 障害認定日 年月日 | 5「障害認定日」(認定日請求のとき) | `MAIN_BACK.ninteibi` | ○ 初診日が年月だけのときは既定を出さず、案内を1行 |
| 裏 1・2 職種/通勤方法/通勤時間/出勤日数/身体の調子 | 4(現在)・6(認定日頃)の `Work` | `sections[s].job/commuteMethod/commuteHours/commuteMinutes/daysPrev/daysPrevPrev/cond` | ○ |
| 裏 1・2 働いていない理由 ア〜オ・オの理由 | 同上 `Work` | `sections[s].reasons/reasonOther` | ○ |
| 裏 1・2 日常生活 10項目 1〜4 | 4・6 `Life` の10項目 | `sections[s].daily` | ○ |
| 裏 1・2 その他日常生活で不便に感じたこと | **4「そのほかに、日常生活で不便に感じていること」/ 6「…感じていたこと」**(新設。`back.genzai.sonota` / `back.nintei.sonota`) | `sections[s].sonota` | ○ |
| 障害者手帳 受けている/受けていない/申請中・①② | 4「障害者手帳を持っていますか」+ `TechouFields`(2冊まで) | `MAIN_BACK.techouKofu`、`techou[i].*` | ○ |
| 申立日・請求者 現住所/氏名/電話・代筆者 氏名/続柄/電話 | 7「最後に、請求者のことを」 | `MAIN_BACK.moushitate.*` | ○ |

## 直したもの

### `b39b1fc`(§1-2、保存データ v3)
- `data/moushitatesho/types.ts`: `version: 3`。`hatsubyou` `shoshin` は `YYYY-MM-DD` または `YYYY-MM`。`BackSide.sonota` を追加、トップレベルの `sonota` を廃止。`Waku.work: boolean | null`。
- `lib/moushitatesho-storage.ts`: `STORAGE_KEY` を `:v3`(v2・v1 は消さない)。`dateFromV2`(`-01` → 年月、それ以外はそのまま)、`migrateV2`(sonota を両区画へ、work: null、ninteibi は残す)。`normalize` は v3 / v2→v3 / v1→v2→v3。`loadMoushitatesho` は v3 → v2 → v1 の順。
- `When`: `type="date"` + 「日は分からない(年月だけ書く。紙の日欄は空欄になります)」。説明を記載要領に合わせた。`Retro` に「初診日の日が分かってから入れてください。手で入れることもできます」。
- `MoushitateshoSheet.tsx`: `BackBlock` の `sonota` prop を外し `side.sonota` を描く(座標・描画の仕組みは不変)。
- `tests/moushitatesho-migrate.test.mjs`: v2→v3 の3件を追加(`-01` → `YYYY-MM` / `-15` はそのまま / `sonota` が両区画)。v1 のテストは v1→v3 の連鎖に合わせた。
- `scripts/verify-moushitatesho/samples.mjs` `verify.mjs`: v3 の形・v3 のキーに。

### 2つ目のコミット(§1-1・§1-3・§1-4・§1-6)
- `Identity`(旧ステップ7)を廃止し、傷病名をステップ1の先頭へ。ステップ番号を 0〜8 に詰めた(`go` 上限 8、進捗バー `aria-valuemax` 9、`next`/`back` の 5↔7、`step<8`)。`Finish` の `useLayoutEffect` は不変。
- `Life`: 10項目の直後に「その他」の `textarea rows=3` + `Capacity(MAIN_BACK.sections[side].sonota)`。
- `backSidesFor(null)` → `{ nintei: false, genzai: true }`。印刷画面に「認定日頃も書くかを決めていません。いまの状態だけで印刷します」(止めない)。
- `Period`: 「働いていましたか」を全期間で選べるようにし、`Waku.work` に保存(紙には出さない)。最後の期間だけ `back.genzai.work` にも写す。仕事の欄は `w.work === true` のときだけ出す。

## 見送ったもの
- §1-5 期間の「日」: 見送り(記載要領は期間に日を求めていない)。期間の から/まで は年月のまま、日欄は空欄で手書きできる。
- ステップ7・8の見出し重複(「最後に、…」): `Identity` を廃止したので消えた(ステップ7「最後に、請求者のことを」だけ)。

## 補足
- v2 の下書きは、印刷ページで読んだだけでは v3 に書き換えない(印刷ページは文字サイズを変えたときだけ保存する)。入力画面を開いて続きから進めた時点で v3 のキーに保存される。v2・v1 のキーは残す。
- `hatsubyou` に本当に「1日」を入れたい人は、`type="date"` で 1 日を選べば `YYYY-MM-01` で保存され、紙に 1 が出る(v3 では本物の日として扱う)。
