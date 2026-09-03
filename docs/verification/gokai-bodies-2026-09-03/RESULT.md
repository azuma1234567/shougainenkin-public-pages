# 誤解カード48枚 本文実装・検証結果

実装・検証日: 2026-09-04。push・デプロイはしていない。**公開前チェックは未通過（A-8が×）**。

## 作業範囲

- 元の作業ディレクトリの未追跡ファイル2件は変更していない。
- ユーザーの承認を受け、別worktree・ブランチ `codex/gokai-bodies` で作業。
- 開始コミット `5e5c897`、開始時の `git status` はclean。
- 原稿5ファイル、既存 `data/gokai.ts`、47記事のソース、一覧、HubGokai、OG画像テンプレート、CSSは差分0。
- 外部ライブラリ・依存関係の追加なし。
- 実装コミット: `c2333e8` — `feat(gokai): 誤解カード48枚に記事本文を追加(生成スクリプト・表示・JSON-LD)`
- 検証と本記録は2つ目の `test(gokai): 本文の検証を verify-gokai に追加` に含める。

## §6 の12項目

| # | 判定 | 結果 |
|---|---|---|
| 1 | ○ | GOKAI_BODIESは48件、既存GOKAIとslugが1対1、重複なし。原稿の再パース結果と全フィールド一致。 |
| 2 | ○ | 全48枚のtitleに「 — 」、descriptionは70〜200字、checkedOnは2026-09-03。空白・太字記号を除いた本文は最短1,652字。配信HTMLでも本文1,500字以上。 |
| 3 | ○ | 全48枚のcheck 3項目とaskが既存データに完全一致。 |
| 4 | ○ | 本文・次に読む・矢印の全内部リンクが公開済み。/gokai/リンクは対応するslugの存在も検査。 |
| 5 | ○ | 本文中の裁決IDは延べ52件。すべてデータに存在しverified:true、excludedではない。表示するPDFリンクも対応するURLと一致。 |
| 6 | ○ | 金額を全件検査し、説明できない値を一覧化。643,948円（kuriage）のみ。指示書どおり非致命的な報告とし、原稿は未変更。詳細は後述。 |
| 7 | ○ | 指定の禁止文字列は原稿データ・表示本文とも0。公開前チェックA-9/A-10も○。 |
| 8 | ○ | 実例節のある全カードにcase 1件以上があり、最後が/jitsureiへのリンク。 |
| 9 | ○ | build後のkoushin-maitoshiを含む全48枚でArticle・FAQPage各1個、BreadcrumbList重複なし。h1・description・title・OG・Twitterも原稿に一致。FAQは接頭辞なしの3組。 |
| 10 | ○ | curlでtechou-ga-naiを取得し、12個のh2の順序が原稿と一致。全48枚も生成HTML・配信HTMLで見出し順と本文を検査。 |
| 11 | × | app/columns/とcontent/columns/の差分0、保護対象記事のmain要素はバイト一致。ただしHTMLファイル全体のSHA-256は不一致。差分はNext.jsのビルド識別子だけ。厳密なファイル一致条件として×。 |
| 12 | × | ページ数は166のまま、C-1○。作業前後でA-8が○→×、B-2が○→×。その他の判定は同じ。原稿や判定基準は変更していない。 |

○は指定の検査を満たしたことを表す。6は「説明できない金額を非致命的に一覧化する」という検査の成功であり、全金額がamounts.tsで説明できたという意味ではない。

## 実行結果

- 作業前 `npm run build`: 成功。
- 作業前 `npm run prelaunch:check -- http://localhost:3195 RESULT-gokai-bodies-before.md`: exit 0、166ページ、A全項目○。
- `node scripts/import-gokai-bodies.mjs`: 成功。48枚生成。
- `node scripts/import-gokai-bodies.mjs --check`: 成功。生成物の再現性を確認。
- `npx tsc --noEmit --incremental false --pretty false`: 成功。
- 作業後 `npm run build`: 成功（Next内部の生成対象270、サイトマップの公開ページ166）。
- `npm run verify:gokai`: 成功。従来のデータ・カテゴリ・配分表・フォント検査を維持。
- `VERIFY_ORIGIN=http://localhost:3195 VERIFY_BUILT=1 npm run verify:gokai`: exit 0。全48枚の生成HTMLと配信HTML、一覧、5カテゴリ、19ハブ、OG画像48枚の寸法・余白を検証。
- `curl -fsS http://localhost:3195/gokai/techou-ga-nai`: HTTP 200。専用検証関数でh2順序・本文・JSON-LD一致を確認。
- 作業後 `npm run prelaunch:check -- http://localhost:3195 RESULT-gokai-bodies-after.md`: exit 1、A-8×。
- `VERIFY_BUILT=1 VERIFY_INTEGRATION=1 npm run verify:gokai`: exit 1。1〜10を通過した後、11と12の両方の不一致を出力。判定を隠さない。
- sitemapの誤解カード48件すべてでlastModifiedが2026-09-03。/jitsureiで表示された12件の外側IDが事例IDと一致し重複なし。

従来の詳細ページ短文の表示検査（truth/why/when/sources/figure）は、指示書の本文への差し替えに合わせて新原稿の表示全文照合へ置き換えた。既存フィールド自体の検査、check/askの表示、金額・電話番号、一覧・カテゴリ・OG・ハブ検査は残している。既存データが変更されていないことは別途git diffでも検証する。

作業前後の完全なprelaunch記録:
- [作業前](../prelaunch-2026-09-02/RESULT-gokai-bodies-before.md)
- [作業後](../prelaunch-2026-09-02/RESULT-gokai-bodies-after.md)

## 11: HTMLの厳密なハッシュ比較

対象: `.next/server/app/columns/moushitatesho-a4-insatsu.html`

- 作業前SHA-256: `814a043df752be23f729b01921ab8fc7255db420ab696a58aad1b5a479ad4453`
- 作業後SHA-256: `679d3d8bf1e28f4b7216c4126aa259abf01c2b59f477647041e0732fe01479a2`
- 作業前ビルド識別子: `GTLK9Xkm9D0_llFCnZS3n`
- 作業後ビルド識別子: `6fC5BhkgSw8hDdazQiOX_`

main要素はバイト一致。両ファイル内のそれぞれのビルド識別子のみをメモリ上で同じ文字列に置換すると全文一致した。これは差分の原因を確認する補助検査であり、厳密なSHA-256一致の代わりにはしていない。HTMLやビルド識別子を書き換えて検査を通す操作はしていない。

## 12: prelaunchの変化

- A-8: /gokai/kuriageの643,948円が既存のamounts-deriveの計算パターン外。○→×。
- B-2: 原稿中の「ほかの実例も読む」等が増え、/jitsureiの被内部リンクが57本になった。50本の閾値を超え、○→×。原稿の導線は削除していない。
- 既存のB-1（/appの孤立）、B-3（500字未満のツール2ページ）、B-10（アプリ案内3ページの更新日なし）は作業前から×のまま。
- ページ数166、A-1〜7/A-9〜10、C-1/C-5は○のまま。

## 金額の記録（原稿は未変更）

- **643,948円**: `kuriage` の2段落。847,300 × (1 − 0.24) = 643,948。既存の金額検証関数は24%減を計算パターンに含めないため、未説明額として出力。**amounts.ts 外・原稿の出典どおり**として記録し、元原稿や検証基準は変更しない。
- 29,590円 / 16,100円 / 56,800円 / 37,830円（nenkin-dake）、56,850円 / 45,480円（munenkin-owari）: **amounts.ts 外・原稿の出典どおり**。原稿に令和7年度と書かれているため、既存関数は前年度額として許容する。未説明額一覧には出ない。
- 545,760円（munenkin-owari）: 原稿の45,480円 × 12。原稿どおり保持。
- 電話番号0570-078374 / 0570-05-4890: 法テラス・年金相談予約の原稿どおり。金額の正規表現には該当しない。

ここでの記録は原稿と計算の照合であり、公的資料の内容を新たに調査し直したものではない。

## ユーザー承認済みの仕様例外

### インライン太字2か所

見本原稿46行の `**診断書なしで**`、72行の事例本文の `**療育手帳**` を許可。原稿データに記号を残し、表示時にstrongへ変換。その他の未対応記法はエラーにする。

### 見出し順8枚

原稿を並べ替えず、パーサ内でslug・固有節名・直前の節を固定して許可した。例外の追加や位置の変化はエラーにする。

| slug | 固有節 | 原稿内の位置 |
|---|---|---|
| shindan-ga-tsuita-hi | 受診歴を、どう洗い出すか | 数字で見るとの後 |
| karute-ga-nai-owari | 家の中を、どこから探すか | 数字で見るとの後 |
| koushin-de-henkin | 更新で、何を準備するか | 数字で見るとの後 |
| jikou-de-muri | 初診日が古い人が、最初にやること | 数字で見るとの後 |
| omoku-misenai-to | 「盛る」と「伝える」の違い | 数字で見るとの後 |
| nyuuin-shitenai | 通院だけの人が、何を書くか | 数字で見るとの後 |
| amae | 迷いが止めているときに、できること | 数字で見るとの後 |
| tenin-shitabakari | 新しい主治医に、何を渡すか | 同じ状況の人が、どうなったかの後 |

## 原稿の要確認事項（未修正）

見本のFAQには「手帳の等級は参考資料にもなりません」とあり、実例では「療育手帳も資料として」と説明されている。等級の扱いと資料としての扱いの区別が読者に伝わるか、執筆者による確認を推奨する。ここでは事実誤認と断定せず、原稿のどちらの文も変更していない。
