# docs/site-audit-2026-10-09.md §5 の 1〜3(2026-10-09)

## 1. 次に読む のクリック計測(next_read_click)
- components/Analytics.tsx。.column-next a のクリックで next_read_click {from_slug, to_slug}。webdriver ガードの内側、計測停止中は送らない、/dev/design では送らない。
- 確認(GA への送信はすべてブラウザ内で横取り): 通常クリック 1 回・同じセッション / ダブルクリック 1 回 / gtag.js 読み込み前のクリックも最初の page_view の後に送る / 中ボタン 1 回。
- prelaunch A/B/C ○、verify:site-graph 11/11。

## 2. IndexNow
- `node scripts/indexnow-submit.mjs --since 2026-09-27`: 39 件 → HTTP 200 OK(indexnow.txt に URL 一覧)。内訳 columns 25・morita 11・byoki/utsu-soukyoku・nayami/fushikyu・about。

## 3. (not set) の原因
- Analytics.tsx に page_view の漏れは無い。着地時・クライアント遷移・戻る/進むはすべて page_view が出る。
- 原因は GA4 の 30 分セッション切れ。1 ページを開いたまま 30 分以上たつと(長い記事、裁決 PDF を別タブで読む、背景タブで開いて後で読む、スマホでアプリを切り替えて戻る)、
  離脱時の user_engagement(または App Store のクリック)が新しいセッションを始め、そのセッションには page_view が無い → 着地 (not set)。
- このプロパティの gtag.js は Enhanced Measurement のイベント(スクロール・PDF クリック等)を実際には送っておらず、読んでいる間に送信が無いので 30 分を超えやすい。
- 再現: 調査 4 系統すべてで再現、独立した検証 2 件も再現(反証なし)。スクリプトはローカルのスクラッチ領域(ga/)。
- 付随して見つかった別の漏れ(not set の原因ではない): gtag.js 読み込み前にサイト内リンクで移ると、着地ページの page_view が出ず遷移先が着地になる / 目次の #リンクの後に「戻る」で page_view が 1 回抜ける / クエリだけの遷移(/jitsurei の絞り込み等)は page_view なし。
- GA4 側での確認方法: 探索で 着地ページ (not set) × イベント名・セッション番号 → user_engagement が主で、セッション番号 2 以上なら確定。
