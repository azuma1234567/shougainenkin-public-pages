# 全ページ精査 — サチコ × GA4(2026-09-11〜10-04 の 24 日) — 2026-10-05

幻の表示(9/7〜10)を除いた 24 日で、サチコの全 153 行と GA4 の全 85 ページを突き合わせました。

## 1. 全体の数字

| 指標 | 値 | 読み方 |
|---|---|---|
| 検索表示 / クリック / CTR / 順位 | 2,671 / 100 / 3.7% / 平均 9.8 位 | 1 日あたり表示 111・クリック 4 |
| GA4 ユーザー / セッション | 304 / 408 | うち Organic Search 280 セッション |
| Organic のエンゲージ率 / 平均時間 | 62.5% / 2 分 13 秒 | 検索で来た人は 6 割が読む |
| Direct のエンゲージ率 / 平均時間 | 29.8% / 48 秒(114 セッション) | 東さんと Claude Code の検証アクセスが主。後述 |
| 1 ユーザーあたりの閲覧ページ | 1.91 | 回遊はほぼ無い(後述) |

改稿の効果は出ています。shinsatsu-mae-memo は CTR 10.2%・平均 11 分 23 秒(改稿前 15 秒)、a4-insatsu は metaTitle 変更後の 7 日で CTR 2.6% → 4.7%、shindansho-jittai-chigau は 7〜10 位 → 6.9 位。

## 2. 回遊の実態

GA4 の「表示回数 ÷ ユーザー」が 1.0 のページが 85 ページ中 60 ページ。つまり、ほとんどの人は 1 記事を読んで帰ります。1.5 を超えるのは、shinsatsu-mae-memo 3.21、kougin 3.00、shindansho-ishi-ni-tsutaeru 2.88、mijushin-kikan 2.33、techou-to-nenkin 2.20、yougo 2.10 だけで、これらは「同じ人が戻ってきて読み直している」記事です(診察前に見直す、書きながら見る)。

原因は構造です。記事は 10,000〜13,000 字で、「あわせて読みたい」は最下部(ColumnFooter)にしかありません。読者が次の記事に出会うのは、最後まで読んだ人だけです。滞在 2〜3 分で離脱する人は、関連記事を一度も見ていません。

**処方(構造・1 回の実装):** 結論の箱(lead)の直後に「次に読む 1 本」を 1 行で置く。記事ごとに手で 1 本選ぶ(`lib/columns.ts` に `nextSlug` を足し、無ければ `relatedSlugs[0]`)。選び方は「この記事を読み終えた人の次の動作」で、例:

| 記事 | 次に読む 1 本 | 理由 |
|---|---|---|
| shindansho-kakunin | shindansho-jittai-chigau | 見てずれていたら、の対処 |
| shindansho-tanomikata | shinsatsu-mae-memo | 渡すメモの作り方 |
| shinsatsu-mae-memo | nichijo-seikatsu-7koumoku | 7 項目の中身 |
| moushitatesho-kikan-kugiri | moushitatesho-mijushin-kikan | 区切ったあとの空白の書き方 |
| moushitatesho-a4-insatsu | teishutsusaki-yuusou | 刷ったら出す |
| teishutsusaki-yuusou | shinsei-kikan | 出したら待つ |
| jushinjokyo-shomeisho | shoshinbi-wakaranai | 取れなかったとき |
| koushin-kakuninhodo | shindansho-kakunin | 届いた診断書の確認 |
| kougin-nenkin-tedori | sagyousho-hajimeru-tsutaeru | 通い始めの伝え方 |

残り 48 本は Claude Code に `relatedSlugs[0]` で仮置きさせ、手で直すのは上の 9 本と、下の表で D に入る記事から。

## 3. 全ページの分類

24 日の数字で、表示 10 以上か閲覧 5 以上のページを分類しました。凡例: **A** 表示はあるのに押されない(CTR < 4%)/**B** 押されたのに読まれない(滞在 < 60 秒)/**C** 順位 30 位以下(被リンクが要る)/**D** 検索に出ないが回遊で読まれている/**E** 改稿直後で様子見。「—」は該当なし。

### A. 表示はあるのに押されない

| ページ | 表示 | CTR | 順位 | 滞在 | 状態 | 処方 |
|---|---|---|---|---|---|---|
| columns/moushitatesho-a4-insatsu | 418 | 3.6% | 6.5 | 1:03 | E(9/30 metaTitle) | 直後 7 日は 4.7%。10/13 に再確認 |
| columns/teishutsusaki-yuusou | 230 | 3.0% | 9.8 | 1:11 | 9/27 改稿、metaTitle 50 字超 | **今回: metaTitle を 40 字に詰める** |
| columns/shinsei-kikan | 147 | 3.4% | 17.4 | 1:16 | 9/27 改稿 | 17 位は 2 ページ目。順位待ち(10/13) |
| columns/jushinjokyo-shomeisho | 132 | 3.8% | 7.0 | 2:54 | E(9/30) | 様子見 |
| columns/moushitatesho-kikan-kugiri | 134 | 6.0% | 7.7 | 0:40 | E(9/30、B でもある) | 改稿後 2 ユーザー 51 秒。様子見 |
| columns/nichijo-seikatsu-7koumoku | 34 | 2.9% | 22.9 | 0:51 | 未着手 | **次の改稿候補 1**。サイトの中核記事(全記事から参照)なのに 51 秒。記載要領の 7 項目×4 段階の定義原文を先頭に |
| columns/tokyu-hantei-guideline | 32 | 3.1% | 24.5 | 1:21 | 9/27 改稿 | 順位待ち |
| gokai/chokin-ga-aru | 35 | 0% | 8.5 | — | 未着手 | 誤解カード群(下の表) |
| columns/shindansho-kakunin | 33 | 0% | 8.6 | 1:45 | E(10/4) | 様子見 |
| dougu/madoguchi | 29 | 0% | 26.6 | 0:49 | ツール | 「年金事務所 どこ」系。順位 26 で CTR 0 は自然。保留 |
| columns/shindansho-tanomikata | 25 | 0% | 8.8 | 6:00 | E(10/4) | 様子見 |
| columns/hatarakinagara | 23 | 0% | 10.7 | — | 9/27 改稿 | 10.7 位=1 ページ目の末尾。順位待ち。metaTitle が 48 字なので teishutsusaki と同時に 40 字へ |
| gokai/sashiosae | 22 | 0% | 6.0 | — | 未着手 | 誤解カード群 |
| gokai/nyuuin-shitenai | 19 | 0% | 7.6 | — | 未着手 | 誤解カード群 |
| columns/shindansho-kaitekurenai | 19 | 0% | 10.2 | 0:56 | 未着手 | 診断書クラスタの残り。kakunin・tanomikata の結果を見てから |
| columns/moushitatesho-mijushin-kikan | 16 | 0% | 10.4 | 5:33 | 未着手 | **次の改稿候補 2**。読まれると 5 分半。kikan-kugiri の姉妹で、記載要領の「受診していない」○の原文を先頭に |
| gokai/koushin-maitoshi | 14 | 0% | 9.9 | — | 未着手 | 誤解カード群 |
| columns/kazoku-enjo-kakikata | 13 | 0% | 5.8 | — | 未着手 | 5.8 位で 0 クリック。記載要領⑩ウ(イ)「家族の援助の内容を具体的に」の原文で metaTitle を問いの形に |
| gokai/kekkon-shitara | 13 | 0% | 7.4 | — | 未着手 | 誤解カード群 |
| gokai/kounin-daikou | 11 | 0% | 5.6 | — | 未着手 | 誤解カード群 |

誤解カード群(chokin・sashiosae・nyuuin・koushin-maitoshi・kekkon・kounin-daikou)は合計 114 表示・0 クリック、順位は 5.6〜9.9。title はすでに「問い？ — 答え」の形なので、タイトルの形の問題ではありません。考えられるのは、上位の社労士ページが FAQ リッチリザルトで答えを出していること。対策は 2 本で試す: chokin-ga-aru と sashiosae の metaTitle に根拠の一語(「国民年金法に資産要件なし」「差押禁止は国民年金法24条」)を足し、10/19 に動いたか見る。動けば残り 4 本へ。

### B. 押されたのに読まれない

| ページ | クリック/ユーザー | 滞在 | エンゲージ率 | 判断 |
|---|---|---|---|---|
| columns/moushitatesho-kikan-kugiri | 11 | 0:40 | 33% | 9/30 改稿済み。改稿後の 2 人は 51 秒・67%。10/13 に判定 |
| columns/kougin-nenkin-tedori | 2 | 0:15 | 50% | 9/30 改稿済み。母数 2。様子見 |
| columns/fushikyu-85ken | 2 | 0:08 | 100% | 数字を見て帰る記事。問題なし |
| columns/nichijo-seikatsu-7koumoku | 10(全経路) | 0:51 | — | A と重なる。候補 1 |
| columns/techou-to-nenkin | 5(全経路) | 0:51 | — | 回遊で来る記事。「次に読む」で手帳の記事へつなぐ |
| yougo | 10(全経路) | 0:31 | — | 用語集。31 秒は用途どおり |

B は、9/27 以降の「現物を先頭に」でほぼ片付いています。残りは 7koumoku だけです。

### C. 順位 30 位以下(本文ではなく被リンクの問題)

| ページ | 表示 | 順位 | 状態 |
|---|---|---|---|
| columns/shoshinbi-wakaranai | 59 | 57.8 | 9/28 改稿済み |
| columns/hattatsu-shougai | 38 | 47.1 | 未着手(病気クラスタ) |
| columns/sokyuu-seikyuu | 30 | 37.2 | 9/27 改稿済み |
| columns/muryou-soudan-psw | 14 | 38.2 | 9/30 X 除去 |
| columns/hitorigurashi-furi | 18 | 30.8 | 9/27 改稿済み |
| columns/fushikyuu-shinsa-seikyu | 17 | 65.1 | 未着手。読まれると 6 分 27 秒 |
| gokai/tesuuryou | 16 | 37.1 | 未着手 |
| columns/shougaisha-koyou-nenkin / shikyuu-teishi-fukkatsu / shoubyou-teatekin / hitsuyou-shorui-seishin / jibun-de-shinsei | 5〜11 | 48〜78 | 未着手 |

改稿した 4 本は内容では上位に負けていません。動かすのは外部リンクで、9 月に決めた「事業所 10 通」と note の投稿が、この群の処方です。本文の追加改稿は、それが動いてからにしてください。

### D. 検索に出ないが、回遊で読まれている

| ページ | ユーザー | 滞在 | 検索表示 / 順位 |
|---|---|---|---|
| columns/gaku-kaitei-seikyuu | 6 | 7:13 | 4 / 32.0 |
| columns/hatachi-mae | 2 | 7:11 | 5 / 7.6 |
| columns/fushikyuu-shinsa-seikyu | 5 | 6:27 | 17 / 65.1 |
| columns/shindansho-tanomikata | 3 | 6:00 | 25 / 8.8 |
| columns/moushitatesho-mijushin-kikan | 3 | 5:33 | 16 / 10.4 |
| columns/hitsuyou-shorui-seishin | 5 | 5:22 | 10 / 76.5 |
| dougu/mitate | 3 | 4:47 | — |
| columns/jukyuugo-tetsuduki | 5 | 3:59 | 4 / 10.0 |
| columns/shindansho-ishi-ni-tsutaeru | 8 | 3:55 | 7 / 8.3 |
| columns/nenkin-jimusho-soudan | 4 | 3:41 | 9 / 6.3 |
| columns/hikazei-shuunyuu | 9 | 3:24 | 3 / 7.3 |

ここは記事の質が高く、着地さえすれば読まれています。「次に読む」の送り先に優先して使ってください(gaku-kaitei は koushin-kakuninhodo から、fushikyuu-shinsa-seikyu は shindansho-jittai-chigau から、hitsuyou-shorui は jushinjokyo から、tanomikata は shindansho-kaitekurenai から)。

### E. 改稿直後で様子見(10/13 に判定)

a4-insatsu(9/30)、jushinjokyo(9/30)、kikan-kugiri(9/30)、kougin(9/30)、shindansho-kakunin(10/4)、shindansho-tanomikata(10/4)、koushin-kakuninhodo(9/28)、shoshinbi(9/28)、shindansho-jittai-chigau(9/29)。

## 4. Direct の 114 セッションについて

トップページ(25 ユーザー・14 秒)と moushitatesho-kakikata(25 ユーザー・7 秒)の数字が極端に短く、Organic の着地ではありません(kakikata の検索クリックは 24 日で 1)。Claude Code の描画確認と東さんの閲覧が Direct に入っています。このままだと「全体のエンゲージ率」が実態より低く出続けるので、GA4 の管理 → データストリーム → 内部トラフィックの定義で自宅の IP を登録し、データフィルタ「内部トラフィック」を「有効」にしてください(東さんの操作。設定後の数字から除外されます)。Claude Code の検証はヘッドレスブラウザなので、計測タグを `navigator.webdriver` で止める 1 行を `components/Analytics.tsx` に足す(下の指示に含めます)。

## 5. 今回やること(優先順)

1. **teishutsusaki-yuusou と hatarakinagara の metaTitle を 40 字に**(lib のみ、2 コミット)。
   - teishutsusaki: `障害年金の書類は郵送で出せる？｜送り先は年金事務所・簡易書留・送付状の見本`
   - hatarakinagara: `働きながら障害年金はもらえる？｜受給者の34.0%は仕事あり。医師に伝える4点`
2. **「次に読む 1 本」を結論の箱の直後に**(構造・1 コミット)。`lib/columns.ts` に `nextSlug?: string` を追加、無ければ `relatedSlugs[0]`。表示は 1 行の箱「次に読む → [記事タイトル]」。上の 9 本 + D の送り先 4 本を手で指定。verify:site-graph に「nextSlug が存在する slug を指す」検査を追加。★記事は h2 の並びに影響しないので baseline 不要。
3. **Analytics.tsx に `navigator.webdriver` ガード**(1 コミット)。東さん側: GA4 の内部トラフィック設定。
4. **誤解カード 2 本の metaTitle 試験**(chokin-ga-aru・sashiosae、1 コミット)。`data/gokai-bodies.ts` の該当 2 件に `metaTitle` を追加。
   - chokin-ga-aru: `貯金や持ち家があると障害年金はもらえない？｜資産要件はなく審査もされない(国民年金法)`
   - sashiosae: `障害年金は差し押さえられる？｜国民年金法24条・厚生年金保険法41条が受給権の差押えを禁止`(本文に両条の記載あり。本文の結論と同じ範囲で、例外には触れない)
5. 次の改稿 2 本(別日): nichijo-seikatsu-7koumoku(記載要領 P.10〜14 の 7 項目×4 段階の定義原文を先頭に。「できる」の定義「他者による特別の援助(助言や指導)を要さない程度」は 04-3.pdf にあり)、moushitatesho-mijushin-kikan(記載要領の「受診していない」○と「期間をあけずに」を先頭に)。

## 6. 次に数字を見る日

10/13: E 群の判定(特に a4-insatsu の CTR、kakunin・tanomikata のクリック、kikan-kugiri の滞在)、teishutsusaki の順位 9.8 と CTR、「次に読む」導入後の 1 ユーザーあたり閲覧ページ(1.91 →)。10/19: 誤解カード 2 本の CTR。
