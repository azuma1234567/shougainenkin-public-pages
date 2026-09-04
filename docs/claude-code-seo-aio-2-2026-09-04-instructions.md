# 指示書: 発見性の穴をふさぐ / 新規記事は書かない (2026-09-04・その2)

Phase C・D(Day 1)まで完了した時点で、`docs/seo-aio-audit-2026-09-04.md` の §6(次に狙う記事)を**取り下げる**。
理由と、代わりにやることを書く。実行は Claude Code。

## §1 監査 §6 の訂正 — 新規記事は1本も書かない

監査は「検索されているのに受け皿が無い」として4本を挙げたが、既存47本を読み直したところ**受け皿は既にある**。

| 監査の提案 | 実際 |
|---|---|
| §6-1 結果待ちの記事を新設 | `shinsei-kikan` に「審査期間はどれくらい? — 『結果待ち』の間に起きること」「結果が遅いときの確認方法」「結果はどう届く?」「待っている間にすること5つ」「不支給通知が届いた場合」がある。**新設は共食い** |
| §6-4 追加書類・照会の記事を新設 | 同じく `shinsei-kikan` に「審査中に連絡が来るケース」「書類の追加提出を求められた場合」がある。「照会」の語は47本中**23本**に出ている。**新設は共食い** |
| §6-3 神経症の記事を新設 | `taishou-shoubyou-kyoukai` が節として扱い、`/byoki/tekiou-fuan` と `/gokai/tekiou-shougai-taishougai` もある。表示10・順位99.7 の語のために3つ目を作るのは薄い。**書かない** |
| §6-2 「打ち切り」の語 | 実施済み(T5)。これだけが正しかった |

**§6 は 6-2 を除いて全部取り消し。** 監査ファイルの §6 冒頭に「2026-09-04 取り下げ。理由はこの指示書 §1」と1行足すこと(本文は消さない。判断の記録として残す)。

## §2 本当の穴 — 47本からハブへのリンクが0本

47本の原稿の本文リンクを数えた。

| リンク先 | 本数 |
|---|---|
| `/columns/*` | 530 |
| `/gokai/*` | 89(39ページ) |
| `/dougu/*` | 83 |
| `/jitsurei` | 42 |
| **`/byoki` `/nayami` `/joukyou` `/okane` `/erabu` のハブ44ページ** | **0** |

`ColumnFooter` も見たが、`parentPillar` が返すのは `/shinsei` か未公開の柱ページだけで、ハブには一切リンクしていない。
つまり**ハブ44ページは、索引されている47本のどこからもリンクされていない**。Google が 53 URL しか把握していないのも、`/byoki` の表示が0なのも、品質ではなくこれが原因。

しかも部品は既にある。`lib/hubs.ts` の `COLUMN_HUB_ASSIGNMENTS` が47本すべてに primary + secondary のハブを割り当てていて、`publishedHubLinks()` も書かれている。**呼んでいる場所が無いだけ**。

### T7: ColumnFooter からハブへリンクする

- `ColumnFooter` に節を1つ足す。見出しは「この記事に関係するページ」。
- 中身は `publishedHubLinks(COLUMN_HUB_ASSIGNMENTS[slug])` の結果を `hub.label` でリンク。primary を先頭に。
- `#` を含む assignment(`/shinsei#step-7` など)はハブではないので除外するか、アンカーを外した `/shinsei` として1回だけ出す。重複させない。
- 既存の「関連記事」「同じテーマの記事」の節とは分ける。記事本文(原稿 .md)は**1文字も変えない**。
- 47本すべてで1本以上のハブリンクが出ることを確認する。出ない記事があれば、その slug の assignment を報告(勝手に足さない)。

### T8: ハブから記事へ、ハブからハブへ

- `HubLanding` の `siblingLinks` は15ページ分しか手書きされていない。残りのハブにも兄弟リンクが要る。**手書きの表は増やさない**。`COLUMN_HUB_ASSIGNMENTS` を逆引きして「このハブを primary/secondary に持つ記事」を一覧にする節を、各ハブの末尾に出す(見出し「このテーマの記事」)。
- これで ハブ → 記事 の導線もできる。ハブ同士は既存の `siblingLinks` のままでよい。

### 完了条件

- `npm run build` 後に、`/columns/shikyuu-teishi-fukkatsu` の HTML に `/nayami/shikyuu-teishi` と `/nayami/koushin` へのリンクがある。
- `/byoki/utsu-soukyoku` の HTML に `/columns/` へのリンクが3本以上ある。
- `npm run verify:columns` 10/10、`npm run verify:hubs`、`npm run typecheck`、`node scripts/prelaunch-check.mjs`(× が B-1・B-3・B-10 から増えないこと)。
- commit: `feat(seo): 記事からハブへ、ハブから記事へのリンクを出す`。main に merge して push。
- デプロイ後に `npm run indexnow -- --since 2026-09-04`(新しくリンクが付いたページを再送信)。

## §3 §5 の積み残し(今日やる)

`scripts/verify-hub-map.mjs` が、作業前の main でも `/jitsurei` の被リンク100本で exit=1 になっている。
`scripts/prelaunch-check.mjs` の B-2 で入れた `LINK_HUBS = {"/jitsurei": …}` と同じ除外を入れて、常時赤を消す。
commit: `fix(verify): 実例ハブを被リンク上限の対象外にする(hub-map も)`。

## §4 Phase D の Day 2 は今日試す

Day 1 の10件で上限メッセージは出ていない。Google の1日あたりの上限は公表されていないので、**出るまでやる**のが確実。
指示書1 §2 Phase D の Day 2 の10件を今日のうちに実行し、上限メッセージが出たらそこで止めてログに書く。出なければ Day 3 も続ける。
T7・T8 の push より**後**に行う(リンクが増えた状態でクロールさせたい)。

## §5 やらないこと

- 新規記事(§1)
- `/jitsurei` の事例個別URL化(監査 §4-6 のまま。索引が120を超えてから)
- 既存47本の本文・URL・slug・h1 の変更
