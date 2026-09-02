# `/yougo` 用語辞典 実装・検証記録（2026-09-02）

対象指示: `docs/codex-phase2-2026-09-02-instructions.md` §1
本文: `docs/yougo-jiten-2026-09-02.md`（アプリrepo側）

## 1. 作ったもの

| もの | 場所 |
|---|---|
| 用語データ（40語） | `data/yougo.ts`（`scripts/import-yougo.mjs` が原稿から生成。手編集しない） |
| 一覧 `/yougo` | `app/yougo/page.tsx`（五十音10群 × カテゴリ5の2軸絞り込み、カードは「用語名+よみ+言い換え1行」） |
| 個票 `/yougo/<slug>` | `app/yougo/[slug]/page.tsx`（言い換え太字1行 → 定義 → 例/注意 → 関連ページ → 出典） |
| 自動リンク | `components/YougoAutoLinker.tsx` + `lib/yougo-linker.mjs`（判定ロジックは単体テスト可能な形で分離） |
| 検索インデックス | `app/page.tsx`（`term` / `yomi` / `paraphrase` を keywords に投入） |
| 検証 | `scripts/verify-yougo.mjs`（`npm run verify:yougo`。`VERIFY_ORIGIN` 指定で実URL検証も行う） |

## 2. 文言の同一性

`scripts/import-yougo.mjs` を再実行して `data/yougo.ts` と差分を取り、**完全一致**を確認した。
つまり公開データは原稿からの機械変換のみで、手による文言変更は0件。
原稿の `## 実装メモ` 以降は変換前に切り落としており、`実装メモ` / `執筆メモ` / `x.com` の文字列は出力に0件。

## 3. 自動リンクの規則と担保

規則（§1-2）と実装の対応:

- 1ページにつき1語1回まで → `linkedSlugs` に付与済みslugを積み、2回目以降は候補から外す。ページ内に既存の `/yougo/` リンクがあればそれも初期値に入れる。
- 見出し（h1〜h3）・リンク内・コード内ではリンクしない → TreeWalker の `acceptNode` で `a, h1, h2, h3, code, pre` を除外。
- 出典ブロックではリンクしない → `.p-source` / `.article-sources` / `.suuji-sources` / `.yougo-sources` / `.references` / `[data-yougo-skip]` を除外。
  **本文md由来のハブ21本は「### 出典」が素の `<ul>` として出ていて除外できていなかったため、`components/MarkdownArticle.tsx` で出典見出し以降のブロックに `data-yougo-skip` を付ける処理を追加した**（21本すべて出典が最終見出しであることを確認済み）。
- 長い語を優先 → 語を長さ降順に走査し、同じ出現位置で競合したときは長い語を採る（「障害認定日請求」が「障害認定日」に食われない）。
- 個票は自分自身にリンクしない → `selfSlug` を候補から除外。
- 表現 → `.yougo-auto-link { color: inherit; text-decoration: none; border-bottom: 1px dotted var(--platform-link); }`。下線ではなく点線ボーダー。

単体条件は `npm run verify:yougo` が担保（同一語2回目・長い語優先・見出し除外・自己リンク除外・出典ブロックへの印）。

## 4. 代表5ページの目視確認（リンク過多になっていないか）

実ブラウザ（localhost:3100）で描画後のDOMを数えた。いずれも**見出し内0・リンク内0・出典内0・同一語の重複0**。

| ページ | 自動リンク数 | 本文文字数 | 1000字あたり |
|---|---|---|---|
| `/nayami/koushin` | 12 | — | — |
| `/columns/shindansho-tanomikata` | 7 | 9,040 | 0.77 |
| `/okane/ikura` | 10 | 3,886 | 2.57 |
| `/byoki/tougou` | 9 | 3,424 | 2.63 |
| `/yougo/kakunin-todoke` | 2 | — | — |

ハブ21本を静的に見積もった上限は `/byoki/shinzou` の12語・4.02本/1000字（およそ250字に1本）。点線ボーダーのみの控えめな表現であり、段落をまたいで分散するため、読みを妨げる密度ではないと判断した。トップページ本文にも4本（裁決・初診日・障害認定日・診断書）が出ることを確認。

## 5. 完了条件

1. **40語すべてが個票を持ち、一覧の五十音・カテゴリの両方から到達できる** — 40個票すべてHTTP 200、原稿の用語名・言い換え・定義文が描画されていることを確認。一覧は40カード。カテゴリ5タブ（9/8/8/9/6語）と五十音10群の両方から全40語に到達することを機械確認。
2. **自動リンクが規則どおり** — 上記§3。単体テストで、同一語2回目がリンクされないこと・見出し内でリンクされないこと・出典ブロックが対象外であることを担保。
3. **検索インデックス** — `term + yomi + paraphrase` を投入。実際に引けることを確認: 「げんしょうび」→ 現症日（1件）、「しょうがいじょうたいかくにんとどけ」→ 障害状態確認届（1件）、「併給調整」→ 用語辞典+コラムの2件。
   よみが原稿に括弧書きされていない「受診状況等証明書が添付できない申立書」は、`lib/yougo.ts` の `searchableYomi` で補って検索・五十音の両方に載せている。
4. **全slugが半角英数字とハイフンのみ** — 40件すべて `/^[a-z0-9-]+$/` に一致（全角・キリル文字の混入0）。slug重複0。
5. **未公開ページへのリンクを出さない** — `isPublishedRelatedPath` が `lib/hubs.ts` の公開フラグで判定。`/yougo/bunshoryou` に `/erabu/hiyou-souba` のリンクが出ないこと、`/yougo/shinsa-seikyuu` に `/erabu/fushikyu-no-ato` のリンクが出ないことを実HTMLで確認。`/suuji` は公開済みのため `/yougo/nintei-kijun` からリンクを出している。

## 6. 実行結果

- `npm run typecheck`: 成功
- `npm run lint`: 成功（警告・エラー0。`next lint` の移行案内のみ）
- `npm run build`: 成功。`/yougo/[slug]` が40ページSSG。
- `VERIFY_ORIGIN=http://localhost:3100 npm run verify:yougo`: 成功（40語・slug・分類・自動リンク単体条件・全URL・2軸到達・検索・公開リンク）
- `npm run verify:hubs -- http://localhost:3100`: 成功。47記事、欠落0、孤立0、リンク切れ0、予約URLリンク0、被内部リンク50本超0。
- `npm run verify:disease-hubs` / `npm run verify:stats`: 成功（failures 0）
- モバイル375px: `/yougo` `/yougo/kakunin-todoke` ともに `scrollWidth=375`、横スクロールなし。カードは1列、絞り込みチップは折り返して最小タップ高42px。

## 7. 付随して直したこと

- `app/sitemap.ts` に `/yougo` と個票40件を追加（未登録だったため）。
- `components/MarkdownArticle.tsx` に出典ブロックの印（§3参照）。既存の描画結果には影響しない属性追加のみ。

## 8. 申し送り

- 自動リンクはクライアント側（`useEffect`）で行うため、配信HTMLには含まれない。クローラ向けの内部リンクとしては数えない前提。したがって棚割り§4-7の「被内部リンク50本超」判定にも入らない。
- `/suuji` が `app/sitemap.ts` に未登録のまま（`kind: "existing"` のため `PUBLISHED_CONTENT_HUBS` に入らない）。§1の範囲外なので触っていない。

---

# 改訂: 1ページ+アンカー構成へ(2026-09-02)

対象指示: `docs/codex-phase2-yougo-revision-2026-09-02.md`(phase2 §1 の差し替え。個票40ページは作らない)

## 1. 変更点

| 項目 | 改訂前 | 改訂後 |
|---|---|---|
| ページ | `/yougo` + `/yougo/<slug>` ×40 | **`/yougo` のみ**。40語を `<section id="<slug>">` で並べる(`/yougo/<slug>` は404) |
| 目次 | クエリでの絞り込み(`?category=` `?kana=`) | カテゴリタブ5つ(`#cat-*` へのページ内リンク)と五十音インデックス(その行で最初に出る語 `#<slug>` へ) |
| 各語のカード | 個票 | h2「用語名(よみ)」→ 言い換え(太字)→ 定義 → 例/注意 → 関連リンク。右上に「リンクをコピー」(`/yougo#<slug>` をクリップボードへ) |
| 着地時 | — | `.yougo-term:target` に2.2秒のアニメーションで淡青(#eef6fc)ハイライト。`scroll-margin-top` で固定ヘッダーの下に隠れない |
| 自動リンク | `/yougo/<slug>` | **`/yougo#<slug>`**。`/yougo` 自身では動かさない。ルール(1ページ1語1回・見出し/リンク/コード/出典の除外・長い語優先)は不変 |
| 構造化データ | — | `DefinedTermSet` + `DefinedTerm` ×40(`@id` = `/yougo#<slug>`、name・alternateName(よみ)・description・inDefinedTermSet) |
| 検索結果・サイトマップ | 個票URL | 検索結果は `/yougo#<slug>`。サイトマップから個票40件を削除 |
| データ・本文 | `data/yougo.ts` | **変更なし**(`import-yougo.mjs` の生成物のまま) |
| ページ末尾 | — | 「ここに無い言葉は、サイト内検索でも探せます」+ トップの検索欄への導線 |

h1 は指示どおり「用語辞典」、リードは「障害年金でよく出てくる言葉を、むずかしくない言い方から説明します(40語)。」。`<title>` は従来の「障害年金の用語辞典」のまま。

## 2. 完了条件(§4)

検証はリライト後のコミットをクリーンなworktreeで本番ビルド(259ページ、改訂前より40ページ減)し、`VERIFY_ORIGIN` 付きの `npm run verify:yougo` と実ブラウザで行った。

1. **1ページに40語、`/yougo/<slug>` は存在しない** — `/yougo` に `<section class="yougo-term" id="<slug>">` が40、原稿の用語名・言い換え・定義文・注意がすべて描画。`/yougo/<slug>` は40件すべて HTTP 404。サイトマップにも個票URLなし。
2. **`id` と `/yougo#<slug>` での着地・ハイライト** — 40語すべてに `id`。`/yougo#genshoubi` で開くと `:target` が真になり `yougo-flash` アニメーション(背景 #eef6fc)が当たることをブラウザで確認。着地位置は `scroll-margin-top: 84px` と `YougoAnchorLanding`(読み込み時・hashchange時に `scrollIntoView`)でそろえる。※検証用ブラウザペインはプログラムからのスクロールを受け付けない環境だったため、スクロール位置そのものは実機で確認する。
3. **カテゴリタブと五十音から到達** — タブ5つは `#cat-shoshinbi` などページ内リンクで、飛び先の `id` が存在。五十音は あ〜や の8行が各行で最初に出る語へ(`#ippan-joutai-kubun` `#genshoubi` `#shoshinbi` …)、ら・わ行は語がないため無効表示。
4. **自動リンクが `/yougo#<slug>` を向く** — 代表5ページを実ブラウザで確認。すべて `href` が `/yougo#<slug>` で、見出し内0・リンク内0・出典内0・同一語の重複0。`/nayami/koushin` 12本、`/columns/shindansho-tanomikata` 7本、`/okane/ikura` 10本、`/byoki/tougou` 9本、`/gokai/kuriage` 2本。`/yougo` 自身では0本(動かさない)。長い語優先・2回目非リンクは単体テストで担保。
5. **リンクをコピー** — 40個。クリックで `navigator.clipboard.writeText` に `https://<origin>/yougo#<slug>` が渡り、表示が「コピーしました」に変わって約1.8秒で戻ることを確認(検証ブラウザはクリップボード権限がないため、`writeText` を差し替えて呼び出し値を検証)。クリップボードが使えない環境では `prompt` でURLを提示するフォールバック。
6. **DefinedTermSet** — `@type: DefinedTermSet`(`@id`/`url` = `/yougo`)に `DefinedTerm` ×40(`@id` = `/yougo#<slug>`、name、alternateName=よみ、description、inDefinedTermSet)。必須項目を出力HTMLで検証。Google のリッチリザルトテストは公開URLが必要なため、デプロイ後に実施する(DefinedTerm はリッチリザルトの対象外の型なので、テストは「エラーなし」の確認になる)。
7. **slug** — 40件すべて `^[a-z0-9-]+$`、重複0。
8. **未公開ページへのリンク** — 関連リンクは `lib/hubs.ts` の公開フラグで判定し、公開済みだけ出す。現時点は関連先(/nayami/*, /byoki/*, /okane/ikura, /erabu/*, /suuji, /columns/*, /jitsurei)がすべて公開済みで、40語の関連リンクはすべて描画されている(未公開が出れば自動で消える)。
9. **モバイル375px** — `scrollWidth=375`、横あふれ要素0。タブ5つは2〜3段に折り返し、五十音は6+4で折り返し、いずれも最小タップ幅42px。

## 3. §5 全公開ページの本文文字数(500字未満)

リライト後のビルド(サイトマップ151ページ)について、`<main>` 内の可視テキスト(タグ・空白を除く)を数えた。

- **500字未満: 49ページ**
  - **誤解カード48枚すべて**(247〜387字。最短 `/gokai/chokin-ga-aru` 247字、最長 `/gokai/shufu-mushoku` 387字)。原稿の「400〜600字」は見出し・出典を含めても届いていない。指示どおり個票のまま残しており、判断はazuma側。
  - `/about` 479字。
- **実例94ページ**: サイトマップに `/jitsurei` の一覧(2,989字)しかなく、94件の個別ページは**このリポジトリにまだ存在しない**(`docs/jitsurei-94-commentary-2026-09-02.md` の流し込みは別作業)。個別ページができた時点で同じ計測を再実行する必要がある。
- 用語辞典 `/yougo` は6,582字。

## 4. 実行結果

- `npm run typecheck` / `npm run lint`: 成功
- `next build`(worktree): 成功、259ページ。ビルドログに `/yougo/` の出力なし
- `VERIFY_ORIGIN=… npm run verify:yougo`: 成功(40語・slug・分類・自動リンク単体条件・1ページ40語・個票404・タブ/五十音・コピー・DefinedTermSet・公開リンク)
- `node scripts/verify-hub-map.mjs`: 151ページ、リンク切れ0、予約URLリンク0、被内部リンク50本超0
