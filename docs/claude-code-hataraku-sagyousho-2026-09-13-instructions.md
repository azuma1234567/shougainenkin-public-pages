# Claude Code 作業指示 — 「働く」4本・「作業所」4本のコラムを追加する(2026-09-13)

対象リポジトリ: `shougainenkin-public-pages`
原稿: `docs/hataraku-sagyousho-2026-09-13/articles/*.md`(8本。columns の原稿形式: frontmatter slug / dateModified / lead 3〜5項目、本文、`## よくある質問(FAQ)`、`## まとめ`、`## 出典`)
研究データ: `docs/hataraku-sagyousho-2026-09-13/voices_x_hataraku_2026-09-13.md`(X 179件の匿名要旨)、`sources_2026-09-13.md`(一次資料と数字の確認記録)
公開の順番: インデックス未登録が減るまで書き溜める方針なので、この作業は「取り込んでビルドが通る状態まで」。push は東さんの指示を待つ。

## 0. 原稿の扱い
- 本文・数字・文言は変えない。パーサーが弾いた箇所だけ、原稿ではなくパーサーの想定との差を報告して止まる。
- 表(`|`)、番号付きリスト、`- □ `のチェック項目、`→ ラベル(/path)` のリンク行は、既存記事(shinsei-shindoi、shinsei-kikan)と同じ描画になることを確認する。

## 1. 原稿を所定の場所に置く
`docs/hataraku-sagyousho-2026-09-13/articles/` の8ファイルを `docs/columns-rewrite-2026-09-03/articles/` にコピーする(ファイル名 = slug.md)。

## 2. lib/columns.ts に8本を追加する
`COLUMNS` 配列に追加。`orderInCategory` は既存の最大値の続きにする。

```ts
{
  slug: "shindansho-shurojokyo",
  title: "診断書の「就労状況」欄には何が書かれるのか — 働きながら申請・更新する人が主治医に渡すメモ",
  metaTitle: "障害年金の診断書「就労状況」欄に書かれること｜働きながら申請・更新する人が主治医に渡すメモ",
  description: "精神の障害用の診断書の「現症時の就労状況」欄は、勤務先の種類・雇用体系・頻度・給与・援助の状況を主治医が書きます。国の記載要領は「仕事場の内外を問わず援助や配慮の状況をできるだけ記入」「過去1年の休職」「日常生活能力は単身を想定」と求めています。何を伝えれば実態が載るか、A4一枚のメモの項目と働き方別の例。",
  datePublished: "2026-09-13", dateModified: "2026-09-13",
  primaryCluster: "medical-certificate", category: "診断書 — 主治医に伝える", orderInCategory: <次の値>,
},
{
  slug: "koushin-hatarakinagara",
  title: "働き始めてから最初の更新で見られること — 障害状態確認届と、1年前から始める準備",
  metaTitle: "障害年金の更新、働いていると止まる？｜停止は1.1%・見られるのは配慮と仕事の外の生活",
  description: "働き始めても障害年金は自動では止まりません。決まるのは更新(障害状態確認届)のときで、令和6年度の更新304,456件のうち支給停止は1.1%・減額0.8%。見られるのは「働いているか」ではなく「どんな援助や配慮で働けているか」「仕事の外の生活が一人で回るか」。次回提出年月の確認、月1回の記録、更新3か月前に主治医へ渡すメモ、チェックリスト。",
  datePublished: "2026-09-13", dateModified: "2026-09-13",
  primaryCluster: "application", category: "受給が始まってから", orderInCategory: <次の値>,
},
{
  slug: "kousei-3kyu-hataraku",
  title: "障害厚生年金3級で働く — 3級の意味、最低保障額、更新・額改定・65歳の3つの線",
  metaTitle: "障害厚生年金3級で働く｜最低保障 年635,475円・更新で非該当になる線・額改定で2級へ",
  description: "障害厚生年金3級は「労働に著しい制限がある」等級で、働くことと両立します。最低保障額は令和8年度で年635,475円(月約53,000円)。基礎年金に3級はありません。更新で「配慮なしに働けている」と読まれると非該当、悪化したら額改定請求で2級、非該当でも3年・65歳までは受給権が残る。給付金・法定免除の対象外など3級だけの扱いも一覧に。",
  datePublished: "2026-09-13", dateModified: "2026-09-13",
  primaryCluster: "application", category: "受給が始まってから", orderInCategory: <次の値>,
},
{
  slug: "zaitaku-freelance-nenkin",
  title: "在宅・フリーランス・副業と障害年金 — 収入で止まる人は誰か、審査で見られる「実態」の残し方",
  metaTitle: "障害年金は副業・フリーランスで止まる？｜所得制限は20歳前傷病だけ(前年所得3,761,000円超で半額)",
  description: "在宅ワーク・フリーランス・副業で収入を得ても障害年金は原則そのまま。収入で減るのは20歳前傷病の障害基礎年金だけで、前年所得3,761,000円超で2分の1停止、4,794,000円超で全額停止(扶養親族で加算、10月〜翌9月)。在宅の人は診断書で「自営」になり実態が見えないので、稼働時間・断った仕事・生活の援助を記録する。開業届・確定申告・失業給付・扶養の線も整理。",
  datePublished: "2026-09-13", dateModified: "2026-09-13",
  primaryCluster: "application", category: "受給が始まってから", orderInCategory: <次の値>,
},
{
  slug: "kougin-nenkin-tedori",
  title: "B型の工賃と障害年金で、月いくらで暮らせるか — 平均24,141円+70,608円から引かれるもの・足されるもの",
  metaTitle: "B型作業所の工賃と障害年金で月いくら？｜平均工賃24,141円+2級70,608円、利用料・給付金・生活保護との併用",
  description: "B型の平均工賃は月24,141円(令和6年度・全国)、A型の平均賃金は91,451円。障害基礎年金2級は月70,608円(令和8年度)。B型+2級で約95,000円、A型+2級で約162,000円。引かれる利用料(課税世帯で上限9,300円)・交通費・GHの家賃、足される給付金(2級 月5,620円)・家賃補助・手当、生活保護との併用の仕組み、見学で聞くお金の8項目。",
  datePublished: "2026-09-13", dateModified: "2026-09-13",
  primaryCluster: "application", category: "受給が始まってから", orderInCategory: <次の値>,
},
{
  slug: "sagyousho-hajimeru-tsutaeru",
  title: "作業所に通い始めるとき、主治医と支援員に伝えること — 通所を年金の不利ではなく材料にする",
  metaTitle: "作業所(B型・A型・就労移行)に通うと障害年金は不利？｜主治医と支援員に伝えること・通所記録の書き方",
  description: "作業所への通所は、審査で「援助のある活動」として読まれます。ガイドラインはA型・B型での就労を1級または2級の可能性を検討するとしています。不利になるのは、診断書に通所日数と援助の内容が載らなかったとき。主治医に通い始める前と後に伝えること、支援員に頼む文面、月1回の通所記録のテンプレート、種類別の診断書での扱い。",
  datePublished: "2026-09-13", dateModified: "2026-09-13",
  primaryCluster: "medical-certificate", category: "診断書 — 主治医に伝える", orderInCategory: <次の値>,
},
{
  slug: "muryou-soudan-psw",
  title: "社労士に頼めない人が、無料で頼れる人 — 精神保健福祉士・相談支援専門員・年金事務所・支援員の地図",
  metaTitle: "障害年金の申請を無料で手伝ってくれる人｜精神保健福祉士(PSW)・相談支援専門員・年金事務所・作業所の支援員",
  description: "社労士に数十万円払えなくても、申請を手伝ってくれる人は無料でいます。病院の相談室の精神保健福祉士、相談支援事業所の相談支援専門員、基幹相談支援センター、市の障害福祉課、年金事務所、就労移行やB型の支援員。それぞれ頼めること・頼めないこと、場面別に最初に行く場所、持ち物、そのまま使える最初の一言。社労士が要る4つの場面も。",
  datePublished: "2026-09-13", dateModified: "2026-09-13",
  primaryCluster: "application", category: "相談・進め方", orderInCategory: <次の値>,
},
{
  slug: "sagyousho-kayoenai",
  title: "作業所に通えない・辞めたとき、障害年金はどうなるか — 記録・伝え方・受給者証と雇用保険・再開の道",
  metaTitle: "作業所に通えない・辞めても障害年金は止まらない｜通えなかった記録は状態の証拠、A型なら雇用保険も",
  description: "作業所に通えない日が続いても、辞めても、障害年金は止まりません。通所は要件ではなく、通えなかった記録は審査で状態の証拠になります。休んだ日と理由の記録、支援員と主治医への伝え方、辞める前に使える3つの調整、受給者証の扱い、A型を辞めたときの雇用保険(就職困難者は給付日数が長い)、額改定請求、在宅型B型・地域活動支援センター・デイケアからの再開。",
  datePublished: "2026-09-13", dateModified: "2026-09-13",
  primaryCluster: "application", category: "受給が始まってから", orderInCategory: <次の値>,
},
```

## 3. ページと OG 画像を作る
各 slug について `app/columns/<slug>/page.tsx` と `opengraph-image.tsx` を、`app/columns/shinsei-kikan/` と同じ形で作る。`relatedSlugs` と `references` は次のとおり。

| slug | relatedSlugs(最大5) | references(label / href) |
|---|---|---|
| shindansho-shurojokyo | shinsatsu-mae-memo, shougaisha-koyou-nenkin, shindansho-kakunin, koushin-hatarakinagara, nichijo-seikatsu-7koumoku | 厚生労働省「障害年金の診断書(精神の障害用)記載要領」https://www.mhlw.go.jp/file/04-Houdouhappyou-12512000-Nenkinkyoku-Jigyoukanrika/0000130048.pdf ／ 厚生労働省「精神の障害に係る等級判定ガイドライン」https://www.mhlw.go.jp/file/04-Houdouhappyou-12512000-Nenkinkyoku-Jigyoukanrika/0000130045.pdf ／ 日本年金機構「障害年金の請求手続き等に使用する診断書・関連書類」https://www.nenkin.go.jp/shinsei/jukyu/shougai/shindansho/index.html |
| koushin-hatarakinagara | koushin-kakuninhodo, shindansho-shurojokyo, kousei-3kyu-hataraku, shikyuu-teishi-fukkatsu, fushikyuu-shinsa-seikyu | 日本年金機構「障害状態確認届(診断書)が届いたとき」https://www.nenkin.go.jp/service/jukyu/tetsuduki/shougai/jukyu/2019091905.html ／ 記載要領(上と同じ) ／ ガイドライン(上と同じ) |
| kousei-3kyu-hataraku | kiso-kousei-chigai, gaku-kaitei-seikyuu, shikyuu-teishi-fukkatsu, koushin-hatarakinagara, techou-to-nenkin | 日本年金機構「障害厚生年金の受給要件・支給開始時期・計算方法」https://www.nenkin.go.jp/service/jukyu/shougainenkin/jukyu-yoken/20150401-02.html ／ 日本年金機構「障害基礎年金の受給要件・支給開始時期・計算方法」https://www.nenkin.go.jp/service/jukyu/shougainenkin/jukyu-yoken/20150401-01.html ／ 日本年金機構「障害年金を受給している方の額改定請求」https://www.nenkin.go.jp/service/jukyu/shougainenkin/jukyu/20150401-03.html |
| zaitaku-freelance-nenkin | hatachi-mae, hikazei-shuunyuu, shindansho-shurojokyo, koushin-hatarakinagara, nofu-yoken | 日本年金機構「20歳前の傷病による障害基礎年金にかかる支給制限等」https://www.nenkin.go.jp/service/jukyu/seido/shougainenkin/jukyu-yoken/20200805.html ／ 記載要領 ／ 全国健康保険協会「被扶養者とは」https://www.kyoukaikenpo.or.jp/g3/cat320/sb3160/sbb3163/1959-230/ |
| kougin-nenkin-tedori | sagyousho-hajimeru-tsutaeru, sagyousho-kayoenai, hikazei-shuunyuu, ikura-moraeru, jukyuugo-tetsuduki | 厚生労働省「令和6年度 工賃(賃金)の実績について」https://www.mhlw.go.jp/content/12200000/001637154.pdf ／ 厚生労働省「障害者の利用者負担」https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/hukushi_kaigo/shougaishahukushi/service/riyou.html ／ 厚生労働省「年金生活者支援給付金制度」https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/0000199979.html |
| sagyousho-hajimeru-tsutaeru | shindansho-shurojokyo, kougin-nenkin-tedori, sagyousho-kayoenai, shinsatsu-mae-memo, muryou-soudan-psw | ガイドライン ／ 記載要領 ／ 厚生労働省「障害福祉サービスの利用について」https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/hukushi_kaigo/shougaishahukushi/service/index.html |
| muryou-soudan-psw | sharoushi-kawaranai-koto, nenkin-jimusho-soudan, jibun-de-shinsei, sagyousho-hajimeru-tsutaeru, shinsei-shindoi | 日本年金機構「年金相談のご予約」https://www.nenkin.go.jp/section/soudan/yoyaku.html ／ 厚生労働省「相談支援」https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/hukushi_kaigo/shougaishahukushi/service/naiyou.html ／ 日本年金機構「病歴・就労状況等申立書」https://www.nenkin.go.jp/shinsei/jukyu/shougai/shindansho/20140421-06.html |
| sagyousho-kayoenai | sagyousho-hajimeru-tsutaeru, kougin-nenkin-tedori, gaku-kaitei-seikyuu, koushin-hatarakinagara, shikyuu-teishi-fukkatsu | ハローワーク「基本手当の所定給付日数」https://www.hellowork.mhlw.go.jp/insurance/insurance_benefitdays.html ／ 記載要領 ／ 日本年金機構「額改定請求」(上と同じ) |

- references の URL は上のとおりだが、**ビルド前に1本ずつ 200 が返ることを確認**し、404 のものは同じ機関の正しいページに差し替えて、差し替えたことを報告する。
- 本文中の `→ ラベル(/path)` のリンク先は全て既存ページ(shinsatsu-mae-memo、shindansho-kakunin、shougaisha-koyou-nenkin、jukyuugo/hataraku、dougu/koushin、nayami/shikyuu-teishi、fushikyuu-shinsa-seikyu、kiso-kousei-chigai、okane/ikura、gaku-kaitei-seikyuu、techou-to-nenkin、joukyou/65sai-ijou、hatachi-mae、jukyuugo/okane、dougu/kougin、joukyou/seikatsu-hogo、jukyuugo/sagyousho、jukyuugo/a-gata-heisa、jukyuugo/nukedasu、nenkin-jimusho-soudan、sharoushi-kawaranai-koto、jitsurei)と、今回の8本の相互リンク。`verify:site-graph` で切れリンクが無いことを確認する。

## 4. ハブに載せる(lib/hubs.ts)
- `COLUMN_HUB_ASSIGNMENTS` に追加:
  - `"shindansho-shurojokyo": assignment("/joukyou/hatarakinagara", "core", ["/jukyuugo/hataraku", "/nayami/shindansho-komatta"])`
  - `"koushin-hatarakinagara": assignment("/nayami/koushin", "core", ["/jukyuugo/hataraku", "/joukyou/hatarakinagara"])`
  - `"kousei-3kyu-hataraku": assignment("/jukyuugo/hataraku", "core", ["/okane/ikura", "/joukyou/65sai-ijou"])`
  - `"zaitaku-freelance-nenkin": assignment("/jukyuugo/hataraku", "leaf", ["/joukyou/hatachi-mae", "/jukyuugo/okane"])`
  - `"kougin-nenkin-tedori": assignment("/jukyuugo/sagyousho", "core", ["/okane/ikura", "/joukyou/seikatsu-hogo"])`
  - `"sagyousho-hajimeru-tsutaeru": assignment("/jukyuugo/sagyousho", "core", ["/nayami/shindansho-komatta"])`
  - `"muryou-soudan-psw": assignment("/erabu", "promote", ["/hajimete", "/shinsei#step-3"])`(/erabu が「社労士に頼むか自分でやるか」のハブなら。違えば `/hajimete`)
  - `"sagyousho-kayoenai": assignment("/jukyuugo/sagyousho", "leaf", ["/nayami/koushin", "/jukyuugo/a-gata-heisa"])`
- 該当ハブの `hub(...)` の関連コラム配列にも slug を足す(/jukyuugo/hataraku、/jukyuugo/sagyousho、/joukyou/hatarakinagara、/nayami/koushin、/erabu または /hajimete)。ハブ側の上限があればその範囲で。

## 5. 件数の固定値と生成
- `scripts/import-columns.mjs` の `assert.equal(Object.keys(articles).length, 49)` → 57。
- `scripts/verify-columns.mjs` の件数・baseline を更新(理由を記録)。
- `node scripts/import-columns.mjs` で `content/columns/*.ts` を生成。
- `lib/sitemap-static-dates.ts` に8本の日付(2026-09-13)。
- `/columns` の一覧に8本が該当カテゴリに出ることを確認。

## 6. 検証
- `npm run typecheck`、`npm run build`、`npm run verify:columns`、`npm run verify:site-graph`、`node scripts/prelaunch-check.mjs`(× が作業前から増えないこと)。
- 各記事の生成 HTML で、FAQPage(Question 6件)、BreadcrumbList、更新日の表示、表の描画、`- □ ` の項目、`→` リンク行を目視で確認(スクリーンショットを `docs/verification/hataraku-sagyousho-2026-09-13/` に)。
- 本文の数字は `docs/hataraku-sagyousho-2026-09-13/sources_2026-09-13.md` の確認記録と一致していること(変えない)。

## 7. コミット(push はしない)
`content(columns): 「働く」4本・「作業所」4本を追加(50〜57本目)。原稿・研究データは docs/hataraku-sagyousho-2026-09-13/`

## 8. 公開時に東さんがやること(後日)
- push → Search Console で8 URL のインデックス登録をリクエスト(1日10件の枠内で)。
- AdSense・A8 が承認されたら、kougin-nenkin-tedori と sagyousho-kayoenai の「次の一歩」付近に就労移行・障害者転職の案件を1つずつ(別指示)。
