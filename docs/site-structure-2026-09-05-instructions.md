# サイト構造の見直し(ナビ・フッター・5機能の配置・パンくず・アプリ導線) — Claude Code 実装指示書

作成日: 2026-09-05
根拠: `docs/site-structure-seisa-2026-09-05.md`(41サイト調査と判断。§7 の5点はすべて東さん承認済み)。
着手条件: 刷新7本(design-system → ハブ一言 → コラム部品 → stepflow → hub-index → hajimete-jitsurei → top-shinsei)が **すべて main にマージ済み**であること。1本でも未了なら着手せず報告する。
優先順位: `user-psychology-seisa` §4 > `page-types-seisa` §4 > `design-seisa` > `writing-techniques` > 本書。見た目は `design-system` のトークンと共通部品だけを使う。

## 0. 変えないもの(先に)

- **URL・slug・h1・title・metaTitle を1つも変えない。** `/nayami` `/erabu` `/dougu/*` などディレクトリ名もそのまま。
- ハブ44本・誤解49本・コラム47本・道具5本の本文。
- 9カテゴリ(`ColumnCategory`)と8ステップの対応。sitemap の URL 集合。
- 既存の検証(`verify-columns` `verify-hub-map` `prelaunch-check` `verify-design-tokens` `verify-column-parts` `verify-moushitatesho-layout`)はすべて通り続けること。

---

## 1. ヘッダー(`components/SiteHeader.tsx`)

現在7項目+「無料アプリ」。次の8項目+ボタンにする(順序もこのとおり):

| 順 | ラベル | href | 変更 |
|---|---|---|---|
| 1 | はじめての方へ | /hajimete | — |
| 2 | 申請の流れ | /shinsei | 位置を2番目へ(柱を前に) |
| 3 | 病気別 | /byoki | ラベル(旧: 病気から) |
| 4 | 状況別 | /joukyou | ラベル(旧: 状況から) |
| 5 | 困りごと別 | /nayami | ラベル(旧: 悩みから) |
| 6 | お金 | /okane | **追加** |
| 7 | 実例と数字 | /jitsurei | — |
| 8 | コラム | /columns | — |
| — | 無料アプリ(ボタン) | /app | — |

- 現在地の表示: パス接頭辞(`/byoki/…` なら「病気別」、`/columns/…` なら「コラム」、`/dougu/*` は「申請の流れ」ただし `/dougu/kingaku` は「お金」)で該当項目に `aria-current="page"` を付け、`--c-primary` の下線 2px で示す(Baymard: 現在位置の表示欠如が66%の失敗)。
- 1180px 以下の折り返し・モバイルメニューは現行の仕組みのまま、項目だけ8つに。ラベルは 1 行に収まること(「困りごと別」5文字が最長)。
- 「サポート」(モバイルのみ)は残す。

## 2. フッター(`components/SiteFooter.tsx`)

3区分「探す / 読む / このサイトについて」を廃止し、**4区分・すべて名詞**にする:

| 区分 | リンク(この順) |
|---|---|
| 病気・状況・困りごと別 | 病気別 /byoki / 状況別 /joukyou / 困りごと別 /nayami / 等級の目安をしらべる /dougu/mitate / 自分でやるか、頼むか /erabu |
| 申請の進め方 | はじめての方へ /hajimete / 申請の流れ /shinsei / 必要書類チェックリスト /dougu/shorui / 年金事務所を探す /dougu/madoguchi / 申立書をつくる /dougu/moushitatesho / よくある誤解 /gokai / コラム /columns / 用語辞典 /yougo |
| お金と数字 | 障害年金の金額(計算) /dougu/kingaku / お金 /okane / 実例 /jitsurei / 数字で見る障害年金 /suuji |
| このサイトについて | 現行どおり(運営者情報 / 情報の品質について / お問い合わせ / プライバシーポリシー / 利用規約 / 広告掲載について / 無料iPhoneアプリ / アプリの利用規約・プライバシーポリシー) |

- 区分見出しは `h2` のまま(現行)。4列は 1181px 以上、2列は 761〜1180px、1列は 760px 以下。
- ラベルとヘッダーのラベルは同じ語(病気別/状況別/困りごと別/お金)。「悩み」「探す」「読む」「道具」の語はヘッダー・フッター・トップの区分名から消える(本文中の「探す」は可)。

## 3. トップ「どこから探しますか」(`app/page.tsx`)

`top-shinsei` 指示書で作った2列ブロックの**見出し語をヘッダーと揃える**: 病気別 / 状況別 / 困りごと別 / お金。セクション見出し「どこから探しますか」は本文の見出しなのでそのまま。中身は変えない。

## 4. 5機能の分解配置(「道具」の括りをやめる)

5本の URL は変えない。**入口だけ**を、利用者の問いの場所に置く。道具カードは既存 `DouguCard`(design-system §3 の共通部品)を使い、文言は `data/dougu.ts` の既存 title/blurb(新しい説明文は書かない)。

| 機能 | 置く場所 | 実装 |
|---|---|---|
| 障害年金の金額 `/dougu/kingaku` | `/okane` 一覧の**先頭**(見出しの直下、3ハブのカードより前) | `lib/hub-index.tsx` の okane 仕様に `tools: ["kingaku"]` を足し、`renderHubIndex` がリード直下にカード1枚を出す |
| 同上 | `/hajimete` の金額タイルの直下 | 既存の `AMOUNTS_2026` タイルの下に「自分の場合を計算する → /dougu/kingaku」のカード1枚 |
| 等級の目安 `/dougu/mitate` | `/hajimete` の「3つの確認」の障害の程度カード | カード内の最後のリンクとして 1 本 |
| 同上 | 精神系の病気ハブ4本(`byoki-utsu-soukyoku` `byoki-tougou` `byoki-hattatsu` `byoki-tekiou-fuan`)の**冒頭**(一言の直下) | `PLACEMENTS.hubs` に `position: "before"` で追加(`HubLanding` が `PLACEMENTS.hubs[slug]` を読む仕組みがあればそれ、無ければ追加) |
| 同上 | `/nayami/shindansho-komatta` の冒頭 | 同上 |
| 必要書類 `/dougu/shorui` | `/hajimete` の「どのくらい時間がかかるか」の隣 | カード1枚 |
| 年金事務所 `/dougu/madoguchi` | `/shinsei` **ステップ7(出す)** | `data/dougu.ts` `shinseiSteps["step-7"]` に `{ tool: "madoguchi", title: "どこに出せばいい？", blurb: 既存 step-3 と同文 }`。ステップ3の既存カードは残す |
| 同上 | `/joukyou/kazoku-ga-tetsudau` の冒頭 | `PLACEMENTS.hubs` |
| 申立書 `/dougu/moushitatesho` | 既存どおり(ステップ6、申立書6記事) | 変更なし |
| 全5本 | 各道具ページ | 冒頭に「入力内容はサーバーへ送りません」の既存文言があることを確認(無いページには `PLACEMENTS.columns` の blurb と同文を1行)。末尾に `/app` へのテキストリンク1本「同じ機能をアプリで続ける」(バッジは置かない) |

- 記事への道具カードは `columns-parts` 指示書の末尾「次にすること」(JSON の `tool`)で既に全47本に1枚ずつ出ているので、**記事には追加しない**。
- 既存のパンくず(mitate/shorui/madoguchi/moushitatesho → 申請の流れ、kingaku → お金の話)は正しい。`/okane` のラベルを「お金」に統一する(表示・JSON-LD とも)。

## 5. コラムのパンくずを主テーマのハブ経由に(`lib/columns.ts`)

- `columnBreadcrumbParents(column)`: 柱(pillar)が公開されていればそれ(現行)。公開されていなければ、`column.hubPrimary` のハブが `published` なら `[{ name: hub.label, path: hub.path }]`。どちらも無ければ `[]`。
- `columnJsonLd` の trail: **ハブ経由のときは「コラム」を外し** `トップ > ハブ > 記事` にする(3階層)。ハブ無しは従来どおり `トップ > コラム > 記事`。表示(`Breadcrumb` の `parents`)も同じ経路。
- `hub.label` はハブの表示名(例: 働きながら、診断書で困った)。`HubDefinition` にある名前をそのまま使い、新しい語を書かない。
- 適用数を報告する(47本中、ハブ経由 N 本 / コラム経由 M 本)。BreadcrumbList の `item` はすべて実在 URL(§8 検査5)。

## 6. Smart App Banner の出し分け(`app/layout.tsx` と各ページの metadata)

- `layout.tsx` の `other: { "apple-itunes-app": ... }` を**外す**。
- 次のページの `metadata.other` にだけ付ける: `/`(`app-id` のみ)、`/app`(`app-id` のみ)、`/dougu/mitate` `/dougu/kingaku` `/dougu/shorui` `/dougu/madoguchi` `/dougu/moushitatesho`(`app-id=…, app-argument=https://shougainenkin-note.net/dougu/<slug>`。アプリ側が受け取れない場合は無視されるだけで害はない)。
- 記事・ハブ・誤解・一覧・法務ページには出さない。

## 7. 誤解カードへの記事内リンク

- `/hajimete` の「よくある不安」6件: それぞれの `copy` の直後に、内容が対応する `/gokai/<slug>` へのリンク1本(既存 `.column-gokai-link` の見た目)。対応は `data/gokai.ts` の `misconception` 文を読んで Claude Code が選び、報告に「不安タイトル → gokai slug」を6行で書く。対応する誤解が無い不安はリンクを付けない。
- `/shinsei` の8ステップ `stumble`: 同様に各1本(無ければ付けない)。既存 `links` の後ろに足す。
- 追加する文言はリンクの `misconception` そのもの(新しい文は書かない)。

## 8. 検証: `scripts/verify-site-graph.mjs`(新規)

`next build` → `next start` の上で `/` から内部リンクを BFS で辿り、次を出す。`docs/verification/site-structure-2026-09-05/report.json` に保存。

| 検査 | 内容 | 合格 |
|---|---|---|
| 1 | sitemap の全 URL が `/` から **3クリック以内**(ヘッダー・フッター・パンくず・本文すべて含む) | 未達 0 |
| 2 | ハブ・誤解・コラム・道具の各ページが、**ヘッダー/フッター/パンくず/一覧ページ(`/` `/byoki` `/joukyou` `/nayami` `/okane` `/erabu` `/gokai` `/columns`)以外**から 2 本以上の被リンク | 未達の一覧を報告(0 が目標。0 にできない URL は理由付きで列挙。本文は書き足さない) |
| 3 | 孤立 URL(被リンク 0)| 0 |
| 4 | ヘッダーの 8 ラベル+href、フッターの 4 区分の見出しとリンクが §1・§2 の表と完全一致。「探す」「読む」「道具」「悩みから」「病気から」「状況から」がヘッダー・フッター・トップの区分名に無い | 一致 |
| 5 | 全ページの BreadcrumbList の `item` URL が 200 を返し、表示のパンくずと JSON-LD の経路が同じ | 全ページ |
| 6 | `apple-itunes-app` meta が §6 の 7 URL にだけある | 7 / 他 0 |
| 7 | §4 のカード配置が指定の場所にある(okane 先頭、step-7、ハブ5本の冒頭、hajimete 3か所)。同じページに同じ tool のカードが 2 枚出ていない | 一致 |
| 8 | `aria-current="page"` がヘッダーで正しく付く(8区画×1ページずつ+ `/dougu/kingaku`) | 9/9 |
| 9 | 390px で横スクロールなし(トップ・/okane・記事1本・ハブ1本) | 4/4 |
| 10 | 既存検証6本がすべて通る。内部リンク切れ 0 | ○ |

## 9. コミット単位(6)

1. ヘッダー(§1)+ フッター(§2)+ トップの語(§3)。
2. 5機能の配置(§4)。
3. コラムのパンくず(§5)。
4. Smart App Banner(§6)。
5. 誤解リンク(§7)。
6. `verify-site-graph.mjs` と report.json(§8)。

各コミット前に `npm run build` と既存検証。push は 6 まで通ってから 1 回。

## 10. 結果報告(この形で)

1. §8 検査 1〜10 の結果(件数)。検査2 の未達一覧。
2. §5 の適用数(ハブ経由 N / コラム経由 M)と、ハブ経由になった記事の例3本のパンくず。
3. §7 の対応表(不安6件・ステップ8件 → gokai slug)。
4. 判断が要ったこと。本文を書き足したくなった箇所は**書かずに**ここに書く。

## 11. Claude Code 用コマンド

```
docs/site-structure-2026-09-05-instructions.md を読み、§0 の前提(刷新7本のマージ済み)を最初に確認し、未了なら着手せず報告してください。§1〜§8 を §9 の順に6コミットで実装し、URL・slug・h1・title・本文は一切変えないこと。§8 の検査10項目と既存検証を通してから git push origin main を1回。§10 の形で報告してください。
```
