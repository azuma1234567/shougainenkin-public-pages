# 一覧ページ3本(/nayami・/okane・/erabu)を /joukyou と同じ型に(2026-09-06)結果報告

指示書: docs/hub-index-3-2026-09-06-instructions.md §1〜§3。既存の `lib/hub-index.tsx` の仕組み(`HUB_HINTS` と `HUB_INDEX` の spec)にデータを足しただけで、部品も CSS も新しく作っていない。URL は変えていない。記事本文・ハブ本文は触っていない(例外は東さんの追加指示の `/jukyuugo/sagyousho` の出典1行だけ。下記)。push はしていない。

## §3 検証

| # | 内容 | 結果 |
|---|---|---|
| 1 | typecheck / build / prelaunch / site-graph / 一言14件の一致 | ○ / ○ / × は **B-3・B-10 だけ**(C-6・C-7 ○)/ 10 項目 ○ / `verify:hub-hints` は無いので、§1 の表と `HUB_HINTS` の描画を突き合わせるスクリプトで 14/14 一致 |
| 2 | 3ページのカードが 題名 + 一言 + 件数で、/joukyou と同じ DOM・CSS クラス | ○ 3ページとも `a.hub-card > h3 > p > span.hub-card-meta`(/joukyou と同一) |
| 3 | 一言14件が §1 と1文字違わず出る。/okane/ikura の金額は `AMOUNTS_2026` | ○ 14/14。`847,300` `635,500` は `AMOUNTS_2026.basicGrade2` / `.employeesGrade3Minimum` から組み立て(直書きなし) |
| 4 | /nayami の title・h1・パンくず・BreadcrumbList が「困りごと別」。ラベルの「悩みから探す」「悩みから」 0 | ○ `<title>`「困りごと別｜障害年金申請サポート」、h1「困りごと別」、表示のパンくず「トップ / 困りごと別」、BreadcrumcList `["トップ","困りごと別"]`。ラベルの残り 0(下記の一覧)。**本文に残る「悩みから探す」: ハブ JSON 6 本のパンくず配列(`data/hubs/nayami-*.json` の `breadcrumb[1]`)。記事本文は 0** |
| 5 | 3ページの `<main>` に「あなた」 0 | 0 / 0 / 0 |
| 6 | /byoki /joukyou の一言・件数・群が変わっていない | ○ 本番と比べて /byoki 21 枚(群 精神・発達 9 / 内部の病気 7 / 体・感覚の障害 4 / その他の疾患 1)、/joukyou 9 枚とも完全一致 |
| 7 | 1400px / 390px で崩れない | ○ 6 枚とも横はみ出し 0px。docs/verification/hub-index-3-2026-09-06/*.png |
| 8 | sitemap の日付 | ○ `/nayami` `/okane` `/erabu` を 2026-09-06 |

生ログ: 同フォルダの checks.txt / prelaunch.txt / site-graph.txt。

## 変えたもの

### `lib/hub-index.tsx`

- `HUB_HINTS` に 14 件(§1 の表そのまま。`/okane/ikura` だけテンプレート文字列で `AMOUNTS_2026` を参照)。
- `nayami`: `title` `h1` を「困りごと別」、`description` を §2 の文、`hint`「期限があるのは1つだけ → [不支給と言われたとき](/nayami/fushikyu)(決定を知った日の翌日から3か月)」、`body` 2段落目の「あなたの状況」→「いまの状況」。`lead` と他の段落は現行のまま。
- `okane`: `hint`「受給が始まってからのお金は → [受給後のお金の設計](/jukyuugo/okane)」を新設。他は現行のまま。
- `erabu`: `hint`「先に事実を1つ。有償で代行できるのは社会保険労務士だけで、「年金機構公認」の代行はありません。」を新設。`body` 4段落目末尾「決めるのはあなたですが、材料はここに揃えました。」→「決めるのは本人です。材料はここに揃えました。」。記事 0 本のカード(hiyou-souba・erabikata)は件数を出さない(現行どおり)。
- `byoki`: `body` の「[悩みから探す](/nayami)」→「[困りごと別](/nayami)」、`tail.label` も「困りごと別」。

### ラベル「悩みから探す」「悩みから」を「困りごと別」に(本文以外)

| ファイル | 箇所 |
|---|---|
| `app/page.tsx` | 検索の `category: "悩みから探す"` → 「困りごと別」 |
| `app/hajimete/page.tsx` | リンク「困りごとがある方は「悩みから探す」へ」→「…「困りごと別」へ」 |
| `app/columns/page.tsx` | まとめページのチップ「悩みから探す」→「困りごと別」 |
| `components/platform/HubIndexList.tsx` | 検索 0 件のときの案内「悩みから探す」→「困りごと別」 |
| `app/llms.txt/route.ts` | 見出し「病気・状況・お金・悩みから探す」→「病気・状況・困りごと・お金から探す」 |

触っていないもの(理由つき): `lib/hubs.ts` には `/nayami` の `hub(...)` 定義が無い(索引の名前は `HUB_INDEX.nayami.title` だけで決まる)。`scripts/verify-site-graph.mjs` の `OLD_LABELS` は「古い名前が残っていないこと」を検査する側の一覧なので「悩みから」を残す(期待値の変更は不要)。`components/ApplicationFlowPage.tsx:995`「よくある悩みから探す」は、/shinsei が `ShinseiRestyled` に置き換わって描画されていない死んだ JSX(本番の /shinsei に出ない)。`app/layout.tsx` `app/page.tsx` の meta description の「いまの悩みから」は区分名ではなく文章なので変えていない。

### 本文に残る「悩みから探す」(件数のみ、触っていない)

`data/hubs/nayami-fushikyu.json` `nayami-shindansho-komatta.json` `nayami-shoshinbi-karute.json` `nayami-koushin.json` `nayami-shikyuu-teishi.json` `nayami-sokyuu.json` の `breadcrumb` 配列(6 本)。これらのハブ個別ページの表示パンくず・BreadcrumbList の中段は今も「悩みから探す」で、`/nayami` の名前と食い違う。直すなら JSON の `breadcrumb[1]` を 6 本とも「困りごと別」にする(本文の指示があれば別途)。

### 追加指示: `/jukyuugo/sagyousho` の出典に 1 行

`data/hubs/jukyuugo-sagyousho.json` の `## 出典` の末尾(確認日の前)に
「厚生労働省 社会保障審議会 資料「勤労控除の趣旨・概要」(生活保護の就労収入の控除の仕組み)」を足した。FAQ「生活保護を受けながら作業所に通っています」の「就労に伴う収入には控除の仕組みがある」の根拠(URL: https://www.mhlw.go.jp/shingi/2004/04/s0420-5b3.html、確認日 2026-09-06)。本文の文は変えていない。描画と C-7 を確認済み。

### `lib/sitemap-static-dates.ts`

`/nayami` `/okane` `/erabu` を 2026-09-06。

## そのほか

- `HUB_INDEX.byoki.lead` に「あなた」が 1 か所残っている(/byoki は今回の対象外・指示なし)。
- site-graph 検査2 の未達は 2 件のまま(counseling・gennin-ga-aru)。
