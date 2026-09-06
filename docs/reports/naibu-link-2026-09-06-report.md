# 被リンクの薄い22ページに本文からのリンクを足す(2026-09-06)結果報告

指示書: docs/naibu-link-2026-09-06-instructions.md。新しい文章は書いていない。触ったのはデータ表 3 か所だけ(`lib/hubs.ts` の `COLUMN_HUB_ASSIGNMENTS`、`components/platform/HubLanding.tsx` の `siblingLinks`、`data/gokai.ts` の各カードの `hubs`)。記事本文(`content/columns/*.ts`)・ハブ本文(`data/hubs/*.json`)・sitemap の差分は 0。push はしていない。

## 検査2 の前後

| | 未達(本文からの被リンクが2本未満) |
|---|---|
| 前(2026-09-05 report.json) | **22** |
| 後 | **2**(`/gokai/counseling` 0 本、`/gokai/gennin-ga-aru` 1 本。理由は下の「置かなかった候補」) |

22 ページの本文被リンク(後): tougou 3・tenkan 2・izon 3・kokyuuki 2・nanbyou 2・choukaku 2・ninchishou 2・shikaku 3・shinzou 2 / gakusei 3・kazoku-ga-tetsudau 3・seikatsu-hogo 3・shufu-mushoku 3・zeikin 3・irai-subeki-case 2 / 65sai-sugita 3・kekkon-shitara 2・kiso-ka-kousei-nitaku 2・munenkin-owari 2・tenin-shitabakari 2 / counseling 0・gennin-ga-aru 1

## §2 検証

| # | 内容 | 結果 |
|---|---|---|
| 1 | typecheck / build / verify:site-graph / verify:columns | ○ / ○ / 10 項目 ○ / 13 項目 ○(baseline は変えていない・変わっていない) |
| 2 | 検査2 の未達が 22 → 5 以下 | ○ 22 → 2 |
| 3 | 足したリンクが全部 200・同じページに同じ先が 2 本以上出ない | ○ 36 本すべて表示 1 回・200 |
| 4 | `secondary` が 4 本以上の記事 | 0(B の siblingLinks も 1 ハブ 3 本まで) |
| 5 | 記事本文・ハブ本文の差分 | 0 |
| 6 | 内部リンク切れ 0・sitemap を変えない | ○ site-graph 10 ○。`app/sitemap.ts` `lib/sitemap-static-dates.ts` は触っていない |
| 7 | 1400px / 390px で `/byoki/tougou` `/joukyou/gakusei` `/columns/nofu-yoken` の末尾が崩れない | ○ 横はみ出し 0px。docs/verification/naibu-link-2026-09-06/*.png(6 枚) |

## 足したリンク(36 本)

### A. 記事 → ハブ(`COLUMN_HUB_ASSIGNMENTS[slug].secondary`)

| 記事 | 足した先 | 根拠(記事にその話題が出ている) |
|---|---|---|
| tokyu-hantei-guideline | /byoki/tougou | 統合失調症 3 回・精神の障害全般の目安表 |
| taishou-shoubyou-kyoukai | /byoki/tenkan、/byoki/izon | 対象一覧に「てんかん → 対象」、「アルコール・薬物依存症 → 依存症候群に伴う精神病状態などは対象になり得る」 |
| nofu-yoken | /joukyou/gakusei、/joukyou/shufu-mushoku | 学生納付特例 14 回、第3号 5 回 |
| hatachi-mae | /joukyou/gakusei | 学生・20歳前 |
| nenkin-jimusho-soudan | /joukyou/kazoku-ga-tetsudau、/erabu/irai-subeki-case | 委任状 5 回・家族 12 回、「(4) 社労士に相談する … 依頼するかどうかは、その後で判断」 |
| moushitatesho-kakikata | /joukyou/kazoku-ga-tetsudau | FAQ「作成を家族が手伝うこと自体は問題ありません。請求手続き自体も、委任状があれば第三者が行えます」(「代筆」の語は無いが同じ話題) |
| hikazei-shuunyuu | /joukyou/seikatsu-hogo、/okane/zeikin | 生活保護 6 回、税 61 回。**4 本になるので `/gokai`(一覧ページ。いちばん関係が薄い)を外した** |
| ikura-moraeru | /joukyou/seikatsu-hogo、/okane/zeikin | 生活保護 4 回、税金 3 回・非課税 7 回 |
| kiso-kousei-chigai | /joukyou/shufu-mushoku | 第3号 12 回・配偶者 18 回・主婦 2 回 |
| jibun-de-shinsei | /erabu/irai-subeki-case | 社労士 23 回・依頼 19 回 |

### B. ハブ → 隣の病名ハブ(`siblingLinks`)

| 元 | 足した先 |
|---|---|
| /byoki/utsu-soukyoku | tougou(新規) |
| /byoki/tekiou-fuan | tougou、izon(新規) |
| /byoki/tougou | izon(新規) |
| /byoki/tounyou | shikaku(糖尿病網膜症。逆向きは既存) |
| /byoki/jinzou-touseki | shinzou |
| /byoki/shinzou | kokyuuki |
| /byoki/shitai | nanbyou(新規。逆向きは既存) |
| /byoki/koujinou | nanbyou(**shitai と差し替え**。下記) |
| /byoki/gengo | choukaku(逆向きは既存) |
| /byoki/ketsueki | kokyuuki |
| /byoki/shikaku | choukaku |
| /byoki/choukaku | shikaku |
| /byoki/nanbyou | ninchishou、tenkan |

ラベルは、手書きの `siblingLabels` に無いハブ(統合失調症・てんかん・依存症)を `HUBS` の `shortLabel` から取る fallback にした(既存の手書きラベルはそのまま。文言を変えないため)。

### C. ハブ → 誤解カード(`data/gokai.ts` の `hubs`)

| カード | 足したハブ | 根拠(ハブ本文にその話題が出ている) |
|---|---|---|
| 65sai-sugita | /joukyou/65sai-ijou、/nayami/sokyuu | 65歳 36 回 / 3 回 |
| kekkon-shitara | /joukyou/shufu-mushoku | 結婚 2 回・配偶者 2 回 |
| kiso-ka-kousei-nitaku | /joukyou/shoubyou-teatekin-kara | 「初診日が会社員のときなら障害厚生年金、退職後なら障害基礎年金だけ … 報酬比例の上乗せ」(二階建ての話) |
| munenkin-owari | /joukyou/gakusei | FAQ「平成3年3月以前に学生だった人は? 当時、学生は任意加入でした … 特別障害給付金」(カードと同じ話題) |
| tenin-shitabakari | /nayami/sokyuu | 「転院していれば、当時の病院に頼む」 |

各ハブの表示は `HUB_GOKAI_LIMIT = 3`(データ順の先頭 3 枚)。足した 5 ハブはいずれも 3 枚以下なので、全部表示される(上の §2-3 で確認)。

## 置かなかった候補と理由

| 候補 | 理由 |
|---|---|
| A: taishou-shoubyou-kyoukai → /byoki/nanbyou | 記事に「難病」が 0 回。話題が出ていない |
| A: fushikyuu-shinsa-seikyu → /erabu/irai-subeki-case | 記事の「依頼」は裁判の弁護士費用の 1 か所だけで、社労士に頼むかの話が無い。代わりに nenkin-jimusho-soudan(「社労士に相談する」の節あり)を置いて 2 本にした |
| A: kiso-kousei-chigai の本文に個別カード | 記事本文に `→ 「…」は誤解です(/gokai/…)` の形で置く仕組みは**ある**が、本文を変えることになる(§2-5 本文差分 0)ので置かない。kiso-ka-kousei-nitaku は C の /joukyou/shoubyou-teatekin-kara で 2 本にした |
| B: /byoki/koujinou → tenkan | koujinou の siblingLinks は既に 3 本(ninchishou・gengo・shitai)。tenkan と nanbyou の両方は入らないので、被リンク 0 で他に足しにくい **nanbyou を shitai と差し替え**た(shitai の本文被リンクは 4 本あり、外しても 3 本)。tenkan は nanbyou→tenkan と記事 taishou-shoubyou-kyoukai で 2 本 |
| C: counseling → /nayami/shoshinbi-karute | ハブに「カウンセリング」は 2 回あるが、カードが既に 8 枚で表示は先頭 3 枚。足しても画面に出ない(データ順の入れ替えは今回の範囲外) |
| C: counseling → /byoki/tekiou-fuan | ハブ本文に「カウンセリング」0 回。ほかに話題の合う・枠のあるハブが無い。**未達のまま(0 本)** |
| C: gennin-ga-aru → /nayami/shoshinbi-karute | 「相当因果関係」0 回、かつ 8 枚で表示枠なし |
| C: gennin-ga-aru → /byoki/nanbyou | カードは産後うつ・更年期(精神)の話。ハブに産後・更年期 0 回で合わない。/nayami/fushikyu の「産後」は産前産後の免除の話で別。**未達のまま(1 本)** |
| C: kekkon-shitara → /okane/chousei | 結婚・配偶者 0 回 |
| C: munenkin-owari → /nayami/fushikyu | 特別障害給付金・任意加入 0 回 |
| C: 65sai-sugita 以外で /joukyou/65sai-ijou に他カード | 候補になし |

## 変更ファイル

`lib/hubs.ts`(10 記事の secondary)、`components/platform/HubLanding.tsx`(siblingLinks 13 ハブ・ラベルの fallback・`HUBS` の import)、`data/gokai.ts`(5 カードの hubs)。検証記録は docs/verification/naibu-link-2026-09-06/(site-graph.txt・verify-columns.txt・png 6 枚)。

## §4(Search Console)への補足

未達で残った `/gokai/counseling` と `/gokai/gennin-ga-aru` は、内部リンクでは拾えなかったので、URL 検査の送信枠に余りがあれば手で送るのがよい。
