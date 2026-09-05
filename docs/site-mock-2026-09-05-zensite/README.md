# 全サイトのモック(2026-09-05・第4稿)

16ページ分のテンプレートを、知識ユニット240件・既存の原稿・公的資料の数字から生成したモックです。
実装は `docs/zensite-2026-09-05-instructions.md` に従って Claude Code が行います(このフォルダは原稿と見本)。

## 生成のしかた

```
cd docs/site-mock-2026-09-05-zensite
python3 gen_pages.py ../.. ~/Projects/shougainenkin/docs out   # out/ に 17 ファイル(16ページ + mocks.html)
python3 combine.py out                                         # out/zensite-all.html(1枚にまとめたレビュー用)
```

- 入力: `data/hubs/*.json`(ハブ本文)、`data/gokai.ts` `data/gokai-bodies.ts` `data/yougo.ts`、`content/columns/koushin-kakuninhodo.ts`、`docs/site-mock-2026-09-05-top/mock.html`(トップ)、アプリ側 `docs/knowledge-units-*.md`(240件)
- 外部ライブラリなし。Python 3.11 以上。

## 方針(モック共通)

- 図は「数字の形に意味があるとき」だけ(推移の跳ね・大多数・順位)。それ以外は文と表で。図には数字を文字でも併記する。
- 見出しは内容を表す短い名詞句。標語・呼びかけ・修辞的な問いは使わない。
- 出典は公的資料と確認日のみ。確認できない数字は書かない。
- 道具(機能)は端末の中だけで動き、何も送信しない。判定はしない。

## ファイル

- `gen_lib.py` 共通部品(CSS・ヘッダー・フッター・表・図・markdown→HTML・知識ユニット読込)
- `gen_pages.py` 16ページの組み立て
- `combine.py` 16ページを1枚にまとめる(レビュー用)
- `out/` 生成物(git には入れない場合は `.gitignore` に追加)
