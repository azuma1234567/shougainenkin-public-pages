# 「申請の流れ ― 8つのステップ」を左→右に読める形にする (2026-09-05)

> **2026-09-05 精査**: `docs/user-psychology-seisa-2026-09-05.md`(§4)> `docs/page-types-seisa-2026-09-05.md`(§4)> `docs/design-seisa-2026-09-05.md` の順で、この指示書より優先。数字タイルの列は置かない・数字は黒・共通定数を使う。食い違う箇所はそちらに従う。

> **2026-09-05 追記(design-system 後)**: 着手条件は `docs/design-system-2026-09-05-instructions.md` のマージ済み。色・文字サイズ・角丸・影は同書 §1〜§2 のトークン(`--c-*`、8段の文字サイズ)だけを使い、本書やモックに書かれた hex 値・px 値はトークンに読み替える(新しい hex を書かない。数字は黒 `--c-heading`)。部品(結論の箱・カード・道具カード・FAQ・日付ラベル「最終確認日」)は同書 §3 の共通部品を使う。見た目の正は `docs/site-mock-2026-09-05-all/site.html` の該当ボードで、本書のモックはレイアウトの参考。文章は `docs/writing-techniques-2026-09-05.md` §5 の規則に従う。実行順: design-system → ハブ一言 → コラム部品 → stepflow → hub-index → hajimete-jitsurei → top-shinsei(同じ作業ツリーで同時に走らせない)。


対象: `components/platform/StepFlow.tsx` と `app/platform.css` の `.step-flow*`。
使われている場所: トップ(`app/page.tsx`)と `/shinsei` のヒーロー(`ShinseiRestyled.tsx`)。**両方で同じ部品**なので、直すのは1か所。
モック: `docs/site-mock-2026-09-05-stepflow/stepflow-mock.html`(ブラウザで開いて幅を変えると3段階が見える)。

## §1 いまの何が読みにくいか

現行は「4+4 の2列、それぞれ縦に進む」レイアウト。読者の目は 1→2→3→4 と下がったあと、右上の 5 まで戻らなければならない。しかも道具カードの有無で各列の高さが違うので、1 の横に 5、3 の横に 7 が来ず、**横に並んでいるものに順序の意味が無い**。8個は一目で追える数(5〜7)を超えているのに、区切りも無い。

## §2 直す形(モックのとおり)

- **1行に 1→8 を横に並べる。** 番号の円を線でつなぎ、線は左から右へ。番号の下にステップ名(2行)。
- **道具カードは、そのステップの真下**に置く(3・4・5・6 の4枚。6 は塗りつぶしのまま)。カードが無いステップは下が空く。これで「流れ」の行と「道具」の行が分かれ、流れだけを一直線に読める。
- **上に4つの区切り**(2ステップずつ): 「確かめる」「そろえる」「書く」「出す・待つ」。8個を4組に分けて追いやすくする。**装飾であり見出しではない**ので `aria-hidden`。文言はこの4つで固定(制度の新しい分類を作らない。ステップ名の要約)。
- リードは「初診日の確認から結果が届くまで。左から右へ、順番に進みます。」に。

### 幅ごとの切り替え

| 幅 | 形 |
|---|---|
| 1181px〜 | 1行×8列。区切りあり |
| 701〜1180px | 4列×2行(1〜4 / 5〜8)。区切りなし。4 の右の線は消す。行間 36px |
| 〜700px | 縦一列(現行スマホと同じ向き)。番号の下に縦線、道具カードは番号の右の列に |

DOM の順序は常に 1→8。並びは CSS grid だけで変える。

## §3 実装の指定

- ルートは `<ol class="step-flow" aria-label="申請の流れ 8つのステップ">`、各ステップは `<li class="step-flow-node" data-n="1..8">`。区切りも `<li class="step-flow-phase" aria-hidden="true">`(`<ol>` の子は `li` しか置けない。**`nth-of-type` は区切りの li を数えてずれるので使わない**。`[data-n="4"]` のように data 属性で当てる。モックで一度この罠を踏んだ)。
- 番号の円 40px、`--platform-primary`。線 2px `--platform-border`、円の中心の高さ(top 19px)。道具のあるステップは円の外に `#e8f4fc` の輪(`box-shadow: 0 0 0 4px #fff, 0 0 0 6px #e8f4fc`)。
- ステップ名は `STEPS` の文字列を使い、PC では2行に割る(`初診日を / 確認する` のように、助詞の後で)。割る位置は `STEPS` に `<br>` を入れず、`{title: "初診日を確認する", split: 4}` のような1項目を足して分ける。**スマホでは割らない**(1行で収まる)。
- ステップ名は `/shinsei#step-N` へのリンク。道具カードは現行どおり `placementCard(placement).href`。**カードの文言は `data/dougu.ts` の `shinseiSteps` をそのまま使う**(変えない)。
- 道具カードの中の見出し 15px、説明 13px。カードは `align-content:start`。
- ホバーは現行の `inset box-shadow` を踏襲。
- 区切りの文言は `StepFlow.tsx` の定数 `PHASES = ["確かめる","そろえる","書く","出す・待つ"]`。

## §4 変えないもの

- `STEPS` の8つの名前と順番。
- `data/dougu.ts`(道具の文言・配置)。
- `/shinsei` の本文(`shinsei-steps` 以下)。ヒーローの `StepFlow` だけが変わる。
- HowTo の JSON-LD(`ShinseiRestyled.tsx`)。

## §5 検証

1. `npm run typecheck && npm run build`。
2. Playwright で `/` と `/shinsei` を 1500 / 1000 / 390px で撮り、`docs/verification/stepflow-2026-09-05/` に置く。**モックの3枚と並べて**、番号の並び・線・カードの位置が同じ形になっていることを目で確認。
3. 1500px で、番号 1〜8 の円の **y 座標が全部同じ**(±1px)であること(横一直線の証明)。`page.locator('.step-flow-node .step-flow-number')` の boundingBox で確認して結果を書く。
4. 1000px で 1〜4 と 5〜8 がそれぞれ同じ y、390px で x が全部同じ。
5. キーボードで Tab を押すと 1→8 の順に道具カードとステップ名に止まる(DOM 順の確認)。
6. `node scripts/prelaunch-check.mjs` の × が B-1・B-3・B-10 から増えない。
7. `docs/verification/stepflow-2026-09-05/RESULT.md` に 1〜6 の結果。

commit: `feat(top): 申請の流れを左から右へ読めるステッパーにする`。main に merge して push。

## §6 貼るコマンド

```
cd ~/Projects/shougainenkin-public-pages && git checkout main && git pull --ff-only && git checkout -b codex/stepflow-yokonarabi && claude "docs/stepflow-yokonarabi-2026-09-05-instructions.md を読み、モック docs/site-mock-2026-09-05-stepflow/stepflow-mock.html のとおりに StepFlow.tsx と platform.css を直してください。§4 の変えないものを守り、§5 の検証をすべて行って RESULT.md を書き、main に merge して push してください。"
```
