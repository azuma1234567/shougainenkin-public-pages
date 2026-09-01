# `/columns`・`/shinsei` 刷新 検証記録

検証日: 2026-09-01

## 1. build・lint・回帰

- `npm run lint`: 成功（警告・エラーなし）
- `npm run typecheck`: 成功
- `npm run build`: 成功（113ページ生成）
- 既存コラムslug: 47件を維持
- 既存47記事のローカルHTTP確認: 全件200
- 新規文言の禁止語確認: `急いで / 手遅れ / 危険 / 今すぐ` なし

## 2. 参照HTMLとの比較

1440pxで `Columns.html` / `Shinsei.html` と実装を同じビューポートで撮影した。

- `mock-columns.png` / `impl-columns.png`
- `mock-shinsei.png` / `impl-shinsei.png`

色、グラデーション帯、最大幅、余白、チップ、カテゴリカード、横並びステッパー、3つのつまずきカード、ステップカードの型を参照に合わせた。意図的な差は次のとおり。

- 固定1440pxのモックを最大幅900px・375px対応にした。
- `/columns` はモック内の例示記事ではなく、実在47記事のタイトル・要約・slugを使用し、9カテゴリをすべて縦に掲載した。
- `/shinsei` はモックで省略されているステップ2〜8と、金額・選択肢・休息案内・アプリ・FAQをすべて同じデザイン体系で実装した。
- 375pxのステッパーは横スクロールではなく、4列×2段で表示する。

## 3. `/columns` の47記事一意性

記事一覧カードに `data-column-slug` を付け、`lib/columns.ts` の47slugと機械比較した。

```text
expected=47 / listed=47 / unique=47
missing=[] / extra=[] / duplicates=[] / same=true
```

悩みチップとテーマ別まとめは索引導線であり、記事一覧カードの集計対象外。記事カードとしては各記事が1回だけ現れる。

## 4. `/shinsei` の8ステップ

- ステッパーリンク: 8件
- 同一クラス `.shinsei-step-card` のカード: 8件
- 各カード: 48px番号、ステップ名、ひとこと、本文、チェック3件、淡青のつまずき1件、関連記事チップ、次へのリンク
- `#step-6` をクリックし、URLハッシュ・対象カード・見出し「申立書を作成する」を確認

## 5. 375px

- `/columns`: `innerWidth=375`, `document.scrollWidth=375`
- `/shinsei`: `innerWidth=375`, `document.scrollWidth=375`
- ステッパー: `clientWidth=335`, `scrollWidth=335`（横スクロールなし）
- 証跡: `mobile-columns-375.png` / `mobile-shinsei-375.png`

## 6. 内部リンク

`/columns` と `/shinsei` から到達する内部URLを抽出し、129 URLを確認。破損0。
