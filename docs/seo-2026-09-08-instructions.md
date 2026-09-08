# SEO 精査と、次にやること(2026-09-08)

## 0. この文書の前提 — 数字で見た現状

GSC(2026-09-08 時点、データは 9/6 まで)と Search Console のリンクレポートから。

| 項目 | 値 |
|---|---|
| 外部リンク | **合計 2 件**(apple.com 1 / vercel.app 1) |
| インデックス登録済み | 69 |
| インデックス未登録 | 100(検出-未登録 **97** / クロール済み-未登録 2 / リダイレクト 1) |
| 97 件の「前回のクロール」 | **該当なし**(＝一度もクロールされていない)。初検出 2026/07/25 |
| sitemap の最終読み取り | 2026/09/04(9/6〜9/8 の刷新は Google に届いていない) |
| 検索パフォーマンス(28日) | 30クリック / 1,390表示 / CTR 2.2% / 平均 30.7位 |

### 未インデックス 97 件の内訳(全数)

- `/gokai` と誤解カード 48 枚 = **49**(誤解カードは 1 枚もインデックスされていない)
- `/byoki` と病気ハブ 16 本 = **17**(通っているのは utsu-soukyoku / tekiou-fuan / hattatsu / tougou / tenkan の 5 本だけ)
- `/joukyou` と状況ハブ 8 本 = **9**(通っているのは hatarakinagara のみ)
- `/nayami` と shindansho-komatta / sokyuu = **3**
- `/okane` と chousei / ikura / zeikin = **4**
- `/erabu` と erabikata / fushikyu-no-ato / irai-subeki-case = **4**
- 静的 10 本 = `/hajimete` `/shinsei` `/jitsurei` `/suuji` `/yougo` `/quality` `/ads` `/app` `/app/privacy` `/app/terms`
- コラム 1 本 = `/columns/kiso-kousei-chigai`

**グローバルナビの行き先(/hajimete /shinsei /byoki /joukyou /nayami /okane /jitsurei)が、/columns を除いて全滅している。**

### 技術面は問題なし(調べた結果)

- `app/sitemap.ts` — 全 URL に lastModified あり。除外は `/tokushoho` のみで理由も明示。◯
- `app/robots.ts` — allow: / と sitemap 指定。ブロックなし。◯
- 誤って `noindex` になっているページは無い(`/tokushoho` と未公開フラグのページだけ)。◯
- canonical は各 `generateMetadata` で自ページを指している。◯
- ヘッダーもフッターも素の `<Link>` で SSR される。JS 依存のリンクではない。◯
- `ColumnThemeBlock` で全コラムからハブへ本文内リンクが出ている。◯
- 構造化データは Article / FAQPage / HowTo / BreadcrumbList / ItemList / DefinedTermSet などを実装済み。◯
- ハブ本文は 972〜7,335 字。誤解カードは 1,224〜3,668 字(中央値 2,779)。薄すぎるページは無い。

**つまり、直すべき技術的な不備は見つからなかった。** インデックスされていない理由は
サイトの作りではなく、**外部リンクが 2 件しかない＝Google がこのドメインにクロール予算を
ほとんど割いていない**ことにある。いま入っている 69 件は、ほぼ手動の URL 検査で通したもの。

---

## §0 コードでは直せない部分(ここが 9 割。東さんの手作業)

### §0-1 サイトマップを再送信する
GSC → サイトマップ → 既存の `https://shougainenkin-note.net/sitemap.xml` を再送信。
最終読み取りが 9/4 のままで、9/6〜9/8 の刷新が Google に届いていない。

### §0-2 URL 検査を、コラムではなくハブに向ける(1日10件・10日で 97 件)
検索需要のあるクエリに対応する未インデックスページから。表示回数は 28 日の実測。

1日目(需要が確認できているページ)
1. `/joukyou/hitorigurashi` ←「障害年金 一人暮らし」24表示
2. `/okane/ikura`
3. `/jitsurei`(公開裁決 91 件。このサイトにしかない)
4. `/suuji`
5. `/shinsei`
6. `/hajimete`
7. `/nayami/shindansho-komatta`
8. `/nayami/sokyuu`
9. `/byoki`
10. `/joukyou`

2日目
`/nayami` `/okane` `/erabu` `/yougo` `/gokai` `/okane/zeikin` `/okane/chousei`
`/joukyou/hatachi-mae` `/joukyou/65sai-ijou` `/joukyou/shoubyou-teatekin-kara`

3日目以降 — 残りの状況ハブ → 病気ハブ 16 本 → 誤解カード 48 枚 → `/quality` `/ads` `/app` 系。
誤解カードは最後でよい(48 枚あり、単体の検索需要は小さい)。

### §0-3 外部リンクをゼロから作る(これが根本原因)
2 件のうち 1 件は App Store の「デベロッパ web サイト」、もう 1 件は vercel.app。
実質ゼロ。数件でも増えるとクロールの頻度が変わる。

やること
- X(x.com/shougainenkinn)のプロフィール URL にサイトを設定。nofollow だが発見経路になる
- 自分の他サイト(discord-nakama.com)のフッター等からリンク
- note / Zenn などに `/suuji` の一次資料まとめ(業務統計・認定状況調査)を要約して投稿し、出典としてサイトを引用
- 障害福祉の当事者コミュニティ、自治体の障害福祉リンク集に掲載を依頼

やってはいけない
- 有料リンク、相互リンク集、ディレクトリ一括登録。手動対策の対象になる

### §0-4 新しいページを増やすのを、当面やめる
既知 169 URL のうち通っているのは 69。ここでページを足すと、乏しいクロール予算が
さらに薄まる。**既存の 97 件を通し切るまで、新規記事・新規ハブは追加しない。**

---

## §1 /llms.txt を置く

`public/llms.txt` を新規作成する。AI 検索(ChatGPT / Perplexity 等)からの参照経路。
効果は現時点で実証されていないが、コストがほぼゼロなので置く。

書式(Markdown。1行目は H1、以降はセクションと箇条書きのリンク)

```
# 障害年金申請サポート

> 障害年金の申請を、公的資料の根拠と公開裁決例で説明するサイト。社会保険労務士事務所ではなく、
> 相談や代行の受付はしていない。数字はすべて出典を明記している。

## 主要ページ
- [障害年金の申請の流れ](https://shougainenkin-note.net/shinsei): 8つのステップ
- [数字で見る障害年金](https://shougainenkin-note.net/suuji): 業務統計・認定状況調査の実数
- [実例](https://shougainenkin-note.net/jitsurei): 公開裁決 91 件
...
```

作り方の条件
- `app/llms.txt/route.ts` として動的生成する(`public/` に手書きしない)。
  `lib/columns.ts` `lib/hubs.ts` `data/gokai.ts` から生成し、ページが増減しても勝手に追随させる。
- 収録するのは sitemap と同じ URL 集合。`SITEMAP_EXCLUDED` は除く。
- 各行の説明は既存の `description` / `hint` を使う。新しい文言を発明しない。
- `app/robots.ts` の返り値に `/llms.txt` への言及を足す必要はない(仕様上そういう決まりはない)。

## §2 Organization と WebSite を @graph でつなぐ

いま `sameAs` は `components/ApplicationFlowPage.tsx` の App Store URL だけ。
トップページ(`app/page.tsx`)に、次の 1 つの JSON-LD を置く。

- `WebSite` — `name` `url` `inLanguage: "ja"` `publisher` は下の Organization を `@id` 参照
- `Organization` — `@id: "https://shougainenkin-note.net/#organization"`、`name`、`url`、
  `sameAs: ["https://x.com/shougainenkinn", "<App Store の URL>"]`

条件
- 既にトップに JSON-LD がある場合は、そこへ統合する(2 つ目の `<script type="application/ld+json">` を増やさない)。
- `SearchAction` は入れない。サイト内検索が無いのに書くと嘘になる。
- Rich Results Test 相当の検証は `prelaunch:check` の B-8(構造化データ)に通ればよい。

## §3 すでに順位がある語を、タイトルと見出しに入れる

28 日のクエリを全 50 件見たところ、**2 語のビッグワードは 56〜83 位で 0 クリック**、
**4 語以上のロングテールは 5〜16 位**という分かれ方をしていた。勝てるのは後者だけなので、
すでに順位がある語をページ側にそろえる。

| クエリ | 順位 | 表示 | 該当ページ | やること |
|---|---|---|---|---|
| 障害年金 申請 結果待ち | 40.4 | 30 | /columns/shinsei-kikan | `metaTitle` に「結果待ち」を入れる(いまは `title` にだけある) |
| 病歴就労状況等申立書 スマホ 入力 | 7.0 | 4 | /dougu/moushitatesho | `TITLE` に「スマホで」を入れる |
| 受診状況等証明書 郵送 | 10.7 | 3 | /columns/jushinjokyo-shomeisho | `metaTitle` は既に最適。本文に「郵送で頼むときの手順」の見出しがあるか確認し、無ければ立てる |
| 障害年金 相談 持ち物 | 11.0 | 1 | /columns/nenkin-jimusho-soudan | 「持ち物」を `metaTitle` と本文の見出しに |
| 障害年金更新 落ちる 理由 | 5.0 | 1 | /nayami/koushin | 「更新で落ちる理由」に当たる見出しを本文に立てる |
| 障害年金 初診日 調べ られる | 16.0 | 1 | /columns/shoshinbi-wakaranai | `metaTitle` は既に最適。変更不要 |

条件
- **本文の事実は変えない。** 見出しの言い回しと `metaTitle` だけを直す。
- コラムの本文は生成物(`content/columns/*.ts`)を直接編集しない。
  原稿 `docs/columns-rewrite-2026-09-03/articles/<slug>.md` を直して `node scripts/import-columns.mjs`。
- `metaTitle` は `lib/columns.ts` を直接編集してよい。
- 検索語をそのまま並べない。日本語として読める見出しにする。読者が読むものが先。
- `verify:columns` の baseline に触る変更になるので、`intentionalUpdates` に理由つきで追記する。

---

## §4 検証

1. `npm run typecheck` が通る
2. `npm run build` が通る
3. `npm run prelaunch:check` — × は B-10 だけ
4. `npm run verify:columns` `verify:hubs` が通る
5. `/llms.txt` が 200 で返り、1 行目が `# 障害年金申請サポート`、収録 URL 数が sitemap と一致する
6. トップの JSON-LD が 1 つで、`Organization.sameAs` に X と App Store の 2 件が入っている
7. §3 の 6 ページで、指定した語が `metaTitle` か h2 に入っている
8. 公開ページの表示テキストに「道具」が 0 件のままである

## §5 コミットの分け方

1. `feat(seo): /llms.txt を動的生成する`
2. `feat(seo): トップに Organization と WebSite の構造化データを置く`
3. `content(seo): すでに順位がある語をタイトルと見出しにそろえる`
