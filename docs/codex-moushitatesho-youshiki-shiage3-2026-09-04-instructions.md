# Codex 指示書3: 紙に載ってはいけないものが載っている (2026-09-04)

`01ec610` `4f5acd4` の続き。ブランチ `codex/moushitatesho-youshiki`。
§10 の12項目は認める。ただし**出力した紙そのものに欠陥がある**。検査の網の外側で起きているので、検査ごと足す。

## §1 見つけたもの

`docs/verification/moushitatesho-youshiki-2026-09-04/png/` の PNG を画素で走査した結果:

| 画像 | 現象 |
|---|---|
| `typical-2-main-back.png` ほか**裏面4枚と続紙3枚** | y=588〜591px(4px)に、**幅いっぱいの横線**。色 `rgb(2,115,173)` = `#0273ad` |
| 表面4枚 | 出ていない |

`#0273ad` は `--green`(サイトの主色)。出どころは `app/globals.css` の**読了バー**:

```css
@media (prefers-reduced-motion: no-preference) { @supports (animation-timeline: scroll()) {
  body::after { position: fixed; z-index: 60; top: 0; left: 0; width: 100%; height: 2px;
                background-color: var(--green); animation-timeline: scroll(root block); } } }
```

`position: fixed` なので、`[data-sheet]` を要素スクリーンショットで撮ると、紙のどこかに焼き込まれる(表面に出ないのはスクロール位置の差)。deviceScaleFactor 2 で 2px → 4px、色も一致。**`@media print` の隠す対象に入っていない**。

### 1-2 同じ穴がもう1つ。こちらの方が重い

`components/AnalyticsConsent.tsx` の `.analytics-consent-banner` は `position: fixed; z-index: 100` で、`.no-print` が付いていない。`@media print` が消しているのは `header.site-header, footer, .no-print` の3つだけ。
つまり**同意バナーに答える前に印刷すると、公式様式の上にバナーが刷り込まれる**。読了バーより目立つし、年金事務所に出す紙に載る。

いま急いで確認すべきは、この2つが**実際の印刷(Chrome の印刷プレビュー)でも紙に載るか**。載るなら、いま出せる状態ではない。

## §2 直し方

1. `@media print` の非表示に、少なくとも次を足す:
   - `body::after`(読了バー)
   - `.analytics-consent-banner`、`.analytics-preference-button`
   - `.lp-sticky-cta`(いま使っていなくても、`position: fixed` なので同じ穴)
2. 印刷画面(`/dougu/moushitatesho/insatsu`)では、**画面でも**読了バーと同意バナーを出さない。`.mt-print-page` の下では `body::after { content: none }`。同意バナーは印刷画面に出さない(同意の取得は他のページでできる)。
3. `position: fixed` を新しく足すときに同じことが起きないよう、`@media print` の非表示は「`.no-print` を付ける」を原則にし、上の3つに `no-print` 相当を付ける形でもよい。どちらでも構わないが、**CSS の1か所を見れば分かる形**にする。

## §3 検査9を足す(これが本題)

今回の欠陥は、スロットの中しか見ていないから素通りした。**紙全体**を見る検査を足す:

> **検査9: 紙の上に、様式の線と自分たちの文字以外のインクが無い。**
> 各サンプルの各シートを 300dpi で描画し、全画素を調べる。許すのは
> (a) 白 (b) 無彩色(R,G,B の最大差 ≤ 12。様式の `#231f20` と本文の `#111`、そのアンチエイリアス)
> の2つだけ。**有彩色の画素が1つでもあれば落とす**。落ちたときは色と座標と件数を出す。

これで、色の付いた UI・フォーカスリング・`data-overflow` の赤い枠・将来の追加が、紙に載った瞬間に落ちる。
`.mt-paper-text[data-overflow="true"]` の赤い outline は `@media print` で消えているので、印刷メディアで撮れば通るはず。通らなければそれも直す。

検査9を足したら、**overlay.mjs の PNG を作り直す**(いま `docs/verification/.../png/` にある7枚には青い線が焼き込まれている。RESULT に貼る画像がそれでは意味がない)。

## §4 ついでに確認してほしいこと

- `typical-2-main-back.png` の請求者・電話番号「045 ― 123 ― 4567」の3つ目 `4567` が、右の区画の中央にしては**右に寄って見える**。3区画の右端が欄の右端まで伸びているためではないか。右区画の幅を「2本目の ― の右端 〜 印字された欄の右端」ではなく、**左・中の区画と同じ幅**にするか、実測した記入欄の右端で切る。検査で ±1mm を見ているなら数値を確認して、問題なければ「確認した」とだけ書く。
- 元号の楕円が `・平成・` のように**前後の中黒まで含んで**見える(k=1.257 の結果)。手書きの○に近いので直す必要はないが、`circles.md` に「囲んだ語の左右の中黒に楕円がかかる」ことを一行残す。

## §5 手順

1. §2 の CSS。
2. §3 の検査9を `verify-moushitatesho-layout` に追加(これで9項目)。落ちることを確認 → §2 で直る、の順で見せる。
3. overlay の PNG を作り直す。`git status` で PNG が差し替わっていること。
4. **実際の印刷経路の確認**: Playwright の `page.pdf()` で `/dougu/moushitatesho/insatsu` を A3 で出し、その PDF に有彩色が無いことを確認する(要素スクリーンショットではなく、本物の印刷経路)。これも検査9の一部にする。
5. RESULT.md に「検査9」と、今回の2件(読了バー・同意バナー)を**見つかった欠陥として**記録する。隠さない。
6. `npm run typecheck && npm run test:moushitatesho && npm run build && node scripts/prelaunch-check.mjs && npm run verify:moushitatesho:layout && npm run verify:moushitatesho`。

コミット: `fix(moushitatesho): 紙に画面用の装飾が刷り込まれるのを止め、紙全体の検査を足す`。push はしない。

## §6 報告

- 検査9を足した直後の結果(直す前に何件落ちたか)
- 印刷 PDF でも載っていたかどうか(§5-4)
- §4 の2点

---

## §7 絵文字の判断 → (b) 枠の中も無彩色にする (2026-09-04 追記)

`.mt-slot-text` に `filter: grayscale(1)`(印刷でも効くように `print-color-adjust: exact` と併記)。理由は2つ。

1. **この紙は白黒の書類**。役所のモノクロ複合機に通せば同じ見え方になる。色を落としても**字は1文字も変わらない**ので、設計 §12「文章を書き換えない」に反しない。
2. **検査9に例外を作らない方が大事**。「枠の中は有彩色でもよい」を入れた瞬間、次に枠の中へ紛れ込む本物の欠陥(色付きの装飾、赤い枠、背景)がその穴を通る。検査は「紙の上に有彩色は1画素も無い」のまま、例外なしで維持する。

検査9から「枠の中と外を分けて数える」分岐を外し、**紙全体で有彩色0**に戻す。`max` がそれで通ることを確認する。
