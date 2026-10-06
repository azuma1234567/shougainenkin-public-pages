# デザインシステム第1段 検証結果(2026-10-06)

指示書: docs/design-system-2026-10-06-instructions.md。決まり: docs/design-system.md。

## 置いてあるもの

| ファイル | 内容 |
|---|---|
| inventory.mjs / inventory.md | 棚卸し(トークン切り出し前 = HEAD の CSS を `ROOT=` で読んだもの)。色・書体・余白・角丸・影・動き・部品 |
| inventory-after.md | 同じ棚卸しを切り出し後の CSS で |
| tokenize.mjs | 1 回限りの移行スクリプト(:root のエイリアス化と、完全一致 hex → var())。記録のため残す |
| snapshot.mjs / diff.mjs / diff.md | 代表 12 ページ × 375/1280px の before/after とピクセル差分(24 枚すべて 0)。PNG 本体(shots/、約 94MB)は .gitignore で除外し、手元にだけ残す |
| dev-design-375.png | 見本ページ /dev/design の 375px 全体 |
| print-shinsatsu-mae-memo.pdf / print-media-shinsatsu-mae-memo-794.png | 2-6 印刷の現状確認 |
| verify-columns.txt / verify-aio.txt / verify-site-graph.txt / prelaunch.txt | 検証一式(prelaunch は新設の B-11 を含む) |

## 数字

- 色: 152 値(hex 119・rgba 33)、孤立色 114。切り出し後に var() へ置き換えた直書き hex: globals.css 84 + platform.css 39 = 123 か所(すべて値が完全一致するもの)。globals.css の hex 直書きは 386 → 292(B-11 の上限 = 292)。
- font-size 113 種 / 組み合わせ 283。transition 21 宣言(18 種)。
- 差分: 24 / 24 枚が 0 px(寸法も同じ)。
- verify:columns 12/12・★3/3、verify-aio PASS、verify:site-graph 11/11、prelaunch A/B/C ○(手動 3)。

## 撮り方の注意

- /about の `<video>` は再生ボタンの数ピクセルが撮るたびに揺れるので、snapshot.mjs で `video{visibility:hidden}` を当てて撮る(CSS の検査には無関係)。それ以外は 2 回撮って byte 一致を確認済み。
