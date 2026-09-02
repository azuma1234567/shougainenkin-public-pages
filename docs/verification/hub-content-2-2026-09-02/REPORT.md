# 病名ハブ8本 追加実装 検証記録（2026-09-02）

対象: `docs/codex-hub-content-2-2026-09-02-instructions.md`

## 完了条件

1. `/byoki/tougou`、`/byoki/chiteki`、`/byoki/tenkan`、`/byoki/jinzou-touseki`、`/byoki/gan`、`/byoki/shinzou`、`/byoki/tounyou`、`/byoki/shitai` の8本を追加。既存URL・slugは変更なし。
2. md→公開データ変換で、各原稿の2つ目のH1以降から「執筆メモ」直前までを取り込み、パンくずと執筆メモを本文から除外。公開本文と原稿の一致を21ページで機械確認。
3. `data/amounts.ts` の金額変換、予約slug非リンク、47記事の棚割りを回帰確認。記事47、割当47、欠落0、孤立0、リンク切れ0、予約URLリンク0。
4. `npm run build` 成功（134ページ生成）、`npm run typecheck` 成功。
5. `/columns` の記事カードを機械集計: `listed=47 / unique=47 / duplicates=[]`。実在slugの欠落・余分なし。
6. 375pxで8病名ハブ、`/columns`、`/shinsei` を確認。全ページ `document.scrollWidth=375`。てんかん表は4行・専用縦積み、表ラッパーも `clientWidth=333 / scrollWidth=333`。`/shinsei` ステッパーは `clientWidth=335 / scrollWidth=335`。
7. 原文照合4点の結果を下記に記録。てんかんは承認後に公式閾値へ修正。
8. 実例フィルタ件数を確認。統合失調症12、知的障害1、腎10、糖尿病7。がん・心疾患・肢体は0件のためリンクを `/jitsurei` にフォールバック。てんかんは実例節・リンクなし。
9. 兄弟リンクは指定の5方向（4組）だけを実装し、指定外の兄弟リンクはなし。糖尿病⇄腎臓病・透析、心臓病→肢体、知的障害⇄発達障害、てんかん→知的障害。

## 認定基準の原文照合（§3）

### 1. てんかん

日本年金機構公開の第8節と照合。A〜Dの定義、1級のA/B月1回以上、2級のA/B年2回以上またはC/D月1回以上、3級のA/B年2回未満またはC/D月1回未満、「十分な治療にかかわらず」、抑制時は原則対象外、発作間欠期を総合評価する点が一致。原稿の旧表は2級・3級の頻度が逆だったため、承認を得て修正済み。

出典: [障害認定基準 第8節（精神の障害）](https://www.nenkin.go.jp/service/jukyu/seido/shougainenkin/ninteikijun/20140604.files/3-1-8.pdf)

### 2. がん

一般状態区分のア〜オと照合。エは日中50%以上就床、オは終日就床・常時介助。悪性新生物の例示は1級がオ、2級がエまたはウ、3級がウまたはイ。本文の「50%以上就床=2級」「終日就床・常時介助=1級」「軽労働不可=3級」は、この対応を要約したものとして矛盾なし。

出典: [障害認定基準（悪性新生物の節を含む全体版）](https://www.nenkin.go.jp/service/jukyu/seido/shougainenkin/ninteikijun/20140604.files/01.pdf)

### 3. 糖尿病

必要なインスリン治療を90日以上継続したうえで、内因性インスリン分泌枯渇・血清Cペプチド0.3ng/mL未満、意識障害により自己回復できない重症低血糖が平均月1回以上、またはケトアシドーシス／高血糖高浸透圧症候群による入院が年1回以上、という原文条件と照合。本文の要約は一致。

出典: [日本年金機構「糖尿病による障害」改正案内](https://www.nenkin.go.jp/service/pamphlet/shougainintei.files/leaflet4.pdf)

### 4. 肢体

診断書の動作欄の4段階（できる、少し困難、非常に困難、できない）と、麻痺の「用を全く廃した」=1級、「相当程度の障害を残す」=2級を照合。本文の表現は利用者向けの短縮表現として一致。てんかん表と同様、スマホでは横スクロールを発生させない。

出典: [肢体の障害用診断書](https://www.nenkin.go.jp/shinsei/jukyu/shougai/shindansho/gaikokushindansyo.files/03_E.pdf)、[障害認定基準（肢体の節を含む全体版）](https://www.nenkin.go.jp/service/jukyu/seido/shougainenkin/ninteikijun/20140604.files/01.pdf)

## 実行結果

- `npm run verify:hubs -- http://localhost:3101`: 成功。47記事、割当47、欠落0、孤立0、ルート失敗0、ページ失敗0、リンク切れ0、予約URLリンク0。
- `npm run verify:disease-hubs -- http://localhost:3101`: 成功。フィルタ件数・実例リンク・H1・兄弟リンクを確認。
- `npm run typecheck`: 成功。
- `npm run lint`: 成功（警告・エラーなし。Next.jsの移行案内のみ）。
- `npm run build`: 成功。134ページ生成。
- 375px実機相当: てんかん、知的障害、糖尿病、腎臓病・人工透析、心臓病、肢体、`/columns`、`/shinsei` を確認。横あふれなし。
