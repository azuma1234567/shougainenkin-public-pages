# SEO / AIO 監査と、次に狙う記事 (2026-09-04)

Search Console(過去28日、2026-09-01まで)とリポジトリの実装を照合した結果と、Claude Code に渡す作業指示。
実行は §5 のコマンドをそのまま貼る。§6 は「次に書く記事」の判断材料。

## 0. 結論(先に)

1. **いちばん大きい問題は「記事が足りない」ではなく「索引に載っていない」。** sitemap は 166 URL を出しているのに、Google が索引に登録しているのは 49 ページ。表示(impression)が付いているのは /columns 配下だけで、/byoki /nayami /joukyou /okane /erabu /gokai /dougu /jitsurei /suuji /yougo は 28日間で表示 0。つまり、いま書いてある本文の 7 割は、まだ検索の土俵に上がっていない。
2. 記事を増やす前に、(a) 47本の書き直しを本番に出す(ハブ・道具・誤解・実例への内部リンクが一気に増える)、(b) sitemap に更新日を付ける、(c) ハブに構造化データと更新日を出す、(d) 上位 30 URL を URL 検査から手動で索引登録する、の 4 つを先に済ませる。これは全部 Claude Code と手作業で 1〜2 日で終わる。
3. 記事の追加は「やらない」ではなく「的を絞る」。検索されているのに答えるページがない語が 5 つある(§6)。それ以外の新規記事は、上の 4 つが効いて索引が 120 以上になってから。

数字の根拠: Search Console 検索パフォーマンス 28日 = クリック 29・表示 1,300・CTR 2.2%・平均掲載順位 32.4。インデックス作成 = 登録済み 49・未登録 4(残りは「検出 - インデックス未登録」等の内訳が UI 上で個別確認できていない)。サイトマップ = 検出 166、最終読み取り 2026-09-04。

## 1. Search Console で見えたこと

### 1-1. クリックが付いているページ(28日)

| ページ | クリック | 平均順位 |
|---|---|---|
| /columns/moushitatesho-a4-insatsu | 13 | 6.7 |
| /columns/moushitatesho-kikan-kugiri | 5 | 7.4 |
| /columns/teishutsusaki-yuusou | 3 | 8.6 |
| /columns/nenkin-jimusho-soudan | 2 | 8.8 |
| その他 | 各1 | — |

★3本(申立書の印刷・期間区切り・提出先郵送)が全クリックの 7 割。これが「書き直しで字数を変えない」判断の根拠でもある。

### 1-2. 表示はあるがクリック 0 の検索語(順位が遠い)

| 検索語 | 表示 | 順位 | いまの受け皿 | 判断 |
|---|---|---|---|---|
| 障害年金 初診日 わからない | 65 | 68.6 | /columns/shoshinbi-fumei, /nayami/shoshinbi-karute | 受け皿はある。索引・内部リンクで上げる |
| 日常生活能力の判定 | 35 | 55.5 | /columns/nichijou-seikatsu-nouryoku | 同上 |
| 障害年金 ガイドライン | 35 | 77.8 | /columns/tokyu-hantei-guideline | 同上 |
| 障害年金 申請 結果待ち | 34 | 41.1 | /columns/shinsei-kikan の一部 | **記事の的**(§6-1) |
| 障害年金 一人暮らし | 29 | 61.1 | /columns/hitorigurashi-furi, /joukyou/hitorigurashi | 受け皿あり |
| 障害年金 就労 | 29 | 79.2 | /columns/hatarakinagara, /joukyou/hatarakinagara | 受け皿あり |
| 障害年金 支給停止 | 15 | 82.1 | /columns/shikyuu-teishi-fukkatsu, /nayami/shikyuu-teishi | 受け皿あり |
| 障害年金 神経症 | 10 | 99.7 | /columns/taishou-shoubyou-kyoukai の一節 | **記事の的**(§6-3) |
| 障害年金 打ち切り | 9 | 86.4 | 「支給停止」の記事にこの語がない | **語を足す**(§6-2) |
| 障害年金 追加書類 | 5 | 71.0 | なし | **記事の的**(§6-4) |
| 障害年金 傷病手当金 | 8 | 87.2 | /columns/shoubyou-teatekin | 受け皿あり |

### 1-3. あと少しで 1 ページ目に届く語

| 検索語 | 順位 | ページ |
|---|---|---|
| 障害年金 決定通知書 いつ届く | 5 | shinsei-kikan |
| 受診状況等証明書 郵送 | 10 | jushinjokyo-shomeisho(表示 48・順位 13.9) |
| 年金事務所 相談 持ち物 | 11 | nenkin-jimusho-soudan |
| 年金事務所に持っていくもの | 12 | nenkin-jimusho-soudan |
| (hitsuyou-shorui) | 23.2 | 表示 19 |

このゾーンは「タイトルと最初の 200 字が検索語に答えているか」で順位が動く。§4-3 で扱う。

### 1-4. 表示ゼロの領域

/byoki(21)、/joukyou(9)、/nayami(6)、/okane(3)、/erabu(5)、/gokai(N)、/dougu(5)、/jitsurei、/suuji、/yougo。
44 のハブ JSON のうち 40 に FAQ 節があり、本文量も十分なのに、表示が 0 なのは品質ではなく発見性(索引・リンク)の問題。

## 2. 実装側で見つかった穴

| # | 場所 | いまの状態 | 影響 |
|---|---|---|---|
| A | `app/sitemap.ts` | 静的 30 URL とハブ 44 URL に `lastModified` が無い。列記事・誤解ページにはある | 更新日の無い URL は再クロール優先度が下がる。ハブが「検出のみ」で止まる一因 |
| B | `components/platform/HubLanding.tsx` / `lib/hub-pages.tsx` | ハブ 44 ページに JSON-LD が一切無い(パンくずも FAQ も) | 列記事だけ Article+FAQPage を出していて、ハブは裸。AI 検索の引用候補に上がりにくい |
| C | ハブ本文 | 更新日が画面に出ない | ユーザーにも検索エンジンにも「生きているページ」と分からない |
| D | 47 本の書き直し | `codex/columns-rewrite` にあり、本番未反映(要確認) | ハブ・道具・誤解・実例への内部リンクは、この 47 本が本番に出て初めて張られる。索引 49 → 100 超の最短経路 |
| E | Bing / IndexNow | 未設定 | Bing・Copilot・DuckDuckGo・ChatGPT 検索(Bing 索引)への到達がゼロ。IndexNow は 1 ファイル置くだけ |
| F | `/jitsurei` | 1 URL に絞り込みクエリ。57 事例が個別 URL を持たない | 「うつ病 2級 事例」のような語の受け皿が無い。ただし今は増やさない(§6-6) |
| G | `robots.ts` | 全許可のみ。AI クローラーへの態度表明なし | いまは問題なし。llms.txt は優先度低(§4-6) |
| H | 列記事の `dateModified` | 2026-08-13〜08-27 のまま。書き直しで 09-03 になる予定 | D と同時に解決 |

問題なし(確認済み): canonical(`lib/seo.ts`)、metadataBase、OG 画像、パンくず JSON-LD(トップ・列記事・誤解)、Person/Organization の publisher、robots に sitemap。

## 3. 優先順位(効く順)

| 順 | 作業 | 誰が | 見込み |
|---|---|---|---|
| 1 | 47 本の書き直しを main に merge して push | 東さん(Codex の完了確認 → merge) | 内部リンク +300 本以上。最大の一手 |
| 2 | sitemap に全 URL の lastModified | Claude Code (§5 T1) | 再クロールの優先度 |
| 3 | ハブに BreadcrumbList + FAQPage JSON-LD、画面に更新日 | Claude Code (§5 T2, T3) | AI 検索の引用・リッチリザルト |
| 4 | IndexNow 鍵の設置 + Bing Webmaster Tools 登録 | Claude Code (§5 T4) + 東さん(登録は手作業) | Bing 系の索引がゼロから始まる |
| 5 | URL 検査で上位 30 URL を索引登録リクエスト | 東さん(手作業、1 日 10 件×3 日) | 索引 49 → 80 前後 |
| 6 | 惜しい語 5 つのタイトル・冒頭調整 | Claude Code (§5 T5) | 順位 5〜12 位 → 1 ページ目上位 |
| 7 | 記事の的 4 本 + 語の追加 1 件 | 私が原稿 → Claude Code | §6 |
| 8 | 4 週間後に GSC を再計測 | 東さん | 索引数・表示・/byoki の初表示を確認 |

## 4. 各作業の仕様

### 4-1. sitemap lastModified (T1)

- 静的ページ: `lib/sitemap-static-dates.ts` を新設し、`Record<path, "YYYY-MM-DD">` で持つ。初期値は各ページの最終コミット日(`git log -1 --format=%cs -- app/<path>/page.tsx`)を機械的に入れる。以後、ページを変えた PR でこの表も更新する(prelaunch-check に「表の日付 < 該当 page.tsx の最終コミット日」なら警告を追加)。
- ハブ: `data/hubs/*.json` に `"dateModified": "YYYY-MM-DD"` を追加。初期値は各 JSON の最終コミット日。`HubContent` 型に必須で足す。
- `app/sitemap.ts` は全エントリに `lastModified` を付け、`changeFrequency`・`priority` は付けない(Google は無視する。ノイズ)。
- 検証: `curl -s https://shougainenkin-note.net/sitemap.xml | grep -c '<lastmod>'` が `<url>` の数と一致。

### 4-2. ハブの JSON-LD と更新日 (T2, T3)

- `HubLanding` に `breadcrumbJsonLd`(既存 `lib/seo.ts`)を出す。パンくずは `content.breadcrumb` と `hub.path` から。
- FAQ: `MarkdownArticle` が `**Q.` 行で accordion を作っているのと同じ規則で、`lib/hub-content.ts` に `extractHubFaqs(source): {question, answer}[]` を足し、`faqJsonLd` に渡す。**画面に出ている Q/A と JSON-LD の Q/A が完全一致すること**(Google のガイドライン。見えない FAQ を入れない)。answer は Markdown 記法を落としたプレーンテキスト。
- Article は出さない。ハブは「まとめページ」なので `WebPage` + `about`(病名)程度で十分。無理に Article を付けると列記事と競合する。
- 更新日: h1 の下に `<p class="hub-updated">最終更新 2026年9月4日</p>` を出す。`dateModified` の値。CSS は列記事の更新日と同じ見た目。
- `/dougu/*` 5 ページは既に個別 JSON-LD があるか確認し、無ければ `WebApplication` + `FAQPage`(moushitatesho の設計書 §11 と同形)を付ける。
- 検証: Google リッチリザルトテストで /byoki/utsu-soukyoku, /nayami/fushikyu, /erabu/hiyou-souba の 3 URL が FAQ を検出。

### 4-3. 惜しい語のタイトル・冒頭 (T5)

URL・slug・h1 は変えない(既存 47 本の約束)。変えるのは `<title>`(metadata.title)、description、リード最初の 1 文だけ。

| ページ | 検索語 | 直す点 |
|---|---|---|
| shinsei-kikan | 決定通知書 いつ届く | title に「決定通知はいつ届く」を入れる。リード 1 文目で「申請から決定通知まで、標準は 3か月(認定審査を複数回行う場合は 4か月)」と直答(本文に既にある表現をそのまま使う) |
| jushinjokyo-shomeisho | 受診状況等証明書 郵送 | h2「受診状況等証明書を郵送で依頼する方法」が既にある。title に「郵送で取り寄せる」を足し、description でもその h2 に触れる |
| nenkin-jimusho-soudan | 持ち物 / 持っていくもの | title を「年金事務所の相談に持っていくもの」に寄せる。リード直後に持ち物の箇条書きを置く(本文の下の方にあるなら上に移す) |
| hitsuyou-shorui | 必要書類 | description を「請求に必要な書類を、全員共通/初診日の証明/人によって違う、の 3 段で」に |
| shoshinbi-fumei | 初診日 わからない | title に「わからないときの探し方 5 つ」など、本文の h2 数に合わせた具体の数を入れる |

### 4-4. IndexNow + Bing (T4)

- `public/<key>.txt` に 32 桁の鍵を置く(鍵は `openssl rand -hex 16`)。鍵はリポジトリに入れてよい(公開が前提の仕組み)。
- `scripts/indexnow-submit.mjs`: sitemap.xml を読み、`https://api.indexnow.org/indexnow` に `{host, key, keyLocation, urlList}` を POST。引数なしなら全 URL、`--since YYYY-MM-DD` なら lastModified がそれ以降の URL だけ。
- `package.json` に `"indexnow": "node scripts/indexnow-submit.mjs --since $(date -v-7d +%F)"`。デプロイ後に東さんが手で叩く(自動化は後)。
- Bing Webmaster Tools は東さんが「Google Search Console からインポート」で登録(アカウント作成は私はしない)。サイトマップ URL を登録。
- サーバーへの送信は「サイト運営者の手元のスクリプトから検索エンジンへ」であり、サイト訪問者からの送信ではない。道具の「何も送らない」約束には触れない。

### 4-5. URL 検査(手作業、東さん)

Search Console → URL 検査 → 「インデックス登録をリクエスト」。1 日 10 件前後で止まる。順番:
1. /byoki/utsu-soukyoku, /byoki/tekiou-fuan, /byoki/hattatsu, /byoki/tougou, /byoki/tenkan(精神 70% の受け皿)
2. /nayami/fushikyu, /nayami/shoshinbi-karute, /nayami/shikyuu-teishi, /nayami/koushin
3. /dougu/mitate, /dougu/kingaku, /dougu/shorui, /dougu/madoguchi, /dougu/moushitatesho
4. /erabu/hiyou-souba, /erabu/jibun-ka-irai, /joukyou/hatarakinagara, /joukyou/hitorigurashi, /joukyou/hatachi-mae
5. /jitsurei, /gokai, /suuji, /yougo, /hajimete, /shinsei
6. 残りのハブ

### 4-6. やらない・後回し

- llms.txt: 効果の実証が無い。置くなら 10 分で済むので T6 に入れてあるが、順位は最後。
- 事例の個別 URL 化(F): 57 ページ増えるが薄いページになりやすい。索引が 120 を超えてから、病名×等級で「実例まとめ」5〜8 ページに束ねる形で検討。
- AI クローラーの robots 制御: 引用されたいので許可のまま。
- 外部被リンク獲得の営業: 東さんが苦手と言っていた領域。社労士掲載(別計画)が回れば自然に付く。

## 5. Claude Code への指示(貼るだけ)

```
cd ~/Projects/shougainenkin-public-pages && git checkout main && git pull && git checkout -b codex/seo-aio-2026-09-04 && claude "docs/seo-aio-audit-2026-09-04.md を読み、§4 の仕様どおりに T1〜T6 を実装してください。順番と完了条件:

T1 sitemap lastModified: lib/sitemap-static-dates.ts 新設、data/hubs/*.json に dateModified 追加(初期値は git log -1 --format=%cs の日付)、app/sitemap.ts で全エントリに lastModified。scripts/prelaunch-check.mjs に C-2 として「sitemap の全 URL に lastModified がある」「静的表の日付が page.tsx の最終コミット日より古くない」を追加。
T2 ハブ JSON-LD: lib/hub-content.ts に extractHubFaqs()、HubLanding に BreadcrumbList と FAQPage を出力。画面の Q/A と JSON-LD の Q/A が一致することをテストで保証(FAQ 節を持つ 40 ハブ全部で、抽出した question 配列と MarkdownArticle が描画する summary の配列を比較)。
T3 ハブ更新日: h1 直下に「最終更新 YYYY年M月D日」。列記事の更新日と同じクラス・見た目。
T4 IndexNow: public/<key>.txt、scripts/indexnow-submit.mjs、package.json の indexnow スクリプト。鍵は openssl rand -hex 16。実際の送信は行わない(東さんがデプロイ後に実行)。
T5 惜しい語 5 本: §4-3 の表どおりに title/description/リード 1 文目のみ変更。URL・slug・h1・本文の h2 構成は変えない。字数は ±3% 以内。docs/verification/ に変更前後の title/description を並べた表を出す。
T6 llms.txt: public/llms.txt にサイト説明 3 行と、ハブ・道具・列記事の一覧を「タイトル: URL」形式で。sitemap から生成する scripts/build-llms-txt.mjs を作り、ビルド前に走らせる。

守ること: 既存記事の URL/slug/h1 は変えない。数字は本文に既にあるものだけ使う。道具ページは訪問者のブラウザから何も送信しない。node scripts/prelaunch-check.mjs と npm run build が通ること。
完了したら docs/verification/seo-aio-2026-09-04.md に、各 T の変更ファイル・検証コマンドと結果・リッチリザルトテストで確認すべき URL 3 つを書く。commit は T ごとに分ける。push はしない。"
```

前提: `codex/columns-rewrite` が main に merge 済みであること。未 merge なら先にそちら(内部リンクが無い状態で T2 を検証すると FAQ 抽出のテスト対象が古い本文になる)。

## 6. 次に狙う記事(GSC の穴に対応するもの)

「記事を増やしたい」に対する答え: **4 本 + 1 修正**。それ以上は §3 の 1〜5 が効いてから。

### 6-1. 申請した後、結果待ちの過ごし方(新規)
- 検索語: 障害年金 申請 結果待ち(表示 34・順位 41)、決定通知書 いつ届く(順位 5)
- 中身: 標準処理期間 → 何日目に何が届くか(受付控え・照会・決定通知・年金証書・初回振込) → 遅れる 3 パターン(照会、認定医の追加審査、書類不備) → 待つ間にやること(手帳、給付金、傷病手当金との調整、就労) → 結果が来たときの読み方(等級・認定日・次回診断書提出年月)。
- 使える数字: 本文に既にある標準処理期間と、令和6年度の等級分布(1級10.9/2級53.9/3級22.1)、非該当13.0%。
- 道具: /dougu/kingaku, /dougu/shorui。誤解: 「連絡が無いのは不支給」系があれば。実例: 待ち期間中に追加書類で結論が変わった事例があれば /jitsurei から。
- slug 案: `kekka-machi-sugoshikata`。字数 8,000 前後。

### 6-2. 「打ち切り」の語を足す(既存修正、新規記事なし)
- 検索語: 障害年金 打ち切り(表示 9・順位 86)
- shikyuu-teishi-fukkatsu と /nayami/shikyuu-teishi に「打ち切り」という言葉が出ていない。ユーザーの言葉は「打ち切り」、制度の言葉は「支給停止」。リードに「『打ち切り』と呼ばれることが多い支給停止は…」と 1 文入れ、h2 か FAQ に「打ち切りと支給停止は同じ?」を足す。T5 と同じ扱いで ±3%。

### 6-3. 神経症(不安障害・強迫性障害・パニック障害など)と障害年金(新規)
- 検索語: 障害年金 神経症(表示 10・順位 99.7)。/byoki/tekiou-fuan があるが「神経症」という語で書いていない。
- 中身: 認定基準の「神経症は原則として認定の対象とならない」の原文と、例外(精神病の病態を示している場合、ICD-10 の F2/F3 相当のコード併記)、診断書のどこを見るか(ICD コード欄・備考)、うつ病や統合失調症との併存、実例、社労士に頼む判断。
- 医師の視点では書かない(方針)。「診断書に何と書いてもらうか」を患者側から。
- slug 案: `shinkeishou-taishougai`。字数 9,000 前後。§6-1 より難度が高いので 2 番目。

### 6-4. 追加書類・照会が来たとき(新規)
- 検索語: 障害年金 追加書類(表示 5・順位 71)。受け皿なし。
- 中身: 照会の種類(初診日の再確認、就労状況の照会、診断書の記載不備、所得証明)、期限、返し方(郵送・持参)、返さないとどうなるか、照会が来た=不利ではない、の順。
- 実例: 「追加書類で結論が変わった」事例が /jitsurei に複数ある想定。ID を引く。
- slug 案: `tsuika-shorui-shoukai`。字数 7,000 前後。6-1 と対になるので同時に書く。

### 6-5. 病名ハブの「表示ゼロ」を埋める(記事ではなく索引)
- /byoki の 21 ページは既に本文がある。§3 の 1〜5 を先にやる。4 週間後に /byoki の表示が付き始めなければ、そのとき初めて「本文の書き直し」を検討する。

### 6-6. 書かない方がいいもの
- 「障害年金 いくら」系の一般記事: ikura-moraeru と /okane/ikura と /dougu/kingaku が既にある。増やすと共食い。
- 病名別の「○○で障害年金はもらえる?」の量産: ハブが 21 ある。索引されてから。
- 社労士の選び方系: /erabu 5 ページで足りている。

## 7. 4 週間後に見るもの

- 索引登録済みページ数(49 →)
- /byoki /nayami /dougu の初表示があるか
- §1-2 の語の順位(特に 結果待ち・神経症・追加書類は新記事の効果)
- §1-3 の語が 1 ページ目上位に入ったか
- 生成 AI 機能レポート(GSC 左メニュー)に表示が付き始めたか
