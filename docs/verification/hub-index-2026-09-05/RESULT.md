# /byoki・/joukyou 一覧ページ刷新 検証記録(2026-09-05)

指示書: `docs/hub-index-sasshin-2026-09-05-instructions.md`
モック: `docs/site-mock-2026-09-05-hubindex/byoki-mock.html`
対象: `lib/hub-index.tsx`(`renderHubIndex`)、`components/platform/HubIndexList.tsx`(新設)、`app/platform.css`。
`/nayami` `/okane` `/erabu` も同じ部品なので同時に変わった(指示書 §5 のとおり、それでよい)。

## 1. typecheck / build / 公開前チェック

```
npm run typecheck                → エラーなし
npm run build                    → ✓ Compiled successfully
node scripts/prelaunch-check.mjs → ページ数 166 / × は B-1・B-3・B-10
```

直前の main と同じ **B-1・B-3・B-10 の3つだけ**で、増えていない。

`verify-hub-content` の `/nayami/shikyuu-teishi: 本文不一致` は作業前からあるもので、この変更とは無関係
(ハブ本文 `data/hubs/*.json` には触っていない)。

## 2. スクリーンショット

`docs/verification/hub-index-2026-09-05/` に保存。

| ページ | 幅 | 列 | カード | ページ全高 | ヘッダー・フッターを除く |
|---|---|---|---|---|---|
| `/byoki` | 1400px | 3列 | 21枚 | 3,302px | 2,782px |
| `/joukyou` | 1400px | 3列 | 9枚 | 1,742px | 1,222px |
| `/nayami` | 1400px | 3列 | 6枚 | 1,498px | 978px |
| `/byoki` | 1000px | 2列 | 21枚 | 3,727px | 3,207px |
| `/joukyou` | 1000px | 2列 | 9枚 | 2,090px | 1,570px |
| `/nayami` | 1000px | 2列 | 6枚 | 1,709px | 1,189px |
| `/byoki` | 390px | 1列 | 21枚 | 6,450px | 5,397px |
| `/joukyou` | 390px | 1列 | 9枚 | 3,768px | 2,715px |
| `/nayami` | 390px | 1列 | 6枚 | 2,791px | 1,738px |

変更前(本番)の `/byoki` 1400px は **4,095px**(除くと 3,575px)。
`byoki-1400-before.png` に残してある。

## 3. 1400px で /byoki が 3,200px 以内か → **超えている(102px)**

- 実測 **3,302px**。指示書の目標 3,200px を **102px 超過**。
- ただしこの数値にはサイト共通のヘッダー(73px)とフッター(447px)が入っている。
  モックにはどちらも無いので、同じ条件で比べると **2,782px** で、目標内。
- 変更前の 4,095px から **793px 短くなった**(約19%減)。
  指示書の「いまは約5,600px相当」は見積もりで、実測は 4,095px だった。
- モックに寄せて詰められるところは詰めた(`.hub-index .p-section` の上下padding を
  40/40 → 26/32、最後の群の下マージンを 0)。これ以上はカードの `min-height: 150px` や
  行間を削ることになり、モックから離れるのでやめた。**直さずに報告する。**

## 4. カードの「一言」が §3 と完全一致

画面に出た文字列を指示書 §3 の表と突き合わせた(実装の定数ではなく、描画結果と照合)。

```
指示書 §3: 30件 / 画面に出た一言: 30件
完全一致: 30 / 30
```

/byoki 21件 + /joukyou 9件。1文字も変えていない。

## 5. 記事数・実例数

記事数 = `hubColumnSlugs(path).length`、実例数 = `jitsureiFilter`(「傷病=…」の形。`・` は「または」)を
`SAIKETSU_CASES` に当てた件数。**0 のものは出していない**(両方 0 ならメタ行は空)。

抜き取り3件:

| ハブ | 記事 | 実例 | 画面のメタ行 |
|---|---:|---:|---|
| /byoki/utsu-soukyoku | 5 | 13 | 記事 5本 · 実例 13件 |
| /byoki/tekiou-fuan | 3 | 0 | 記事 3本 |
| /byoki/tougou | 0 | 12 | 実例 12件 |

モックの数値(記事7本・実例12件 など)は仮値なので、実データとは違う。
なお `jitsureiFilter` が「心疾患」「肢体」「血液」など、`shobyo` に現れない分類語のハブは実例 0 になる。
これは宣言されたフィルタをそのまま当てた結果で、推測で補っていない。

## 6. 絞り込み

| 入力 | 結果 |
|---|---|
| `ADHD` | ['発達障害'] だけが残る |
| `透析` | ['腎臓病・人工透析'] だけが残る |
| `xyz` | カード 0枚。「「xyz」に当てはまる病気は見つかりませんでした。見つからないときは 悩みから探す か はじめての方へ へ。」/ リンク先 ['/nayami', '/hajimete'] |

JavaScript を切った状態(`javaScriptEnabled: false`)でも **カード 21枚が全部見える**
(`byoki-nojs-1400.png`)。カードはサーバー側で描画しており、絞り込みはブラウザの中だけで動く。何も送信しない。

## 7. JSON-LD

`CollectionPage` + `ItemList`。`numberOfItems` 21、`itemListElement` 21件。

```json
{"@type":"ListItem","position":1,"name":"うつ病・双極性障害","url":"https://shougainenkin-note.net/byoki/utsu-soukyoku"}
```

パンくずの JSON-LD は既存の `Breadcrumb` が出しているので重ねていない。
見出し階層は h1(ページ名) → h2(群名) → h3(病名)。「このページの使い方」も h2。

## 変えていないもの(§5)

- 各ハブ本文(`data/hubs/*.json`)。
- `HUB_INDEX` の `title` `h1` `lead` `description` `groups` の中身。
  `body` は byoki の統計段落だけを群メモへ移し、残りは一覧の下に「このページの使い方」として残した。
- URL・パンくず・メタデータ。

## 本番確認(2026-09-05)

`main` への push で Vercel が本番デプロイ(`dpl_6rg3UW9HmZdtnSoy3FAFrpzhFR4j`、Ready)。
`https://shougainenkin-note.net` の別名が付いていることを確認した。
`npx vercel --prod` は "Not authorized" で失敗したが、Git 連携の本番デプロイが同じコミットで
すでに通っていたため、こちらを本番として検証した。

| 項目 | 結果 |
|---|---|
| /byoki 1400px | 3列・21枚・全高 3,302px(ローカルと一致) |
| /joukyou 1400px | 3列・9枚・全高 1,742px |
| /byoki 390px | 1列・21枚 |
| 一言 | §3 の30件と **30/30 完全一致** |
| 件数 | utsu-soukyoku「記事 5本 · 実例 13件」/ tekiou-fuan「記事 3本」/ tougou「実例 12件」/ tenkan メタなし |
| 絞り込み | ADHD→発達障害、透析→腎臓病・人工透析、xyz→0件の案内 |
| JS 無効 | カード21枚が表示される |
| JSON-LD | CollectionPage + ItemList、numberOfItems 21 |

スクリーンショット: `prod-byoki.png` `prod-joukyou.png` `prod-byoki-390.png`
