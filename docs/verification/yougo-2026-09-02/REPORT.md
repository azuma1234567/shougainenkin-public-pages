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
