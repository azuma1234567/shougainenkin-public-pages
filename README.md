# shougainenkin-public-pages

shougainenkin-note.net(障害年金申請サポート)の公開サイト。Next.js。

## よく使うコマンド

- `npm run build` — 本番ビルド
- `npm run typecheck`
- `npm run prelaunch:check -- http://localhost:3200` — 公開前チェック(`npm run start -- -p 3200` を立ててから)
- `npm run verify:columns` / `verify:hubs` / `verify:site-graph` / `verify:stats` / `verify:fonts` — 各種検査

## 見出しフォント

見出し用の Zen Old Mincho と Zen Kaku Gothic New は、見出しに出る文字だけの自前サブセット(`public/fonts/*.woff2`)です。
**見出しの文字が増えたら `npm run build:fonts`** を実行して、`public/fonts/` の woff2 と `charset.txt` を更新してください
(元フォントは Google Fonts の GitHub から `scripts/fonts-src/` に自動で取得します。Python の fonttools が必要: `pip3 install fonttools brotli`)。
`npm run verify:fonts -- http://localhost:3200` が「見出しに出る文字がすべて charset.txt にあること」を検査します。
charset に無い文字はシステムフォントで描かれます。
