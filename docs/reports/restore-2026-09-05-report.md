# 復元(2026-09-05)結果報告

指示書: docs/restore-2026-09-05-instructions.md
土台 `42444a8` に 6 コミット(8026dd6 ac075d3 ed1738d 5ade7f8 007e91c ed04e54)だけを cherry-pick した枝 `restore-0905` を作り、そのツリーを 1 コミットで `main` に載せた(force-push なし)。**push はしていない。**

```
git log --oneline -3 main
01d88ef restore: 午後の刷新を外し、午前の変更とサイト構造だけ残す(2026-09-05 東さんの判断)
6253b95 fix(jukyuugo): 原稿の数字に戻し、2本目のリンクを描くようにする(§6 の検証)
828ed71 feat(jukyuugo): 幹10 への入口を8か所に足す(§3)

backup/2026-09-05-evening = 6253b95c379daa861c38172937af1e68ff9bd702(復元前の main)
restore-0905 の先頭     = cb4bc8a(ツリーは main と同一)
```

## §3 検証

| # | 内容 | 結果 |
|---|---|---|
| 1 | typecheck / build / prelaunch / verify:site-graph | typecheck ○(0件)・build ○(271ページ)・site-graph ○ 10/10。prelaunch の × は **B-3・B-10・C-6** の3つ(下記)。× が B-3 だけにはならなかった |
| 2 | `git diff --stat restore-0905 main` | 空 ○ |
| 3 | 土台との差分(docs 除く)が 6 コミットの触るファイルだけ | ○ 26 ファイル。全部が 6 コミットのいずれかで触っているもの(`scripts/verify-column-parts.mjs` は捨てたので入っていない) |
| 4 | ヘッダー 8 ラベル + 無料アプリ・`aria-current`。フッター 4 区分が名詞。`/byoki` `/joukyou` `/nayami` は午前の版のまま | ○ site-graph 4(ヘッダー・フッター一致)・8(aria-current 9/9)。3 一覧ページは土台(42444a8 をビルドして比較)と h1〜h3・`<p>` の文集合が完全一致 |
| 5 | 機能の配置 | ○ `/shinsei` ステップ 3〜7 に 窓口・書類・目安・申立書・窓口。`/hajimete` は JibunCards 2枚(目安・金額)。`/okane` `/okane/ikura` に金額。精神系ハブ 5 本(utsu-soukyoku / tekiou-fuan / tougou / hattatsu / chiteki)+ shindansho-komatta に目安、kazoku-ga-tetsudau に窓口。道具のパンくずは トップ/申請の流れ/…(金額だけ トップ/お金/…) |
| 6 | 記事のパンくずが トップ / 主テーマのハブ / 記事、BreadcrumbList と一致 | ○ site-graph 5(165 ページ)。例: /columns/shoshinbi-wakaranai → トップ / 初診日のカルテがないとき / 記事 |
| 7 | `apple-itunes-app` が `/` `/app` `/dougu/*` だけ | ○ site-graph 6(7/7) |
| 8 | ld+json の中に `<a` が無い | ○ prelaunch C-7(4 ページ 8 個、崩れ 0) |
| 9 | 昨日の状態に戻っている | ○ `/shinsei` に localStorage 0・チェック欄 0・進み具合(部品)0(本文の「進み具合を見ながら」は土台の文)。記事に「ここまでの要約」「読む目安」「今日はここまでで大丈夫です。」0。`/hajimete` `/jitsurei` `/` `/shinsei` の h1〜h3 と `<p>` は土台の描画と文集合が完全一致(差分 0) |
| 10 | `/jukyuugo` が無い | ○ 404、sitemap に無し(`/columns/jukyuugo-tetsuduki` だけが残る)、サイト内リンク 0 |
| 11 | 誤解カードへのリンク(5f1d9c1)が無い | ○ 5f1d9c1 が足した gokai(amae / kaisha-ni-shirareru / techou-ga-nai / hataraitetara-muri / mukashi-minou / jikou-de-muri のカード内リンク)は無し。`/hajimete` `/shinsei` に残る `/gokai/*` 3 本ずつは土台の `HubGokai` ブロック |
| 12 | 午後のトークン名が無い | ○ `grep -c "\-\-c-" app/globals.css app/platform.css` → 0 / 0 |
| 13 | 1400px / 390px のスクリーンショット 6 ページ | ○ docs/verification/restore-2026-09-05/*.png(12 枚)。390px の横はみ出し 6 ページとも 0px |

prelaunch の生ログ: docs/verification/restore-2026-09-05/prelaunch.txt、site-graph: 同 site-graph.txt。

### prelaunch の × 3 つ(B-3 以外の 2 つはこの復元で直せないもの)

- **B-3** `/dougu/mitate` 336 字 — 指示書どおり許容。
- **B-10** `/app` `/app/privacy` `/app/terms` に更新日の表示なし — 土台 42444a8 の時点で同じ(土台をビルドして確認、3 ページとも 0)。直したのは午後のデザイン統一(4bba988)なので、復元で外れた。
- **C-6** 4 件 — `/hajimete`(表 09-03)`/jitsurei`(09-04)`/suuji`(09-02)`data/hubs/joukyou-65sai-ijou.json`(09-02)。復元コミット 01d88ef が今日の日付でこれらのファイルを**元に戻した**ため、git 上の「中身が変わった日」が 09-05 になっている。中身は土台の版そのもの。日付を 09-05 に上げると §3-3(6 コミットの触るファイルだけ)から外れるので**触っていない**。デプロイすると本番のこれらのページは実際に(昨日の内容へ)変わるので、上げるなら 4 行とも 2026-09-05 で正しい。東さんの判断に委ねる。

## 衝突を解いた箇所と捨てた行

| コミット | ファイル | したこと |
|---|---|---|
| 8026dd6 | `scripts/verify-column-parts.mjs` | 土台に無いファイル。hunk を捨てた(ファイルは作らない) |
| 8026dd6 | `app/page.tsx` | 「10人のうち7人が精神の診断書で申請しています。」→「新しく決まった障害年金の10件のうち7件は、精神の障害です。」の差し替え。**土台の `app/page.tsx` にこの文が無い**(午後の f38114e で足された `p-stats-note`)ので当てる先が無く、捨てた。同じ誤った文が土台の `app/suuji/page.tsx:113` に残っている(8026dd6 の対象外なので触っていない。別途直すのが良い) |
| 8026dd6 | `lib/yougo-linker.mjs` `scripts/prelaunch-check.mjs`(C-7) | そのまま当たった |
| ac075d3 | `app/platform.css` | 衝突なしで当たったが、`var(--c-heading)` `var(--c-primary)` `var(--r-pill)` は土台に無い。`--platform-heading` `--platform-primary` `999px`(土台の `.site-app-link` と同じ)に読み替えた |
| ed1738d | `app/hajimete/page.tsx` | 3 か所衝突。§2 のとおり**土台の版に戻した**(`git checkout 42444a8 -- app/hajimete/page.tsx`)。土台の「自分の場合を、確かめる」に JibunCards 2 枚(mitate・kingaku)が既にあるので、それで §3-5 を満たす。ed1738d の「お金の節に金額カード」「期間の節に書類カード」「カードの末尾に目安への1本」「JibunCards を mitate だけに」は捨てた |
| ed1738d | `lib/hub-index.tsx` | 2 か所衝突。`DouguCards` / `ToolId` の import と `tools?` と `/okane` の `tools: ["kingaku"]` と描画の 1 行だけ当てた。`HubIndexSearch` の import 行(土台に既にある)と `filterable` を落とす変更は捨て、土台の `<HubIndexList groups={groups} filterable={filterable} />` を残した。一言と件数は触っていない(土台との差分は道具に関わる 7 行だけ) |
| ed1738d | `app/platform.css` | 衝突なし。`.dougu-app-link a` の `var(--c-primary)` `var(--fs-small)` を `var(--platform-primary)` `14.5px`(午後の `--fs-small` の値)に読み替えた |
| 5ade7f8 | `components/ColumnArticle.tsx` | import の並びだけ衝突。`formatDate`(土台)と `columnParentIsHub` を両方残した。`showColumns={!columnParentIsHub(column)}` は自動で当たった。要約・固定目次・次にすることは無い |
| 007e91c | 全ファイル | 衝突なし。`app/page.tsx` はメタの `showAppBanner: true` の 1 行だけ |
| ed04e54 | `scripts/verify-column-parts.mjs` | modify/delete 衝突。捨てた(ファイルを残さない) |
| ed04e54 | `package.json` | `verify:site-graph` だけ足した。`verify:column-parts` は捨てた |
| ed04e54 | `lib/sitemap-static-dates.ts` | ed04e54 は `/suuji` `/byoki` `/nayami` `/joukyou` `/erabu` も 09-05 にしていたが、この枝ではそれらの page.tsx を変えていないので土台の日付のまま。09-05 にしたのは `/okane`(hub-index の道具)と `/dougu/*` 5 本(パンくず・バナー)と `/app`(007e91c でメタを変えた。C-6 が指摘したので追加) |
| ed04e54 | `components/platform/HubLanding.tsx` `scripts/verify-site-graph.mjs` | そのまま当たった |

## `verify-site-graph` から外した・変えた検査

- **検査 4 の一部を外した**: 「古い区分名(探す / 病気から / 状況から …)がトップの区分見出し(`.p-find-title, .p-section-head h2`)に残っていない」。トップの区分名を変えたのは午後の f38114e(外した)なので、土台のトップには「探す」「病気から」が残る。ヘッダー・フッターの区分名の検査は残した。
- **検査 7 の期待値を復元後の形に変えた**: `/hajimete` は「金額カード + 書類カード」ではなく「JibunCards 2 枚(目安・金額)」を期待。`/shinsei` の窓口の道具は `.dougu-chip`(午後の部品)ではなく土台の `.step-flow-tool` も数える(ステップ 3 と 7 で 2 本)。
- 検査 8・9 に、水和を待つ `waitForFunction` と 300ms の待ちを足した(復元とは無関係の安定化。最初の失敗は古いビルドを配っていた別ポートの server に向いていたのが原因で、正しい server に向ければ元の検査でも通る)。
- 残した検査: 3クリック / 被リンク / 孤立 / ヘッダー8・フッター4区分 / BreadcrumbList / Smart App Banner の範囲 / 道具の配置 / aria-current / 390px / リンク切れ。

## そのほか

- 復元前に `docs/` 配下の未コミット変更(検証ログの再生成分・指示書 2 本の変更)を `git stash`(stash@{0}「restore-0905: docs の未コミット変更を退避」)に退避した。必要なら `git stash pop`。未追跡の docs(モック・指示書・精査メモ)はそのまま残っている。
- 今日の午前より前のデザイン・文章に戻ったので、Search Console 対策(8026dd6)は入っているが、B-10 の更新日表示(/app 3 ページ)は元に戻った。
