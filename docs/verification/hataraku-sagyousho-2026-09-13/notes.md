# 「働く」4本・「作業所」4本の取り込み — 確認記録(2026-09-13)

指示書: docs/claude-code-hataraku-sagyousho-2026-09-13-instructions.md。原稿の文言と数字は変えていない。push はしていない。

## references の URL(ビルド前に1本ずつ確認)

指示書の URL のうち 404 だったもの・別ページへ転送されたものは、同じ機関の正しいページに差し替えた。ラベルは実際のページ名に合わせた。

| 記事 | 指示書の URL(結果) | 差し替え先(200) |
|---|---|---|
| kousei-3kyu-hataraku | nenkin …/shougainenkin/jukyu-yoken/20150401-02.html(404) | 日本年金機構「障害厚生年金の受給要件・請求時期・年金額」 …/service/jukyu/seido/shougainenkin/jukyu-yoken/20150401-02.html |
| kousei-3kyu-hataraku | nenkin …/shougainenkin/jukyu-yoken/20150401-01.html(転送先が「障害年金」の総合ページ) | 日本年金機構「障害基礎年金の受給要件・請求時期・年金額」 …/jukyu-yoken/20150514.html(サイト内で既に使っているページ) |
| kousei-3kyu-hataraku・sagyousho-kayoenai | nenkin 額改定請求 …/shougainenkin/jukyu/20150401-03.html(404) | 日本年金機構「障害の程度が変わったとき」 …/tetsuduki/shougai/jukyu/20140421-24.html(gaku-kaitei-seikyuu と同じ) |
| zaitaku-freelance-nenkin | 協会けんぽ「被扶養者とは」 …/g3/cat320/sb3160/sbb3163/1959-230/(404。検索で出る g7 の URL も 404) | 全国健康保険協会「用語集」 https://www.kyoukaikenpo.or.jp/glossary/(被扶養者の定義を含む1ページの用語集。項目ごとの URL は無い) |
| kougin-nenkin-tedori | 厚労省「障害者の利用者負担」 …/service/riyou.html(404) | 厚生労働省「障害者の利用者負担」 …/service/hutan1.html |
| kougin-nenkin-tedori | 厚労省「年金生活者支援給付金制度」 …/bunya/0000199979.html(404) | 厚生労働省「年金生活者支援給付金制度について」 …/bunya/0000143356_00002.html |
| muryou-soudan-psw | nenkin「年金相談のご予約」 …/section/soudan/yoyaku.html(404) | 日本年金機構「予約相談について」 …/section/guidance/yoyaku.html(nenkin-jimusho-soudan と同じ) |
| muryou-soudan-psw | nenkin「病歴・就労状況等申立書」 …/shindansho/20140421-06.html(404) | 日本年金機構「病歴・就労状況等申立書を提出するとき」 …/shindansho/20140516.html(NENKIN_REFERENCES.moushitatesho と同じ) |

200 のままでラベルだけ実際のページ名にしたもの: 厚生労働省「障害福祉サービス等」(service/index.html、指示書のラベルは「障害福祉サービスの利用について」)、厚生労働省「障害福祉サービスの内容」(service/naiyou.html、指示書のラベルは「相談支援」)。

## 指示書と違う形にしたところ

- muryou-soudan-psw の主ハブは `/erabu/jibun-ka-irai`(「自分で申請するか、依頼するか」)。`/erabu` はカテゴリの一覧でハブ定義が無く、主ハブに置くとパンくずが作れない。
- `lib/sitemap-static-dates.ts` には足していない。コラムの sitemap の日付は `COLUMNS` の dateModified(2026-09-13)から出ていて、この表は静的ページ専用(公開前チェック C-6 も静的ページとして突き合わせる)。
- `verify-hub-map.mjs` のハブ別本数を、記事を足したハブについて更新(/nayami/koushin 6、/joukyou/hatarakinagara 5、/erabu/jibun-ka-irai 5)。

## ユーザー承認の上で検証側を変えたもの

- verify-columns 検査3: 原稿に /dougu/ へのリンクが無い5本(shindansho-shurojokyo・kousei-3kyu-hataraku・zaitaku-freelance-nenkin・sagyousho-hajimeru-tsutaeru・sagyousho-kayoenai)を例外に登録。原稿に道具リンクが入ったら外す。
- 金額: `scripts/lib/amounts-derive.mjs` に「所得制限 + 扶養親族等の加算 × 人数」を足した(4,141,000円・4,521,000円)。162,000円(A型平均賃金 91,451 + 2級月額 70,608 の概算)は `scripts/lib/amounts-assumed.mjs` に仮定値として宣言し、verify-columns 検査6と prelaunch A-8 で共有。
- prelaunch B-2 / verify-hub-map: `/shinsei` を宣言済みハブに追加(申請クラスタの記事末尾「このテーマの全体像」から戻る導線で、記事が増えるほど増える)。
- `lib/published-links.ts`: 公開済みの判定に `/jitsurei?争点=` を追加(4dd8fc6 で絞り込みを足したときの漏れ)。

## 確認記録(sources_2026-09-13.md)に値そのものが無い数字

原稿のまま。多くは確認記録の数字からの計算・例示。

- koushin-hatarakinagara: 100人(「100人に1人」)、53,000円
- kousei-3kyu-hataraku: 53,000円、106,000円、17,920円
- zaitaku-freelance-nenkin: 4,141,000円・4,521,000円(扶養加算)、420万円・340万円・288万円・180万円・130万円・1,000万円
- kougin-nenkin-tedori: 95,000円・162,000円(工賃+年金の概算)、112,000円・144,000円・98,000円・91,000円・70,000円・65,000円・38,000円・24,000円・22,000円・15,000円・17,920円・2.9万円・2.7万円・3,000円・200円・114万円・180万円
- sagyousho-kayoenai: 150日

## 作業前からの食い違い(今回は変えていない)

- verify-hub-map: /nayami/fushikyu が表の4本に対して実数5本(93d8265 で fushikyu-85ken を足したときから)。
- amounts-derive: 635,475円(3級の最低保障)は、月額の近似の規則で別の式に拾われる。本来の式は 2級 × 3/4。

## 公開前に見ておくこと

- `voices_x_hataraku_2026-09-13.md`(X 179件の匿名要旨)は、公開リポジトリに載せないため git から外し、ファイルも削除した(2026-09-13 ユーザー指示)。`sources_2026-09-13.md` の S11 に名前だけ残る。
