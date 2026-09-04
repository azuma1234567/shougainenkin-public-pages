# 惜しい検索語の title / description の変更前後 (2026-09-04)

監査 `docs/seo-aio-audit-2026-09-04.md` §4-3 と §6-2(T5)。
**URL・slug・h1・h2 の構成は1つも変えていない。**

このサイトは h1 が `lib/columns.ts` の `title` から出るので、`title` を触ると h1 まで変わる。
「`<title>` は変える / h1 は変えない」を両立させるため、`metaTitle`(HTML の title だけを差し替える欄)を使った。

| slug | フィールド | 前 | 後 | 根拠(監査の検索語) |
|---|---|---|---|---|
| shinsei-kikan | metaTitle | (なし。title がそのまま HTML title) | 障害年金の決定通知はいつ届く？審査期間の目安と、遅いときの確認先 | 「決定通知書 いつ届く」(§4-3) |
| shoshinbi-wakaranai | metaTitle | (なし) | 障害年金の初診日がわからないときの探し方5つ｜証明できないときも | 「初診日 わからない」(§4-3)。本文の h2「方法1〜5」に合わせて数を入れた |
| hitsuyou-shorui-seishin | description | 精神疾患(…)で障害年金を申請するときの必要書類を完全チェックリスト化。全員に必要な5点と、ケース別の追加書類、入手先・費用・期間の一覧表、… | 精神疾患(…)の障害年金で請求に必要な書類を、**全員共通/初診日の証明/人によって違う、の3段**で整理しました。入手先・費用・期間の一覧表、… | 「必要書類」(§4-3) |
| shikyuu-teishi-fukkatsu | リード1文目 | 更新で完全に止まる人は少数です。… | **「障害年金が打ち切りになった」と言われるものの多くは、支給停止です。**更新で完全に止まる人は少数です。… | 「打ち切り」(§6-2) |
| shikyuu-teishi-fukkatsu | FAQ | (「打ち切り」の問いなし) | Q. 障害年金の打ち切りとは何ですか?(1問追加、先頭) | 「打ち切り」(§6-2) |
| /nayami/shikyuu-teishi(ハブ) | リード | (「打ち切り」の語なし) | 冒頭に「『打ち切りになった』と言われるものの多くは支給停止です」の1文 | 「打ち切り」(§6-2) |

## 字数

- `docs/columns-rewrite-2026-09-03/articles/shikyuu-teishi-fukkatsu.md` 本文(リード除く): 11,564 → 11,771 字(**+1.79%**。rewrite 仕様の ±10% 以内)
- `data/hubs/nayami-shikyuu-teishi.json` の source: 3,330 → 3,386 字(+1.68%)

## 原稿と実装の順番

`content/columns/*.ts` は `scripts/import-columns.mjs` が原稿(.md)から生成する。
最初に生成物のほうを直してしまい、原稿と食い違って検査9が落ちた。
**原稿を直してから `node scripts/import-columns.mjs` で生成し直す**のが正しい順番。

## baseline に触った範囲

`docs/verification/columns-rewrite-2026-09-04/baseline.json` は**再生成していない**。
上の2 slug の `metaTitle` と `htmlTitle` だけを書き換え、`intentionalUpdates` に理由を残した。
`slug` `h1` `canonical` は1つも動いていない。

## 監査の表と実際の食い違い(指示書 §4 で訂正済み)

- `hitsuyou-shorui` → `hitsuyou-shorui-seishin`、`shoshinbi-fumei` → `shoshinbi-wakaranai`
- `jushinjokyo-shomeisho` と `nenkin-jimusho-soudan` は既に満たしていたので触っていない
