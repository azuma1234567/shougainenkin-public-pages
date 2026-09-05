# サイト構造の俯瞰精査 — ナビ・階層・SEO/AIO/ASO(2026-09-05)

位置づけ: 7本の刷新指示書(design-system → ハブ一言 → コラム部品 → stepflow → hub-index → hajimete-jitsurei → top-shinsei)が終わった**あと**に着手する、構造(情報設計)の見直し。ページの中身やデザインではなく、「何がどこにあり、どう名前が付き、どうつながるか」だけを扱う。
調査: 国内26サイト・海外15サイト(計41、2026-09-05 実取得。取得不可は除外して集計)、Google検索セントラル、Apple/Google のアプリ導線ガイド、AI検索の引用研究7本、NN/g・Baymard のナビ研究。出典は §9。
優先順位: 既存の精査文書(user-psychology > page-types > design-seisa > writing-techniques)は本書より優先。本書は構造だけを決める。

---

## 0. 結論(先に)

1. **「探す」「読む」は外す。** 41サイト中、種別の動詞ラベルをフッターやナビの区分に使うのは検索型サービス(SUUMO・HOME'S・メディカルノート・発達ナビ)だけで、公的給付・年金・社労士系は 0 件。NN/g は「Explore/Discover/Learn のような曖昧な動詞はカテゴリ名として機能しない」と明記している。当サイトの「探す/読む」は、内部の分類(page-types の「選ぶページ/読ませるページ」)が外に漏れたもので、利用者の言葉ではない。
2. **ヘッダーは今の切り口(はじめて/病気/状況/悩み/流れ/実例/コラム)で概ね正しい。** 公的給付系(GOV.UK・SSA・Canada.ca)は「テーマ別の上位+下層で状況別(if you're…)」の二層で、当サイトの「病気から/状況から/悩みから」はこの下層をヘッダーに引き上げた形。項目数7は41サイトの中央値6と同水準。直すのはラベルの語尾(「病気から」は途中で切れている)と、**「お金」がフッターにしか無い**こと、5つの機能の置き場(3.)。
3. **道具5本は「道具」という括りをやめ、利用者の問いの場所に分けて置く。**(2026-09-05 東さんの指摘で改定)「等級の目安」「金額」「必要書類」「年金事務所」「申立書」は作り手から見れば同じ「道具」だが、利用者から見ると「対象になるか」「いくらか」「何を揃えるか」「どこに出すか」「どう書くか」という別々の問いで、同じジャンルではない。`/dougu` の一覧ページは作らず、ヘッダーにも「道具」を置かない。各道具は URL を変えずに、申請の流れの該当ステップ・お金・はじめての方へ・該当する記事に配置し直す(§4-1)。
4. **URL は1つも変えない。** 構造の改善は、一覧ページの新設・ナビとフッターのラベル・パンくず・内部リンクで行う。Google のガイダンスも、サイトリンクは「論理的な構造と簡潔なアンカー」から自動生成、パンくずは BreadcrumbList(2025-01 からデスクトップのみ表示)、URL 階層は「人が読んで分かる」こと以上を求めていない。
5. **SEO/AIO/ASO は「意識する」が、構造で効くのは3点だけ。** (a) 全ページが3クリック以内で到達でき、内部リンクが多いこと(AIO の引用ページは内部リンクが69%多い)。(b) 各一覧ページの冒頭に答えがあること(引用要因の上位は「答えが上部にある」「自己完結した段落」)。(c) 構造化データは Article + BreadcrumbList(+ トップの WebSite、/app の MobileApplication)で足りる。FAQ・HowTo はリッチリザルト終了、JSON-LD 追加で AIO 引用が増える証拠は無い(Ahrefs 2026-05: −4.6%)。

---

## 1. 現状の棚卸し

### 1-1. ページ(約165 URL)

| 区画 | URL | 数 | ヘッダー | フッター | 備考 |
|---|---|---|---|---|---|
| トップ | `/` | 1 | ロゴ | — | WebSite JSON-LD あり |
| はじめて | `/hajimete` | 1 | ○ | 読む | 対象者別の入口 |
| 申請の流れ | `/shinsei` | 1 | ○ | 読む | 柱(8ステップ) |
| 病気別ハブ | `/byoki`, `/byoki/[21]` | 22 | ○(病気から) | 探す | |
| 状況別ハブ | `/joukyou`, `/joukyou/[9]` | 10 | ○(状況から) | 探す | |
| 悩み別ハブ | `/nayami`, `/nayami/[6]` | 7 | ○(悩みから) | 探す | |
| お金 | `/okane`, `/okane/[3]` | 4 | × | 探す | |
| 自分でやるか頼むか | `/erabu`, `/erabu/[5]` | 6 | × | 探す | |
| 誤解 | `/gokai`, `/gokai/[48]` | 49 | × | 読む | 全体の3割のURLがここ |
| 実例 | `/jitsurei` | 1 | ○ | 読む | 裁決91件 |
| 数字 | `/suuji` | 1 | × | 読む | |
| 用語 | `/yougo` | 1 | × | 読む | |
| コラム | `/columns`, `/columns/[47]` | 48 | ○ | 読む | 9カテゴリ |
| 道具 | `/dougu/[5]` (+`/insatsu`) | 6 | **×** | **×** | **一覧ページ無し** |
| アプリ | `/app`, `/app/privacy`, `/app/terms` | 3 | ○(無料アプリ) | このサイトについて | MobileApplication JSON-LD、Smart App Banner 全ページ |
| 運営・法務 | `/about` `/quality` `/support` `/privacy` `/terms` `/ads` `/tokushoho` | 7 | × | このサイトについて | |

### 1-2. 気づいたこと

- ヘッダー7項目+「無料アプリ」。項目数は妥当。ラベル「病気から」「状況から」「悩みから」は「〜から探す」の省略形で、単独では文が切れて見える。
- フッターは「探す / 読む / このサイトについて」の3区分。「探す」に お金・自分でやるか頼むか、「読む」に 誤解・数字・用語・コラム が入り、ヘッダーに無いページ(/gokai 49本、/okane、/erabu、/suuji、/yougo)はフッターだけが入口。
- 道具5本は、ヘッダー・フッター・トップの「どこから探しますか」のいずれにも一覧として出ていない。記事内の道具カード(`PLACEMENTS`)と 8ステップ内のカードだけ。
- コラムのパンくずは「トップ > コラム > 記事」(柱ページ未公開のため)。記事には `hubPrimary` があるのに、パンくずはハブを通らない。
- 誤解 `/gokai` は 49 URL(全体の3割)でサイト最大の区画だが、ヘッダーに無い。
- Search Console(8/28)で Google が把握している URL は 53(約165中)。構造の問題というより、一覧ページからの到達経路と内部リンクの薄さが原因の可能性が高い(§5)。
- Smart App Banner(`apple-itunes-app`)は全ページに出る。記事を夜に読む読者A(`user-psychology` §1)には画面上部の帯が一つ増える。

---

## 2. 41サイトのナビ調査(要約)

### 2-1. 国内26(取得可22)

| 型 | 件数 | 例 |
|---|---|---|
| テーマ別が主軸 | 8 | 日本年金機構(6項目: 年金の制度・手続き/様式/ご相談・Q&A/機構について…)、厚労省(7)、協会けんぽ(3)、東京都福祉局(10)、価格.com |
| サイト構成型(サービス/料金/事例/会社概要) | 5 | 社労士の障害年金サイト5件すべて |
| コンテンツ種別を併用(様式・Q&A・統計・コラム) | 8 | 年金機構、厚労省、デジタル庁、協会けんぽ、弁護士ドットコム、沖縄テラス |
| 対象者別を最上位に | 2 | デジタル庁(一般の方/行政・事業者の方)、freee(個人/税理士) |
| 行動別 | 4 | SUUMO(借りる/買う/建てる)、HOME'S、キャリアガーデン(適職を見つける/キャリアを考える)、メディカルノート(調べる/相談する/探す/知る) |
| **種別の動詞ラベル(探す/読む/調べる)を区分名に使用** | **5** | 厚労省「テーマ別に探す」(1項目のみ)、メディカルノート(フッター)、SUUMO、HOME'S、発達ナビ(本文見出し) |

読み取り: 「探す」は不動産・医療機関検索のように**検索対象(物件・病院)がある**サイトのラベル。「読む」を区分名に使うサイトは 0。障害年金の社労士サイトは全件「サービス/料金/事例/会社概要」型で、情報サイトとしての構造を持つものは無かった(= 当サイトの「病気・状況・悩みの索引 + 使える機能 + 実例」は競合に無い構造で、これは維持する)。

### 2-2. 海外15(取得可14)

| 指標 | 結果 |
|---|---|
| ヘッダー項目数 | 3〜19、**中央値6** |
| テーマ別が主軸 | 9(NHS: Health A-Z/NHS services/Healthy living/Mental health/Care and support、Citizens Advice: Benefits/Work/Debt…、MoneyHelper、Healthline、WebMD、MedlinePlus、Canada.ca) |
| 上位テーマ+下層で状況別 | GOV.UK `/browse/benefits`(…if you're disabled or have a health condition / …if you're caring for someone)、SSA `/disability`(Who can get / What you could get / What to do during a review)、Canada.ca(Benefits by audience / Manage life events) |
| 行動別が主軸 | 3(Scope・Turn2us「Get support / Get involved」、Cleveland Clinic「Find a Provider / Appointments」) |
| 対象者別が主軸 | 1(Mayo Clinic)。他は副軸(SSA フッター「Services for」) |
| ヘッダーに Tools/Find 等 | 5(Healthline「Tools」、WebMD「Symptom Checker / Find a Doctor」、Cleveland「Find a Provider」、Mayo「Health Library」、Scope「Get support」) |
| フッターに種別区分 | 7(Citizens Advice「Resources and tools」、MoneyHelper「Tools and calculators」、SSA「Forms/Publications」、Cleveland「Actions」、NHS「NHS App」、WebMD「WebMD App」、Canada「Mobile applications」) |

読み取り: 医療メディア(Healthline・WebMD)は**「Tools」をヘッダーの独立項目**にしている。給付案内(GOV.UK・SSA)は「状況別(if you're…)」を下層に置き、動詞は「Manage / Get / Apply / Check」のような**具体的な行動**で、Explore/Read のような種別動詞は使わない。フッターでは「Tools and calculators」「App」のように**名詞**で種別を示す。

### 2-3. UX 研究の要点

- NN/g(2023): 「Explore, Discover, Learn, Partner のような曖昧な動詞はカテゴリ名として機能しない」。品詞を揃える必要はない。「I want to…」型も情報の匂いが弱い。
- NN/g(2013/2024): 「ラベルは退屈でも分かる語を」「造語・ブランド語を避ける」「重複カテゴリを作らない」。
- NN/g(2015): 対象者別ナビは避ける(自分がどの群か分からない・重複が生じる)。ただし「はじめての方へ」1項目は、ほほえみLabo(フッター)・GOV.UK(Benefits の下層)に相当例があり、1項目に限れば害は小さい。
- Baymard: 「商品種別をカテゴリにするな(54%が誤り)」「現在位置のハイライト欠如 66%」。

---

## 3. 判断: ラベルと区分

### 3-1. ヘッダー(7項目+アプリ)

| 現在 | 提案 | 理由 |
|---|---|---|
| はじめての方へ | はじめての方へ | 維持。対象者別だが1項目。 |
| 病気から | **病気別** | 「〜から」は述語が欠けている。年金機構・NHS 型の名詞ラベルに。 |
| 状況から | **状況別** | 同上。GOV.UK の「if you're…」に相当する下層を名詞で。 |
| 悩みから | **困りごと別** | 「悩み」は精神の含みが強く、読者B(内部・外部疾患)が自分事にしにくい。「困りごと」は不支給・更新・停止・初診日不明を包む。URL `/nayami` は変えない。 |
| 申請の流れ | 申請の流れ | 維持。柱。 |
| 実例と数字 | 実例と数字 | 維持(`/jitsurei` に `/suuji` を並べる: §4-3)。 |
| コラム | コラム | 維持。 |
| (無し) | **お金** | 「いくらもらえるか」は最初の問いなのに `/okane` はフッターだけ。`/okane` 一覧の先頭に金額計算を置き、ヘッダーに上げる。 |
| 無料アプリ | 無料アプリ(ボタンのまま) | 維持。 |

8項目+ボタン(デスクトップ)、モバイルは現行メニューに全項目。「道具」は置かない(§4-1)。

### 3-2. フッター(3区分 → 4区分、すべて名詞)

| 現在 | 提案 |
|---|---|
| 探す(病気から/状況から/悩みから/お金の話/自分でやるか、頼むか) | **病気・状況・困りごと別**(病気別 / 状況別 / 困りごと別 / 等級の目安をしらべる / 自分でやるか、頼むか) |
| 読む(はじめて/流れ/誤解/実例/数字/コラム/用語) | **申請の進め方**(はじめての方へ / 申請の流れ / 必要書類チェックリスト / 年金事務所を探す / 申立書をつくる / よくある誤解 / コラム / 用語辞典) と **お金と数字**(いくらもらえるか(金額計算) / お金 / 実例 / 数字で見る) |
| このサイトについて | このサイトについて(維持。「無料iPhoneアプリ」はここ) |

区分名は Citizens Advice「Advice / Resources and tools / About this site」、MoneyHelper「Tools and calculators」の名詞型に合わせる。

### 3-3. トップの「どこから探しますか」

セクション見出しの「探す」は、発達ナビ「お悩み別でコラムを探す」・SUUMO「エリアから探す」と同じ用法で、**本文の見出しとしては問題ない**(区分名として単独で立つのが問題)。`top-shinsei` 指示書の「探す 2列」はそのまま。ただしブロックのラベルはヘッダーと同じ語(病気別/状況別/困りごと別/お金)に揃える。

---

## 4. 判断: 階層とつながり

### 4-1. 道具5本を分解して、問いの場所に置く(最優先)

「道具」は作り手の分類で、利用者は「どこに出せばいい」と思って年金事務所を探し、「いくらもらえる」と思って金額を計算する。同じ棚に並べる理由が利用者側に無い。URL(`/dougu/*`)は変えず、**入口と親(パンくず)** を次のとおりにする。

| 道具 | 利用者の問い | 親(パンくず) | 置く場所(入口) |
|---|---|---|---|
| 等級の目安をしらべる `/dougu/mitate` | 自分は対象になるか・何級か | トップ > 申請の流れ > 等級の目安 | `/shinsei` ステップ5(診断書を受け取って確認)の道具カード(既存)/ `/hajimete` の「3つの確認」の障害の程度 / 精神系の病気ハブ(うつ・双極、統合失調、発達、適応・不安)の冒頭 / `tokyu-hantei-guideline` `shindansho-kakunin` 記事 |
| 障害年金の金額 `/dougu/kingaku` | いくらもらえるか | トップ > お金 > 金額 | **`/okane` 一覧の先頭**(ヘッダー「お金」の着地)/ `/hajimete` の金額タイルの直下 / `ikura-moraeru` `kiso-kousei-chigai` 記事 |
| 必要書類チェックリスト `/dougu/shorui` | 何を揃えればいいか | トップ > 申請の流れ > 必要書類 | `/shinsei` ステップ4(既存)/ `/hajimete` の「どのくらい時間がかかるか」の隣 / `hitsuyou-shorui-seishin` 記事 |
| 年金事務所を探す `/dougu/madoguchi` | どこに相談し、どこに出すか | トップ > 申請の流れ > 年金事務所 | `/shinsei` ステップ3(既存)と**ステップ7(出す)にも** / `nenkin-jimusho-soudan` `teishutsusaki-yuusou` 記事 / `/joukyou/kazoku-ga-tetsudau`(家族が代わりに行く) |
| 申立書をつくる `/dougu/moushitatesho` | どう書けばいいか | トップ > 申請の流れ > 申立書 | `/shinsei` ステップ6(既存)/ 申立書カテゴリ6記事(既存 PLACEMENTS)/ `/nayami/shindansho-komatta` |

- `/shinsei` が4本の親になる。申請の流れは「読む柱」であると同時に「やることの置き場」になり、GOV.UK `/browse/benefits` の「Manage an existing benefit」と同じ、行動の入口を柱に持つ形になる。
- 「この5本はサーバーに何も送らない」の文言は、各道具ページの冒頭に残す(一覧が無くなるので、そこで言う)。
- 構造化データ: 各道具に `WebApplication` は付けない(評価・価格の必須項目を満たさない。無い評価を書かない)。パンくずの BreadcrumbList だけ。
- 検索エンジン向け: `/dougu/*` は sitemap にあり、上の入口から2クリックで到達する(§4-5 を満たす)。

### 4-2. コラムのパンくずを主テーマのハブ経由に

- 現在: トップ > コラム > 記事。提案: **トップ > 主テーマのハブ(`hubPrimary`)> 記事**。ハブ未公開の記事だけ「トップ > コラム > 記事」のまま。
- BreadcrumbList もそれに合わせる(実在URLのみ、`item` 省略なし)。Google は「典型的な経路」を推奨しており、記事への主要経路はハブ→記事になる(T8 で「このテーマの記事」を置いた)。
- URL・slug・`/columns` 一覧は変えない。`/columns` は「時系列と9カテゴリの索引」として残す。

### 4-3. 「実例と数字」を1つの入口に

- `/jitsurei` の上部に `/suuji` へのタイル、`/suuji` の上部に `/jitsurei` へのタイルを相互に置く(すでに hajimete-jitsurei 指示書に帯グラフがある。それに1行リンクを足すだけ)。
- ヘッダー「実例と数字」は `/jitsurei` のまま。

### 4-4. `/gokai`(49 URL)の入口

- ヘッダーには入れない(9項目になる)。代わりに **`/hajimete` の「よくある不安」6件の直後**と、**`/shinsei` の各ステップの「つまずき」**から、対応する誤解カードへ1本ずつリンクする(既存の gokai-link の仕組み)。トップの「どこから探しますか」にも「よくある誤解」ブロックを1行で残す。
- 理由: 誤解ページは検索流入(「障害年金 働いていると もらえない」型)の受け皿で、ナビより記事内リンクからの到達が自然。

### 4-5. 到達深さの規則(検証可能)

- すべての公開 URL が、トップから **3クリック以内**(トップ → 一覧 → 個別)。
- すべての個別ページ(ハブ・誤解・コラム・道具)が、**一覧ページ以外から2本以上**の内部リンクを受ける(現在は誤解・コラムの一部が一覧からのみ)。
- 検証: `scripts/verify-site-graph.mjs`(新規)がビルド後 HTML を走査し、到達深さと被リンク数を出す。基準未満の URL を一覧にして報告。

### 4-6. 変えないもの

- URL・slug・h1・title。`/nayami` `/erabu` などのディレクトリ名も変えない(ラベルだけ変える)。
- ハブ44本・誤解49本・コラム47本の中身。
- 9カテゴリ(`ColumnCategory`)と8ステップの対応。

---

## 5. SEO・AIO・ASO を構造でどこまで意識するか

### 5-1. SEO(構造で効く範囲)

| 項目 | 一次情報 | 当サイトの対応 |
|---|---|---|
| サイトリンク | 自動生成。論理的な構造、簡潔で重複しないアンカー | ヘッダー8項目の名詞化で条件を満たす。「サイトリンク検索ボックス」は2024-11廃止なので SearchAction は任意(害はない) |
| パンくず | BreadcrumbList、2025-01からデスクトップのみ表示 | §4-1/4-2 で経路を実態に合わせる |
| URL 階層 | 「人が読んで分かる」「似たテーマをディレクトリでまとめる」 | 既に `/byoki` `/joukyou` … で満たしている。`/columns` が平坦なのは許容(変えない) |
| サイト名 | トップに WebSite(name, url) | あり。`SITE_NAME`=「障害年金申請サポート」(アプリと同名)。ドメインの note とズレるが、Google は「簡潔でよく知られた名」を求めるだけ。変えない |
| インデックス | GSC 把握 53 / 約165 | 到達深さ3・被リンク2の規則(§4-5)を機械検証。sitemap は全件入っている |

### 5-2. AIO(AI Overviews / AI Mode)

- 引用元と検索上位の重なりは 76%(2025-07)→ **37.9%(2026-01)** に低下。上位でなくても引用される(BrightEdge: 21〜100位が「sweet spot」)。→ 小さなサイトでも、**問いに直接答える段落**があれば引用対象になる。
- 引用ページの平均は 1,282 語、語数と引用の相関は 0.04。→ 長さは効かない。
- Seer(2026-05, 8,500KW): 「Article + Breadcrumb で十分、他のスキーマは無駄」「勝者は内部リンクが+69%」。Ahrefs(2026-05): JSON-LD 追加後 AIO 引用 −4.6%。→ **構造化データを増やさない**。FAQ/HowTo は既存分を残すだけ。
- Zyppy 54研究統合: 上位要因は URL のアクセス性、順位、**答えの位置(上部)8.8、自己完結した段落 8.0**。→ 各一覧ページ(byoki/joukyou/nayami/dougu/gokai)の冒頭に、`hub-index` 指示書の「一言」と同じ型で**2〜3文の答え**を置く。これは既に4本の指示書に入っている。
- 結論: AIO のために構造を変える必要は無い。効くのはページ内の「答えの位置」と内部リンク数で、§4-5 がそれに当たる。

### 5-3. ASO(サイト → アプリ)

| 項目 | 一次情報 | 当サイト | 判断 |
|---|---|---|---|
| Smart App Banner | `apple-itunes-app` を head に。`app-argument` で該当画面へ | 全ページに app-id のみ | **道具5本(`/dougu/*`)と `/app`、トップに限定**し、記事・ハブでは外す(2026-09-05 同意済み。読者Aの画面上部を空ける)。道具ページは `app-argument` で同じ機能の画面へ |
| Universal Links | `.well-known/apple-app-site-association`、https・リダイレクト無し | 未確認 | アプリ側の対応と合わせて別タスク(本書の範囲外) |
| App Store バッジ | 高さ40px以上、余白1/4、1レイアウトに1個、改変不可 | `/app` | `/app` のみ。他ページには置かない(道具ページからは `/app` へのテキストリンク1本) |
| MobileApplication JSON-LD | name, offers.price(無料=0), aggregateRating または review が必須 | `/app` にあり | `aggregateRating` は実際のストア評価が取れる場合のみ。無ければ付けない(無い数字を書かない) |

ASO の意味で構造が効くのは「使う機能 → 同じ機能をアプリで続ける」の1本道だけ。各道具ページの末尾の `/app` リンクと、道具ページ限定の Smart App Banner がそれに当たる。

---

## 6. 実装の単位(次の指示書の骨子)

1. 道具5本の分解配置(§4-1): 各道具のパンくず(親を `/shinsei` または `/okane` に)、`/okane` 一覧先頭の金額計算、`/shinsei` ステップ7の年金事務所カード、`/hajimete` からの3本、精神系ハブ冒頭の等級の目安。ヘッダーに「お金」。
2. ヘッダー3ラベル改名(病気別/状況別/困りごと別)+ フッター4区分化(名詞)。トップ「どこから探しますか」のブロック名を同じ語に。
3. コラムのパンくず(表示・JSON-LD)を主テーマのハブ経由に。
4. `/hajimete` 不安6件・`/shinsei` つまずきから誤解カードへのリンク、`/jitsurei`⇄`/suuji` 相互リンク。
5. Smart App Banner の出し分け(道具・/app・トップのみ、`app-argument` 付き)。
6. `scripts/verify-site-graph.mjs`(到達深さ≤3、被リンク≥2、孤立0、パンくずが実在URLのみ、ラベルとURLの対応表が一致)。

各コミット前に既存の検証(`verify-columns` `verify-hub-map` `prelaunch-check` `verify-design-tokens`)を通す。指示書: `docs/site-structure-2026-09-05-instructions.md`。

---

## 7. 判断(2026-09-05 時点)

1. ヘッダー8項目+アプリボタン: **同意済み**。8項目めは「道具」ではなく「お金」(§3-1)。
2. 「悩みから」→「困りごと別」: **同意済み**(§3-1)。
3. Smart App Banner を記事・ハブから外す: **同意済み**。
4. コラムのパンくずを主テーマのハブ経由に: **同意済み**(§4-2)。
5. 「道具」という括りをやめて5本を分解配置: **東さんの指摘により採用**(§4-1)。

## 8. 本書で決めないこと

- 社労士掲載(`/senmonka`)の位置(保留中)。
- 柱ページ(`lib/clusters.ts`)の公開可否。公開するなら §4-2 のパンくずは柱経由に差し替える。
- Universal Links のアプリ側対応。

---

## 9. 出典

国内(2026-09-05 実取得): 日本年金機構 nenkin.go.jp / 厚生労働省 mhlw.go.jp / デジタル庁 digital.go.jp / メディカルノート medicalnote.jp(フッター) / 弁護士ドットコム bengo4.com / stgy.shogainenkin.jp / hajimete-shogai.com / office-kanae.link / higashiosaka-shogai.com / okinawa-shogainenkin.jp / shogai-nenkin.com / biz.moneyforward.com / freee.co.jp/kb / suumo.jp / homes.co.jp / kakaku.com / kyoukaikenpo.or.jp / nenkin.go.jp/n_net / h-navi.jp(一部) / careergarden.jp / fukushi.metro.tokyo.lg.jp。取得不可: マイナポータル、白石社労士事務所、NHKハートネット、LITALICO仕事ナビ、Yahoo!くらし。
海外: nhs.uk / gov.uk(トップ, /browse/benefits) / ssa.gov(トップ, /disability) / citizensadvice.org.uk / moneyhelper.org.uk / mayoclinic.org / my.clevelandclinic.org / healthline.com / webmd.com / medlineplus.gov / canada.ca/en/services/benefits / service.nsw.gov.au / scope.org.uk / turn2us.org.uk。取得不可: servicesaustralia.gov.au。
Google: developers.google.com/search/docs/appearance/sitelinks; …/structured-data/breadcrumb; …/site-names; …/crawling-indexing/url-structure; …/fundamentals/seo-starter-guide; …/structured-data/software-app; developers.google.com/search/updates(サイトリンク検索ボックス 2024-11-29 廃止、HowTo 2023-08、FAQ 2026-06-15 文書削除)。
AI 検索: ahrefs.com/blog/search-rankings-ai-citations(2025-07); ahrefs.com/blog/ai-overview-citations-top-10/(2026-03, 37.9%); ahrefs.com/blog/short-vs-long-content-in-ai-overviews/(1,282語); ahrefs.com/blog/schema-ai-citations/(2026-05, −4.6%); brightedge.com …/rank-overlap-after-16-months-of-aio; seerinteractive.com …/what-it-takes-to-rank-in-googles-ai-overviews-in-2026…; ppc.land/23-factors…(Zyppy 54研究統合); semrush.com/blog/semrush-ai-overviews-study/; seranking.com/blog/ai-overviews-us-states-comparison-research/。
Apple/Google: developer.apple.com/documentation/webkit/promoting-apps-with-smart-app-banners; developer.apple.com/documentation/xcode/supporting-associated-domains; developer.apple.com/app-store/marketing/guidelines/; partnermarketinghub.withgoogle.com …/google-play/lockups-icons-badges/。
UX: nngroup.com/articles/3-ia-mistakes/; nngroup.com/articles/category-names-suck/; nngroup.com/articles/information-scent/; nngroup.com/articles/audience-based-navigation/; nngroup.com/articles/menu-design/; nngroup.com/articles/mega-menus-work-well/; baymard.com/research/homepage-and-category-usability。
