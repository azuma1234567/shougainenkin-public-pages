# 復元(2026-09-05 午後の刷新を外し、午前の変更 + サイト構造だけ残す) — Claude Code 実装指示書

作成日: 2026-09-05
東さんの判断: 「今日変えたタグ(ヘッダー・フッター・機能の配置)は残す。デザインも内容も、午後のモック精査より前(午前の変更まで)に戻す。幹10と誤解カードへのリンク(5f1d9c1)は外す。」
対象: `shougainenkin-public-pages` の `main`。URL は変えない。

## 0. 到達点(結論)

`main` のツリーを次と同じにする:

**土台** = `42444a8`(09-05 11:52 「一覧ページ刷新の本番確認を追記」。午前の変更 = トップのステッパー f15c627・4cb0614、一覧ページの3列カードと一言・件数 36309e4 を含む。昨日までのデザインと文章)

**その上に載せる(この6つだけ、この順)**

| 順 | コミット | 中身 | 残す理由 |
|---|---|---|---|
| 1 | `8026dd6` | fix(seo): 用語の自動リンクが構造化データを壊さないようにする | Search Console「解析不能な構造化データ」の修正。デザインと無関係 |
| 2 | `ac075d3` | feat(nav): ヘッダー8項目とフッター4区分を名詞にそろえ、現在地を出す | タグ |
| 3 | `ed1738d` | feat(dougu): 5つの機能を、利用者の問いの場所に置く | タグ(機能の配置) |
| 4 | `5ade7f8` | feat(columns): 記事のパンくずを主テーマのハブ経由にする | タグ(構造) |
| 5 | `007e91c` | feat(app): Smart App Banner を `/` `/app` `/dougu/*` だけに | タグ(構造) |
| 6 | `ed04e54` | test(structure): サイトの構造の検査を足す | 上の検査 |

**外す(土台より後ろで、上の6つ以外の全部)**: デザインシステム統一(eef48e0 dbdc4f2 7ddb41f 4bba988 d4c0bcf a4d3e38)、一覧の一言30件・板の見た目・「あなた」外し(dfb0d09 1ad455b 2c6c704)、コラム部品(096de0d 3fd9983 237ed05 cd5da31 4c1af6e)、ステップの輪(0e67ee2)、はじめて・実例の刷新(fd2f489 f59a9bb)、トップ・申請の流れの刷新と進み具合(f38114e)、誤解カードへのリンク(5f1d9c1)、幹10(0275300 93ecccc 828ed71 6253b95)、それらの docs コミット。
`docs/` の下に今日入れたモック・指示書・検証記録は、コードではないので**残してよい**(消さない。参照もしない)。

## 1. 手順

```
git tag backup/2026-09-05-evening main            # 戻せるように、いまの main に印
git switch -c restore-0905 42444a8
git cherry-pick 8026dd6 ac075d3 ed1738d 5ade7f8 007e91c ed04e54   # 1つずつ。衝突は §2 で解く
npm run typecheck && npm run build && npm run prelaunch && npm run verify:site-graph
```

衝突が解けたら、`main` には **force-push せず**、ツリーだけを1コミットで載せる(履歴は残る):

```
git switch main
tree=$(git rev-parse restore-0905^{tree})
c=$(git commit-tree "$tree" -p main -m "restore: 午後の刷新を外し、午前の変更とサイト構造だけ残す(2026-09-05 東さんの判断)")
git update-ref refs/heads/main "$c"
git diff --stat restore-0905 main      # 空であること
```

`git push origin main` は東さんが行う(自動デプロイ)。`git status` は使わない(index.lock)。同じ checkout で別のエージェントを同時に動かさない。

## 2. 衝突の解き方(予想される所)

土台には午後の部品(デザインシステムのトークン、`ArticleToc` の2モード、`ShinseiRail`、`verify-column-parts.mjs` など)が無い。cherry-pick の差分のうち、**タグ(ラベル・配置・パンくず・メタ・検査)に関わる行だけ**を土台に当て、午後の部品に依存する行は捨てる。判断に迷う行は「捨てて報告」。

| コミット | 衝突しそうなファイル | 解き方 |
|---|---|---|
| 8026dd6 | `scripts/verify-column-parts.mjs` | 土台に無いファイル。この hunk は捨てる。`lib/yougo-linker.mjs` の `isYougoExcludedTag`(SCRIPT / STYLE / TEMPLATE / NOSCRIPT / TEXTAREA)と `scripts/prelaunch-check.mjs` の C-7、`app/page.tsx` の分は当てる |
| ac075d3 | `app/platform.css`、`SiteHeader.tsx`、`SiteFooter.tsx` | ラベル(はじめての方へ / 申請の流れ / 病気別 / 状況別 / 困りごと別 / お金 / 実例と数字 / コラム + 無料アプリ)、フッター4区分(名詞)、`aria-current` の現在地は当てる。CSS は `--c-*` の新トークンを土台の変数名(`app/globals.css` にある旧名)に読み替える。土台に無い変数は書かず、既存の色を使う |
| ed1738d | `app/hajimete/page.tsx`、`lib/hub-index.tsx`、`app/platform.css`、`data/dougu.ts`、`data/hubs/okane-*.json`、`app/dougu/*/page.tsx` | `data/dougu.ts` の `PLACEMENTS`・`HAJIMETE_TOOLS`・`TOP_BAND_TOOLS`、道具ページのパンくず(`/shinsei` 経由 など)、`/okane` の並びは当てる。`/hajimete` は土台の(昨日の)ページに `HAJIMETE_TOOLS` の2枚を足す(位置は「自分の場合を、確かめる」の節)。`lib/hub-index.tsx` は土台(36309e4)の一言と件数を**変えず**、配置に関わる行だけ当てる |
| 5ade7f8 | `components/ColumnArticle.tsx`、`components/Breadcrumb.tsx`、`lib/columns.ts` | パンくずを「トップ / 主テーマのハブ / 記事」にする行だけ当てる(`ColumnArticle` は土台の版のまま。要約・固定目次・次にすることは足さない) |
| 007e91c | `app/layout.tsx`、`lib/seo.ts`、`app/page.tsx`、`app/app/page.tsx`、`app/dougu/*/page.tsx` | `apple-itunes-app` を `/` `/app` `/dougu/*` だけに出す分を当てる。`app/page.tsx` は土台(午前の版)のまま、メタの行だけ |
| ed04e54 | `scripts/verify-column-parts.mjs`、`components/platform/HubLanding.tsx`、`package.json`、`lib/sitemap-static-dates.ts` | `verify-column-parts.mjs` の hunk は捨てる。`HubLanding` のパンくず href(途中の階層にも href)と `scripts/verify-site-graph.mjs`、`package.json` の `verify:site-graph` は当てる。`sitemap-static-dates.ts` は当てた変更に合う日付だけ(幹10の行は入れない) |

`verify-site-graph.mjs` が午後の部品(固定目次・進み具合・幹10 など)を前提にしている検査を含むなら、その検査だけ外して報告(タグの検査 = ヘッダー8 / フッター4区分 / 道具の配置 / パンくず / Smart App Banner の範囲 / JSON-LD、は残す)。

## 3. 検証(完了条件)

| # | 内容 | 合格 |
|---|---|---|
| 1 | `typecheck` / `build` / `prelaunch`(× は B-3 のみ)/ `verify:site-graph` | ○ |
| 2 | `git diff --stat restore-0905 main` が空 | 空 |
| 3 | 土台との差分(`git diff --name-only 42444a8 main`)が、§0 の6コミットが触るファイルだけ(docs を除く) | ○ |
| 4 | ヘッダー: 8ラベル + 無料アプリ、現在地の `aria-current`。フッター: 4区分が名詞。`/byoki` `/joukyou` `/nayami` は3列カード + 一言 + 件数(午前の版 36309e4 の見た目・文のまま) | ○ |
| 5 | 機能の配置: `/shinsei` のステップ3・4・5・6・7 に道具、`/hajimete` に2枚、`/okane/ikura` に金額、精神系ハブ5本に等級の目安、道具ページのパンくずが `site-structure` §のとおり | ○ |
| 6 | 記事のパンくずが「トップ / 主テーマのハブ / 記事」。BreadcrumbList と表示が一致 | ○ |
| 7 | `apple-itunes-app` が `/` `/app` `/dougu/*` にだけある(記事・ハブに無い) | ○ |
| 8 | 公開 HTML の `<script type="application/ld+json">` の中に `<a` が無い(C-7)。用語リンクは本文には付く | ○ |
| 9 | 昨日の状態に戻っていること: `/shinsei` に `localStorage` の参照が無い、チェック欄と進み具合が無い。記事に「ここまでの要約」「読む目安」「今日はここまでで大丈夫です。」が無い。`/hajimete` `/jitsurei` `/` `/shinsei` の h1〜h3 と `<p>` が `42444a8` の描画と一致(道具2枚・パンくず・ヘッダーの差分を除く) | ○ |
| 10 | `/jukyuugo` `/jukyuugo/*` が存在しない(sitemap にも無い)。サイト内から `/jukyuugo` へのリンクが 0 | 0 |
| 11 | `/hajimete` の不安6枚・`/shinsei` のつまずきに、誤解カードへのリンク(5f1d9c1)が無い | 0 |
| 12 | デザイン: `app/globals.css` `app/platform.css` が土台 + ac075d3/ed1738d のナビと配置の分だけ。`--c-text` など午後のトークン名が残っていない(`grep -c "\-\-c-" app/*.css` を報告) | ○ |
| 13 | 1400px / 390px のスクリーンショット(`/` `/byoki` `/shinsei` `/hajimete` `/columns/shoshinbi-wakaranai` `/byoki/utsu-soukyoku`)を `docs/verification/restore-2026-09-05/` に。390px で横スクロールなし | ○ |

## 4. 報告

`docs/reports/restore-2026-09-05-report.md` に: §3 の表を結果つきで、衝突を解いた箇所と捨てた行(ファイル・理由)、`verify-site-graph` から外した検査、`git log --oneline -3 main` と `backup/2026-09-05-evening` のハッシュ。push はしない。

## 5. コマンド(東さんが Claude Code に貼る)

```
docs/restore-2026-09-05-instructions.md を読んで、§0〜§4 のとおり main を復元して。土台は 42444a8、載せるのは 8026dd6 ac075d3 ed1738d 5ade7f8 007e91c ed04e54 の6つだけ、幹10と 5f1d9c1 は入れない。衝突は §2 の表のとおりタグの行だけ当てて、迷う行は捨てて報告。最後に §1 のとおり force-push せずツリーを1コミットで main に載せて、§3 の検証結果を docs/reports/restore-2026-09-05-report.md に書いて。push はしない。
```
