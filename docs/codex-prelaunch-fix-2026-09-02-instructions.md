# 公開前チェック(2026-09-02)の×を全部つぶす — Codex 指示書

対象リポジトリ: `shougainenkin-public-pages`
根拠: `docs/verification/prelaunch-2026-09-02/RESULT.md`(HEAD d53b143 時点の結果)
この指示書の作成: 2026-09-02(Claude)。判断の理由は各段の冒頭に書いた。理由に納得できない場合も、指示のとおりに実装してから RESULT に異議を書くこと。

## §0 貼り付け用コマンド(Codex にこのまま渡す)

```
docs/codex-prelaunch-fix-2026-09-02-instructions.md を読み、§1 から §8 を番号順に実装してください。
各段の「完了条件」を満たしたら、その段だけを1コミットにしてから次へ進んでください(コミット文は各段に書いてあります)。
最後に §9 のとおり npm run prelaunch:check を再実行し、docs/verification/prelaunch-2026-09-02/RESULT-after.md に結果を書いてください。
守ること:
- 既存47記事(content/columns/*.ts)の本文は、§1-3 の1か所(ninteibi-jigojusho の「111,300円」→「111,242円」)以外、1文字も変えない。URL・slug・h1 も変えない。
- 数字は data/amounts.ts と docs/gokai/gokai-cards-addon-2026-09-02.json にあるものだけを使う。自分で新しい金額・統計を書かない。
- X/Twitter/YouTube/note などの調査元・アカウント名・「ツイート」という語を出力に入れない。
- 医師の視点の文章を書かない。主語は「国のガイドラインでは」「日本年金機構は」にする。
- npm run build が通ること。tsc だけで済ませない。
```

## 全体像(なぜこの順番か)

| 段 | 項目 | 何をするか | 判断 |
|---|---|---|---|
| §1 | A-8 金額 | 検出ルールを「amounts.ts の値、またはその和・×1.25・÷12 で説明できること」に変える。既裁定者3額+障害手当金を amounts.ts に追加 | 18件の未登録額は全件検算済みで誤りゼロ。直書きの解消はしない(派生値の二重管理になる) |
| §2 | B-9 パンくず構造化データ | `Breadcrumb` コンポーネントが JSON-LD を出す。コラム47本は既に持っているので二重にしない | 共通1か所で103ページ |
| §3 | B-10 更新日 | 9ページに `最終更新日` を出す | 1行ずつ |
| §4 | B-3 索引5本 | `/byoki /nayami /joukyou /okane /erabu` に本文を足す(文面は本書にある) | 113〜269字は薄すぎる |
| §5 | B-1 孤立 | `/byoki/shikaku` を索引と関連ハブから引く。法務系4ページは検査対象外にする | |
| §6 | B-2 / C-2 | B-2 はパンくず由来を除外。C-2 は対象外にする | 分割sitemapは 50,000 URL 超の話 |
| §7 | B-3 誤解カード48枚 | `docs/gokai/gokai-cards-addon-2026-09-02.json` を data/gokai.ts に取り込み、3ブロックを描画 | 9/3 08:00 から X の流入先。247〜387字では薄い |
| §8 | 手順書 | 検査項目の変更を prelaunch-check の冒頭コメントと RESULT に記録 | |
| §9 | 再実行 | 全項目の期待値を照合 | |

---

## §1 A-8 — 金額チェックの基準を変える

### 1-1 data/amounts.ts に4額を追加

`AMOUNTS_2026` に次を足す(キー名はこのとおり)。

```ts
basicGrade1Old: "1,056,125",           // 昭和31年4月1日以前生まれの1級
basicGrade2Old: "844,900",             // 同 2級
employeesGrade3MinimumOld: "633,700",  // 同 3級最低保障
disabilityAllowanceMinimum: "1,271,000", // 障害手当金の最低保障(3級最低保障×2)
```

`apply2026Amounts` の挙動は変えない。

### 1-2 scripts/prelaunch-check.mjs の A-8 を書き換える

現在の A-8 は「直書きファイル数」と「amounts.ts に無い10万円以上の額」を数えている。これを次に変える。

1. **直書きの件数は判定に使わない**(参考として件数だけ出力に残す)。
2. 出力HTMLの `\d{1,3}(,\d{3}){1,2}円` を全部拾い、10万円以上のものを次の順で「説明」する。
   - amounts.ts の値そのもの
   - amounts.ts の値 2〜4個の**和**(子の加算は同じ値を2回使ってよい)
   - 上記の **×1.25**(1級)
   - 上記の **÷12**(月額)、または **÷12×2**(2か月分)。丸め誤差は **±100円** まで許す
   - 前年度額として明示されているもの: 本文の同じ段落に「前年度」「令和7年度」がある場合のみ許す(現状 831,700 の1件)
   - 「超」の整数表現: amounts.ts の値 +1 円(現状 3,761,001 の1件)
3. 説明のつかない額だけを `未説明額: <path>: <額>` として列挙し、**0件で○**。
4. 説明のついた額は、`説明済み: <額> = <式>` の形で RESULT の A-8 付記に全件出す(次回の人が検算できるように)。

期待結果: 18件すべてが説明済みになり、A-8 は○。もし説明のつかない額が出たら、その額は**直さずに** RESULT に書いて止める(人の判断が要る)。

### 1-3 唯一の本文修正

`content/columns/ninteibi-jigojusho.ts` の `月約111,300円` を `月約111,242円` に変える(ikura-moraeru と同じ 1,334,900÷12)。**この1か所以外、既存記事の本文は触らない。**

### 完了条件
- `npm run prelaunch:check` で A-8 が○、説明済み一覧に18件。
- `git diff --stat` に content/columns が ninteibi-jigojusho.ts の1ファイル・1行だけ。

コミット: `test(prelaunch): A-8 を「amounts.ts から導出できるか」の検算に変え、既裁定者額と障害手当金を登録する`

---

## §2 B-9 — Breadcrumb コンポーネントで BreadcrumbList を出す

### 2-1 実装

`components/platform/Platform.tsx` の `Breadcrumb` に `jsonLd?: boolean`(既定 `true`)を足す。`true` のとき、`lib/seo.ts` の `breadcrumbJsonLd()` を使って `<script type="application/ld+json">` を nav の直後に出す。

- `items` のうち `href` が無い最後の項目は、`path` を**現在のページのパス**にする。現在のパスは `usePathname` を使わず、呼び出し側から `currentPath` を渡す形にする(サーバーコンポーネントのまま保つ)。
  - 型: `Breadcrumb({ items, currentPath, jsonLd = true })`
  - `currentPath` が無い場合は最後の項目を `item` 無しの ListItem にせず、**最後の項目を JSON-LD から落とす**(Google は最後の要素の item を省略できるが、ここでは落として安全側にする)。
- `href` の無い中間項目は出てこない前提だが、もし来たら JSON-LD からは落とす。

### 2-2 呼び出し側

`Breadcrumb` を使っている14ファイル(`grep -rln "Breadcrumb " app components lib`)を全部見て、`currentPath` を渡す。動的ページ(`[slug]`)はその slug から組み立てる。

**コラム記事だけ例外**: `components/ColumnArticle.tsx` は `lib/columns.ts` の `columnJsonLd()` がすでに BreadcrumbList を `@graph` に持っている。ここは `jsonLd={false}` を渡し、二重にしない。

### 2-3 検査

prelaunch-check の B-9 に「BreadcrumbList が**2つ以上**あるページ」も数える行を足し、0件であること。

### 完了条件
- B-9 ○(BreadcrumbList なし 0、2つ以上 0)。
- B-8 の構造化データ検査でエラー 0 のまま。
- 任意の3ページ(`/byoki/utsu-soukyoku` `/gokai/techou-ga-nai` `/yougo`)のHTMLで、ListItem の `item` が `https://shougainenkin-note.net/...` の絶対URLになっている。

コミット: `feat(seo): パンくずコンポーネントから BreadcrumbList を出力し、103ページに構造化データを足す`

---

## §3 B-10 — 更新日の表示(9ページ)

### 3-1 部品

`components/platform/Platform.tsx` に `PageDate({ updated, checked })` を足す。

```tsx
<p className="p-page-date">
  <time dateTime={updated}>最終更新日 {和暦なしの yyyy年M月d日}</time>
  {checked ? <> ・ 確認日 <time dateTime={checked}>{同形式}</time></> : null}
</p>
```

CSS は `app/platform.css` に `.p-page-date { font-size: 12.5px; color: var(--platform-muted); margin: 6px 0 0; }`。

### 3-2 各ページの日付の出し方(固定値を埋めない)

| ページ | updated の出どころ |
|---|---|
| `/columns` | `COLUMNS` の `dateModified` の最大値 |
| `/gokai` | `data/gokai.ts` に `GOKAI_UPDATED = "2026-09-02"` を足して参照(§7 でカードを更新するので同日) |
| `/byoki /nayami /joukyou /okane /erabu` | その kind のハブJSONの出典に書かれた「確認日」の最大値。`data/hubs/*.json` の `source` から `確認日 (\d{4}-\d{2}-\d{2})` を全部拾って max を取るヘルパーを `lib/hub-content.ts` に足す |
| `/about` `/support` | ページ内に `const UPDATED = "2026-09-02"` を置く(内容を変えたら手で更新する。コメントにそう書く) |

配置は各ページの hero(h1 の直下、lead の後)。

### 完了条件
- B-10 ○(表示なし 0)。
- `/columns` の日付が、最新の記事の dateModified と一致している。

コミット: `feat(site): 一覧・索引・案内ページに最終更新日を表示する`

---

## §4 B-3 — 索引5本の本文

`lib/hub-index.tsx` の `HUB_INDEX[kind]` に `body: string[]`(段落の配列)を足し、`renderHubIndex` で hero の後・カード一覧の前に `<section className="p-section hub-index-body"><div className="p-container hub-reading-width">` として段落を描画する。リンクは `→ ラベル(/path)` 形式ではなく、段落内の `[ラベル](/path)` を `Link` に変換する小さな関数で処理する(ハブの `HubLanding` に同等の処理があるなら流用する)。

以下の文面を**そのまま**使う。数字はすべて既存ページに載っている公的統計・令和8年度額。

### /byoki

```
病名で探すページです。同じ「うつ病」でも、初診日にどの制度に入っていたか、いまの生活にどれだけ支障があるかで結果は変わります。だから各ページは、病名の説明ではなく、「その病気で審査に見られるところ」「診断書の様式」「つまずきやすい場所」の順に並べています。
病名が2つ以上ある人は、生活の支障がいちばん大きい病気のページから読んでください。精神と身体の両方がある場合は、診断書が2枚になることがあります。
令和6年度に新しく決まった障害年金のうち、精神の障害の診断書によるものは70.3%でした。不支給の割合は、内部疾患(心臓・腎臓・糖尿病など)が20.6%と高く、外部障害は10.8%、精神は12.1%です。病気によって、気をつける場所が違います。
病名が一覧にないときは、[悩みから探す](/nayami)か、[はじめての方へ](/hajimete)へ。
```

### /nayami

```
手続きの順番ではなく、「いま止まっているところ」で並べたページです。初診日が分からない、診断書で困っている、不支給と言われた、更新が不安、さかのぼって請求したい。どれも、同じ場所で同じようにつまずく人が多い悩みです。
各ページは、まず「あなたの状況を確かめる質問」から始まります。読む前に、手元に年金証書や診断書の控えがあれば出しておいてください。
当サイトが整理した裁決事例91件では、争点は障害の程度が57件、初診日が35件、診断書が15件、納付要件が10件でした。悩みの多くは、この4つのどれかに入ります。
どれに当てはまるか分からないときは、[はじめての方へ](/hajimete)から。
```

### /joukyou

```
病名が同じでも、働いているか、一人暮らしか、20歳前に初診があるか、で見られるところが変わります。このページは、いまの暮らし方から入る入口です。
働いている人は、働けている「条件」が審査の材料になります。一人暮らしの人は、支援の有無と、できていない実態が材料です。20歳前に初診がある人は、納付要件が問われない代わりに、本人の所得制限があります。
国のガイドラインは、労働に従事していることだけで日常生活能力が向上したとは捉えない、と書いています。一人暮らしについても、その理由や時期を考慮するとしています。状況は不利の理由ではなく、書き方が変わるだけです。
自分の状況が2つ以上重なる人は、両方のページを読んでください。矛盾はしません。
```

### /okane

```
いくら受け取れるのか、税金はどうなるのか、他の制度とどう重なるのか。お金まわりの疑問をここにまとめています。
先に骨組みだけ。障害基礎年金は2級で年847,300円、1級で年1,059,125円(令和8年度)。障害厚生年金は給与と加入期間で変わりますが、3級でも最低保障が年635,500円あります。子がいれば1人目・2人目は各243,800円が上乗せ。年金生活者支援給付金は1級で月7,025円、2級で月5,620円です。
税金はかかりません。貯金があっても関係ありません。差押えもされません。ただし健康保険の扶養では収入として数えます。ここが、いちばん驚かれるところです。
金額は毎年4月に改定されます。このページの数字は令和8年度のもので、各ページに確認日を書いています。
```

### /erabu

```
自分で申請するか、アプリを使うか、社会保険労務士に頼むか。ここは、その比べ方のページです。
先に事実を3つ。請求に国へ払う手数料はありません。報酬を得て代行できるのは、法律上、社会保険労務士だけです。「年金機構公認」の代行はありません。
自分でやる人がいちばん困るのは、申立書と診断書の整合です。頼む人がいちばん困るのは、費用の相場と、依頼先の見分け方です。どちらの困りごとも、それぞれのページに具体的に書いています。
書類集めの体力がないこと自体が、依頼を検討する十分な理由になります。逆に、体力があって時間もあるなら、自分で出して不支給でも審査請求の道は残ります。決めるのはあなたですが、材料はここに揃えました。
```

### 完了条件
- 5ページとも 500字以上(B-3 の一覧から消える)。
- `/okane` の金額は §1 の検算を通る(すべて amounts.ts の値)。

コミット: `content(index): 索引5ページに、使い方と根拠の本文を足す`

---

## §5 B-1 — 孤立ページ

### 5-1 /byoki/shikaku

`lib/hub-index.tsx` の `HUB_INDEX.byoki.groups` の `paths` に `/byoki/shikaku` が入っていないのが原因のはず(`renderHubIndex` は groups に無いハブを描画しない)。確認して、「身体・感覚の障害」相当のグループに足す。groups が無い設計なら、`PUBLISHED_CONTENT_HUBS` から漏れている理由を探す。

あわせて本文からのリンクを2本足す(索引だけだと B-1 の趣旨を満たさない):
- `data/hubs/byoki-tounyou.json` の「関連するページ」相当の箇所に `→ 目の障害(糖尿病網膜症など)(/byoki/shikaku)`
- `data/hubs/byoki-nanbyou.json` の同箇所に `→ 目の障害(/byoki/shikaku)`

JSON の `source` 文字列の**末尾の関連リンク群にだけ**足す。本文の段落は変えない。

### 5-2 法務系ページ

`/about /privacy /terms /quality /support` は、フッターからのリンクが正常な設計。prelaunch-check の B-1 に `UTILITY_PAGES` として除外リストを作り、付記に「フッターのみで可」と書く。

### 完了条件
- B-1 ○(孤立 0、除外 5)。

コミット: `fix(byoki): 目の障害ハブへの導線を索引と関連ハブに足し、法務ページを孤立検査から外す`

---

## §6 B-2 と C-2 — 検査項目の見直し

### 6-1 B-2

被リンク数の集計から、次を除外する:
- `nav[aria-label="パンくずリスト"]` 内のリンク
- `.gokai-back`(誤解カードの「一覧へ戻る」)

除外後に50本超が残ったら、それは本物なので RESULT に残す(たぶん残らない)。

### 6-2 C-2

分割sitemap は作らない。理由: Google の分割要件は 50,000 URL または 50MB。157ページでは効果がなく、管理対象が増えるだけ。

- prelaunch-check の C-2 を `record("C-2", ..., null, "対象外(157ページ・単一 sitemap.xml で十分。50,000 URL 超で再検討)")` に変え、判定を「手動」扱いにする。
- C-3 の付記「C-2 の分割後に sitemap-columns.xml から送る」を「`sitemap.xml` を送る」に変える。
- `app/sitemap.ts`(またはそれに相当するもの)は触らない。

### 完了条件
- B-2 ○。C-2 は「対象外」表示。

コミット: `test(prelaunch): B-2 からパンくず由来を除外し、C-2 の分割sitemapを対象外にする`

---

## §7 B-3 — 誤解カード48枚に3ブロックを足す

### 7-1 データ

`docs/gokai/gokai-cards-addon-2026-09-02.json` に、48枚ぶんの `check`(3項目)・`ask`(1文)・`figure`(任意)がある。

`scripts/merge-gokai-addon.mjs` を作り、`data/gokai.ts` の各カードに `check: string[]`、`ask: string`、`figure?: string` を追記する。`data/gokai.ts` の先頭コメント「docs/gokai-cards-batch1〜4-2026-09-02.md から生成」に、このスクリプトのことも足す。`GokaiCard` 型を更新する。

`scripts/verify-gokai.mjs` に次を足す:
- 48枚すべてに `check` が3つ、`ask` が1つある
- `check` `ask` `figure` に `x.com` `twitter` `@` `ツイート` `note.com` `youtube` が含まれない
- `figure` に含まれる `\d{1,3}(,\d{3})+円` は §1 の検算を通る

### 7-2 描画

`app/gokai/[slug]/page.tsx` の「こんなときに多い」の後、「次に読む」の前に、この順で足す:

```tsx
<section className="gokai-block gokai-check">
  <h2>自分の場合を確かめる</h2>
  <ul>{card.check.map((c) => <li key={c}>{c}</li>)}</ul>
</section>
<section className="gokai-block gokai-ask">
  <h2>窓口で聞く一言</h2>
  <p>{card.ask}</p>
</section>
{card.figure && (
  <section className="gokai-block gokai-figure">
    <h2>数字で見ると</h2>
    <p>{card.figure}</p>
  </section>
)}
```

CSS(`app/platform.css` の gokai ブロックに追記):
- `.gokai-check ul { margin: 0; padding-left: 1.2em; display: grid; gap: 8px; }`
- `.gokai-ask p { padding: 12px 14px; border-left: 3px solid var(--platform-primary, #0284c7); background: #f4fafe; border-radius: 0 10px 10px 0; margin: 0; }`
- `.gokai-figure p { margin: 0; }`

`/gokai` の一覧側は変えない(カードは「本当は」までで十分)。

### 7-3 検査

- 48枚すべて 500字以上(§7 の見込みは最小 550 字)。
- 「窓口で聞く一言」の電話番号は `0570-05-4890`(年金相談予約)と `0570-078374`(法テラス)の2種類だけ。それ以外の番号が出たら止める。

### 完了条件
- B-3 の一覧から `/gokai/` が消える(索引5本も §4 で消えているので、B-3 は「実例の個別ページ未実装」の注記だけになる)。
- `npm run build` が通り、`/gokai/oya-no-shuunyuu` が3ブロックを表示する(9/3 08:00 の X 投稿の着地先。**ここだけは実機で目視**)。

コミット: `content(gokai): 誤解カード48枚に「自分の場合を確かめる」「窓口で聞く一言」「数字で見ると」を足す`

---

## §8 記録

- `scripts/prelaunch-check.mjs` の冒頭コメントに、今日変えた判定基準(A-8 導出検算 / B-1 除外 / B-2 除外 / C-2 対象外)を日付つきで書く。
- `docs/verification/prelaunch-2026-09-02/RESULT.md` の末尾に「## 2026-09-02 判定基準の変更」を足し、同じ内容を書く。

コミット: `docs: 公開前チェックの判定基準の変更を記録する`

---

## §9 再実行と期待値

`rm -rf .next && npm run build && npm run prelaunch:check` を実行し、結果を `docs/verification/prelaunch-2026-09-02/RESULT-after.md` に保存する。期待値:

| 項目 | 期待 |
|---|---|
| A-1〜A-10 | すべて○(A-8 は説明済み18件・未説明0) |
| B-1 | ○(孤立 0、除外 5) |
| B-2 | ○ |
| B-3 | `/gokai/` 0、索引 0。残るのは注記のみ |
| B-4〜B-8 | ○のまま |
| B-9 | ○(なし 0、二重 0) |
| B-10 | ○ |
| C-1 | ○(157 + 変化なし) |
| C-2 | 対象外 |
| C-4 / C-5 | ○のまま |

期待と違う項目があれば、**直さずに** RESULT-after.md に書いて止める。

コミット: `docs: 公開前チェックの再実行結果を追加する`

---

## 付記: この指示書で「やらない」と決めたこと

- 既存47記事の本文改善(深く厚く)は別の指示書で扱う。ここでは1か所の数字統一だけ。
- 実例94件の個別ページは未実装のまま。B-3 の注記に残す。
- 分割sitemap は作らない(§6)。
- `/dougu/*` の道具は別の指示書(`docs/claude-code-orders-dougu-2026-09-02.md`、アプリ側 repo)で扱う。
