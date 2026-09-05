# コラム47本の部品(要約・止まり所・固定目次・次に読む) — Claude Code 実装指示書

作成日: 2026-09-05
対象: `components/ColumnArticle.tsx` `components/MarkdownArticle.tsx` `components/ArticleToc.tsx` `app/columns/columns.css` と、47本の記事ページ(`app/columns/*/page.tsx`)。本文(`content/columns/*.ts` と原稿)は**1文字も変えない**。
前提: `design-system-2026-09-05-instructions.md` が main にマージ済みであること(§1 のトークン名を使う)。マージ前なら着手しない。
優先順位: `user-psychology-seisa` §4 > `page-types-seisa` §4 > `design-seisa` > `writing-techniques` > 本書。矛盾があれば上位に従い、結果報告に書く。
根拠: `site-design-seisa` §6(順番: design-system → ハブ一言 → **コラム部品** → stepflow → hub-index → hajimete-jitsurei → top-shinsei)。

---

## 0. 何を作るか(結論)

読ませるページ(記事)の離脱5か所(`writing-techniques` §6)に、**新しい文章を書かずに**部品を置く。

| # | 部品 | 置く場所 | 中身の出どころ |
|---|---|---|---|
| 1 | 読む目安 | h1直下のメタ行 | `docs/columns-parts-2026-09-05-checkpoints.json` の `readMinutes`(本文文字数÷500、切り上げ) |
| 2 | この記事の結論(既存) | 現在位置のまま | `lead[]`(既存。見た目だけ §3 の共通部品に統一) |
| 3 | ここまでの要約(止まり所) | 指定した h2 の節の**末尾**(次の h2 の直前)に 3〜4か所 | `lead[k]` を**そのまま再掲**。最初の1か所だけ固定文「ここまで読めば、今日は十分です。」を添える |
| 4 | 固定目次(左レール) | 幅 1181px 以上で本文の左に sticky | 本文の h2(既存 `ArticleToc` と同じ抽出) |
| 5 | 末尾「次にすること」 | 本文の後、`ColumnFooter` の前 | 道具1つ(`PLACEMENTS.columns[slug]` の after、無ければ JSON の `tool`)+ 次に読む3本(各 page.tsx の `relatedSlugs`)+ 固定文「今日はここまでで大丈夫です。」 |

固定文は全47本で同一。個別の文は一切書かない。
理由: 記事は「読ませるページ」で、離脱は 10秒・最初の見出し・記事中盤・末尾で起きる(`page-types-seisa` §1)。読者A(精神・現役・夜・余力なし)は途中で閉じるので、閉じる前に「今日はここまでで足りる」と本人に渡す(`user-psychology-seisa` §2-4 余力なし/先延ばし)。要約はリードの再掲にすると、本文と矛盾せず、原稿の検査(`verify-columns` 検査1)も通る。

---

## 1. データ: `docs/columns-parts-2026-09-05-checkpoints.json`

すでにリポジトリに置いてある。形:

```json
"hatachi-mae": {
 "tool": "kingaku",
 "readMinutes": 13,
 "checkpoints": [
  { "lead": 0, "h2": 0, "h2Title": "...", "leadHead": "..." },
  ...
 ],
 "review": "(3本のみ)人手で確認が要る点"
}
```

- `lead`: `content/columns/<slug>.ts` の `lead[]` の添字。
- `h2`: その記事の**原稿(MarkdownArticle に渡る `source`)に出る `## ` 見出しの 0 始まりの順番**。`h2Title` はその見出し文(照合用)。`よくある質問` `まとめ` `出典` も数える。
- `checkpoints` は `h2` 昇順(本文順)。1記事 4件(= リード4本すべてを、いずれかの節の末尾で1回ずつ再掲する)。
- `review` がある3本(`shinsei-shindoi` `techou-to-nenkin` `shoshinbi-wakaranai`)は §2-3 の規則で確定し、結果報告に採用した `h2` を書く。

この JSON は `data/columns/checkpoints.json` にコピーして import する(docs 側は原本として残す。二重管理を避けるため、`scripts/verify-columns.mjs` で両者の一致を検査する — §6 検査11)。

### 1-2. 配置の規則(自動照合)

実装前に `scripts/check-checkpoints.mjs`(新規、使い捨てでよい)で全47本×4件を照合する:

1. `h2Title` が、`source` の `h2` 番目の `## ` 見出しと一致する(前後空白と全角/半角の記号差は無視)。1件でも不一致なら**実装に進まず**結果報告に書く(JSON の h2 番号が原稿とずれている)。
2. `lead[k]` に含まれる **数字(%, 件, 円, か月, 年, 日, 級)** と、名詞の要点(`leadHead`)が、`h2` 番目の節の本文、または**それより前**の本文に出ていること。出ていなければ、その語が最初に出る節の末尾へ**後ろに**動かす(前には動かさない)。動かした結果 `h2` の順序が入れ替わる場合は、入れ替えて昇順を保つ。動かした件は結果報告に「slug / lead k / h2 旧→新」で列挙する。
3. 動かしても見つからない場合(リードにしかない数字)は、リードの再掲は行い、結果報告に「本文未出」と書く(本文は変えない)。

---

## 2. 部品の仕様

### 2-1. 読む目安(#1)

`ColumnArticle` の `.meta-line` を次の形にする(1行、区切りは「 / 」):

```
公開日: 2026-09-03 / 最終確認日: 2026-09-04 / 読む目安 約13分
```

「約N分」の N は JSON の `readMinutes`。「最終確認日」の語は design-system §3 の統一ラベルを使う(すでにそうなっていればそのまま)。

### 2-2. この記事の結論(#2)

現在の `.column-conclusion`(h2「この記事の結論」+ `lead[]` の段落)は位置・文言・h2 のまま。CSS だけ design-system §3 の「結論の箱」部品(`--c-band` 背景、`--c-border` 罫線、角丸 14px、影なし)に置き換える。
h2 は目次(#4)に**入れない**(現行の `ArticleToc bodyOnly` と同じく `.column-body` の h2 だけを拾う)。

### 2-3. ここまでの要約 = 止まり所(#3)

`MarkdownArticle` に `checkpoints?: { h2: number; text: string; first: boolean }[]` を追加する。パーサが `## ` を数えながら `blocks[]` を作っているので、**次の `## ` に出会った時点**(および source の末尾)で、直前の h2 番号が `checkpoints` にあれば、その h2 のブロック列の末尾に次を差し込む:

```html
<aside class="col-check" aria-label="ここまでの要約">
  <p class="col-check-title">ここまでの要約</p>
  <p class="col-check-body">{lead[k] をそのまま}</p>
  <p class="col-check-rest">ここまで読めば、今日は十分です。続きは、次に開いたときで大丈夫です。</p>  <!-- first のときだけ -->
</aside>
```

- 見出し要素(h2/h3)は使わない(目次・構造化データ・`verify-columns` の見出し検査に影響させない)。
- `col-check-body` の文字列は `lead[k]` と**完全一致**(`apply2026Amounts` 適用後の値。`lead` は content 側ですでに適用済みなのでそのまま渡す)。
- 「よくある質問」「まとめ」「出典」の節には置かない(JSON にもその番号は入っていない)。
- 4件目(最後)の要約は、`まとめ` の前に来ることが多い。まとめと重なって見えるが、まとめは本文、要約はリード再掲なので**両方残す**(本文は変えない)。
- 見た目: `--c-band` 背景、左に 4px `--c-primary` の縦線、角丸 0 8px 8px 0、余白 16px 20px、`col-check-title` は `--c-meta` 13px 太字、本文は 17px/1.9(本文と同じ)、`col-check-rest` は `--c-body-muted` 14.5px。既存の `.column-inline-card` と同じ罫線系にして、部品の種類を増やさない。
- 印刷: そのまま印刷される(隠さない)。

### 2-4. 固定目次(#4)

`ArticleToc` を 2 モードにする。マークアップは1つ、CSS で切り替える:

- **幅 1181px 以上**: `.column-article` を `grid-template-columns: 240px minmax(0, 720px)`、`column-gap: 40px` にし、目次は左列で `position: sticky; top: 24px; max-height: calc(100vh - 48px); overflow: auto`。`<details>` ではなく常時表示(`open` 固定、summary は「目次」のまま見出し扱いで `pointer-events: none`)。現在位置の h2 を `IntersectionObserver` で追い、`aria-current="true"` を付け、`--c-primary` の左線 3px で示す。
- **幅 1180px 以下**: 現行どおり本文の前の `<details>`(761px 以上で open、以下で閉)。
- 目次に入れる h2 の抽出条件は現行(`.column-body` の h2、`related-columns` `references` を除く)を変えない。`col-check` は h2 を持たないので影響なし。
- 左レールは印刷で `display: none`。
- 左レールの下端に、末尾ブロック(#5)へのアンカー「次にすること」を1行だけ置く(固定文)。

h1・結論の箱・メタ行・パンくず・`ColumnThemeBlock` は右列(本文列)に置く。グリッドの左列は目次だけ。

### 2-5. 末尾「次にすること」(#5)

`ColumnArticle` に `ColumnNext` を追加し、`DouguCards position="after"` と `ColumnFooter` の間ではなく、**`DouguCards after` の代わりに**置く(道具カードを二重に出さない):

```
<section class="col-next" aria-labelledby="col-next-title">
  <h2 id="col-next-title">次にすること</h2>
  <div class="col-next-tool">   … 道具カード1枚(既存 DouguCard を1枚だけ) </div>
  <p class="col-next-read-title">次に読む</p>
  <ol class="col-next-read"> … relatedSlugs の3本(title を <a>) </ol>
  <p class="col-next-close">今日はここまでで大丈夫です。</p>
</section>
```

- 道具: `PLACEMENTS.columns[slug]` に `position: "after"` のカードがあればそれ(文言そのまま)。無ければ JSON の `tool` を `data/dougu.ts` の `TOOLS` から引き、`name` を見出し、既存の短文(`blurb` 相当があればそれ、無ければ name のみ)で1枚。**新しい説明文は書かない**。
- `position: "before"` の既存カードはそのまま残す(本番3記事の見え方を変えない)。
- 次に読む: 各 `page.tsx` の `relatedSlugs` の先頭3本(3本未満なら `relatedColumns(slug, relatedSlugs, 3)` で補う)。`ColumnFooter` の「あわせて読みたい」(最大5本)はそのまま残す — 重複してよい(末尾は「3本に絞った次の一歩」、フッターは網羅)。
- この h2「次にすること」は `.column-body` の外なので目次に入らない。
- 見た目: 結論の箱と同じ部品(`--c-band` / `--c-border` / 14px)。`col-next-close` は `--c-body-muted`、太字なし。
- 「今日はここまでで大丈夫です。」の直後に、次の道具や外部リンクを置かない(閉じてよい、で終える)。

### 2-6. 触らないもの

- 本文 markdown、`lead[]`、`faqs`、h1、`title` / `metaTitle`、URL、`relatedSlugs`、`references`、JSON-LD の中身(`columnJsonLd` `faqJsonLd`)。
- 本文の 17px / 1.9、印刷CSS、`AppCta`、`CaseLead`、`ColumnThemeBlock`。
- 手書き記事(`jibun-de-shinsei` など、markdown を通らないもの)は、`checkpoints` を渡せなければ #3 を**出さない**(無理に差し込まない)。該当 slug を結果報告に列挙する。

---

## 3. 見た目の規則(design-system に従う)

- 色は §1 の 11 色だけ。新しい hex を書かない。数字は黒(`--c-heading`)。
- 部品は「結論の箱」「罫線カード(`column-inline-card` 系)」「道具カード」の3種だけを使い回す。新しい影・角丸・枠線パターンを増やさない。
- 幅: 本文列は現行の max-width を維持(変えない)。左レール 240px は 1181px 以上でのみ現れるので、本文の折り返しは変わらない。
- 1180px 以下の見え方は、#1 のメタ行、#3 の要約、#5 の末尾以外、現行と同じであること(スクリーンショット比較で確認 — §6 検査14)。

---

## 4. 実装順(コミット単位)

1. `data/columns/checkpoints.json` + `scripts/check-checkpoints.mjs` + 照合結果(§1-2 の 1〜3)。JSON の h2 を動かした場合はここで両方(docs / data)を直す。
2. `MarkdownArticle` の `checkpoints` prop と `.col-check`、`ColumnArticle` からの受け渡し(`checkpoints.json[slug]` と `column.lead` から生成)。
3. `ArticleToc` の 2 モード + グリッド + 現在位置。
4. `ColumnNext`(#5)+ メタ行(#1)+ 結論の箱の CSS 統一(#2)。
5. `verify-columns.mjs` の検査 11〜13 追加 + `scripts/verify-column-parts.mjs`(§6 検査14)。

各コミットの前に `npm run build` と §6 を通す。push は 5 まで通ってから 1 回。

---

## 5. 実装前に取る基準

変更前の main で、47本の `.column-body` のテキスト(全テキストノードを連結、空白正規化)と、JSON-LD 全部を `docs/verification/columns-parts-2026-09-05/baseline.json` に保存する(`slug → { bodyText, jsonLd[] }`)。§6 検査14 で使う。

---

## 6. 検証(完了条件)

既存の 10 検査(`scripts/verify-columns.mjs`)がすべて通ることに加えて:

| 検査 | 内容 | 合格 |
|---|---|---|
| 11 | `docs/…/checkpoints.json` と `data/columns/checkpoints.json` が同一。47 slug、各4件、`h2` 昇順、`lead` は 0..3 を各1回 | 47/47 |
| 12 | ビルド後 HTML で、各記事の `.col-check` が4つ(手書き記事は0でよく、その slug を報告)。各 `.col-check-body` の文字列が `lead[k]` と完全一致。`.col-check-rest` は先頭の1つだけ | 47/47 |
| 13 | 各記事の `.col-check` が、JSON の `h2` 番目の h2 の**後**かつ次の h2 の**前**にある(DOM 順) | 47/47 |
| 14 | `.column-body` のテキスト連結が baseline と一致(`.col-check` の中身を除いて比較)。JSON-LD が baseline と一致 | 47/47 |
| 15 | `.col-next` が47本にあり、`.col-next-read li` が3、道具カードが1枚、末尾の固定文が一致。`DouguCard` が同じ tool で2枚出ていない | 47/47 |
| 16 | 1280px で `.article-toc` が sticky(`getComputedStyle().position === "sticky"`)、`aria-current` がスクロールで移る。1180px / 390px で従来の `<details>`。390px で横スクロールなし(`scrollWidth === clientWidth`) | 3幅×3記事 |
| 17 | 新規部品の文字色/背景のコントラストが AA(4.5:1)以上。`--c-*` 以外の hex が差分に無い | 0件 |
| 18 | 印刷(`page.pdf()` 相当の emulateMedia print)で左レールが出ない、`.col-check` は出る | 3記事 |
| 19 | 目次の項目数と文言が変更前後で一致(47本)。FAQ JSON-LD の件数が一致 | 47/47 |

Lighthouse は不要。`verify-hub-map` `prelaunch-check` は現行のまま通ること。

---

## 7. 結果報告(この形で)

1. 検査 11〜19 の結果(件数)。
2. §1-2 で動かした checkpoint の一覧(slug / lead / h2 旧→新)と、`review` 3本の確定値。
3. #3 を出せなかった手書き記事の slug。
4. 本文未出の数字(§1-2 の 3)。
5. 判断が要ったこと(あれば)。**本文を変えたくなった箇所があっても変えず、ここに書く**。

---

## 8. Claude Code 用コマンド

```
docs/columns-parts-2026-09-05-instructions.md を読み、その §0〜§7 のとおりに実装してください。前提: design-system-2026-09-05-instructions.md がマージ済みであることを最初に確認し、未マージなら着手せず報告してください。本文・lead・faqs・title・URL・JSON-LD は一切変えないこと。§5 の baseline を最初に取り、§4 の順に5コミット、§6 の検査19項目を通してから git push origin main を1回。§7 の形で報告してください。
```
