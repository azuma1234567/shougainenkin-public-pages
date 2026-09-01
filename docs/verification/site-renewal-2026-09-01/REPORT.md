# サイトリニューアル フェーズ1 検証記録

検証日: 2026-09-01

## 実装範囲

- 新トップ、`/hajimete`、`/byoki/utsu-soukyoku`、`/jitsurei`、`/nayami/fushikyu`
- 病名ハブ共通テンプレート、全ページ共通ナビ・フッター
- 既存トップの8ステップを `/shinsei` へ移設
- 裁決例JSONを `data/` に配置し、原文確認済みデータを表示
- 社労士掲載枠は実装済み・feature flag既定OFF
- サイト内検索は指示どおり見た目のみ（アクセシビリティ上は無効状態を明示）

## 自動検証

| 項目 | 結果 |
| --- | --- |
| `npm run build` | 成功（113ページ生成） |
| `npm run lint` | 警告・エラーなし |
| `npm run typecheck` | 成功 |
| 内部リンク | 146 URL確認、破損0 |
| 既存コラムslug | 47件、変更なし |
| 新設ページ禁止語 | `急いで / 手遅れ / 危険 / 今すぐ` なし |
| 金額プレースホルダ | `[金額]` なし |
| 調査元ネタ表現 | `YouTube / TikTok / note / ブログ` なし |
| ブラウザconsole | warning / error なし |

## レスポンシブ確認

375pxの同一オリジンiframe内で、次の6ページを確認した。全ページで `innerWidth = documentElement.scrollWidth = 375` となり、横スクロールは発生しなかった。

- `/`
- `/hajimete`
- `/byoki/utsu-soukyoku`
- `/jitsurei`
- `/nayami/fushikyu`
- `/shinsei`

トップではデスクトップナビが非表示、モバイルメニューが表示され、3列グリッドが幅335pxの1列へ変化することも確認した。見出しは375pxで意味のまとまりごとに3行改行する。

## 参照モックとの差分

- 固定1440pxのモックを、最大幅1200px・375px対応のレスポンシブレイアウトにした。
- ナビは既存サイトへ組み込み、モバイルではネイティブの開閉メニューにした。
- 元JSONは94件だが、`verified=true` かつ `excluded` でないデータは91件だった。公的PDFを提示できない3件を表示せず、「構造化94件中、原文確認済み91件を公開」と明記した。
- 結論表示はデータ内の「容認」をそのまま見せず、指示書どおり「結論が変わった」へ変換した。
- 社労士掲載枠は実データがないため既定OFF。検索は見た目のみ。

## スクリーンショット

- `mock-main-desktop-viewport.png`: 承認済みトップモック
- `home-desktop-viewport-final.jpg`: 実装トップ 1440px
- `home-mobile-375-top-final.jpg`: 実装トップ 375px
- 各新設ページと `/shinsei` のdesktop / mobile画像を同じディレクトリに保存

`/jitsurei` のフィルタは見た目だけではなく、URLクエリを使うサーバー描画として実装した。`?filter=mental` などを共有・再読み込みしても状態が維持される。
