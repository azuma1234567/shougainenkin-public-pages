# アクセス解析を同意方式からオプトアウト方式に変える 結果報告

指示書: docs/analytics-optout-2026-09-08-instructions.md §1〜§4。push はしていない。作業日 2026-09-08。

コミット:
1. `feat(analytics): 同意方式からオプトアウト方式に変える`
2. `content(privacy): 第5条を外部送信の明示とオプトアウトの案内に`(この報告と検証ログを含む)

## いちばん大事な点(§1)

`localStorage` の `analytics-consent-v1` が **`denied` の人は、これまでどおり計測しない**。キーも値も変えていない(`granted` / `denied`)。未設定(null)と `granted` は計測する。検証3・4のとおり、denied では gtag のスクリプトを1本も読み込まず、collect も 0 回。

## §3 検証(実測)

| # | 内容 | 実測 |
|---|---|---|
| 1 | typecheck / build / prelaunch / verify:site-graph | ○ / ○ / **× は B-10 だけ**(C-6・C-7 ○)/ **10 項目 ○**(検査2の未達は変更前と同じ2件)。印刷 CSS を触ったので `verify:moushitatesho:layout` も実行 → **検査9(紙の全画素が白か無彩色)まで全項目 ○** |
| 2 | localStorage 空で開く | バナー要素 **0 個**。`/` で gtag/js 1本・collect **1回**。クライアント遷移で `/privacy` へ **+1回**、`/about` を開いて **+1回**(累計3回 = ページごと1回)。localStorage は **null のまま**(勝手に書かない) |
| 3 | `analytics-consent-v1=denied` で2ページ開く | gtag/js の読み込み **0本**、`script#google-analytics-gtag` **0個**、collect **0回**。ボタンの表示「**アクセス解析を再開する**」 |
| 4 | 計測中に「停止する」 | Cookie `["_ga_PHHDYX0H53","_ga"]` → **`[]`**(消えた)。localStorage=**denied**。押したあと〜次のページで collect の増分 **0**。/privacy のボタンは「**アクセス解析を再開する**」 |
| 5 | 停止中に「再開する」 | localStorage=**granted**、collect **1回**、ボタンは「**アクセス解析を停止する**」 |
| 6 | /privacy 第5条が §2-2 のとおり | 指示書の文 **12本すべて一致**(足した3ブロック + 差し替えた2段落)。公開11ページの本文に「同意バナー」「同意する」「拒否する」**0件** |
| 7 | 印刷でボタンが紙に出ない | /privacy を印刷メディアで `.analytics-preference-button` の `display=none`。申立書の印刷ページ(下書きを1つ入れて開いた)では **ボタン0個・バナー0個・フッター display:none・画面固定で見えている要素 0** |
| 8 | 1400px / 390px の /privacy | 横はみ出し **0px**、バナー要素 **0個**、画面固定の要素 **0個**、フッター下の余白 **0px**(バナーの残骸なし)。スクリーンショット2枚 |
| 9 | `data/corrections.ts` を触らない / `AnalyticsConsent.tsx` が残っていない | ○ どちらも ○(前者は差分なし、後者は削除済み) |

計測の検証は Playwright で、`**/g/collect` を **204 で受け止めて件数だけ数えている**(検証のヒットを本物の GA4 に送らないため)。生ログ: docs/verification/analytics-optout-2026-09-08/(check.mjs / checks.txt / prelaunch.txt / site-graph.txt / png 2枚)。

**GA4 は2回目以降のヒットをまとめて送る**ので、1〜2秒では collect が観測できない(最初の1回だけ即時)。検証スクリプトは最大12秒待つようにしてある。最初にこれを知らずに「2ページ目以降が送られない」と読み違えた。実際は送られている。

## 変えたもの

### コミット1(§2-1・§2-3)
- `components/AnalyticsConsent.tsx` → **`components/Analytics.tsx`**。default export `Analytics`、named export `AnalyticsOptOutButton`。import 元2か所(`components/SiteFooter.tsx`・`app/privacy/page.tsx`)を直した。
- 削除: バナーの `<section role="dialog">`、`isBannerOpen`、`grantConsent`、`OPEN_SETTINGS_EVENT` とその listener、見出しへの focus 処理、`bannerHeadingRef`、`next/link` の import。
- マウント時: `denied` なら何もしない。それ以外(`granted`・未設定)は `initializeGoogleTagQueue()` を呼ぶ。**localStorage を読み終えるまで(`isReady`)は `<Script>` を出さない**(denied の人に一瞬でも gtag を読ませないため)。
- `page_view` の条件を「`isReady` かつ `denied` でない かつ 初期化済み」に。`lastTrackedPathnameRef` の二重送信防止はそのまま。gtag の設定(`send_page_view: false`・`allow_google_signals: false`・`allow_ad_personalization_signals: false`)と consent mode(analytics_storage だけ granted)、`app_store_click` は現行のまま。
- `AnalyticsOptOutButton`: 計測中は「アクセス解析を停止する」(denied 保存 → consent update → `_ga`/`_ga_*` 削除 → リロード)、停止中は「アクセス解析を再開する」(granted 保存 → リロード)。`aria-haspopup="dialog"` を外した。
- `app/globals.css`: `.analytics-consent-banner` 系 **115行**(`-inner` `-copy` `-title` `-actions` `-accept` `-deny` と 720px 以下の指定)を削除。`@media print` の2か所と `body:has(.mt-print-page)` の指定から `.analytics-consent-banner` だけ外し、`.analytics-preference-button` は残した。印刷の注記の「同意の取得は他のページでできる」を「アクセス解析の停止は /privacy でできる」に。

### コミット2(§2-2・§2-4)
- `app/privacy/page.tsx` 第5条: 見出しと第1段落、Google へのリンク3つはそのまま。第1段落の後に **外部へ送るもの5項目のリスト**と**送信先・利用目的の段落**を追加。最後の段落(同意バナーの説明)を、**既定で有効/ボタンで停止できる/Cookie も削除する/再開もできる**の段落と、**アドオンやブラウザ設定でも止められる**の段落に差し替え。`<AnalyticsOptOutButton />` の位置は変えていない。
- `lib/sitemap-static-dates.ts`: `/privacy` を 2026-09-05 → **2026-09-08**。

## 「同意」の語(§2-4)

`grep -rn "同意バナー|同意する|拒否する"` の結果、**公開ページの本文に残っているものは 0 件**。

| 場所 | 語 | 扱い |
|---|---|---|
| `app/privacy/page.tsx:115`(旧) | 同意バナー | §2-2 で差し替え済み |
| `components/AnalyticsConsent.tsx`(旧) | 同意する / 拒否する | ファイルごと削除 |
| `data/gokai-bodies.ts:8217` | 「年金事務所への照会に同意する同意書」 | **アクセス解析と無関係**(精神障害者保健福祉手帳の申請書類の説明)。触っていない |
| `components/Analytics.tsx:9` | 「旧・同意バナーで「拒否する」を押した人」 | ソースのコメント。画面に出ない。denied を尊重する理由を残すために書いた |

`app/terms/page.tsx` 第3条(広告と掲載について)、`app/about/page.tsx`、`app/ads/page.tsx` に、アクセス解析や Cookie の同意の記述は **該当なし**。これらの「同意」は規約への同意・第三者提供の同意で、別の話なので触っていない。

## 指示書と違う点・気づいたこと

1. **`lib/constants.ts` の `SITE_LEGAL_UPDATED` は変えていない。すでに「2026年9月8日」だったため**(9/8 朝の /about /quality /support の刷新で更新済み)。§2-4 の指定と同じ値になっている。
2. **オプトアウトの結果を知らせる `aria-live` の1行は入れていない**(§2-1-8 の「実装しやすいほうでよい」に従い、リロード後にボタンの表示が「再開する」に変わることで足りると判断)。
3. `AnalyticsOptOutButton` は自分で localStorage を読む(前はイベントでバナーを開くだけだった)。サーバー描画では「停止する」で出て、denied の人だけマウント後に「再開する」へ変わる。一瞬の切り替わりが起きるのは、すでに停止している人だけ。
4. 申立書の印刷ページは、**下書きが無いと入力画面へ戻る**作りだった。検証7では空の下書きを1つ入れてから開いている。
5. GA4 のヒットは2回目以降まとめて送られる(上記)。検証のやり方の話で、実装の問題ではない。
6. 反映後の運用は指示書 §5 のとおり(GA4 リアルタイムの確認、ベースラインの取り直し)。数字は計測範囲が広がるぶん跳ね上がる。
