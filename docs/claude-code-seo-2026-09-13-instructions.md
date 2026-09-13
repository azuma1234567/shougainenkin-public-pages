# Claude Code 作業指示 — GA参照元の修正と、表示が増えたページのタイトル改善（2026-09-13）

対象リポジトリ: `shougainenkin-public-pages`
背景: Search Console で 9/7〜9/10 に表示回数が 60/日 → 433/日 に増えたが、クリックは 3〜5/日のまま。GA では全流入が Direct になっている。
方針: 本文は変えない。変えるのは `components/Analytics.tsx` と、5ページの `<title>` / `description` だけ。

---

## 作業1: GA が全部 Direct になる不具合を直す（components/Analytics.tsx）

### 1-1. 参照元を消している行を直す
`components/Analytics.tsx` の page_view 送信（234行付近）:

```ts
window.gtag("event", "page_view", {
  page_location: window.location.origin + pathname,
  page_referrer: "",
});
```

`page_referrer: ""` が参照元を空にしているため、検索・SNS・YouTube からの流入が全部 Direct になっている。次のように変える。

```ts
const isFirstPageView = lastTrackedPathnameRef.current === null;
window.gtag("event", "page_view", {
  page_location: window.location.href,
  ...(isFirstPageView ? { page_referrer: document.referrer } : {}),
});
```

- 初回だけ `document.referrer` を渡す（2ページ目以降はサイト内遷移なので渡さない）。
- `page_location` は `window.location.href` にする（クエリ文字列 `?case=` `?争点=` を含めるため。/jitsurei の絞り込みが GA で見えるようになる）。

### 1-2. セッション数 > 表示回数 になっているページの対策
GA で `/columns/tokyu-hantei-guideline` が 7セッション/4表示 のように、page_view が落ちているセッションがある。gtag の読み込み完了前に離脱した人の page_view が送られていない。

対策: `configureAnalyticsOnce` 内の `send_page_view: false` はそのまま残し、代わりに `<Script>` の `strategy` を `"afterInteractive"` から `"beforeInteractive"` には**変えない**（consent 判定が localStorage 依存のため）。
代わりに、page_view を送る useEffect の依存に `analyticsInitialized` があることを確認したうえで、`configureAnalyticsOnce` の末尾で `lastTrackedPathnameRef.current = null` を明示的に初期化し、初回 page_view が必ず1回送られることをブラウザの Network タブ（`collect?v=2` に `en=page_view` が含まれること）で確認する。落ちる原因が「読み込み前離脱」なら仕様として許容し、コードは 1-1 のみで完了とする。

### 1-3. 検証
- `npm run build` が通ること。
- ローカルで `/columns/nichijo-seikatsu-7koumoku` を開き、Network の `collect?v=2` リクエストに `dr=`（referrer）が入っていること。外部リンク経由（例: X の投稿から）で開いたとき `dr=https://t.co/...` になれば成功。
- `/privacy` の「アクセス解析を停止する」を押した後は `collect` が飛ばないこと（既存挙動の維持）。

コミットメッセージ: `fix(analytics): page_view の参照元を空にしていたのをやめ、初回は document.referrer を送る`

---

## 作業2: 表示回数が増えたのにクリック0のページのタイトルを直す

Search Console 直近7日で、表示は増えたがクリックがほぼ無いページ。検索結果に出た瞬間に「自分のことだ」と分かる形にする。**h1（本文の見出し）は変えない。変えるのは `<title>` に使われる値と `description` だけ。**

| ページ | 7日表示 | クリック | 平均順位 |
|---|---|---|---|
| `/` | 90 | 0 | 5.0 |
| `/gokai/shufu-mushoku` | 74 | 0 | 5.0 |
| `/columns/jukyuugo-tetsuduki` | 74 | 1 | 5.5 |
| `/dougu/moushitatesho` | 70 | 0 | 7.1 |
| `/columns/koushin-kakuninhodo` | 65 | 0 | 8.2 |

### 2-1. トップ `/`（app/page.tsx 22〜23行）
現在:
```
TITLE = "障害年金の疑問に、公的根拠と実例で答える｜障害年金申請サポート"
DESCRIPTION = "障害年金がはじめての方へ。病気、申請の段階、いまの悩みから、公的資料の根拠と公開裁決例を使って自分に近い情報を探せます。"
```
変更後:
```
TITLE = "障害年金申請サポート｜社労士に頼まず自分で申請する人の、初診日・診断書・申立書の進め方"
DESCRIPTION = "障害年金を自分で申請する人のための無料サイト。初診日の探し方、診断書で見られる7項目、申立書をスマホで作って印刷する機能、不支給85件の公開裁決例まで、公的資料の根拠つきで案内します。"
```

### 2-2. `/gokai/shufu-mushoku`（data/gokai-bodies.ts 4356〜4357行）
現在:
```
title: "専業主婦(主夫)や無職だから障害年金は関係ない？ — 国民年金の被保険者なら、収入の有無は要件にありません"
```
変更後:
```
title: "専業主婦(主夫)・無職でも障害年金は請求できる｜第3号被保険者の期間は「納付済み」扱い"
description: "働いていなくても、収入がなくても、障害基礎年金は請求できます。会社員の配偶者に扶養されていた第3号被保険者の期間は、自分で保険料を払っていなくても納付済期間です。あきらめる前に、年金事務所かねんきんネットで納付記録を確認してください。"
```
※ `title` は `<title>` と Article の headline の両方に使われている（app/gokai/[slug]/page.tsx 23〜48行）。h1 が同じ `body.title` を参照しているなら、h1 の表示だけは現行の文言を保つ（`metaTitle` 相当のフィールドを足すか、page.tsx 側で分ける）。分け方は既存の columns の `metaTitle` の流儀に合わせる。

### 2-3. `/columns/jukyuugo-tetsuduki`（lib/columns.ts 190行）
現在:
```
metaTitle: "障害年金の受給決定後の手続き｜給付金・法定免除・扶養"
```
変更後:
```
metaTitle: "障害年金が決まったら｜年金証書が届いた後にやる手続き（給付金・法定免除・扶養・手帳）"
```
description はそのまま（金額入りで具体的なので維持）。

### 2-4. `/dougu/moushitatesho`（app/dougu/moushitatesho/page.tsx 14〜16行）
現在:
```
TITLE = "病歴・就労状況等申立書を、スマホで公式の様式にそのまま入力して印刷する"
```
変更後:
```
TITLE = "病歴・就労状況等申立書をスマホで入力して、公式様式のまま印刷する【無料・送信なし】"
DESCRIPTION = "日本年金機構の様式(A3・続紙A4)に、パソコンの文字で書いた紙がそのまま出ます。手書きで清書し直す必要はありません。元号は○、年月日は数字、未記入欄は空欄のまま。入力内容はこの端末にだけ残り、送信しません。"
```

### 2-5. `/columns/koushin-kakuninhodo`（lib/columns.ts 564〜566行）
現在:
```
metaTitle: "障害年金の更新（障害状態確認届）｜時期・支給停止への備え"
description: "障害年金の更新時期、障害状態確認届の提出期限、就労中の注意点、支給停止や級落ちへの対応を解説。更新前から準備したい生活記録と診断書の確認事項も紹介します。"
```
変更後:
```
metaTitle: "障害年金の更新は何年ごと？障害状態確認届の期限と、止まる人は1.1%という数字"
description: "障害年金の更新（障害状態確認届）は1〜5年ごと。提出期限、就労中の注意点、支給停止や級落ちへの備えを解説します。令和6年度の再認定304,456件のうち96.7%はそのまま継続、支給停止は1.1%（日本年金機構「障害年金業務統計」）。"
```
※ 数字は本文（content/columns/koushin-kakuninhodo.ts 5行・37行: 継続96.7%・増額1.4%・減額0.8%・支給停止1.1%）と同じ値。本文を変えない限りこのまま使える。

### 2-6. 検証と反映
- OG 画像（`opengraph-image.tsx`）が title を描画している場合、長すぎて2行に収まらないものが無いか、`/columns/koushin-kakuninhodo/opengraph-image` をローカルで開いて確認。
- `npm run build` → コミット → デプロイ。
- デプロイ後、Search Console の「URL 検査」で上の5 URL を「インデックス登録をリクエスト」する（これはユーザーが手動で行う。Claude Code は URL 一覧を出力するだけでよい）。

コミットメッセージ: `content(seo): 表示が増えてクリックの無い5ページの title と description を、検索結果で押す理由がある形に`

---

## やらないこと
- 本文・h1・URL は変えない。
- タイトルに「完全版」「徹底解説」等の常套句を足さない。
- 5ページ以外のタイトルは触らない（順位が付いている語は 9/9 に揃えたばかりなので動かさない）。
