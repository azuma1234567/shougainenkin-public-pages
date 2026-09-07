# /about /quality /support の書き直し(2026-09-07 指示書)結果報告

指示書: docs/about-quality-support-2026-09-07-instructions.md §1〜§6。3ページとも server component で、文言は §1〜§3 の原稿のとおり。「任意の1段落」は、最初の指示(9/8 朝)では判断が無かったので入れず、同日の再指示「任意の1段落は入れてください」で **入れた**(コミット5)。「あなた」は新しい文で 0(残るのは原稿にある引用「あなたは◯級」だけ)。「個人で運営」「個人運営」0。黄色い箱・新しい CSS クラスなし。push はしていない。作業日は 2026-09-08。

コミット:
1. `content(about): 「このサイトについて」に書き直す`(フッターの表示変更・SITE_LEGAL_UPDATED を含む)
2. `content(quality): 情報の作り方と訂正の記録`(`data/corrections.ts` 新設)
3. `content(support): サイトの道具の節を足し、アプリの節を整理`(この報告を含む)
4. `fix(shorui): 「あなたの場合」を「自分の場合」に(2語)`((b) の検証ログを含む)
5. `content(about): 任意の1段落を入れる`(再指示。1〜4 は push 済み)

## ★ アプリ側の確認(§3)

| ★ | 確認したもの | 結果 |
|---|---|---|
| 「月400回まで無料」 | アプリ repo `src/lib/freeTrialCore.ts`(現行 1.0.7: 「AI機能は、ひと月に合計400回まで使えます」)、`server/lib/security/ai-usage-limits.ts`(`FREE_TRIAL_MONTHLY_LIMIT_DEFAULT = 400`。既定400回/月、環境変数で上書き可) | **一致**。原文のまま |
| 「購入の復元」ボタンが残っているか | 現行の入口 `App.tsx` → `src/MockupV4App 14.tsx` の設定画面に `<Btn …>購入の復元</Btn>`(15836行)と `doRestore()` が残っている | **残っている**ので、原稿の2文目「過去に購入した方が「購入の復元」を押しても、機能は変わりません(復元の操作は不要です)」を**そのまま入れた**。旧「購入を復元できますか」の Q は原稿どおり統合して削除 |

## §5 検証

| # | 内容 | 結果 |
|---|---|---|
| 1 | typecheck / build / prelaunch / site-graph | ○ / ○ / × は **B-10 だけ**(B-3・C-6・C-7 ○)/ **10 項目 ○** |
| 2 | 本文が原稿と一致、「あなた」0、「個人で運営」「個人運営」0 | ○ 原稿のコードブロックの各行(「[…]」の指示行・★を除く)が本文にあるかを機械で照合: /about 16 本中、無いのは「(/ads)(/privacy)のパス表記」の1行だけ(パスは本文ではリンク。任意の1段落もコミット5で入り、一致)。/quality 36 本すべて。/support 33 本すべて。「あなた」: /about 0・/support 0・/quality 2(原稿にある引用「あなたは◯級」の2か所)。「個人で運営」「個人運営」: 3ページとも 0 |
| 3 | `/about#ad-promises` と、`/terms` `/ads` `/quality` からのリンク | id は残した(h2「お金のこと」に `id="ad-promises"`)。**`/terms` `/ads` に `/about#ad-promises` へのリンクは刷新前から無く**(repo 全体で `ad-promises` を参照していたのは旧 `/quality` の1文だけ)、その1文は §2 の原稿に無いので消えた。いま `#ad-promises` への内部リンクは 0 本(下記) |
| 4 | 訂正の記録が `data/corrections.ts` から3行 | ○ 3 行(2026-09-06 × 3: 申立書 / 更新関連の記事・カード(/columns/koushin-kakuninhodo ほか)/ 障害年金の金額) |
| 5 | 道具の表7行が `TOOLS` の名前と一致、保存の挙動が実装と一致 | ○ 7 行の名前が `TOOLS[id].name` と完全一致。挙動をコードで確認: mitate = `saveMitate` はボタン「この結果を、この端末に残す」の1回だけ / kingaku = `localStorage` 参照なし / shorui = `saveShoruiChecks` を変更のたびに自動 + 「共用のパソコンを使っています(この端末に保存しない)」/ madoguchi = `useEffect` で pref/code を自動保存 + 同じボタン / moushitatesho = 500ms 後に自動保存(`noSave` で止まる)+ チェック「共用のパソコンなので、この端末に残さない」+ 「この端末の下書きを消す → 確認」/ kougin・koushin = ボタン「この端末に保存する」と「入力を消す」 |
| 6 | フッターの表示、全ページから届く | ○ 「このサイトについて」「情報の作り方」「お問い合わせ」(/shinsei ほかのフッターで確認)。site-graph 検査 4(フッター4区分)・10(内部リンク切れ 0)○ |
| 7 | スクリーンショット | ○ 1400px・390px × 3 ページ(横はみ出し 0)。docs/verification/about-quality-support-2026-09-07/ |

生ログ: 同フォルダの checks.txt / prelaunch.txt / site-graph.txt / verify-hubs.txt。

## 変えたもの

- `app/about/page.tsx`: §1 の原稿(任意の1段落「運営者自身が、申請する側の立場で…」を「誰が作っているか」の3段落目の後に入れた)。title「このサイトについて(運営者情報)」、h1「このサイトについて」、パンくず「このサイトについて」。JSON-LD(BreadcrumbList・publisher)は現行のまま。「お金のこと」の h2 に `id="ad-promises"`、6項目・`adSourceList`・`HAS_ACTIVE_ADS` の切替は現行のまま。
- `app/quality/page.tsx`: §2 の原稿。title「情報の作り方と、訂正の記録」、h1「情報の作り方」。訂正の記録は `data/corrections.ts` から `article-table-wrap` の表で描く(h2 に `id="corrections"`)。アプリの知識は `QUALITY_METRICS` から。
- `app/support/page.tsx`: §3 の原稿。道具の表は `TOOLS[id].name`(リンクつき)。旧「購入を復元できますか」を統合、「あなたが書いた言葉」→「本人が書いた言葉」、「※個人で運営しているため」を削除。
- `data/corrections.ts`(新設): `Correction { date, page, path, others?, what, why }`。以後の訂正は報告と同時にここへ1行足す。
- `components/SiteFooter.tsx`: 「運営者情報」→「このサイトについて」、「情報の品質について」→「情報の作り方」(URL は不変)。
- `lib/constants.ts` `SITE_LEGAL_UPDATED` → 2026年9月8日。`lib/sitemap-static-dates.ts` の `/about` `/quality` `/support` → 2026-09-08。
- (a) `components/tools/ShoruiTool.tsx`: 「あなたの場合に足すもの」→「自分の場合に足すもの」、「あなたの場合」→「自分の場合」(2語)。
- (b) ハブ原稿 8 本(下記)。

## (b) verify:hubs の × 8件

`scripts/verify-hub-content.mjs` は `data/hubs/*.json` の本文を **アプリ repo の `../shougainenkin/docs/hub-*-2026-09-02.md`** と突き合わせる(原稿は公開サイト repo には無い)。JSON 側は 9/6 の数字の混在の修正(出典表記)と 9/6 の内部リンク(幹10への1行)で更新されていたので、原稿側に同じものを当てた。**文は変えていない**(置換表の出典表記と、JSON にすでにある行の追加だけ)。

| 原稿(アプリ repo docs/) | 当てたもの |
|---|---|
| hub-byoki-tougou / hub-byoki-hattatsu / hub-byoki-tekiou-fuan / hub-erabu-jibun-ka-irai / hub-nayami-shindansho-komatta | 出典表記「厚生労働省「障害年金の業務統計等(令和6年度)」」→「日本年金機構「障害年金業務統計(令和6年度決定分)」」(各1か所) |
| hub-joukyou-hatarakinagara | 上の出典表記 1か所 + 9/6 の内部リンクの1行「受給が始まってから → 働くと年金はどうなるか(/jukyuugo/hataraku)」 |
| hub-nayami-koushin | 9/6 の内部リンクの1行(同上) |
| hub-nayami-shikyuu-teishi | 9/6 の内部リンクの2行「「打ち切りになった」と言われるものの多くは、**支給停止**です。…」「受給が始まってから → 抜け出すロードマップ(/jukyuugo/nukedasu)」 |

結果: `npm run verify:hubs` **全項目 ○**(OK: 本文21ページ。本文一致、見出し/FAQ一致、非公開語0、予約URLリンク0 / ハブの FAQ 49 本中 45 本に計 152 件、抽出と画面の質問が全件一致)。

**注意**: この8本の原稿はアプリ repo(`~/Projects/shougainenkin`)の作業ツリーで変更したまま、**コミットしていない**(アプリ repo は別の未コミット変更が多数あり、公開サイトの指示だけでコミットしないほうがよいと判断した)。`hub-byoki-tounyou-2026-09-02.md` は今回より前から変更されていたもので、触っていない。

## 指示書と違う点・補足

1. **日付は 2026-09-08**(指示書は 09-07)。sitemap の日付は prelaunch C-6 が「中身が最後に変わった日」と突き合わせるため作業日にし、`SITE_LEGAL_UPDATED` も同じ日にそろえた(`/terms` `/privacy` `/ads` `/tokushoho` の「最終更新日」も同じ定数なので 9月8日に変わる。現行の作りどおり)。
2. **`/about#ad-promises` への内部リンクは 0 本**。id は残したが、`/terms` `/ads` はもともとリンクしておらず、旧 `/quality` の1文は原稿に無い。必要なら `/quality` の「出典の決まり」か `/ads` に1文足す(原稿の追加が要る)。
3. `/quality` の「あなた」2件は、原稿の「機械で検査していること」「書かないこと」にある引用「あなたは◯級」で、新しい文ではない。
4. `/about` の「iPhoneアプリ版について」は原稿の段落の下に、現行の App Store リンクの1行を残した(原稿に「[現行のまま]」の指定は無いが、App Store への導線を消す指示も無いため)。
5. `/quality` の訂正の記録の2行目は、原稿の「更新関連の記事・カード(/columns/koushin-kakuninhodo ほか)」を `page` + `path` + `others: true` で描いている(表示は原稿と同じ)。
