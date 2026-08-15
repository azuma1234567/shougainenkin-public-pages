# Claude Code 指示書(第2弾) — カテゴリ内の並び順を意味順にする / 取りこぼしを塞ぐ / コミット分割

作成日: 2026-08-15
対象リポジトリ: shougainenkin-public-pages
前提: 第1弾 `docs/claude-code-site-structure-2026-08-15-instructions.md` の実装が完了していること
対象ファイル: `lib/columns.ts` / `app/columns/page.tsx` / `app/page.tsx`

---

## 0. 背景

第1弾でカテゴリ軸をTOPの8ステップに揃えた。実装は正しいが、実データを見たところ
**並び順のレイヤーが手つかず**で、次の3つの問題が残っている。

1. **カテゴリ内が日付順。** 「申請の前に」11本・「診断書」10本のような大きな箱で、
   公開日順は読者にとって意味を持たない。背骨ナビにした以上、箱の中も読む順で並ぶべき。
2. **並び順が2箇所でバラバラ。** `/columns` のカテゴリ節は `COLUMNS_BY_DATE`(日付順)、
   TOPの索引(`app/page.tsx` 1190行付近)は `COLUMNS`(定義順)を使っている。
   同じカテゴリを開いても順番が違う。
3. **最新3本がカテゴリ節から消えている。** `/columns` のカテゴリ節は `LATEST_SLUGS` を
   除外しているため、いま `kiso-kousei-chigai`(基礎と厚生の違い)と
   `ikura-moraeru`(いくらもらえる)が「申請の前に」から抜け落ちている。
   雑誌型の一覧なら重複回避で正しいが、**背骨ナビでは「その段階の記事が全部そこにある」
   ことのほうが重要**。入口カテゴリの中核2本が入口から見えないのは実害。

## 1. 原則(第1弾と同じ。全変更に優先)

1. 既存URL・slug・ディレクトリを変更しない。記事の追加・削除もしない。
2. `content/columns/*.ts`(記事本文)・記事タイトル・descriptionを変更しない。
3. `lib/clusters.ts` と primaryCluster / secondaryClusters を変更しない。
4. カテゴリの値(9つの文字列)・`CATEGORY_ORDER`・`CATEGORY_ANCHORS`・`CATEGORY_LEADS`・
   `WORRY_SHORTCUTS` を変更しない。第1弾の結果はそのまま。
5. 今回変えるのは **並び順** と **カテゴリ節の抽出条件** だけ。

---

## 2. 変更1: `lib/columns.ts` — 並び順の単一の情報源をつくる

### 2-1. `Column` 型にフィールドを追加

```ts
  // カテゴリ節の中での表示順(小さいほど上)。
  // 未指定の記事は指定済みの記事より後ろに回り、その中では公開日の新しい順になる。
  // 「読む順」が意味を持つ大きなカテゴリにだけ付ける。
  orderInCategory?: number;
```

### 2-2. `columnsInCategory()` を新設してエクスポート

`/columns` のカテゴリ節と TOP の索引が**必ずこの関数を通る**ようにする(問題2の解消)。

```ts
export function columnsInCategory(category: ColumnCategory): Column[] {
  return COLUMNS.filter((c) => c.category === category).sort((a, b) => {
    const ao = a.orderInCategory ?? Number.MAX_SAFE_INTEGER;
    const bo = b.orderInCategory ?? Number.MAX_SAFE_INTEGER;
    if (ao !== bo) return ao - bo;
    return b.datePublished.localeCompare(a.datePublished); // 未指定どうしは新しい順
  });
}
```

### 2-3. 3カテゴリに明示順を付ける

以下の27本に `orderInCategory` を付ける。残り17本は未指定のまま(日付順フォールバック)。
番号は連番にせず 10, 20, 30… と10刻みにすること(将来の記事を間に挟めるようにするため)。

**「申請の前に」11本** — 対象か → いつの分から(急ぐ理由)→ 金額と制度 → 誤解・併存

| 順 | slug | 位置づけ |
|---|------|---------|
| 10 | taishou-shoubyou-kyoukai | この病名は対象になるのか(最初の関門) |
| 20 | tekio-shogai-shogai-nenkin | 適応障害でも申請できるか |
| 30 | hattatsu-shougai | 発達障害で申請する |
| 40 | ninteibi-jigojusho | いつの分から受け取れるか(認定日請求と事後重症) |
| 50 | sokyuu-seikyuu | 遡及請求と5年の時効 |
| 60 | ikura-moraeru | いくらもらえるか |
| 70 | kiso-kousei-chigai | 障害基礎年金と障害厚生年金の違い |
| 80 | hatachi-mae | 20歳前傷病の特例 |
| 90 | techou-to-nenkin | 障害者手帳とは別物 |
| 100 | shoubyou-teatekin | 傷病手当金との関係 |
| 110 | shougaisha-koyou-nenkin | 障害者雇用で働きながら |

請求方式(40・50)を金額(60)より前に置くのは意図的。**遡及の5年時効は、
迷っている月数がそのまま取り戻せない金額になる**ため、金額の話より先に目に入る必要がある。

**「診断書 — 主治医に伝える」10本** — 依頼まで → 伝える → 受け取ってから

| 順 | slug | 位置づけ |
|---|------|---------|
| 10 | shindansho-irai-timing | いつ頼むか(現症日の3か月ルール) |
| 20 | shindansho-tanomikata | どう頼むか(切り出し方の台本) |
| 30 | shindansho-kaitekurenai | 書いてもらえないとき(依頼段階のつまずき) |
| 40 | shindansho-ishi-ni-tsutaeru | 何を伝えるか(全リスト) |
| 50 | nichijo-seikatsu-7koumoku | 日常生活能力7項目 |
| 60 | shinsatsu-mae-memo | 主治医に渡す生活状況メモ |
| 70 | hitorigurashi-furi | 一人暮らしだと不利か |
| 80 | shindansho-kakunin | 受け取ったら確認する7点 |
| 90 | tokyu-hantei-guideline | 自分の診断書が何級相当か読む |
| 100 | shindansho-jittai-chigau | 実態と違う・軽く書かれたとき |

**「申立書」6本** — 総論 → 区切り → 空白 → 中身 → 提出形式

| 順 | slug | 位置づけ |
|---|------|---------|
| 10 | moushitatesho-kakikata | 書き方の総論(精神疾患) |
| 20 | moushitatesho-kikan-kugiri | 期間の区切り方 |
| 30 | moushitatesho-mijushin-kikan | 未受診期間の書き方 |
| 40 | hatarakinagara | 働きながらの就労状況の書き方 |
| 50 | kazoku-enjo-kakikata | 家族の援助の書き方 |
| 60 | moushitatesho-a4-insatsu | A4での印刷・提出形式 |

---

## 3. 変更2: `app/columns/page.tsx` — カテゴリ節の取りこぼしを塞ぐ

- カテゴリ節の抽出を `columnsInCategory(category)` に置き換える。
- **`LATEST_SLUGS` による除外をやめる**(問題3の解消)。最新3本はカテゴリ節にも出す。
  「最新の記事」セクションはそのまま残すので、ページ内で3本だけ二重に出るが、
  **段階から探す人がその段階の記事を取りこぼさないことを優先する**。
- `LATEST_SLUGS` が他で使われていなければ定数ごと削除する。
- 各カテゴリ節の見出し・リード文(`CATEGORY_LEADS`)・カードの体裁は変更しない。

## 4. 変更3: `app/page.tsx` — TOP索引を同じ順に揃える

- 1190行付近の `COLUMNS.filter((c) => c.category === category)` を
  `columnsInCategory(category)` に置き換える。
- `COLUMNS` の直接importが不要になれば外す。
- 表示の体裁(`guide-index-group` の details)は変更しない。
- 第1弾で入れた8ステップ→カテゴリのリンク、アプリの文脈CTA、悩み8本は変更しない。

---

## 5. 変更4: コミットを2つに分ける

現在の working tree には、**今回のサイト構造の変更とは別タスクの未コミット変更**が
混ざっている(前セッションの柱ページ基盤)。このまま一括でコミットすると、
サイト構造の変更だけをあとで戻せなくなる。次の順で2コミットに分ける。

**コミット1 — 柱ページ基盤(先行タスク)**

```
lib/clusters.ts            (新規・未追跡。git add が必要)
components/SiteHeader.tsx
components/SiteFooter.tsx
components/Breadcrumb.tsx
components/ColumnArticle.tsx
components/ColumnFooter.tsx
components/ArticleToc.tsx
components/MarkdownArticle.tsx
app/columns/jibun-de-shinsei/page.tsx
```

メッセージ例: `feat: トピッククラスタ(柱ページ)の基盤を追加`

**コミット2 — サイト構造の再編(第1弾+第2弾)**

```
lib/columns.ts
app/columns/page.tsx
app/page.tsx
app/globals.css
docs/claude-code-site-structure-2026-08-15-instructions.md
docs/claude-code-site-structure-2-2026-08-15-instructions.md
```

メッセージ例: `feat: コラムの分類をTOPの8ステップに揃え、悩みショートカットと並び順を追加`

注意:
- `lib/columns.ts` は両方の作業が混ざっている可能性がある。もし柱ページ基盤側の変更
  (`availableClusters` / `clusterColumns` / `isPillarAvailable` / `parentPillar` など)が
  含まれていて分離が難しければ、**無理にhunk分割せずコミット2にまとめてよい**。
  その場合はコミットメッセージ本文にその旨を1行書く。
- 他のdocs配下の未追跡ファイル(`claude-code-deploy-and-faq-instructions.md`、
  `claude-code-mobile-line-fill-2026-08-14-instructions.md`)は今回の対象外。触らない。
- push・デプロイは行わない。コミットまで。

---

## 6. やらないこと(明示)

- 記事の新規作成。とくに「納付要件」カテゴリは現在1本だが、**記事を足すのは別タスク**。
  本文は運営者側で用意してから実装する(このリポジトリの従来運用どおり)。
  今回、記事が1本しかないことを理由にカテゴリを統合・非表示にしてはいけない。
  納付要件は不可逆な要件なので、ステップ2として独立して見えている状態を保つ。
- 柱ページ(`shougainenkin-joken` 等)の新規作成・公開。
- `WORRY_SHORTCUTS` の増減。8本のまま。
- 新しい計測イベントの追加。
- push・本番デプロイ。

## 7. 確認方法

1. `npx tsc --noEmit` / `npm run lint` / `npm run build` がすべて通ること。
2. `git status` で `content/` と記事ディレクトリ(`app/columns/<slug>/`)に差分がないこと
   (`app/columns/jibun-de-shinsei/page.tsx` は先行タスク分なので例外)。
3. `/columns` の「申請の前に」が上から
   `この病名は対象 → 適応障害 → 発達障害 → 認定日/事後重症 → 遡及 → いくらもらえる → …`
   の順に並ぶこと。
4. **`kiso-kousei-chigai` と `ikura-moraeru` が「申請の前に」の節に出ること**(問題3の回帰テスト)。
5. TOPの索引と `/columns` のカテゴリ節で、同じカテゴリの並び順が一致すること。
6. 記事44本すべてがいずれかのカテゴリ節に出ること(どこにも出ない記事がないこと)。
   カテゴリ別の内訳は 申請の前に11 / 初診日4 / 納付要件1 / 相談・進め方3 / 必要書類・提出3 /
   診断書10 / 申立書6 / 結果を待つ3 / 受給が始まってから3 = 44。
7. `git log --oneline -2` で2コミットに分かれていること。
