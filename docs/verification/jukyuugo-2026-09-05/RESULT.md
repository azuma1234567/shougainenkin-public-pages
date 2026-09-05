# 幹10「受給が始まってから」検証結果(2026-09-05)

指示書: shougainenkin/docs/codex-jukyuugo-2026-09-05-instructions.md §6

| # | 内容 | 結果 |
|---|---|---|
| 1 | typecheck / build / prelaunch(× は B-1・B-3 のみ) | ○ tsc 0件・build 成功・prelaunch の × は B-3 のみ(/dougu/mitate 336字。着手前からの既存) |
| 2 | 7 URL が 200・sitemap 収録・h1 が1つ | ○ 7/7 |
| 3 | 本文が原稿の文集合と一致 | ○ 8/8(原稿の文で実装に無いもの 0。65歳は既存⊆新で消えた文 0) |
| 4 | 数字の照合 | ○ 原稿の数字で実装に出ないもの 0、実装に出て原稿に無い数字 0 |
| 5 | 金額トークンの展開・`[金額]` が出ない | ○ 0件 |
| 6 | 描画後の ld+json に要素が混ざらない | ○ 7/7(script 14個、要素混入 0、JSON parse 失敗 0) |
| 7 | 内部リンク切れ 0・`/dougu/kougin` へのリンク無し | ○ リンク先 49件・200以外 0・kougin 0 |
| 8 | 幹10 の各ページが索引以外から2本以上 | ○ 5/5(hataraku 8・sagyousho 5・nukedasu 7・okane 3・a-gata-heisa 2) |
| 9 | 390px で横スクロールなし | ○ 3/3 |
| 10 | 色・文字サイズ・角丸・影が design-system の基準内 | ○ verify-design-tokens「すべて基準内」 |
| 11 | schema.org バリデータでエラー 0 | ○ /jukyuugo(CollectionPage・BreadcrumbList)/jukyuugo/hataraku(FAQPage・BreadcrumbList)ともエラーなし・警告なし |

既存の検証: verify-columns 13項目 ○ / verify-column-parts 14〜19 ○ / verify-site-graph 10項目 ○ /
verify-hub-hints ○ / check-checkpoints 見出しの不一致 0 / verify-hub-map 破損 0。

- verify-jukyuugo.txt … §6 の 2〜9 の生ログ
- prelaunch.txt … prelaunch-check の生ログ
