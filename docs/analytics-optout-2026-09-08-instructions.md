# アクセス解析を「同意した人だけ」から「オプトアウト方式」に変える — Claude Code 実装指示書

作成日: 2026-09-08
東さんの判断: いまの作りは同意バナーで「同意する」を押した人だけ計測するため、GA4 に実際の読者がほとんど残っていない(2026-09-08 の分析: 7日でセッション60・うちオーガニック0。同じ期間に Search Console は13クリックを記録)。**原則は計測し、止めたい人が止められる形(オプトアウト)に変える。**

法令の整理(実装の前提。最終判断は東さん): 電気通信事業法の外部送信規律は、原則として「通知または公表」+ オプトアウトの機会の提供で足り、事前の同意取得を必須としていない。個人情報保護法上も、Cookie 単体は個人データではない。したがって、①何を・誰に・何のために送るかをプライバシーポリシーで明示し、②いつでも止められるボタンを置く、の2点を満たす形にする。

## 1. 変える動き

| 場面 | いま | これから |
|---|---|---|
| 初回訪問 | バナーが出る。押すまで計測しない | バナーは出ない。計測する |
| 「同意する」を押した人(localStorage `granted`) | 計測する | 計測する(変わらない) |
| **「拒否する」を押した人(localStorage `denied`)** | 計測しない | **計測しない(そのまま尊重する。勝手に計測を始めない)** |
| 止めたい人 | バナーか /privacy のボタン | /privacy のボタン(表示を「停止する」に) |
| 止めたあと | Cookie 削除 + リロード | 同じ |

**denied を尊重するのが、この変更でいちばん大事な点です。** いったん拒否した人を、変更を理由に計測し直さない。

## 2. 実装

### 2-1. `components/AnalyticsConsent.tsx` → `components/Analytics.tsx` に改名

役割が「同意を取る」から「計測して、止める道を用意する」に変わるので、ファイル名と export を変える。

- default export: `Analytics`(いまの `AnalyticsConsent`)
- named export: `AnalyticsOptOutButton`(いまの `AnalyticsConsentSettingsButton`)
- import 元2か所を直す: `components/SiteFooter.tsx`、`app/privacy/page.tsx`

中身の変更:

1. **localStorage のキーは `analytics-consent-v1` のまま**(既存の `denied` を読めなくなるため、絶対に変えない)。値も `granted` / `denied` のまま。
2. マウント時の分岐を次のようにする。
   - `denied` → 計測しない。gtag を読み込まない
   - `granted` または **未設定(null)** → 計測する
3. バナー(`isBannerOpen`・`role="dialog"` の `<section>`・`grantConsent`・`OPEN_SETTINGS_EVENT`)を削除する。バナー用の state と ref、見出しへの focus 処理も削除。
4. gtag の設定は現行のまま残す(`send_page_view: false`、`allow_google_signals: false`、`allow_ad_personalization_signals: false`)。consent mode は `analytics_storage: "granted"`、`ad_storage` / `ad_user_data` / `ad_personalization` は `"denied"` のまま。
5. `page_view` を送る `useEffect` の条件を「`denied` でない かつ 初期化済み」に。`lastTrackedPathnameRef` による二重送信の防止はそのまま。**初回のページビューが必ず1回送られること**を確認する(いまは同意を押すまで送らないため、ここが変わる)。
6. `app_store_click` の計測は現行のまま。`denied` のときは `window.gtag` が無いので何も起きない(現行と同じ)。
7. オプトアウトの関数(いまの `denyConsent`)は、`denied` を保存 → consent update で denied → `_ga` / `_ga_*` Cookie 削除 → リロード。現行の実装をそのまま使う。
8. `AnalyticsOptOutButton` は、いまの状態で表示を変える。
   - 計測中: 「アクセス解析を停止する」(押すとオプトアウト)
   - 停止中: 「アクセス解析を再開する」(押すと `granted` を保存してリロード)
   - `aria-haspopup="dialog"` は不要なので外す。押したあとの結果が分かるよう、リロード前に `aria-live` の1行(「停止しました」)を出すか、リロード後に状態が変わることで足りるなら不要。実装しやすいほうでよい。

### 2-2. `app/privacy/page.tsx` 第5条

見出しは「5. アクセス解析(Google アナリティクス)」のまま。第1段落と Google へのリンク3つはそのまま。**外部へ送るものを明示する段落**を足し、最後の段落(同意バナーの説明)を差し替える。

第1段落の後に足す:

```
Google アナリティクスによって外部へ送信される情報は、次のものです。氏名やメールアドレスなど、個人を直接特定する情報は含みません。

- 閲覧したページの URL とページの題名、参照元のURL
- 閲覧日時、サイト内での滞在時間や操作の回数
- ブラウザとOSの種類、画面の大きさ、言語設定
- IPアドレスから推定されるおおよその地域(市区町村まで。IPアドレス自体は保存しません)
- Google アナリティクスが発行する識別子(Cookie)

送信先は Google LLC で、利用目的は本サイトの利用状況の把握と、記事や導線の改善です。広告の配信や、広告のための個人の特定には使いません(広告関連の Cookie は既定で無効にしています)。
```

最後の段落(「本サイトでは、初回訪問時の同意バナーから…」)を、次に差し替える:

```
アクセス解析は、既定で有効です。停止したい場合は、下のボタンからいつでも止められます。停止すると、Google アナリティクスのタグを読み込まず、通信も行いません。すでに保存されている Cookie も削除します。選択はこのブラウザに保存され、あとから再開することもできます。

このボタンのほかに、Google アナリティクス オプトアウト アドオン(上のリンク)や、ブラウザの Cookie の設定でも停止できます。
```

`<AnalyticsOptOutButton />` はそのままの位置に。

### 2-3. `app/globals.css`

`.analytics-consent-banner` とその中身(`-inner` `-copy` `-title` `-actions` `-accept` `-deny`)の規則を削除する。`.analytics-preference-button` は残す(オプトアウトのボタンで使う)。印刷用の `body:has(.mt-print-page) .analytics-consent-banner` と、3217行付近の印刷指定からもバナーのセレクタだけ外す。

### 2-4. 文言の残りを合わせる

`grep -rn "同意バナー\|同意する\|拒否する"` で、公開ページの本文に残る記述を直す。`app/terms/page.tsx` 第3条、`app/about/page.tsx`、`app/ads/page.tsx` に「同意」の記述があれば、オプトアウトの言い方に。無ければ何もしない(報告に「該当なし」と書く)。

`lib/constants.ts` の `SITE_LEGAL_UPDATED` を「2026年9月8日」に更新する(プライバシーポリシーの実質的な変更なので、ここは動かす)。`lib/sitemap-static-dates.ts` の `/privacy` を 2026-09-08 に。

## 3. 検証(完了条件)

| # | 内容 | 合格 |
|---|---|---|
| 1 | `typecheck` / `build` / `prelaunch`(× は B-10 だけ)/ `verify:site-graph` | ○ |
| 2 | localStorage を空にして本番ビルドを開く: バナーが出ない。`google-analytics.com/g/collect`(または `region1.google-analytics.com`)へのリクエストが**ページごとに1回**出る。ページ遷移でも1回ずつ | ○ |
| 3 | localStorage に `analytics-consent-v1=denied` を入れて開く: gtag のスクリプトを読み込まない。collect へのリクエスト 0。ボタンの表示が「再開する」 | 0 |
| 4 | 計測中に「停止する」を押す: `_ga` と `_ga_*` の Cookie が消える。リロード後も collect 0。localStorage が `denied` | ○ |
| 5 | 停止中に「再開する」を押す: `granted` になり、collect が出る | ○ |
| 6 | `/privacy` 第5条の本文が §2-2 のとおり。「同意バナー」「同意する」の語が公開ページに 0 | 0 |
| 7 | 印刷(申立書の印刷ページ)で、オプトアウトのボタンが紙に出ない | ○ |
| 8 | 1400px / 390px で `/privacy` が崩れない。バナーが消えたことで下部に余白の残骸が出ていない。スクリーンショットを `docs/verification/analytics-optout-2026-09-08/` に | ○ |
| 9 | `data/corrections.ts` は触らない(記事の訂正ではないため)。`components/AnalyticsConsent.tsx` が残っていない(改名済み) | ○ |

## 4. コミット・報告・コマンド

2コミット: `feat(analytics): 同意方式からオプトアウト方式に変える`、`content(privacy): 第5条を外部送信の明示とオプトアウトの案内に`。報告 `docs/reports/analytics-optout-2026-09-08-report.md`(検証2〜5 の実測、残っていた「同意」の語の一覧)。push はしない。

```
docs/analytics-optout-2026-09-08-instructions.md を読んで、アクセス解析を同意方式からオプトアウト方式に変えて。§1 のとおり、localStorage が denied の人は引き続き計測しない(キーは analytics-consent-v1 のまま)。§2-1 でファイルを components/Analytics.tsx に改名しバナーを削除、§2-2 で /privacy 第5条を差し替え、§2-3 でバナーの CSS を削除、§2-4 で残りの文言と日付。§3 を全部通して2コミット。結果を docs/reports/analytics-optout-2026-09-08-report.md に書いて。push はしない。
```

## 5. 変更後にやること(東さん)

- 反映後、GA4 のリアルタイムで自分のアクセスが見えることを確認する。
- **9/2 に取ったベースラインとは比較できなくなる**(母数が変わるため)。反映日を記録し、そこから新しいベースラインを取り直す。日付は `docs/metrics/` に1行。
- 数字は数日で跳ね上がるが、それは実力ではなく計測範囲が広がっただけ。1週間ためてから読む。
