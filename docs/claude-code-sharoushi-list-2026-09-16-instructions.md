# 指示書: 「社労士を探す」`/sharoushi` 一覧・都道府県・事務所ページと計測 (2026-09-16)

`/ads/sharoushi`(掲載案内、e82916e)が約束した掲載先を作る。v0計画 docs/sharoushi-keisai-v0-2026-09-04-plan.md の §2(掲載の中身)と §3(計測)の実装。事務所データは0件で始め、`SHOW_LISTINGS` で公開を切り替える。

参照: docs/sharoushi-keisai-v0-2026-09-04-plan.md、docs/claude-code-ads-sharoushi-2026-09-16-instructions.md(フォームの19項目＝ここで表示する項目)、`data/sharoushi/options.ts`(ラベルの正)、`lib/hubs.ts` 89〜95行(/senmonka の予約と一覧テンプレートの2条件)。

---

## §0 冒頭に貼るコマンド

```
docs/claude-code-sharoushi-list-2026-09-16-instructions.md を読んで、§1〜§7 を実装してください。
§0.5 のモック docs/site-mock-2026-09-16-sharoushi/Sharoushi.html(3画面)を見た目と動作の正とし、
§2 の文面はそのまま使い、言い換えないでください。§8 の「やらないこと」を守ってください。
完了したら §9 の完了条件を1つずつ検証し、結果を報告してください。コミットは報告の後で指示します。
```

## §0.5 参照モック

`docs/site-mock-2026-09-16-sharoushi/Sharoushi.html`。上部のタブで ①一覧 ②都道府県(大阪府) ③事務所ページ を切り替える。事務所3件はすべて架空のサンプルで、実装のデータには入れない。絞り込みチップ・件数表示・0件時の文・更新日順は、このモックの動作が正。

---

## §1 決定事項(変えない)

| 項目 | 決定 |
|---|---|
| URL | `/sharoushi`(一覧)、`/sharoushi/[pref]`(都道府県)、`/sharoushi/[pref]/[office]`(事務所)。v0 §2-2 の `/sharoushi/<slug>` は都道府県と衝突するため、事務所ページは都道府県の下に置く |
| pref のスラッグ | `data/madoguchi/offices.json` の `pref`(例 `osaka`、`hokkaido`)と同じローマ字を使う。`pref`↔`prefName` の対応表を `data/sharoushi/prefectures.ts` に置き、`/dougu/madoguchi` と同じ値であることをテストで固定する |
| 事務所のスラッグ | `[pref]-[事務所名のローマ字か短い英字]`。運営者が JSON に手で書く(自動生成しない)。一度公開したら変えない |
| 並び順 | `updatedAt` の新しい順。同日は `name` の五十音順(`localeCompare("ja")`)。有料でも変えない |
| 都道府県の一覧に出す条件 | `pref` がその都道府県、または `areas` にその都道府県を含む、または `areas` に「全国(オンライン・郵送)」を含む |
| 公開の切替 | `lib/ads.ts` の `SHOW_LISTINGS`。false の間は `/sharoushi` 配下すべてが `notFound()`、sitemap に載せず、どこからもリンクしない。true にした時点で `data/sharoushi/offices.json` が0件でも一覧は出す(§2-1 の0件文) |
| 計測 | v0 §3 の6イベントを `window.gtag` で送る。値は事務所 id・都道府県・絞り込み条件・遷移元だけ。閲覧者の情報は送らない。コールトラッキング番号は使わない |
| 表示しないもの | 受給率・実績件数・口コミ・星・おすすめ・ランキング・運営者の評価。番地(任意項目でも一覧には出さない。事務所ページには申告があれば出す) |
| 事務所ページの冒頭 | 「掲載(広告)」ラベル(`components/AdLabel.tsx`)と免責を、電話ボタンより上に置く(景表法の位置の要件) |
| 読者向けの導線 | §4 の5か所だけ。47記事の本文には入れない |

---

## §2 ページ本文(全文。この順・この文面で)

### 2-1 `/sharoushi` 一覧

- パンくず: トップ ／ 社労士を探す
- h1: 障害年金を扱う社労士を探す
- lead: 都道府県から、障害年金の相談を受けている社会保険労務士事務所を探せます。掲載は事務所の申告にもとづき、一覧は更新日の新しい順です。
- 開示ブロック(`AdLabel kind="掲載(広告)"` ＋ 箇条書き3行):
  - 掲載内容は各事務所の申告です。当サイトは特定の事務所を推薦・選定しません。
  - 当サイトは相談者と事務所の仲介・斡旋をしません。連絡は事務所へ直接お願いします。
  - 掲載の条件は「[広告掲載について](/ads)」をご覧ください。
- 判断の帯(`decide`): 依頼するか迷っている段階なら、先に: [自分で申請するか、依頼するか](/erabu/jibun-ka-irai) ／ [かかるお金](/erabu/hiyou-souba) ／ [社労士の選び方](/erabu/erabikata)
- h2「都道府県から探す」: `PREFECTURE_REGIONS`(data/sharoushi/options.ts)の8地方×都道府県。各都道府県に件数(§1 の条件で数える)。0件は破線・薄色で表示し、リンクは残す(0件ページにも §2-2 の0件文が出る)。
- h2「全国(オンライン・郵送)に対応する事務所」: lead「来所せずに相談できる事務所です。お住まいの都道府県の一覧にも同じ事務所が出ます。」＋ 該当事務所のカード(§2-4)。0件なら h2 ごと出さない。
- h2「相談の前に」: 事務所へ連絡する前に、[相談の持ち物](/dougu/shorui)と[契約前に確認する3点](/erabu/hiyou-souba)(着手金の有無・成功報酬の計算方法・不支給のときの費用)を見ておくと、初回の相談が短く済みます。
- small-note: 掲載を希望する社労士事務所の方は「[社労士事務所の掲載のご案内](/ads/sharoushi)」へ。
- 全体が0件のとき: 「都道府県から探す」の上に `empty` ブロック: 「掲載事務所は、順次追加しています。いまは掲載がありません。相談先を探す前に、[自分で申請するか、依頼するか](/erabu/jibun-ka-irai)をご覧ください。」(「準備中」の語は使わない)

### 2-2 `/sharoushi/[pref]` 都道府県

- パンくず: トップ ／ 社労士を探す ／ {都道府県名}
- h1: {都道府県名}の障害年金を扱う社労士
- lead: {都道府県名}に事務所がある、または{都道府県名}を対応地域にしている事務所です。全国(オンライン・郵送)対応の事務所も含みます。
- 開示ブロック(2行): 掲載内容は各事務所の申告です。当サイトは特定の事務所を推薦・選定しません。／ 連絡は事務所へ直接お願いします。当サイトは仲介・斡旋をしません。
- 絞り込み(§3): 3行のチップ「相談のしかた・条件」(WAYS＋FLAGS)、「対応できる相談」(TOPICS)、「得意な障害の種類」(KINDS)。件数「{n}事務所(更新日の新しい順)」と「絞り込みを解除」。
- 事務所カード(§2-4)を更新日順。
- 0件文(絞り込みで0件): この条件に合う事務所は、いまのところ掲載がありません。条件を減らすか、全国(オンライン・郵送)対応の事務所をご覧ください。
- 0件文(都道府県自体が0件): {都道府県名}の事務所は、いまのところ掲載がありません。全国(オンライン・郵送)対応の事務所は[一覧](/sharoushi#nationwide)にあります。
- h2「{都道府県名}の年金事務所」: 請求書の提出先は住所地の管轄の年金事務所です。市区町村名から引けます。→ [年金事務所を探す](/dougu/madoguchi)
- small-note: {都道府県名}で掲載を希望する社労士事務所の方は「[社労士事務所の掲載のご案内](/ads/sharoushi)」へ。

### 2-3 `/sharoushi/[pref]/[office]` 事務所ページ

- パンくず: トップ ／ 社労士を探す ／ {都道府県名} ／ {事務所名}
- 見出しブロック(`prof-head`): `AdLabel` ＋「掲載日 {registeredAt} ／ 更新日 {updatedAt}」、h1 {事務所名}、sub「社会保険労務士 {代表者名} ／ {都道府県}{市区町村} ／ {所属会}」、タグ(FLAGS を緑、WAYS を青)、ボタン3つ(§3-3)、ボタン下に「連絡は事務所へ直接届きます。当サイトは内容を受け取りません。」
- 判断の帯: まだ依頼するか決めていない方へ: [自分で申請するか、依頼するか](/erabu/jibun-ka-irai) ／ [かかるお金](/erabu/hiyou-souba)
- h2「対応地域と相談のしかた」: dl(対応地域／相談のしかた／初回相談／相談の条件)
- h2「料金の型」: lead「金額は事務所の申告どおりです。契約前に「[かかるお金](/erabu/hiyou-souba)」の3点を確認してください。」＋ dl(着手金／成功報酬／不支給のとき／審査請求)
- h2「対応できる相談」: 申告した分類ごとに、当サイトの入口ページへのリンク行(§3-4 の対応表)。下に「得意な障害の種類: {kinds を「 ／ 」区切り}」
- h2「事務所から一言」: `note` をそのまま(改行は `<br>`)。無ければ h2 ごと出さない
- 開示ブロック(3行): このページの内容は事務所の申告にもとづきます。当サイトは内容の正確さを保証せず、特定の事務所を推薦・選定しません。／ 受給率・実績件数・口コミは掲載していません([掲載の方針](/ads/sharoushi#nosenai))。／ 内容の誤りに気づいた方は [訂正窓口](/support) へ。
  - `/ads/sharoushi` の「載せないもの」h2 に `id="nosenai"` を付ける
- h2「近くの年金事務所」: {市区町村}の管轄が `data/madoguchi/index.json` から引けるときは「{市区町村}の管轄は「{年金事務所名}」です(市区町村から引く → [年金事務所を探す](/dougu/madoguchi))。」。引けないときは「請求書の提出先は住所地の管轄の年金事務所です。→ [年金事務所を探す](/dougu/madoguchi)」
- small-note: {都道府県名}のほかの事務所 → [{都道府県名}の一覧](/sharoushi/{pref})

### 2-4 事務所カード(一覧・都道府県で共通)

事務所名(リンク) ／ sub「{代表者名} ／ {都道府県}{市区町村}{全国対応なら「 ／ 全国オンライン対応」}」 ／ タグ(FLAGS 緑→WAYS 青) ／ タグ(TOPICS) ／ 一言(先頭60字＋…。無ければ省略) ／ 「更新日 {updatedAt} ／ 得意: {kinds を「・」区切り}」。カード内に電話番号は出さない(電話は事務所ページから。タップ計測を1か所にするため)。

---

## §3 データ・絞り込み・ボタン・対応表

### 3-1 データ `data/sharoushi/offices.json`

```json
{
  "checkedOn": "2026-09-16",
  "offices": [
    {
      "id": "osaka-example",
      "pref": "osaka",
      "name": "事務所名",
      "person": "代表者名",
      "regno": "12345678",
      "kai": "大阪府",
      "city": "大阪市北区",
      "addr": "",
      "areas": ["大阪府", "全国(オンライン・郵送)"],
      "ways": ["来所", "電話"],
      "flags": ["初回相談無料"],
      "topics": ["初診日・受診歴の確認"],
      "kinds": ["精神"],
      "firstConsult": "無料(60分まで)",
      "fee": { "start": "なし", "success": "年金額の2か月分", "fail": "不要", "appeal": "別料金" },
      "tel": "06-0000-0000",
      "mail": "",
      "url": "https://example.com/",
      "note": "",
      "registeredAt": "2026-09-20",
      "updatedAt": "2026-09-20",
      "verified": { "registryCheckedOn": "2026-09-19", "by": "連合会名簿" }
    }
  ]
}
```

初期状態は `offices: []`。上の1件は型の例で、コミットしない。`lib/sharoushi.ts` に型と読み込み・並び替え・都道府県抽出・件数を置き、`tests/sharoushi.test.mjs` で (a) ラベルが `data/sharoushi/options.ts` の配列に含まれること (b) `pref` が `prefectures.ts` にあること (c) `regno` が数字とハイフンのみ (d) `id` が一意で `[a-z0-9-]+` (e) `updatedAt >= registeredAt` (f) `tel`・`mail`・`url` の最低1つ、を検証する。JSON にラベル外の値があれば build を落とす。

### 3-2 絞り込み(都道府県ページ、クライアント)

`components/sharoushi/OfficeFilter.tsx`(`"use client"`)。チップは `aria-pressed`。複数選択は AND。状態は URL に載せず、ページ内で持つ(共有リンクに条件が乗らないようにする)。初期描画は絞り込みなしの全件をサーバーで出し、チップ操作で client 側が同じデータを絞る(JS 無効でも全件が読める)。

### 3-3 事務所ページのボタン3つ

| ボタン | href | 無いとき |
|---|---|---|
| 電話する(主・緑) | `tel:{tel}` | ボタンを出さない |
| メールを送る | `mailto:{mail}` | 出さない |
| 事務所サイト | `{url}`、`target="_blank" rel="noopener nofollow"` | 出さない |

3つとも無いデータはテストで落とす。ボタンは3列グリッド、2つ以下なら等分。

### 3-4 「対応できる相談」→ 入口ページの対応表(`data/sharoushi/topic-links.ts`)

| 分類 | リンク先 | 表示する補足 |
|---|---|---|
| 申請の前の相談 | /erabu/jibun-ka-irai | 自分で申請するか、依頼するか → |
| 初診日・受診歴の確認 | /nayami/shoshinbi-karute | 初診日のカルテがないとき → |
| 診断書・申立書の準備 | /nayami/shindansho-komatta | 診断書で困ったとき → |
| 働きながらの申請 | /joukyou/hatarakinagara | 働きながら申請するとき → |
| 家族からの相談 | /joukyou/kazoku-ga-tetsudau | 家族が申請を手伝うとき → |
| 精神の障害・発達障害 | /byoki | 病気から探す → |
| 身体の障害・内部の病気 | /byoki | 病気から探す → |
| 不支給になったあと | /nayami/fushikyu | 不支給と言われたとき → |
| 更新・支給停止のあと | /nayami/koushin | 更新や額改定で困ったとき → |

リンク先は `isPublishedInternalPath` を通し、未公開ならリンク無しの文字だけにする。

---

## §4 公開の切替と導線

1. `lib/hubs.ts` の予約 `/senmonka` を `/sharoushi` に置き換える(`reserved`、`published: false` のまま)。`SHOW_LISTINGS` を true にするときに `published: true` へ(コメントで手順を書く)。
2. `lib/published-links.ts`: `/sharoushi` 配下は `SHOW_LISTINGS` が true のときだけ公開扱い。
3. `SHOW_LISTINGS === true` のときだけ出す導線(5か所、それ以外に置かない):
   - トップの `Listings`(app/page.tsx 177行): カードの本文を「都道府県から、障害年金を扱う社労士事務所を探せます。」に変え、`/sharoushi` へのリンクを付ける。`AdLabel` と「推薦・選定しません」はいまのまま。
   - `/erabu/jibun-ka-irai`・`/erabu/erabikata`・`/erabu/hiyou-souba`・`/erabu/fushikyu-no-ato`・`/erabu/irai-subeki-case` の末尾に1行: 「相談先を探す → [社労士を探す](/sharoushi)」(本文の途中には入れない)
   - `/nayami/fushikyu` の末尾に同じ1行
   - `/dougu/madoguchi` の検索結果パネルの末尾に「この都道府県の社労士 → [{都道府県名}の一覧](/sharoushi/{pref})」(結果が出たときだけ)
   - フッター「このサイトについて」の列ではなく、読者向けの列に「社労士を探す」を1つ
4. sitemap: `SHOW_LISTINGS` が true のとき `/sharoushi`・都道府県47・事務所ページを載せる。`lastmod` は事務所ページが `updatedAt`、都道府県は配下の最大、一覧は全体の最大。

---

## §5 計測(v0 §3)

`lib/sharoushi-track.ts` に関数を置き、すべて `window.gtag` が無ければ何もしない。

| イベント | いつ | パラメータ |
|---|---|---|
| `sharoushi_list_view` | `/sharoushi` と `/sharoushi/[pref]` の表示 | `pref`(一覧は `all`)、`from`(§5-2) |
| `sharoushi_filter` | チップ操作 | `pref`、`filter`(ラベル)、`on`(true/false)、`result_count` |
| `sharoushi_profile_view` | 事務所ページの表示 | `office_id`、`pref`、`from` |
| `sharoushi_tel_tap` | 電話ボタン | `office_id` |
| `sharoushi_mail_tap` | メールボタン | `office_id` |
| `sharoushi_site_click` | 事務所サイトボタン | `office_id` |

5-2 `from`: `document.referrer` が自サイトなら、そのパスの先頭セグメント(`erabu` / `nayami` / `dougu` / `top` / `sharoushi`)。外部・直接なら `external`。パスの全文は送らない。

5-3 GA4 側: カスタムディメンション `office_id`・`pref`・`from`・`filter` を登録する手順を `docs/metrics/sharoushi-ga4-setup.md` に書く(登録は東さんが行う)。月次レポートは GA4 の探索で `office_id` ごとに profile_view / tel_tap / mail_tap / site_click を集計し、v0 §3 の文面でメールする。手作業の手順と探索の設定を同じファイルに書く。自動化はしない。

---

## §6 メタデータ・構造化データ

- 一覧: `pageMetadata({ title: "障害年金を扱う社労士を探す", description: "都道府県から、障害年金の相談を受けている社会保険労務士事務所を探せます。掲載は事務所の申告にもとづき、順位づけをしません。連絡は事務所へ直接。", path: "/sharoushi" })`。`BreadcrumbList`。`ItemList` は入れない。
- 都道府県: title「{都道府県名}の障害年金を扱う社労士」、description「{都道府県名}に事務所がある、または対応地域にしている社会保険労務士事務所の一覧。全国オンライン対応の事務所も含みます。更新日の新しい順。」。`BreadcrumbList`。0件の都道府県は `robots: noindex, follow`(薄いページを索引に出さない。1件以上になったら自動で index)。
- 事務所: title「{事務所名}(障害年金・{都道府県名})」、description「{都道府県名}{市区町村}の社会保険労務士事務所。対応: {topics 先頭3つ}。{firstConsult}。掲載内容は事務所の申告です。」。JSON-LD は `ProfessionalService`(name, address(都道府県・市区町村のみ), telephone(あれば), url(事務所サイト), areaServed(都道府県名の配列))＋ `BreadcrumbList`。`aggregateRating`・`review` は入れない。
- 事務所サイトへのリンクは `rel="nofollow"`(掲載＝広告なので)。

---

## §7 見た目

- 法務ページと同じ本文幅(`--content`)。モックの `office`・`prof-head`・`decide`・`disclose`・`spec` に相当するクラスを `sr-*` として globals.css 末尾に追加。
- 都道府県のチップ、事務所カード、ボタン3つはモックどおり。375px で横スクロールなし、ボタンは2列に落ちる。
- 事務所ページの電話ボタンは `min-height: 56px`(指で押す)。

---

## §8 やらないこと

- 相談フォーム・LINE・運営者経由の連絡・コールトラッキング番号(仲介になる)
- 口コミ・星・おすすめ・ランキング・「厳選」「パートナー」の語
- 受給率・実績件数の表示。事務所が `note` に書いてきた場合は掲載前に運営者が外す(コード側では `note` に「%」「件」「率」が含まれたら build を警告で止める)
- 47記事の本文への導線。トップのヒーロー・ヘッダーへの追加
- 事務所データの自動収集・スクレイピング。JSON は運営者が手で書く
- 地図SDK。住所はテキストのみ
- `/senmonka` の別名・リダイレクト(公開したことがないので不要)
- モックの架空3件をデータに入れること

---

## §9 完了条件(1つずつ検証して報告)

1. `SHOW_LISTINGS = false` で `/sharoushi`・`/sharoushi/osaka`・`/sharoushi/osaka/x` が 404、sitemap に無く、§4-3 の5か所の導線がどれも出ない。
2. `SHOW_LISTINGS = true`・`offices: []` で、一覧に §2-1 の0件文が出て、47都道府県が全部0件の破線で並び、各都道府県ページに §2-2 の0件文が出る。都道府県ページが `noindex`。
3. テスト用に架空でない形の1件(§3-1 の例を `id: "test-office"` で)を一時的に入れて: 大阪府ページと兵庫県ページ(areas に無く全国対応でもない)で出る・出ないが §1 の条件どおり。全国対応にすると全都道府県に出る。検証後に JSON を `[]` に戻す。
4. 事務所ページ: `AdLabel` と免責が電話ボタンより上にある(DOM 順)。ボタンは `tel:`・`mailto:`・外部URL(`rel` に nofollow と noopener)。`tel`・`mail`・`url` の欠けに応じてボタン数が減る。
5. 絞り込み: チップ操作で件数と一覧が変わり、AND で絞れ、「解除」で戻る。JS 無効(`curl`)でも全件のカードが HTML にある。
6. `tests/sharoushi.test.mjs`: ラベル外の値・重複 id・`updatedAt < registeredAt`・連絡先ゼロ・`note` に「%」「件」「率」、の5つが落ちること。`prefectures.ts` の47件が `data/madoguchi/offices.json` の `pref`/`prefName` の組と一致すること。
7. 計測: 一覧表示・都道府県表示・チップ操作・事務所表示・3ボタンで、§5 のイベント名とパラメータだけが gtag に渡る。パラメータに氏名・電話番号・URL・パス全文が無い。
8. 対応表: 9分類すべてがリンクになり、飛び先が §3-4 と一致。未公開ページは文字だけになる。
9. JSON-LD: 事務所ページに `ProfessionalService` と `BreadcrumbList`、`aggregateRating` が無い。リッチリザルトテストでエラー0。
10. `tsc`・lint・build 通過。内部リンク切れ0。375px で横スクロールなし。Lighthouse アクセシビリティ 95以上(一覧・都道府県・事務所の3ページ)。
11. `SHOW_LISTINGS` を false に戻して build し、1 を再確認してから報告する(本番は false のまま公開する)。
