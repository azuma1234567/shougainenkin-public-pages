# トップページ §7 — 6枚に線画アイコンを足す(2026-09-15)

モック: docs/seo-2026-09-15-top-mock.html(アイコン入りの版)。

## やること

1. `components/platform/NextStepIcons.tsx` を新設し、6つの SVG を名前つきで export する(`FirstVisitIcon` `DoctorNoteIcon` `StatementIcon` `SubmitIcon` `WaitingIcon` `ResultIcon`)。
2. 各 SVG は `Platform.tsx` の `TopicIcon` と同じ作法: `viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"`。className は `p-next-icon`。
3. `app/page.tsx` の6枚それぞれで、番号(01〜06)の並びに置く。h2 の前。順番は下の表のとおり。
4. CSS(`platform.css`): `.p-next-icon{width:34px;height:34px;color:var(--platform-primary);background:var(--platform-chip);border-radius:10px;padding:7px}`。新しい色を足さない。ダークモードは既存トークンに乗せる。
5. 画像ファイルは作らない(インライン SVG のみ)。`next/image` も使わない。

## パス(モックから。そのまま使う)

| # | 名前 | 絵 | path |
|---|---|---|---|
| 01 | FirstVisitIcon | カレンダーに印のついた日 | `<path d="M4 6h16v14H4z"/><path d="M4 10h16M8 3v4M16 3v4"/><circle cx="12" cy="15" r="2"/>` |
| 02 | DoctorNoteIcon | 紙1枚にハート | `<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4V3h6v1"/><path d="M12 16s-3-2-3-4a1.7 1.7 0 0 1 3-1 1.7 1.7 0 0 1 3 1c0 2-3 4-3 4z"/>` |
| 03 | StatementIcon | スマホの画面に書式の行 | `<rect x="7" y="2" width="10" height="20" rx="2"/><path d="M10 7h4M10 10h4M10 13h2"/><path d="M11 18h2"/>` |
| 04 | SubmitIcon | 封筒 | `<path d="M3 7l9 6 9-6"/><rect x="3" y="5" width="18" height="14" rx="2"/>` |
| 05 | WaitingIcon | 砂時計 | `<path d="M7 3h10M7 21h10"/><path d="M8 3c0 4 4 5 4 9s-4 5-4 9M16 3c0 4-4 5-4 9s4 5 4 9"/>` |
| 06 | ResultIcon | 開いた封筒と手紙 | `<path d="M4 10l8-6 8 6v9a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1z"/><path d="M4 10l8 5 8-5"/><path d="M8 7h8v5"/>` |

## 検証

1. `typecheck` `build` `prelaunch:check`(全 ○)、`verify:site-graph`
2. 6枚すべてに `svg.p-next-icon` があり、`aria-hidden="true"` で、`<title>` を持たない(装飾なので読み上げない)
3. 390px で1列、1400px で3列+3列のまま。アイコンが h2 の文字と重ならない
4. ダークモードでアイコンの線と背景が読める(`--platform-primary` と `--platform-chip` の既存の暗色値に任せる)
5. `/` の HTML サイズは gzip 後の増分が 1KB 以内(RSC の重複で生 HTML は約2.6倍に膨らむため、転送量で見る)

## コミット
`feat(top): 6枚に線画アイコンを置く`
