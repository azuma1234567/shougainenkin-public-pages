# 幹10「受給が始まってから」第2稿への差し替え(2026-09-06)結果報告

指示書: `shougainenkin/docs/jukyuugo-2026-09-06/README-codex-jukyuugo-v2-2026-09-06.md`。原稿は同フォルダの 00〜06。05(65歳の挿入)と 07(誤解カード)は第1稿のまま。デザイン・URL は変えていない。push はしていない。

## 差し替えたファイル

| ファイル | 内容 |
|---|---|
| `data/hubs/jukyuugo-{hataraku,sagyousho,nukedasu,okane,a-gata-heisa}.json` | `source` を第2稿(frontmatter を除いた `## リード(直答)` 以降。HTML コメントは外す)に。`title` `breadcrumb` は frontmatter、`dateModified` 2026-09-06 |
| `lib/hub-index.tsx` | `jukyuugo` の項目を第2稿に。リード4段落は1段落目を `lead`(ヒーロー本文)、残り3段落を `hint`(配列対応にした)。年表 11 行。**年表の下は `markdown`(「## 数字で見る」〜「## 出典」の原稿そのまま)を既存の `MarkdownArticle` で描く**(新しい部品・CSS なし。`hub-content hub-reading-width` の既存クラスで包む)。旧 `notes` `extraCards` `body` `nextSteps` `sources` は外した(二重出しなし) |
| `lib/hubs.ts` | 5 ハブの `relatedSlugs` を frontmatter の `relatedColumns` に(techou-to-nenkin / gaku-kaitei-seikyuu ×2 / shikyuu-teishi-fukkatsu が増えた) |
| `lib/sitemap-static-dates.ts` | `/jukyuugo` を 2026-09-06(5 ハブは JSON の `dateModified`) |
| `lib/hub-content.ts` | リンク変換と金額展開を `prepareHubSource()` に切り出し、索引の markdown にも同じ規則を当てた(下の「直したもの」) |
| `scripts/verify-jukyuugo.mjs` | 原稿の場所を 2026-09-06 に(07 だけ 09-05 のまま)、数字の一覧を §3 に更新 |

## §2 検証

| # | 内容 | 結果 |
|---|---|---|
| 1 | typecheck / build / prelaunch / site-graph / verify-jukyuugo | ○ / ○ / × は **B-3・B-10 だけ**(C-6・C-7 ○)/ 10 項目 ○ / 2〜9 すべて ○ |
| 2 | 原稿 ⊆ 実装(消えた文 0) | ○ 索引 106 文・hataraku 174・sagyousho 147・nukedasu 137・okane 167・a-gata-heisa 138、実装に無い文 **0**(65歳・誤解カードも 0) |
| 3 | 数字: §3 の一覧が出る・原稿に無い数字が出ない・`{{` `[金額]` `[要確認]` 0 | ○ 出ない数字 0・原稿に無い数字 0・伏せ字 0(6 ページ) |
| 4 | 「あなた」0 | 0(6 ページ) |
| 5 | 本文の `(/path)` が全部 200・外部はリンクにしない | ○ 原稿のリンク先 22 本すべて 200(`/jitsurei?issue=teido` 含む)。`/dougu/kougin` は HTML コメント内だけで、画面にもリンクにも出ない(検査 7: 0 本)。WAM NET・ハローワークは文字のまま(外部 `<a>` 0) |
| 6 | FAQ の対が全件取れ、画面と FAQPage が一致 | ○ hataraku 8 / sagyousho 6 / nukedasu 5 / okane 5 / a-gata-heisa 5、JSON-LD = 画面 = 期待 |
| 7 | ld+json に `<a` が無い | ○ C-7 ○、6 ページの script 12 個に要素混入 0 |
| 8 | 1400px / 390px で崩れない | ○ 横はみ出し 0px(12 ページ分)。1400px では表 12 個すべて横スクロール枠(`.suuji-table-wrap` 相当)の中。390px は既存のハブと同じ土台の表の組版で、はみ出し 0。スクリーンショット 12 枚: docs/verification/jukyuugo-v2-2026-09-06/ |
| 9 | 索引の順序 | ○ 年表 11 行 → 「数字で見る」→「不安3つ」→「意外と知らない5つ」→「次の一歩」→「出典」。`extraCards` の二重出し 0、幹10 のカード 5 枚はその下 |
| 10 | `/byoki` `/joukyou` `/nayami` の一言・件数 | ○ 本番と比べて 21 / 9 / 6 枚とも完全一致 |

生ログ: verify-jukyuugo.txt / checks.txt / prelaunch.txt / site-graph.txt(同フォルダ)。site-graph 検査2 の未達は 2 件のまま(counseling・gennin-ga-aru。内部リンクの作業と同じ)。

## 直したもの(検証で見つかった 2 件)

1. **索引の markdown のリンクが生の `(/path)` で出ていた。** `HubLanding` は `getHubContent()` で「→ ラベル(/path)」をリンクに変えてから描くが、索引の markdown はそれを通っていなかった(6 か所: /app、/columns/koushin-kakuninhodo、/gokai/hataraitara-make、/jukyuugo/hataraku ×2、/jukyuugo/okane)。変換を `prepareHubSource()` に切り出し、索引にも当てた。直したあとは生の `(/path)` 0、`/gokai/hataraitara-make` への本文リンクも戻った。
2. **年表の「起きること」の `**次回診断書提出年月**` が `**` のまま出ていた。** 年表の文を `inlineLinks()`(太字・リンク対応)で描くようにした。

## §4 生活保護の1文(「就労に伴う収入には控除の仕組みがある」)

**残した。** 厚生労働省 社会保障審議会(生活保護基準部会・生活保護制度の在り方に関する専門委員会)資料「勤労控除の趣旨・概要」に、「被保護世帯に収入があった場合、世帯の最低生活費から当該収入を差し引いた不足分を保護費として支給するのが基本であるが、勤労収入を得るためには … 経費が必要となることから、勤労収入のうちの一定額を控除する」(基礎控除・特別控除・新規就労控除・未成年者控除)とあり、原稿の文の趣旨と一致する。URL: https://www.mhlw.go.jp/shingi/2004/04/s0420-5b3.html(確認日 2026-09-06)。同省「生活保護制度」ページと Q&A(PDF)には控除の記述が無かったので、上の審議会資料を根拠にした。原稿の出典には足していない(文は変えない)。

## そのほか

- 第2稿の frontmatter `relatedColumns` で増えた `techou-to-nenkin` などは `relatedSlugs` に入れたが、ハブの「このテーマの記事」は `COLUMN_HUB_ASSIGNMENTS` の逆引き(記事側の secondary)で出るので、画面の一覧は変わらない(仕組みどおり)。
- 索引の `description`(meta)は第1稿のまま(原稿に無いため)。
- 索引ヒーローの「最終確認日」は原稿の確認日から 2026年9月6日 になる。
