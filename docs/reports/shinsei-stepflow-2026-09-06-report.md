# /shinsei「申請の流れ — 8つのステップ」の道具カードの重なりを直す(2026-09-06)結果報告

指示書: docs/shinsei-stepflow-2026-09-06-instructions.md §1〜§3。トップページの8ステップは変えていない(outerHTML 完全一致)。新しい部品・CSS は作っていない(追加した CSS は 0 行。コメント1行だけ)。push はしていない。

## §2 検証

| # | 内容 | 結果 |
|---|---|---|
| 1 | typecheck / build / prelaunch / verify:site-graph | ○ / ○ / × は **B-3・B-10 だけ**(C-6・C-7 ○)/ **10 項目 ○** |
| 2 | `/shinsei` の `ol.step-flow` に `.step-flow-tool` 0・`.has-tool` 0 | **0 / 0** |
| 3 | `#step-3`〜`#step-7` に `.dougu-band-card` 各1枚、`b`/`span`/`href` が `PLACEMENTS.shinseiSteps` と一致、位置は「この段階ですること」の直後・「つまずきやすいところ」の前 | ○ 8/8 一致。`#step-1` `#step-2` 0。**`#step-8` にも1枚**(下記) |
| 4 | トップ(`/`)の `ol.step-flow` の outerHTML が変更前と完全一致 | ○ 変更前(直前ビルドの配信 HTML)2,466 字 = 変更後 2,466 字、**完全一致 true** |
| 5 | 1400px / 1000px / 390px で崩れない | ○ ヒーローの8ステップで、番号の円・題名の矩形どうしの重なり **0**(3幅とも)。列数 8 / 4 / 1。ステップカードの道具カードは全部枠の内側。横はみ出し 0px。スクリーンショット 9 枚: docs/verification/shinsei-stepflow-2026-09-06/(全体・ヒーロー・ステップ4 × 3幅) |
| 6 | 700px 以下でヒーローが縦一列、道具は本文側だけ | ○ 390px で列数 1、ヒーローの道具 0、ステップカード側に道具 |
| 7 | `lib/sitemap-static-dates.ts` の `/shinsei` を 2026-09-06 | ○ |

生ログ: 同フォルダの checks.txt / site-graph.txt / prelaunch.txt。

## 変えたもの

- `components/platform/StepFlow.tsx`: `StepFlow({ tools = true })`。`Node` に `tools` を渡し、`false` のときは `placement`/`card` を求めず、`has-tool` も `.step-flow-tool` も描かない。`STEPS`・番号・題名・`split`・`href="/shinsei#step-N"`・`is-featured` の判定は不変。
- `components/platform/ShinseiRestyled.tsx`: ヒーローを `<StepFlow tools={false} />`。ステップカードの `.shinsei-tasks` の直後に `<DouguCards placements={PLACEMENTS.shinseiSteps[step.id]} variant="grid" />`(`.dougu-band-card`。文言は `PLACEMENTS` のまま)。順序: header → 本文 → この段階ですること → 道具 → つまずきやすいところ → footer。
- `app/platform.css`: `.step-flow` のコメントに「道具カードはトップだけ。/shinsei は tools={false} で外し、本文のステップカードの中に出す」の1行。**CSS の値・クラスの追加は 0**(`.shinsei-step-card` の `gap: 22px` の中に `.dougu-band-card` がそのまま収まった。上書き1行も要らなかった)。
- `lib/sitemap-static-dates.ts`: `/shinsei` → 2026-09-06。
- `scripts/verify-site-graph.mjs` 検査7: `/shinsei` の窓口の道具(ステップ3と7で2本)を数える selector に `.shinsei-step-card .dougu-band-card` を足した(これまでの `.step-flow-tool` はヒーローに無くなったため)。

## 指示書と違う点(1つ)

**`#step-8` にも道具カードが1枚出る**(更新カウントダウン `/dougu/koushin`)。指示書 §1-2・§2-3 は「`shinseiSteps` に無いステップ(1・2・8)は 0」と書いているが、今日先に入れた道具2本の指示書(docs/dougu-2hon-2026-09-06-instructions.md §B-5)で `PLACEMENTS.shinseiSteps["step-8"]` に `koushin` を置いており、`PLACEMENTS` は触らない約束(§1-4)なので、そのまま出している。ヒーローから外す前もステップ8の真下にこのカードが出ていたので、動きとしては同じ。カードは合計 6 枚(3〜8)。外すなら `data/dougu.ts` の `"step-8"` を消すだけ。

## 見た目

- ヒーロー(900px 幅)は 8 ステップの円・題名・線だけになり、重なりは無い(docs/verification/shinsei-stepflow-2026-09-06/shinsei-hero-1400.png)。
- ステップカードの中の道具は、白地・枠線・題名+一言の `.dougu-band-card` が 1 列で入る(shinsei-step4-1400.png)。ステップ6の濃紺(featured)は `/shinsei` では使っていない。
