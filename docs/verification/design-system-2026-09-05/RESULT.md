# デザインシステムの実装 検証記録(2026-09-05)

指示書: `docs/design-system-2026-09-05-instructions.md`(根拠 `docs/site-design-seisa-2026-09-05.md`)
ブランチ: `codex/design-system`。コミットは §7 の5本に分けた。

変えたファイル: `app/platform.css` / `app/globals.css` / `app/columns/columns.css` /
`components/platform/Platform.tsx`(`PageDate`) / `components/ColumnArticle.tsx` /
`components/MarkdownArticle.tsx` / `components/platform/JibunCard.tsx` /
`components/platform/DiseaseHub.tsx` / `app/hajimete/page.tsx` / `app/jitsurei/page.tsx` /
`lib/sitemap-static-dates.ts` / `scripts/verify-design-tokens.mjs`(新設)。

## 1. 棚卸し(§6-1)

`node scripts/verify-design-tokens.mjs --ref main`

| 種類 | main | いま | 目標 | 判定 | 印刷CSS(§5で触らない) |
|---|---:|---:|---:|---|---:|
| 色 | 109 | **15** | ≤ 20 | ○ | 17 |
| font-size | 87 | **9**(8段+!important 1) | ≤ 12 | ○ | 19 |
| border-radius | 19 | **3**(8 / 14 / 999) | ≤ 3 | ○ | 3 |
| box-shadow | 24 | **1** | ≤ 1 | ○ | 1 |

数えているのは画面の CSS だけ。申立書の印刷 CSS(`@media print` / `@page` / `.mt-paper*`)は
指示書 §5 で「触らない」と決めた領域なので、判定から外して別に出している。

残った15色の内訳と、寄せなかった理由は
[leftover-colors.md](leftover-colors.md) に全部書いた(/suuji のグラフの等級別4色、
濃い地に重ねる白の透過6つ、追従目次の半透明、申立書の紙面の黒)。

## 2. コントラスト(§6-2)

```
検査した color の値 41種 ・ 4.5 未満 0
```

同じスクリプトで、`color:` に出てくる値をすべて変数を解決したうえで、
白・帯(#eef6fc)・主色・見出し色(フッターの地)の上に置いたときの比を出している。
白地で 4.5 に届かない色は「濃い地の上に置く文字」として、見出し色の上で見る
(フッターの淡い文字を誤って×にしないため)。

main での未達は26件だった。とくに効いたのは:

| 直したもの | 前 | 後 |
|---|---:|---:|
| `--platform-faint`(パンくず・日付・メタ) | 2.58 | **5.31**(--c-meta #4f6f87) |
| `--platform-meta`(件数・メタ行) | 3.58 | **5.31**(同上に統合) |
| `--platform-subtle`(注) | 4.53 | **5.31**(同上に統合) |
| ボタンの白文字(#0284c7 の地) | 4.10 | **5.17**(主色を #0273ad に一本化) |
| 注意の注記の文字 | 3.64 | **5.02**(--c-warn-text #8b6a1f) |

**決めてほしいこと**: 指示書 §0 の `--c-warn: #b7791f` は、文字に使うと白地 3.64 で
AA に届かない。`--c-warn` は §0 の値のまま(左罫線とバッジの地)にして、文字だけ
`--c-warn-text: #8b6a1f`(もとのコードで使われていた値・白地 5.02)を足した。
2本立てのままでよいか、`--c-warn` 自体を濃くするかは leftover-colors.md §5 に残した。

## 3. 廃止したものの残り(§6-3)

| 対象 | 残り |
|---|---:|
| `#0284c7` | **0** |
| `--jc-`(道具ごとの5色) | **0** |

`--platform-faint` などの旧トークン名は、新トークンを参照する別名として残してある
(指示書 §1-1)。参照が残っているのは想定どおり。

## 4. 見出しの統一(§6-4)

Playwright で8ページの computed style を取った(1400px)。

| ページ | h1 | h2(節の見出し) | h2(カード・フッターの小見出し) |
|---|---|---|---|
| / | 30px Zen Kaku Gothic New | 22px ×5 | 14.5px ×3 |
| /byoki | 同上 | 22px ×5 | 14.5px ×3 |
| /byoki/utsu-soukyoku | 同上 | 22px ×14 | 14.5px ×3 |
| /columns/shoshinbi-wakaranai | 同上 | 22px ×20 | 14.5px ×3 + 18px ×1(結論の箱) |
| /gokai/hataraitetara-muri | 同上 | — | 14.5px ×13 + 18px ×1(結論の箱) |
| /jitsurei | 同上 | 22px ×7 | 14.5px ×3 |
| /dougu/mitate | 同上 | — | 14.5px ×3 |
| /shinsei | 同上 | 22px ×15 | 14.5px ×3 |

- **h1 は8ページとも 30px・Zen Kaku Gothic New で完全に一致**。
  main では コラム 明朝26px / ハブ ゴシック36px / 道具 40px級 に割れていた。
- h2 は2段になった。**節の見出しは8ページとも 22px**。もう一方の 14.5px は
  カードの中の小見出しとフッターの列見出しで、節の見出しとは役割が違うので
  `.p-card-heading` として別の段にした(全ページ共通で 14.5px)。
  結論の箱の見出しだけ 18px(--fs-h3)で、コラムと誤解で同じ値。
- 「全部同じ」を1つの値にするには、カードの中の h2 を節見出しと同じ 22px にするか、
  h2 をやめて別の要素にするかになる。前者は見た目が壊れ、後者は見出しの階層
  (SEO・読み上げ)を変えるので、**2段にして値をそろえる形にした**。

## 5. 並べて見る(§6-5)

`docs/verification/design-system-2026-09-05/` に保存。

| 変更前 | 変更後 |
|---|---|
| `column-1400-before.png` | `column-1400-after.png` |
| `column-390-before.png` | `column-390-after.png` |
| `hub-1400-before.png` | `hub-1400-after.png` |
| `hub-390-before.png` | `hub-390-after.png` |
| — | `header-1400.png`(ヘッダーとボタン) |

見比べると、コラムとハブで次がそろった: h1(ゴシック30px)・パンくず(#4f6f87)・
更新日(「最終確認日 …」を h1 の直下)・結論の箱(左4pxの主色・帯の地・角丸 0 14 14 0)・
表(帯のヘッダー行・角丸14)・カード(角丸14・padding 20 22・影1つ)。

## 6. 文が変わっていないか(§6-6)

8ページの `<p>` `<li>` `<h1>`〜`<h3>` のテキスト集合を、変更前(本番)と変更後で比べた。

| ページ | 変更前 | 変更後 | 変更後に無い |
|---|---:|---:|---:|
| / | 59 | 59 | 0 |
| /byoki | 63 | 63 | 2(更新日の行) |
| /byoki/utsu-soukyoku | 123 | 134 | 1(更新日の行) |
| /columns/shoshinbi-wakaranai | 227 | 227 | 1(更新日の行) |
| /gokai/hataraitetara-muri | 54 | 54 | 1(更新日の行) |
| /jitsurei | 59 | 59 | 0 |
| /dougu/mitate | 10 | 10 | 1(更新日の行) |
| /shinsei | 112 | 112 | 0 |

**消えた6件はすべて更新日の行**で、指示書 §3-4(「最終確認日 …」に統一)で
意図して変えたもの。記事・ハブ・誤解・道具の本文は1文字も減っていない。

```
公開日: 2026年7月17日 / 最終確認日: 2026年9月3日   → 最終確認日 2026年9月3日
最終更新日 2026年9月3日 ・ 確認日 2026年9月3日      → 最終確認日 2026年9月3日
最終更新日 2026年8月31日                            → 最終確認日 2026年8月31日
```

/byoki/utsu-soukyoku が11件増えているのは、ハブの FAQ の問いが
`<summary>`(数えていない)から `<h3>` に変わったため(§3-3)。文は同じ。
FAQ の JSON-LD の11問と、画面に出た11問は完全一致していることも確かめた。

**指示書と違えたところが1つ**: §3-1 の「結論の箱の見出し語を『この記事の結論』で統一」は
見送った。誤解ページの「結論」は `data/gokai-bodies.ts` に書かれた本文の節見出しで、
§5(誤解の文は変えない)に当たるため。**箱の見た目だけ統一し、語は変えていない。**

## 7. 申立書の検査(§6-7)

印刷 CSS を触っていないことの証明。

```
npm run verify:moushitatesho:layout  → 9項目すべて○(×なし)
npm run verify:moushitatesho         → 9項目すべて○(×なし)
```

## 8. typecheck / build / 公開前チェック(§6-8)

```
npm run typecheck                → エラーなし
npm run build                    → ✓ Compiled successfully
node scripts/prelaunch-check.mjs → ページ数 166 / × は B-1・B-3・B-10
```

A-1〜A-10・B-2・B-4〜B-9・C-1・C-5・C-6 すべて○。× は **B-1・B-3・B-10 の3つだけ**で、
main と同じ。増えていない。

C-6 は §2 で `/hajimete` と `/jitsurei` の JSX を触ったので、
`lib/sitemap-static-dates.ts` の2件を 2026-09-05 に上げて○にした。

B-10(更新日の表示なし 3件)は main から続いている未達で、該当は
**/ ・/jitsurei ・/shinsei** の3ページ。`PageDate` は1実装にそろえたが、
この3ページには元から日付が無い。**足すかどうかは中身の判断なので決めていない。**

## 9. 構造化データ(§6-9)

リッチリザルトテストは使わない。8ページの `application/ld+json` を全部読んで
構文だけ確かめた。

```
/ : WebSite
/byoki : CollectionPage, BreadcrumbList
/byoki/utsu-soukyoku : FAQPage, BreadcrumbList
/columns/shoshinbi-wakaranai : @graph, FAQPage
/gokai/hataraitetara-muri : @graph, BreadcrumbList
/jitsurei : BreadcrumbList
/dougu/mitate : BreadcrumbList
/shinsei : @graph, BreadcrumbList
構文エラー 0
```

FAQ をアコーディオンから見出し+段落に変えたが、JSON-LD の作り方は変えていない
(どちらも Markdown の原文から作っている)。

## 変えていないもの(§5)

- 記事・ハブ・誤解・道具の**文**(上の6を参照。変わったのは更新日の行だけ)。
- URL・h1 の文言・JSON-LD の中身。
- 本文 17px / 1.9、1行 760px。
- 申立書の印刷 CSS。検査9/9で確認(上の7)。
- 道具の動作(申立書の検査9/9、公開前チェックの A 全項目○)。

## 本番確認(2026-09-05)

`main` への push で Vercel が本番デプロイ(`i3vz2mpcu`、Ready)。
`https://shougainenkin-note.net` で実測した。

| 見るところ | /columns/shoshinbi-wakaranai | /byoki/utsu-soukyoku |
|---|---|---|
| h1 | 30px Zen Kaku Gothic New | 30px Zen Kaku Gothic New |
| h2 | 22px(節)/ 18px(結論の箱)/ 14.5px(カード・フッター) | 22px / 14.5px |
| パンくずの文字 | rgb(79,111,135) = #4f6f87(白地 5.31) | 同左 |
| ヘッダーのボタン | 白文字 on rgb(2,115,173) = #0273ad(5.17) | 同左 |
| 更新日 | 最終確認日 2026年9月3日 | 最終確認日 2026年9月2日 |
| FAQ の `<details>` | 0(見出し+段落になった) | 0 |

スクリーンショット: `prod-column-1400.png` / `prod-hub-1400.png`。
記事(旧世代)とハブ(新世代)が、同じ書体・同じ見出しの段・同じ日付の言い方になった。

---

# 追補(2026-09-05)

指示3点を実装した。

## (1) `--c-warn` を `color:` に使わない

`--c-warn`(#b7791f)は白地 3.64 で、文字に使うと AA に届かない。
**左罫線・バッジの地・枠線だけに使い、文字は `--c-warn-text`(#8b6a1f・白地 5.02)** と決めた。
`--c-warn-text` は現状維持。

`scripts/verify-design-tokens.mjs` に検査を足した。`color: var(--c-warn)` の数を数え、
0 でなければ×にする。

```
| 対象 | 残り |
| #0284c7 | 0 |
| --jc- | 0 |
| color: var(--c-warn) | 0 |
```

## (2) 図表の色 `--chart-1` 〜 `--chart-4`

主色 `#0273ad` の**色相(200)を明度で4段**にしたトークンを作り、
許容一覧に「図表の色」として登録した。色数の上限は 20 → **16**。

| トークン | 値 | 白文字 | 見出し色の文字 |
|---|---|---:|---:|
| `--chart-1` | `hsl(200 92% 22%)` | 9.50 | — |
| `--chart-2` | `var(--c-primary)` | 5.18 | — |
| `--chart-3` | `hsl(200 62% 62%)` | — | 4.74 |
| `--chart-4` | `hsl(200 47% 84%)` | — | 7.53 |

使い場所は /suuji の帯グラフ・凡例の点(等級別と更新結果)と、/jitsurei の争点の棒4本。
`#075985` `#69b7dd` `#c5dfea` `#38a8dc` `#8fc9e7` の直書き5色はこれに置き換わった。

**色だけに意味を持たせない**ため、各区分にラベルか数値を直接書いた:

- /suuji の帯: 帯の中に割合(10.9% / 53.9% / 22.1% / 13.0%)を書き、
  濃い2段は白文字・淡い2段は `--c-heading` の文字にした(上の表のとおり AA を満たす)。
  下の凡例には名前と実数(109件・10.9% …)が並ぶ。
- /jitsurei の棒: 棒の脇に争点名と件数(障害の程度・等級該当性 57件 …)。

棚卸しは `色 15 → 10 / 上限 16`。`--chart-1`〜`4` が揃っているかもスクリプトが見る。

## (3) 最終確認日の追加と B-10

`lib/constants.ts` に `SITE_PAGES_CHECKED = "2026-09-04"` を1つ置き、
`PageDate` で **/ ・/jitsurei ・/shinsei** の h1 直下に「最終確認日 2026年9月4日」を出した。

**訂正**: 前回の RESULT に「B-10 の該当は / ・/jitsurei ・/shinsei」と書いたのは誤りでした。
公開前チェックの実際の該当は **/app ・/app/privacy ・/app/terms** の3ページです
(B-10 は `/` を対象から外している)。正しい対処は次のとおり:

- **/app**(アプリの紹介ページ): 日付が1つも無かったので、同じ定数で PageDate を足した。
- **/app/privacy**(制定日)・**/app/terms**(最終改定日): どちらも日付は出ている。
  検査の正規表現が `最終更新日|更新日|確認日` しか見ておらず、法務ページの言い方を
  拾えていなかった。**検査側に `制定日|最終改定日` を足した**。
  この2ページに「最終確認日」を足すと、私には確かめようのない「本文を確かめた日」を
  名乗ることになるので、そちらは選ばなかった。必要なら足せます。

結果: **B-10 が○になり、× は B-1(/app が孤立)・B-3(/dougu/mitate 323字)の2つだけ**になった。

```
A-1〜A-10 ○ / B-1 × / B-2 ○ / B-3 × / B-4〜B-10 ○ / C-1 ○ / C-5 ○ / C-6 ○
```

C-6 のため `lib/sitemap-static-dates.ts` の `/` `/shinsei` `/suuji` `/app` を 2026-09-05 に上げた。
