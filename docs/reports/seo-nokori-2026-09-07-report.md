# SEO の残り(2026-09-07 指示書 §1・§2)結果報告

指示書: docs/seo-nokori-2026-09-07-instructions.md。§0(GSC の手動リクエスト)は東さんの手作業なので触っていない。新しい事実は書かず、`data/shorui.ts` `data/amounts.ts` `data/dougu.ts` と指示書の文からだけ組んだ。「あなた」は新しい本文・リードで 0。push はしていない。作業日は 2026-09-08(指示書の日付は 09-07)。

コミット:
1. `feat(jukyuugo): 5ページのカードを年表の直後へ`
2. `feat(shorui): 書類の全体像・様式一覧・FAQ を静的本文に`
3. `feat(dougu): kougin・koushin に FAQPage の JSON-LD、kougin に線の一覧`(この報告を含む)

## §1 /jukyuugo のハブカード5枚を年表の直後へ

| # | 内容 | 結果 |
|---|---|---|
| 1 | typecheck / build / prelaunch / site-graph / verify:hubs | ○ / ○ / × は **B-10 だけ**(B-3・C-6 ○)/ **10 項目 ○** / **verify:hubs は × 8 件(刷新前から。下記)** |
| 2 | `/jukyuugo` の `.hub-card` 5枚が「数字で見る」の h2 より前にあり、下に無い | ○ 変更前: 前 0 / 後 5 → 変更後: **前 5 / 後 0、重複 0**。h2 の順: 年金証書が届いてから → **受給が始まってからの5ページ** → 数字で見る → 不安3つ → 意外と知らない5つ → 次の一歩 → 出典 |
| 3 | `/byoki` `/joukyou` `/nayami` `/okane` `/erabu` の HTML が変更前と完全一致 | ○ **描画される HTML(script の中身を除く)は5本とも完全一致**(21,652 / 18,296 / 17,963 / 17,570 / 17,526 字)。HTML 全体では、ビルドIDと、React の RSC ペイロード(`self.__next_f.push` の中)に条件分岐の空スロット `null` が1つ増える差だけ(DOM には出ない) |
| 4 | CollectionPage の JSON-LD(ItemList 5件) | ○ 変更前後で完全一致(働くと年金はどうなるか / B型・A型作業所 / 抜け出すロードマップ / 受給後のお金 / A型事業所が閉鎖) |
| 5 | スクリーンショット / sitemap | ○ 1400px・390px(横はみ出し 0)。docs/verification/jukyuugo-list-first-2026-09-07/。`/jukyuugo` → 2026-09-08 |

変えたもの: `lib/hub-index.tsx` に `listFirst?: boolean`(jukyuugo だけ true)。`renderHubIndex` で `listFirst` のとき、年表の直後・markdown の前に `p-section`(h2「受給が始まってからの5ページ」+ 道具カード + `HubIndexList`)を描き、下では描かない。下に描くもの(body / nextSteps / sources / tail)が無いハブでは下の `p-section` ごと出さない(空の余白を残さないため。jukyuugo だけ該当)。CSS は足していない。

## §2 道具3本の静的本文と FAQ の JSON-LD

| # | 内容 | 結果 |
|---|---|---|
| 1 | typecheck / build / prelaunch / site-graph / verify:shorui | ○ / ○ / × は **B-10 だけ**(**B-3 ○**: 3本とも 500 字以上)/ **10 項目 ○** / **11 項目 ○**(#1・#7 は刷新前から ×だったので見方を更新。下記) |
| 2 | 3ページの FAQPage | ○ 1つずつ。JSON-LD の質問数 = 画面の FAQ: shorui **5 = 5**、kougin **4 = 4**、koushin **4 = 4**。`<a` 0 |
| 3 | shorui の静的本文 | ○ 書類名 **17 件が `SHORUI_DOCS` と1字一致**(もらう場所ごとに並べ替えた順)。様式 **8 件の名前と URL が `SHINDANSHO_FORMS` + `SHINDANSHO_NAIBU` と一致**。誰にでも要るもの 6・条件つき 11(`shoruiDocs(emptyShoruiAnswers())`)。静的本文とリードの「あなた」**0**。リード「…自分の場合に要るものが足されます。」 |
| 4 | kougin の表の値 | ○ 10 セルが `KOUGIN_2026` / `AMOUNTS_2026` と一致(3,761,000 / 3,858,000 / 4,794,000 / 4,918,000 / 380,000 / 480,000 / 630,000 / 380,000 / 年収180万円未満(1,800,000円未満) / 年収130万円未満(1,300,000円未満))。直書き 0(prelaunch A-8 ○) |
| 5 | 道具の動き | ○ verify:shorui の既存項目 ○。kougin A①〜⑤(20歳以降 → 対象外 / 全額支給・余裕 3,461,000 / 控除 1,640,000・所得 4,360,000 → 2分の1停止 / 扶養2人の線 4,521,000・5,554,000 / 2級+100万 = 1,847,300 → 180万以上)、koushin B①〜④(2027-03-31 / 2026-12-31 / 2026-12-31〜 / 2026-03-01、2026年8月は過ぎ、無期限、2028-02-29 / 2027-11-30 / 2027-11-29〜)が **9/6 の報告と同じ**(lib を直接呼んで検算。今回 lib は触っていない) |
| 6 | スクリーンショット / sitemap | ○ 1400px・390px × 3本(横はみ出し 0)。docs/verification/dougu-seo-2026-09-07/。3本とも → 2026-09-08 |

生ログ: 両フォルダの checks.txt(check.mjs / diff-hubs.py / shots.mjs の出力)、prelaunch.txt、site-graph.txt。

### 2-1 `/dougu/shorui`
- リードと description の「あなたの場合」→「自分の場合」。
- 道具の下に h2: **書類の全体像**(`shoruiSections(SHORUI_DOCS)` の 8 節。各書類は `n` と `stuck` の1行、「誰にでも要るもの」/「条件つき(`why`)」のタグ)/ **診断書は障害の種類で様式が違う**(`SHINDANSHO_FORMS` 5 + `SHINDANSHO_NAIBU` 3、機構ページへのリンク)/ **初診の病院と、診断書を書く病院が違うとき**(→ /nayami/shoshinbi-karute)/ **よくある質問** 5 問(指示書の文そのまま。Q4 の → /erabu/hiyou-souba は本文だけ)。
- 出典: 機構「障害基礎年金を請求するとき」「障害厚生年金を請求するとき」「障害年金の請求手続き等に使用する診断書・関連書類」(`SHORUI_URLS`。リンク名は各ページの実際の title)+ 確認日 2026-09-03(`data/shorui.ts` の照合日)。
- CSS `.sr-static*` を追加(`.kg-static` と同じ体裁)。

### 2-2 `/dougu/kougin` `/dougu/koushin`
- 既存の `FAQ` 配列から `faqJsonLd` で FAQPage を生成(質問・答えはそのまま。答えに内部リンクは無い)。
- kougin に **線の一覧(令和8年度)**: 20歳前傷病の所得制限の基準額(2分の1停止 / 全額停止 × 9月分まで / 10月分から)、扶養親族等の加算(38万 / 48万 / 63万、全額停止の線は1人38万)、健康保険の扶養の線(180万 / 130万)。値は `KOUGIN_2026` / `AMOUNTS_2026`、年度は `FISCAL_YEAR`。出典は既存の `SOURCES`(表の直下のページの出典行)。
- koushin は JSON-LD だけ。

## 指示書と違う点・補足

1. **sitemap の日付は 2026-09-08**(指示書は 09-07)。作業が 09-08 で、prelaunch C-6 は「中身が最後に変わった日」と突き合わせるため、09-07 だと × になる。
2. **`verify:hubs` は刷新前から × 8 件**(`/byoki/tougou` `/byoki/hattatsu` `/byoki/tekiou-fuan` `/erabu/jibun-ka-irai` `/joukyou/hatarakinagara` `/nayami/koushin` `/nayami/shikyuu-teishi` `/nayami/shindansho-komatta`: 本文不一致)。`scripts/verify-hub-content.mjs` が `data/hubs/*.json` の source を 2026-09-02 の原稿(`hub-*-2026-09-02.md`)と突き合わせるもので、9/6 の数字の混在の修正(`ebcc888`)などで JSON 側が更新され、原稿側が古いまま。今回のコミット前(`git stash`)でも同じ 8 件が ×。原稿を直すのは今回の範囲外なので触っていない。
3. **`verify:shorui` #1・#7 も刷新前から ×**(#1: StepFlow の道具リンクが 09-06 に `DouguCards` へ移った / #7: 09-05 に足した Smart App Banner の自サイト URL を外部と数えていた)。今の構造に合わせて見方を更新した(趣旨は不変)。
4. **`/dougu/shorui` のページ全体では「あなた」が 1 件残る**: 道具の見出し「あなたの場合に足すもの」と、足された書類の印「あなたの場合」(`components/tools/ShoruiTool.tsx`、刷新前からの文)。指示書 §2-3-3 は「本文に 0」なので、静的本文とリードは 0 にし、道具の文は触っていない。「自分の場合に足すもの」「自分の場合」に変えるなら1語ずつ。
5. `/jukyuugo` の下の空の `p-section` を出さないようにした(listFirst で一覧を上に出したとき、下に描くものが無いため)。他のハブは条件に当たらないので DOM は同じ(上の検証3)。
6. `/byoki` ほか5本の「HTML の diff 0」は、描画される HTML で 0。HTML 全体では React の RSC ペイロード(script の中)に `null` が1つ増える(条件分岐のスロット)。画面・DOM・JSON-LD に差は無い。
