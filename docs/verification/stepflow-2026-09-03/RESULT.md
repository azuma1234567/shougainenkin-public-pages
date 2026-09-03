# 申請の流れ StepFlow 検証記録 (2026-09-03)

## 実装

- トップと `/shinsei` は `components/platform/StepFlow.tsx` を共用
- 8ステップは、1280pxで左1〜4・右5〜8の2列、760px以下で1列
- ステップ3〜6の機能は各ステップ内に入れ子で表示
- ステップ6の機能だけ primary 背景・白文字で強調

## 自動検証

- `rm -rf .next && npm run build`: ○
- `npm run prelaunch:check`: ○
- ページ数: 166 → 166
- A: 全項目○のまま
- C-1: ○のまま
- 既存警告: B-1 `/app`、B-3 2件、B-4 1件、B-10 3件（今回の変更前から継続）
- `/columns/moushitatesho-a4-insatsu` の `<aside class="mt-column-card">`: ローカルと本番でバイト一致（292バイト）

## 画面検証

- 375px: トップ・`/shinsei` とも `innerWidth=375` / `scrollWidth=375`、1列
- 1280px: トップ・`/shinsei` とも2列
- 両画面とも8ステップ、機能の入れ子4枚を確認

### スクリーンショット

- `top-375.jpg`
- `top-1280.jpg`
- `shinsei-375.jpg`
- `shinsei-1280.jpg`
