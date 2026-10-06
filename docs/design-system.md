# デザインシステム(2026-10-06 制定・第1段)

サイトの見た目の決まりを 1 本にまとめたもの。方向は「公的文書を美しく組む」。白い紙に印刷しても通じる見た目を保ったまま、色数を絞り、書体を揃え、余白を一定にし、触ったときの反応を丁寧にする。世界観や装飾(イラスト・アイコンの乱用・グラデーション)は入れない。読者の多くは当事者とその親世代で、制度の書類を手にした状態で来る。

- 第1段(この文書と `app/design-tokens.css`、見本ページ `/dev/design`)では **公開ページの描画を変えていない**。旧トークン名は新トークンのエイリアスとして残し、CSS に直書きされていた色のうち新トークンと完全一致する値だけを `var()` に置き換えた(代表 12 ページ × 375/1280px の before/after ピクセル差分 0: `docs/verification/design-system-2026-10-06/diff.md`)。
- 第2段(見た目を変える差し替え)は 10/13 の数字を見てから別に指示する。候補は末尾の一覧。
- 棚卸しの全データは `docs/verification/design-system-2026-10-06/inventory.md`(切り出し前)と `inventory-after.md`(切り出し後)。

## 0. 守ること(変えない)

- 記事本文・h2 の並び・lead・内部リンク・FAQ・JSON-LD は見た目の変更で触らない。verify:columns(★含む)・verify-aio・verify:site-graph・prelaunch:check が通ること。
- フォントは既存のサブセット運用(`scripts/fonts-src`、`build-font-subset.mjs`、`verify-fonts.mjs`)のまま。新しい書体を足さない。Google Fonts は読み込まない(LCP)。
- 見た目を変える変更は、代表 12 ページ × 2 幅のスクリーンショット(`snapshot.mjs` → `diff.mjs`)で、**意図した差分だけ**が出ていることを確かめてから入れる。

## 1. 棚卸しの要点(切り出し前の globals.css 3,305 行 + platform.css 1,235 行 + columns.css 33 行)

| 項目 | 数 |
|---|---|
| 異なる色の値 | 152(hex 119・rgba 33)。トークンに定義されている値 38、どのトークンにも無い孤立色 114(出現 288 回) |
| 名前と実体のずれ | `--green`/`--green-dark`/`--green-tint*` は青(#0273ad 系)。`--marker`/`--accent`/`--gold-wash` は旧・金色アクセントの名残で中立色 |
| font-size の値 | 113 種(605 宣言)。line-height 20 種、font-weight 5 種。font-size × line-height × weight の組み合わせ 283 |
| 余白の値 | 122 種(2,474 個)。8px 格子(4px 刻みを含む)に乗るのは 533 / 1,645 |
| border-radius | 25 種(999px ×46、12px ×37、10px ×34、8px ×28、14px ×26 …) |
| box-shadow | 26 種(トークン 4 つ + 直書き 22) |
| transition | 21 宣言・18 種の値。時間は 0.2s ×15、0.15s ×11、0.12s、0.25s、0.3s、160ms と散っている。イージングは `var(--ease)` 29・`ease` 2 |
| animation | 読了バー(scroll-timeline)と用語のフラッシュ(2.2s)の 2 つ。reduced-motion では 0.01ms |
| 部品の重複 | FAQ 4 系統、カード 7 系統、ボタン 6 系統以上、パンくず 3 系統、ヘッダー/フッターは globals.css と platform.css で二重定義(後勝ち) |
| 未定義のまま参照されているトークン | `--platform-navy`・`--platform-blue`・`--platform-blue-soft`・`--platform-line`(宣言が無効になり親の色を継承している) |

## 2. 決まり

### 2-1. 色(`app/design-tokens.css`)

トークンは意味で命名する。`--green` のような実体名は新しく使わない(旧名はエイリアスとして残っているだけ)。

| トークン | 値 | 役割 |
|---|---|---|
| `--ink` | #1e3a4d | 本文文字(--paper 上 11.4:1) |
| `--ink-muted` | #4a6a80 | 補足・メタ(白地 5.7:1) |
| `--ink-faint` | #6e8ba0 | 日付・件数(白地 3.6:1。13px 以下では使わず、使うなら太字か 19px 以上) |
| `--paper` | #f7fbfe | ページの地 |
| `--paper-deep` | #eef6fc | 帯・箱の地(結論の箱・表の見出し行・引用) |
| `--paper-card` | #ffffff | カードの地 |
| `--line` | #dcebf5 | 罫線 |
| `--line-strong` | #cfe6f5 | 強い罫線(表の区切り・h2 の下線) |
| `--primary` | #0273ad | サイトの 1 色。リンク・左罫・塗りボタン。白地 5.17:1、--paper 4.97:1、--paper-deep 4.74:1 |
| `--primary-deep` | #015d8c | hover・FAQ の Q(白地 7.1:1) |
| `--primary-wash` | #e3f2fc | 薄い地(チップ・次に読む) |
| `--mark` | rgba(2,132,199,.13) | 強調の地(マーカー)。文中太字の代わり |
| `--ok` | #067647 | 裁決の容認の札(地 #e8f6ef で 5.1:1) |
| `--warn` | #8b6a1f | 期限の警告(地 #fdf3dd で 4.6:1) |
| `--danger` | #b3261e | エラー(白地 6.5:1) |

- 意味色は 3 つだけ。装飾には使わない。使う場所は裁決の容認/棄却の札、期限の警告、入力エラーに限る。
- 色数の上限: 上の表の 15 色。これ以外の hex を globals.css に増やさない(prelaunch:check B-11 が直書きの数を見張る。上限は第1段直後の 292)。孤立色は第2段で最寄りのトークンへ寄せる(第1段では完全一致の値だけ置換した)。
- ダークモードは定義しない(読者層と印刷性を優先)。`color-scheme: light` を明示。
- 第 2 の青 `--platform-primary`(#0284c7、白地 4.1:1 で 4.5:1 を満たさない)は第1段では残している。第2段で `--primary` に統合するのが候補 1 番。

### 2-2. 書体

- 見出し: Zen Old Mincho(自前サブセット、700 のみ)。h1/h2 だけ。h3 以下はゴシック。platform 系ページ(トップ・ハブ・道具)の h1 は Zen Kaku Gothic New 700 で、これも現行のまま。
- 本文: システムゴシック(`--font-body`: Hiragino Sans → Hiragino Kaku Gothic ProN → Yu Gothic → Noto Sans JP → system-ui)。
- 数字: 表と金額に `font-variant-numeric: tabular-nums`。
- 型スケール 6 段(`--text-*`): 本文 17px / 小 15px / 注 13px / h3 19px / h2 24px / h1 30px(モバイル)〜34px(PC)。line-height は本文 1.85、見出し 1.4。字間は本文 0.01em、見出し 0.02em。英数字だけの大見出しは使わない。
- 本文の行長は `--content: 42rem`(全角 40 字前後)を維持。
- 文中太字は使わない(verify:columns 検査 2 と同じ)。強調は `--mark` のマーカーだけ。
- 第1段ではスケールを定義しただけで、113 種ある font-size はまだ寄せていない。

### 2-3. 余白

- 基本単位 8px。`--space-1`〜`--space-8` = 8 / 12 / 16 / 24 / 32 / 48 / 64 / 96。
- 段落間 1.2em。h2 は上 48px・下 16px、h3 は上 32px・下 8px。箱の内側は 16px(モバイル)/ 24px(PC)。箱同士は 24px。
- 横の余白は現行 `--gutter: 1.25rem`(20px)を維持。16px に寄せるかは第2段で判断。

### 2-4. 部品(見本: `/dev/design`。noindex・sitemap 外)

各部品の「役割・使う場所・使わない場所・状態」。クラス名と定義場所は inventory.md §7。

- **結論の箱(lead)** `.column-conclusion`: 記事冒頭に 1 つ。地 `--paper-deep`、左罫 `--primary` 3px、角丸 `--radius`。本文の中では使わない。状態なし(押せない)。
- **次に読む** `.column-next`: 結論の箱の直後に 1 行、矢印つき。hover で矢印が 4px 右へ(200ms)。記事に 1 つだけ。
- **誤解カード(一覧)** `.gokai-card`: 押せることが分かる。hover で 1px 浮く + `--shadow-md`、active で戻る。typingmusou から取り込むのはこの手触りだけで、色や装飾は取り込まない。
- **裁決リード** `.gokai-case`: 札(容認 = `--ok`、棄却/却下 = `--ink-muted`)+ 1 行要旨 + PDF/実例リンク。記事中と誤解カード中で同じ見た目。
- **表** `.article-table-wrap`: 横スクロールの端に影(切れていることを示す)。見出し行の地 `--paper-deep`。数字は右寄せ・tabular。スマホで縦積みにしない(columns.css の方針を全体に)。
- **FAQ** `.column-faq-question`: 開閉なし(AIO のため全文表示)。Q は `--primary-deep` の太字、A は通常。hub の `details.hub-faq-item` も第2段で開閉なしへ寄せる。
- **出典** `.references`: 13px、`--ink-muted`。リンクは下線あり。
- **CTA(App Store)** `.app-cta`: 1 ページ 2 か所まで。地 `--paper-deep`、ボタンは primary。
- **ボタン**: primary(塗り `--primary`、文字白)/ secondary(罫 `--primary`、文字 `--primary-deep`)/ text(下線リンク)の 3 種だけ。最小タップ領域 44px。hover は 120ms で色、active で戻る。ツールごとの独自ボタンはこの 3 種に寄せる。
- **リンク**: 本文中は下線あり(親世代に分かるように)。色 `--primary-deep`、visited は `--ink-muted`。platform 系の「下線なし」は第2段で見直す。
- **フォーカス**: すべての操作可能要素に 2px の `--primary` アウトライン(offset 2px)。現行は 3px。
- **Breadcrumb / Toc / Header / Footer**: 構造は現行のまま、色と余白をトークンに寄せる。Breadcrumb の 3 系統は 1 つに。

### 2-5. 動き

- 時間は 3 つだけ: `--duration-fast` 120ms(hover の色)/ `--duration` 200ms(浮く・矢印)/ `--duration-slow` 320ms(開閉・出現)。イージングは `--ease` 1 つ。
- `prefers-reduced-motion: reduce` で transition と animation をすべて 0 に(現行は 0.01ms。実質同じ)。
- ページ読み込み時のアニメーションは入れない。動くのは触ったときだけ。読了バー(`body::after` の scroll-timeline)は「触ったとき」ではないので第2段で要否を決める。

### 2-6. 印刷

- `@media print` で、ヘッダー・フッター・CTA・次に読む・Toc・道具カードを非表示。リンクの下線を残し、本文を黒、箱の地を白 + 罫線に。
- A4 で 1 記事が崩れずに出ることを shinsatsu-mae-memo で確認する。
- 第1段の現状(`docs/verification/design-system-2026-10-06/print-shinsatsu-mae-memo.pdf`、A4 12 ページ。`print-media-shinsatsu-mae-memo-794.png` は print メディアでの描画): ヘッダー・フッターは消えるが、CTA・次に読む・目次・道具カードは印刷されている。本文の文字色は画面と同じ #1e3a4d、結論の箱の地は薄青のまま、本文リンクの下線は print で消えている(親世代が紙で見たときにリンクだと分からない)。崩れ(はみ出し・重なり)は無い。これらを直すのが第2段の候補 17。

## 3. 第2段の候補(何を直すと、どのページの見た目が変わるか)

優先度は 10/13 の数字(表示回数 ÷ ユーザー、CTR、滞在)と合わせて決める。

| # | 候補 | 変わるページ | 備考 |
|---|---|---|---|
| 1 | `--platform-primary`(#0284c7)を `--primary`(#0273ad)に統合。`.mt-redesign` の `--mt-primary`・`.jc--mitate` も | トップ・全ハブ・一覧・道具・誤解カード・コラムの「次に読む」左罫と h2 左罫(platform-primary を使っている) | 第 2 の青を無くす。4.5:1 未満の青を無くす |
| 2 | 見出し色 #14425e(`--green-deep`/`--platform-heading`、直書き 15 か所)を `--ink` か `--primary-deep` に寄せる、または `--ink-strong` を 1 つ足す | コラムの h1〜h3、ハブの見出し、誤解カードの h3 | 無彩色 5 段の数え方(本文 3 + 地 3 + 罫 2 = 8 名)と合わせて決める |
| 3 | 近似色の統合: #d7e9f5(19)→`--line`、#f4faff/#f4fafe/#eef7fc/#e8f4fc → `--paper-deep` か `--primary-wash`、#fbfdff(`--card-warm`)→ `--paper-card`、#b9dced/#8cc8e8/#9db9ca/#8db4c9 → `--line-strong` | 道具(kingaku・mitate・moushitatesho・shorui・madoguchi)、column-theme-block、hub-sibling-links、gokai-filters | 1〜2px の色差。並べないと分からない |
| 4 | 見立てツール(.mi-*)の独自グレー #526575/#263746/#71808d/#cbd5df/#bbbbbb → `--ink-muted`/`--ink`/`--ink-faint`/`--line` | /dougu/mitate だけ | 44 か所 |
| 5 | 警告箱の黄系(#fdf3dd/#8b6a1f/#f0e2bd/#6b5316)を `--warn` 1 色 + 地に統一 | kingaku・mitate・shorui の注意箱、jitsurei の札 | 意味色の限定 |
| 6 | ~~未定義トークンの修正~~ **済(2026-10-06)**: `--platform-navy`=見出し色、`--platform-blue`=--primary、`--platform-blue-soft`=--paper-deep、`--platform-line`=--line | ハブ本文(.hub-content)の h2/h3・FAQ の summary が見出し色に、引用に左罫と薄青の地、関連ハブのリンクが青に。49 ハブ(引用があるのは 4 ハブ)。/columns は fallback があったので変わらず | before/after: docs/verification/design-system-2026-10-06/c6-before-after-*.png、diff-c6.md |
| 7 | font-size 113 種 → 6 段、line-height 20 → 2 | 全ページ | 最も影響が大きい。記事ページ → platform の順で |
| 8 | 余白を 8px 格子に(1,112 個が格子外)。h2/h3 の上下、箱の内側を 2-3 の値に | 全ページ | 7 と同時に |
| 9 | border-radius 25 → 3(8/10/12)。999px の丸チップは 8px に(ピル型をやめる方針の徹底) | チップ・札・フィルタ(gokai-filters・p-chip・p-label・column-theme-links) | 2026-08 の方針の積み残し |
| 10 | box-shadow 22 直書き → 4 トークン | カード類・道具の紙面プレビュー | |
| 11 | transition 18 種 → 3 時間 × 1 イージング。`ease` 2 か所を `--ease` に | hover のあるもの全部 | 見た目というより手触り |
| 12 | FAQ 4 系統 → 開閉なし 1 系統(hub の details を開く) | ハブ本文の FAQ、申請の流れの FAQ | AIO にも効く |
| 13 | カード 7 系統 → 1 つの `.card` + 修飾(押せる/押せない) | 一覧ページ全部 | 誤解カードの hover(1px 浮く)はここで |
| 14 | ボタン 6 系統 → 3 種、タップ領域 44px、フォーカス 2px | 道具・申請の流れ・フィルタ | |
| 15 | Breadcrumb 3 系統 → 1 つ | コラム・ハブ・見立て | 構造(ol/li)はコラム版に |
| 16 | globals.css の死んだヘッダー/フッター定義(濃紺)を削除 | 変わらない(platform.css が後勝ち) | 掃除だけ。差分 0 を確認して入れる |
| 17 | 印刷用 CSS(2-6) | 印刷時だけ | PDF で確認 |
| 18 | 出典 13px・`--ink-muted`、本文リンク `--primary-deep`、visited `--ink-muted` | コラム全記事 | 文字の読みやすさに直結。親世代の確認を |
| 19 | 読了バー(body::after)の要否 | 全ページ | 「動くのは触ったときだけ」との整合 |
| 20 | app/jitsurei/page.tsx の style 属性の色を CSS へ | /jitsurei | 掃除 |

## 4. 運用

- 新しい色が要るときは `app/design-tokens.css` に意味で名前を付けて足し、CSS からは `var()` で使う。globals.css に hex を直書きしない(B-11)。
- 見本ページ `/dev/design` に部品を 1 つ足したら、この文書の 2-4 にも 1 段落足す。
- 第2段の各候補は 1 候補 1 コミット。`snapshot.mjs before` → 変更 → `snapshot.mjs after` → `diff.mjs` で、意図したページだけに差分が出ていることを確認してから push。
