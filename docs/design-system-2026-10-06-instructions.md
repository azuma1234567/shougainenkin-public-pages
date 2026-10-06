# デザインシステムの制定(第1段: 定義のみ、記事と見た目は変えない) — 2026-10-06

## 目的と範囲

サイトの見た目を刷新する前に、色・書体・余白・部品・動きの決まりを 1 本に定める。この段では **公開ページの描画結果を変えない**。やるのは、(1) いまの `app/globals.css`(3,305 行)に散っているトークンと部品を棚卸しし、(2) 決まりを `docs/design-system.md` に書き、(3) トークンを `app/design-tokens.css` に切り出して `globals.css` から参照させ、(4) 部品の見本ページを noindex で置く、まで。差し替え(第2段)は 10/13 の数字を見てから別に指示する。

方向は「公的文書を美しく組む」。白い紙に印刷しても通じる見た目を保ったまま、色数を絞り、書体を揃え、余白を一定にし、触ったときの反応を丁寧にする。世界観や装飾(ファンタジー・イラスト・アイコン乱用)は入れない。読者の多くは当事者とその親世代で、制度の書類を手にした状態で来る。

## 守ること(変えない)

- 記事本文・h2 の並び・lead・内部リンク・FAQ・JSON-LD は触らない。verify:columns(★含む)・verify-aio・verify:site-graph・prelaunch:check がすべて通ること。
- フォントは既存のサブセット運用(`scripts/fonts-src`、`build-font-subset.mjs`、`verify-fonts.mjs`)のまま。新しい書体を足さない。Google Fonts の読み込みは引き続き禁止(LCP の件)。
- 描画結果の差分を検査する: 第1段の最後に、代表 12 ページ(トップ・hajimete・columns 3 本・gokai 1・jitsurei・dougu/moushitatesho・byoki 1・nayami 1・support・about)を 375px と 1280px で before/after スクリーンショットし、ピクセル差分が 0 であることを報告(トークン切り出しが純粋なリファクタであることの証明)。

## 1. 棚卸し(最初にやる・報告のみ)

`globals.css` と `platform.css` から次を抽出して `docs/verification/design-system-2026-10-06/inventory.md` に:

- 使われている色の全一覧(hex/rgba、出現回数、どのセレクタか)。`--green` 系が実際は青(#0273ad)である件を含め、名前と実体のずれを列挙。
- font-size・line-height・font-weight の全組み合わせと出現回数。
- margin/padding/gap に使われている値の分布(rem/px)。
- border-radius・box-shadow の種類。
- transition/animation の全一覧(プロパティ・時間・イージング)。`prefers-reduced-motion` の扱い。
- 部品の一覧: 結論の箱(lead)、次に読む、誤解カード、裁決リード、表(横スクロール)、FAQ、出典、CTA(App Store)、Breadcrumb、ArticleToc、SiteHeader/Footer、ツール類(dougu)、jitsurei の一覧カード、hub の章カード。各部品が使っているクラス名と、重複している定義。
- `.mt-redesign` や platform.css の役割(別デザインが混在しているなら、その範囲)。

## 2. 決めること(`docs/design-system.md` に書く)

### 2-1. 色(トークンは意味で命名し、`--green` のような実体名はやめる)

- `--ink`(本文文字)/`--ink-muted`/`--ink-faint`
- `--paper`(地)/`--paper-deep`(帯・箱の地)/`--paper-card`
- `--line`(罫線)/`--line-strong`
- `--primary`(サイトの 1 色。現行 #0273ad を起点に、本文地との コントラスト 4.5:1 以上を確認)/`--primary-deep`/`--primary-wash`(薄い地)
- `--mark`(強調の地、マーカー)
- 意味色は 3 つだけ: `--ok` `--warn` `--danger`。装飾には使わない。使う場所を限定(裁決の容認/棄却の札、期限の警告、エラー)。
- 色数の上限: 無彩色 5 段 + primary 3 段 + 意味色 3 + mark 1。これ以外の hex を globals.css に残さない(棚卸しで出た孤立色は最寄りのトークンへ寄せる。ただし第1段では **描画が変わらない範囲で** = 完全一致の値だけを置換し、近似置換は第2段の候補として一覧に残す)。
- ダークモードは今回定義しない(読者層と印刷性を優先)。`color-scheme: light` を明示。

### 2-2. 書体

- 見出し: Zen Old Mincho(現行のまま)。h1/h2 のみ。h3 以下はゴシック。
- 本文: システムゴシック(Hiragino Sans → Yu Gothic → Noto Sans JP → system-ui)現行のまま。
- 数字: 表と金額に `font-variant-numeric: tabular-nums`。
- 型スケールを 6 段で固定: 本文 17px / 小 15px / 注 13px / h3 19px / h2 24px / h1 30px(モバイル)〜34px(PC)。line-height は本文 1.85、見出し 1.4。字間: 本文 0.01em、見出し 0.02em、英数字の見出し(TYPING のような)は使わない。
- 本文の行長は現行 `--content: 42rem` を維持(全角 40 字前後)。
- 文中太字は使わない(検査2 と同じ方針)。強調は `--mark` のマーカーだけ。

### 2-3. 余白

- 基本単位 8px。`--space-1`〜`--space-8`(8/12/16/24/32/48/64/96)。
- 段落間 1.2em、h2 上 48px・下 16px、h3 上 32px・下 8px、箱の内側 16px(モバイル)/24px(PC)、箱同士 24px。
- 横の余白は現行 `--gutter: 1.25rem`(20px)を 16px に寄せるかは第2段で判断(今回は現行維持)。

### 2-4. 部品(見本ページに 1 つずつ置く)

各部品に「役割・使う場所・使わない場所・状態(通常/hover/focus/active)」を 1 段落ずつ。

- 結論の箱(lead): 地 `--paper-deep`、左罫 `--primary` 3px、角丸 `--radius`。
- 次に読む: 1 行、矢印、hover で矢印が 4px 右へ。
- 誤解カード(gokai 一覧): 押せることが分かる(hover で 1px 浮く + 影 `--shadow-md`、active で戻る)。typingmusou から取り込むのは **この手触りだけ**。
- 裁決リード: 札(容認=`--ok`、棄却/却下=`--ink-muted`)+ 1 行要旨 + PDF/実例リンク。
- 表: 横スクロールの影(端が切れていることを示す)、見出し行の地 `--paper-deep`、数字は右寄せ tabular。
- FAQ: 開閉なし(AIO のため全文表示を維持)。Q を `--primary-deep` の太字、A は通常。
- 出典: 13px、`--ink-muted`。
- CTA(App Store): 1 ページ 2 か所まで。地 `--paper-deep`、ボタンは primary。
- ボタン: primary(塗り)/secondary(罫)/text の 3 種。最小タップ領域 44px。
- リンク: 本文中は下線あり(親世代に分かるように)、色 `--primary-deep`、visited は `--ink-muted`。
- フォーカス: すべての操作可能要素に 2px の `--primary` アウトライン(offset 2px)。
- Breadcrumb / Toc / Header / Footer: 現行の構造のまま、トークンに寄せる。

### 2-5. 動き

- 時間は 3 つだけ: 120ms(hover の色)/200ms(浮く・矢印)/320ms(開閉・出現)。イージングは現行 `--ease` 1 つ。
- `prefers-reduced-motion: reduce` で transition と animation をすべて 0 に。
- ページ読み込み時のアニメーションは入れない(LCP と、画面が動くことを嫌う読者のため)。動くのは触ったときだけ。

### 2-6. 印刷

- `@media print` で、ヘッダー・フッター・CTA・次に読む・Toc を非表示、リンクの下線を残し、本文を黒、箱の地を白 + 罫線に。A4 で 1 記事が崩れずに出ることを 1 本(shinsatsu-mae-memo)で PDF 出力して確認。

## 3. 実装(第1段の範囲)

1. `app/design-tokens.css` を新設し、2-1〜2-3・2-5 のトークンを定義。`globals.css` の `:root` を、旧名(`--green` など)を新トークンのエイリアスとして残す形で置換(`--green: var(--primary)`)。描画は変わらない。
2. `app/dev/design/page.tsx` に部品の見本ページ(`robots: noindex`、sitemap 除外、verify:site-graph の対象外に)。各部品を実データ(実在の記事 1 本の lead、実在の誤解カード、実在の裁決 1 件)で描く。
3. `docs/design-system.md` に 2 章の決まりを書く。棚卸しで見つかった「第2段で直す候補」(近似色、ばらついた余白、重複部品)を末尾に一覧。
4. before/after の差分検査(上記 12 ページ × 2 幅)。差分 0 を確認してから 1 コミット、push。差分が出たら原因を直してから。
5. prelaunch:check に「globals.css に hex 直書きが増えていない」検査を 1 項目足す(第1段の棚卸し時点の数を上限として)。

## 4. 報告してほしいこと

- 棚卸しの要点(色の総数と孤立色の数、font-size の組み合わせ数、transition の数)。
- 見本ページの URL と、375px の全体スクリーンショット 1 枚。
- 差分検査の結果(12 × 2 = 24 枚、すべて 0 か)。
- 第2段の候補一覧(何を直すとどのページの見た目が変わるか)。これを見て、10/13 の数字と合わせて第2段の順番を決める。
