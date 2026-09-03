# 申立書ツールカード 3記事検証結果

実行日: 2026-09-03

再現手順:

```bash
node -e "require('node:fs').rmSync('.next',{recursive:true,force:true})"
npm run build
npm run start
```

`http://localhost:3000` と `https://shougainenkin-note.net` のHTMLを取得し、カード文言と `/dougu/moushitatesho` へのリンクを照合した。

| 記事 | ローカル | 本番 | 確認したリンク |
|---|---|---|---|
| `/columns/moushitatesho-a4-insatsu` | ○ | ○ | `/dougu/moushitatesho` |
| `/columns/moushitatesho-kikan-kugiri` | ○ | ○ | `/dougu/moushitatesho#kikan` |
| `/columns/moushitatesho-kakikata` | ○ | ○ | `/dougu/moushitatesho` |

`moushitatesho-a4-insatsu` と `moushitatesho-kikan-kugiri` には「この様式を、ブラウザで書いてそのまま印刷できます」が含まれる。`moushitatesho-kakikata` には「申立書の下書きをつくる」の専用カードが含まれる。

3記事の本文・URL・h1に変更はない。
