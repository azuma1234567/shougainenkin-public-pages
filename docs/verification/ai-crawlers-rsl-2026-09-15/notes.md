# AI クローラー方針の明示と RSL ライセンス宣言 — 確認記録(2026-09-15)

指示書: claude-code-ai-crawlers-rsl-2026-09-15-instructions(ユーザー提供)。既存ページの本文・数字・メタ情報は変えていない。どのボットも Disallow していない。

## robots.txt の生成方式

- 変更前: `app/robots.ts`(`MetadataRoute.Robots`)が `User-Agent: *` / `Allow: /` / `Host:` / `Sitemap:` を生成。この型では `License:` のような任意の行を書けない。
- 変更後: `app/robots.ts` を削除し、`public/robots.txt` の静的ファイルに置き換えた(ビルドに robots のルートは残っていない)。
  - `User-agent: *` の許可に加えて、AI 検索・回答エンジンの取得ボット 11 種(Googlebot・Bingbot・OAI-SearchBot・ChatGPT-User・PerplexityBot・Perplexity-User・Claude-SearchBot・Claude-User・Applebot・DuckAssistBot・Amazonbot)を個別のグループで明示的に許可。
  - `License: https://shougainenkin-note.net/license.xml` をグループの外に置いた(全クライアントに適用)。
  - 標準外の `Host:` 行は落とした。
  - 「将来 Disallow を足すときも、取得ボットのグループには足さない」とコメントを入れた。
  - 学習用ボット(GPTBot・ClaudeBot・CCBot・Google-Extended)も `User-agent: *` の許可のまま。遮断していない。

## RSL 1.0 仕様との照合(https://rslstandard.org/rsl、2026-09-15 確認)

指示書の `public/license.xml` は仕様どおりで、直した箇所は無い。

- 1つの `<content>` に複数の `<license>` を置いてよい: 仕様は「Multiple `<license>` elements MAY appear within the same `<content>` to express distinct term sets」。
- `<payment type>` のトークン: `purchase` `subscription` `training` `crawl` `use` `contribution` `attribution` `free`。`use`(AI の出力に使われるたびに支払い。推論・グラウンディング・生成を含む)、`training`(学習に使われるたびに支払い)、`attribution`(見える形の出典表示と、元ページへの機能するリンク)はいずれも正規。
- `<amount>` の省略: `<payment>` の子要素は「zero or one」なので省略してよい。金額未定の宣言として成り立つ。
- `<permits>` の値はスペース区切り(`search ai-index`)。`<content url="/">` の相対パスは robots.txt と同じ規則(RFC 9309)で許される。
- `server` 属性(ライセンスサーバー)は有償ライセンスでも必須ではない。無い場合、クライアントは `<standard>` か `<custom>` で取得の手続きを探すことになっている。今回は宣言だけなので入れていない。有償の条件を実際に交渉するときは、`<custom>` で問い合わせ先(/quality のお問い合わせ、または専用ページ)を指すと、取得の手続きが機械可読になる。

`license.xml` は xmllint --noout で well-formed。

## 配信

- `next.config.ts` に `headers()` を新設。
  - `/license.xml` → `Content-Type: application/rsl+xml; charset=utf-8`(仕様は「RSL documents MUST be served with this media type」)。
  - `/:path*` → `Link: <https://shougainenkin-note.net/license.xml>; rel="license"; type="application/rsl+xml"`。HTML の `<link rel="license">` は入れていない。
- 変更前は、どのページにも `Link` ヘッダは出ていなかった。変更後、Next.js が動的ページ(`/jitsurei`・`/gokai`)でフォントの preload 用に出す `Link` とは、Next.js がカンマ区切りで連結する(ライセンスが先頭)。
- ローカル(next start)の確認結果は `headers.txt`。push 後、本番(Vercel)でも `/license.xml` の Content-Type と `/` の Link ヘッダを確かめる。

## 作業4: 遮断していないことの確認

- `middleware.ts` と `vercel.json` は無い。`next.config.ts` に User-Agent で弾く設定は無い(`redirects()` と、今回足した `headers()` だけ)。ソースに GPTBot・ClaudeBot・CCBot・Google-Extended・user-agent の判定は無い。
- 生成 HTML の `<meta name="robots">`: `index, follow` 183、`noindex` 系 3(`/tokushoho`・`/_not-found`・`/dougu/moushitatesho/insatsu`。いずれも以前からの意図どおり)。`nosnippet`・`max-snippet`・`noai`・`noimageai` はゼロ。
- `X-Robots-Tag` ヘッダは sitemap の全 185 ページでゼロ。
- Search Console の「Search generative AI control」はコードからは触れない。東さんが画面で「オプトアウトしていない」ことを確認する。

## 検証

- `npm run build` 通過。
- `/license.xml` 200・`application/rsl+xml; charset=utf-8`・中身がファイルと一致。
- `/` に指定どおりの `Link` ヘッダ。sitemap の全 185 ページがライセンスの `Link` を含む。
- `/robots.txt` がファイルと一致し、`License:` 行と `Sitemap:` 行がある。Disallow 0、Host 0。
- prelaunch 24 項目で判定の変化なし(A-7「robots.txt が全ページを許可している」○、A-5 noindex 0 / 185、C-1 ○)。`prelaunch.txt`。
