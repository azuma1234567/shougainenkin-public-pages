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

---

# §3 改稿の反映(2026-09-05)

指示書 `docs/hub-index-sasshin-2026-09-05-instructions.md` の §3 が改稿され、
**30件すべてが「当てはまる側」から書き直された**ので、実装を差し替えた。
今回は §3 だけ。§2・§4〜§5 は 36309e4 のまま触っていない。

例(/byoki/utsu-soukyoku):

```
前: いちばん標準的なケース。病名ではなく、診断書の…
後: うつ病でも双極性障害でも請求できます。病名ではなく、診断書の…
```

## 検証

**1. 指示書との一致 → ○**

`npm run verify:hub-hints`(新設)。指示書の表と `lib/hub-index.tsx` の
`HUB_HINTS` / `HUB_ALIASES` を突き合わせる。

```
指示書の一言 30件 / 実装 30件
指示書の別名 10件 / 実装 10件
先頭に 不支給・対象外・却下・打ち切り・無理・通らない を置いたもの: 0件
○ すべて一致。
```

**2. 画面に出た文字列との一致 → ○**
描画された HTML から取り出した30件と、指示書の表が **30/30 完全一致**。

**3. 絞り込み → ○**
`ADHD` → 発達障害 / `透析` → 腎臓病・人工透析 / `線維筋痛症` → 難病・その他の病気。
別名10件は指示書のまま。

**4. 見た目 → ○**
/byoki は3列21枚(1400px)・1列21枚(390px)、/joukyou は9枚。
ページ全高は 1400px で 3,367px(一言が少し長くなったぶん 3,302 → 3,367)。
`hints-byoki-1400.png` / `hints-byoki-390.png` / `hints-joukyou-1400.png`。

**5. typecheck / build / 公開前チェック → ○**
```
npm run typecheck / npm run build → エラーなし
node scripts/prelaunch-check.mjs  → ページ数 166 / × は B-1・B-3 の2つだけ
```
(B-10 はデザインシステムの追補で解消済み)

`lib/sitemap-static-dates.ts` の `/byoki` `/joukyou` を 2026-09-05 に上げた。

---

# モック site.html の /byoki 板に合わせる(2026-09-05)

指示書の先頭の注記どおり、優先順位は
`user-psychology-seisa §4` > `page-types-seisa §4` > `design-seisa` > `writing-techniques §4` >
本指示書。見た目の正は `docs/site-mock-2026-09-05-all/site.html` の **/byoki の板**。
色・文字サイズ・角丸・影は design-system のトークンだけを使い、新しい hex を書いていない。

## 直したところ(モックとの差)

| 箇所 | 前 | 後(モックの板) |
|---|---|---|
| 絞り込み | 一覧の上に、ラベル付きの四角い入力欄 | **ヒーローの分類チップと同じ行**、右端に寄せた丸い欄。虫めがね + 「病名で絞り込む(ADHD、透析…)」 |
| 分類チップ | 文字は見出し色、件数は薄い別書式 | 白地・主色の文字・件数も同じ書式(`精神・発達 9`) |
| カード | padding 18px、min-height 150px、影なし | **padding 20px 22px(`--card-pad`)・影 1つ(`--shadow`)・min-height なし** |
| 「このページの使い方」 | 見出し h2 + 大きめの箱 | モックの `.sum`(帯の地・角丸8・小さい見出し語) |
| ヒーローの余白 | 上44px 下32px | **上28px 下24px**(モックの `.hero`) |
| 節の余白 | 上26px 下32px | 上26px 下26px |

絞り込みの欄はヒーローに移したので、検索の状態を
`components/platform/hubIndexFilter.ts`(モジュール内の小さなストア)で持ち、
ヒーローの `HubIndexSearch` と一覧の `HubIndexList` が同じ語を見る形にした。
どちらもブラウザの中だけで動き、何も送信しない。

欄の枠線はモックが `#9db9ca` だったが、新しい hex を書かない決まりなので
`1px solid var(--c-primary)` にした(操作できるものは主色、という原則どおり)。

## §6 の検証

**1. typecheck / build / 公開前チェック → ○**
```
npm run typecheck / npm run build → エラーなし
node scripts/prelaunch-check.mjs  → ページ数 166 / × は B-1・B-3 の2つ
```
B-10 は 2026-09-05 の design-system 追補で解消済みなので、いまの × は
**B-1(/app が孤立)と B-3(/dougu/mitate 323字)だけ**。増えていない。
`verify-hub-content` の `/nayami/shikyuu-teishi: 本文不一致` は作業前からのもので無関係。

**2. スクリーンショット → ○**
`mock-{byoki,joukyou,nayami}-{1400,1000,390}.png` の9枚と、
`mock-byoki-hero.png` / `mock-byoki-filter-adhd.png` / `mock-byoki-filter-none.png` /
`mock-byoki-nojs.png`。

| ページ | 1400px | 1000px | 390px |
|---|---|---|---|
| /byoki | 3列・21枚 | 2列・21枚 | 1列・21枚 |
| /joukyou | 3列・9枚 | 2列・9枚 | 1列・9枚 |
| /nayami | 3列・6枚 | 2列・6枚 | 1列・6枚 |

**3. 1400px で /byoki の全21カードが 3,200px 以内 → ○(3,198px)**
サイト共通のヘッダー(73px)とフッター(442px)を含めて **3,198px**。
モックにはヘッダー・フッターが無いので、同じ条件で比べると 2,683px。
本番の変更前は 4,095px だった。

**4. 一言が §3 と完全一致 + 先頭12文字の禁止語 → ○**
`npm run verify:hub-hints`(指示書の表と実装の突き合わせ):
```
指示書の一言 30件 / 実装 30件
指示書の別名 10件 / 実装 10件
先頭12文字に 不支給・対象外・却下・打ち切り・無理・通らない があるもの: 0件
○ すべて一致。
```
描画された HTML から取り出した30件との突き合わせも **30/30 完全一致**、
画面の一言の**先頭12文字**にも禁止語 **0件**。

**5. 記事数・実例数 → ○**
`hubColumnSlugs` と `SAIKETSU_CASES` の実数。0 のものは出さない。

| ハブ | 画面のメタ行 |
|---|---|
| /byoki/utsu-soukyoku | 記事 5本 · 実例 13件 |
| /byoki/tekiou-fuan | 記事 3本 |
| /byoki/tougou | 実例 12件 |
| /byoki/tenkan | (空) |

**6. 絞り込み → ○**
`ADHD` → 発達障害だけ、`透析` → 腎臓病・人工透析だけ、`xyz` → 0件で
「「xyz」に当てはまる病気は見つかりませんでした。見つからないときは 悩みから探す か はじめての方へ へ。」
JavaScript を切っても **カード21枚が全部見える**(絞り込みの欄も出るが、
カードはサーバー側で描画しているので一覧は成立する)。

**7. JSON-LD → ○**
`CollectionPage` + `ItemList`、`numberOfItems: 21`、`itemListElement` 21件、
`ListItem` の `@type`/`position`/`name`/`url` に欠けなし。
`page-types-seisa §4` のとおり、リッチリザルトテストではなく **schema.org のバリデータ**で見る
(公開 URL が要るので、デプロイ後に本番 URL で実施し、下に追記する)。

## 変えていないもの(§5)

- 各ハブ本文(`data/hubs/*.json`)。
- `HUB_INDEX` の `title` `h1` `lead` `description` `groups` の中身。
- URL・パンくず・メタデータ。
- `/nayami` `/okane` `/erabu` は同じ部品なので見た目が変わる(それでよい)。

`lead` の「あなたの病気で、どこが見られるのかから確認してください。」は、
`writing-techniques §5` の「『あなた』は使わない」に反しているが、
§5 で「lead は変えない」と決まっているので**触っていない**(直すなら別の指示で)。

`lib/sitemap-static-dates.ts` の `/nayami` `/okane` `/erabu` を 2026-09-05 に上げた
(`/byoki` `/joukyou` は前回上げ済み)。

## 本番確認(2026-09-05)

`main` への push で Vercel が本番デプロイ(`pw1kotrv4`、Ready)。
`https://shougainenkin-note.net/byoki` の実測:

| 見るところ | 結果 |
|---|---|
| ページ全高(1400px) | **3,198px**(ローカルと同じ) |
| 列とカード | 3列・21枚 |
| カードの padding | 20px 22px |
| 絞り込みの位置 | ヒーローの中(チップと同じ行) |
| 絞り込み ADHD | 発達障害だけ |
| 一言 | 指示書の30件と **30/30 完全一致**、先頭12文字の禁止語 **0件** |

構造化データは schema.org のバリデータに公開 URL を渡して確認した
(`page-types-seisa §4` のとおり、リッチリザルトテストは使わない)。

```
https://shougainenkin-note.net/byoki
→ エラー 0 / 警告 0 / 検出オブジェクト 2(CollectionPage + BreadcrumbList)
```

スクリーンショット: `prod-byoki-1400.png`。
