# /about に運営者の自己紹介動画を置く(2026-09-18)

## 0. すでに用意してあるもの(Cowork が置いた。作り直さない)

| ファイル | 中身 |
|---|---|
| `public/video/about-intro.mp4` | 本編 82.3MB / 13分15秒 / 960×540 / H.264+AAC / faststart 済み |
| `public/img/about/intro-poster.webp` | ポスター 24KB / 960×540(2026-09-18 に元動画の2秒地点から作り直した。最初は 68KB / 1280×720)。本編 2秒地点(電車の車窓・「僕が、自分が病気だと気づいたのは、」) |
| `data/about-intro.ts` | 目次7件と書き起こし7節(本文4,369字)。台本から生成した。**本文を直接編集しない** |

元データは `~/Projects/YouTube/01_気づくのに8年かかった話/`(YOUTUBE_テロップ入り.mp4 と 台本_概要欄_目次.md)。
字幕(テロップ)は**映像に焼き込み済み**なので、`<track>` は付けない(二重に出る)。

## 1. 置き場所

`app/about/page.tsx` の「運営者」節。`AUTHOR_NAME` と「特定の事務所や団体に所属していません」の段落の**直後**に足す。
既存の文は1文字も変えない。他の節も触らない。

## 2. 動画の出し方

### 2-1. マークアップ
```tsx
<h3>なぜこのサイトを作ったか(動画 {ABOUT_INTRO_DURATION_LABEL})</h3>
<p>
  自分が病気だと気づくまでに8年かかりました。気づいてから病院に行くまでにも、時間がかかりました。
  制度を知ったのは、そのあとです。その8年に何があって、なぜ気づけなかったのか、
  そして「これは最初に知りたかった」と思ったことを話しています。
</p>

<figure className="about-video">
  <video
    controls
    preload="none"
    playsInline
    poster="/img/about/intro-poster.webp"
    width={1280}
    height={720}
  >
    <source src="/video/about-intro.mp4" type="video/mp4" />
    お使いのブラウザは動画の再生に対応していません。下の書き起こしをお読みください。
  </video>
  <figcaption>{ABOUT_INTRO_DURATION_LABEL}・音声あり。字幕は映像に入っています。</figcaption>
</figure>
```

条件
- **`preload="none"` は必ず付ける。** 82MB を、再生ボタンを押した人だけに落とす。付け忘れると /about を開いただけで 82MB 落ちて、9/15 に直した表示速度も転送量も壊れる。
- `width`/`height` を書いて、読み込み前に場所を確保する(CLS 0 を保つ)。
- `<track>` は付けない(§0)。
- 自動再生しない。`muted`/`autoplay`/`loop` は付けない。

### 2-2. 目次(クリックでその時間へ)
`ABOUT_INTRO_CHAPTERS` を `ol` で出す。7件。`0:00 冒頭` `0:45 ① 12歳から…` の形。
秒→`M:SS` の整形はその場で書く(新しい依存を足さない)。

クリックでシークするので、この部分だけ小さなクライアント部品にする(`components/AboutIntroChapters.tsx`, `"use client"`)。

- `<video>` に `id="about-intro"` を付け、部品側は `document.getElementById` ではなく **`useRef` を親から渡す**か、部品の中に `<video>` ごと入れる。どちらでもよいが、`<video>` を持つ側を1つに決めること。
- クリックで `video.currentTime = at` と `video.play()`。`play()` の Promise は握りつぶさず `.catch(() => {})` で黙らせる(自動再生がブロックされたときにコンソールへ出さない)。
- ボタンは `<button type="button">`。リンクにしない(遷移しないため)。
- JavaScript が無効でも目次の文字は読めること(`<button>` の中に時間とラベルを普通に書く)。

### 2-3. 書き起こし
`ABOUT_INTRO_TRANSCRIPT` を `<details className="about-video-transcript">` に入れる。

```tsx
<details className="about-video-transcript">
  <summary>動画で話している内容(書き起こし)</summary>
  {/* 節ごとに h4 と本文。items は {sub} と {p} が混ざる */}
</details>
```

- `summary` の文言はこのまま。
- 節の見出しは `h4`、`sub`(「(1) 初診日という言葉」など)は `strong` の段落でよい。見出しの階層を増やさない。
- **閉じていても HTML には入っている**のが狙い。`hidden` や JS で中身を差し替えない。

## 3. 構造化データ

いま `/about` は `breadcrumbJsonLd` と `publisherJsonLd` を**2つの script** で出している。
9/16 の方針(1ページ1 script)に合わせ、**1つの `@graph` にまとめ**、そこへ `VideoObject` を足す。

`VideoObject` に入れるもの
- `name`: `ABOUT_INTRO_TITLE`
- `description`: 上の導入文と同じ趣旨の1〜2文(ページの文と食い違わせない)
- `thumbnailUrl`: `[`${SITE_URL}/img/about/intro-poster.webp`]`
- `uploadDate`: `ABOUT_INTRO_RECORDED_ON`
- `duration`: `"PT13M15S"`
- `contentUrl`: `${SITE_URL}/video/about-intro.mp4`
- `transcript`: `ABOUT_INTRO_TRANSCRIPT_TEXT`
- `inLanguage`: `"ja"`
- `isFamilyFriendly`: `true`
- `author` / `publisher`: 既存の `authorPersonJsonLd` / `organizationJsonLd` の `@id` を参照する(定義を二重に置かない)
- `hasPart`: `ABOUT_INTRO_CHAPTERS` から `Clip` を7件。各 `{"@type":"Clip", name, startOffset, endOffset, url: `${SITE_URL}/about#t=${at}`}`。最後の `endOffset` は 795。

`embedUrl` は書かない(iframe で配っていないため)。

## 4. CSS(`app/globals.css`)

- `.about-video video { width: 100%; height: auto; border-radius: 12px; background: #000; display: block; }`
- `figure.about-video { margin: 20px 0; }`、`figcaption` は既存の注記の色(`--platform-meta` 相当)に合わせる
- 目次は行間を詰めた `ol`。ボタンは背景なし・左寄せ・時間だけ等幅(`font-variant-numeric: tabular-nums`)
- `details` は既存の折りたたみがあればその見た目に合わせる。無ければ `summary` にだけ最小限(カーソルとフォーカスリング)
- 新しい色を足さない。既存のトークンだけ使う
- 印刷(`@media print`)では動画と目次を消す。書き起こしは残す

## 5. 検証

1. `typecheck` `build` `prelaunch:check`(全 ○)、`verify:site-graph`、`verify:fonts`
2. `/about` の初回読み込みで **`about-intro.mp4` へのリクエストが 0 件**(DevTools の Network で確認)。再生ボタンを押して初めて 206 が出ること
3. Lighthouse モバイルで `/about` は LCP 4秒以内、CLS 0。2.5秒は追わない（検索流入がほぼ無いページのため）。before/after を `docs/verification/about-video-2026-09-18/` に残す
4. 目次の7つのボタンを押すと、その時間へ飛んで再生が始まる
5. JavaScript を切った状態で、動画が再生でき、目次の文字が読め、書き起こしが開けること
6. `<script type="application/ld+json">` が **1つだけ**。中身に BreadcrumbList / Person / Organization / VideoObject / Clip×7 が入っている
7. 390px と 1400px で横スクロールなし。動画が画面からはみ出さない
8. 公開ページの表示テキストに「道具」が 0 件のまま

## 6. コミット

1. `feat(about): 運営者の自己紹介動画と書き起こしを置く`(mp4・poster・data/about-intro.ts を含む)
2. `feat(about): VideoObject の構造化データを1つの @graph にまとめる`

`public/video/about-intro.mp4` は 82.3MB ある。**差し替えるときは、新しいファイルを足さずに同じパスへ上書きする**(git の履歴に何本も残さないため)。
