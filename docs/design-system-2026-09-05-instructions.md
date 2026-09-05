# デザインシステムの実装 — 2 世代を 1 つにする (2026-09-05)

根拠: `docs/site-design-seisa-2026-09-05.md`(全体の精査)。優先順位はそこに書いたとおり。
目的: 色 11・文字 8 段・角丸 3・影 1・部品 1 実装 に統一し、AA 未達をゼロにし、見出しの書体をゴシックに揃える。**記事とハブの本文(文)は 1 文字も変えない。** 変えるのは CSS と部品。
実行: Claude Code。ブランチ `codex/design-system`。commit は §7 のとおり分ける。push は最後にまとめて。


**サイト全体のモック**: `docs/site-mock-2026-09-05-all/site.html`(10 の型を同じ部品で組んだもの。`overview.png` が一覧)。§3 の部品はこのモックの見た目を正とする。

## §1 トークン(`app/platform.css` の `:root` に 1 か所)

```css
:root {
  /* 色 11 */
  --c-text: #1e3a4d;
  --c-heading: #14425e;        /* 見出し・数字(数字は黒 = これ) */
  --c-body-muted: #4a6a80;     /* 説明文 */
  --c-meta: #4f6f87;           /* メタ・注・パンくず・日付(白地 5.31 / 帯地 4.86) */
  --c-border: #dcebf5;
  --c-band: #eef6fc;           /* 帯・箱の背景 */
  --c-primary: #0273ad;        /* ボタン・リンク・強調(白文字 5.17) */
  --c-primary-deep: #015d8c;   /* hover */
  --c-ok: #1a7f4b;  --c-ok-bg: #e9f6ee;
  --c-warn: #b7791f; --c-warn-bg: #fdf5e6;
  --c-danger: #b3261e; --c-danger-bg: #fdf1ef;
  /* 文字 8 段 */
  --fs-h1: 30px; --fs-h2: 22px; --fs-h3: 18px; --fs-num: 28px;
  --fs-body: 17px; --fs-small: 14.5px; --fs-meta: 13px; --fs-note: 12.5px;
  --lh-body: 1.9; --lh-heading: 1.45;
  --font-heading: var(--font-platform-heading), "Hiragino Kaku Gothic ProN", sans-serif;
  /* 形 */
  --r-sm: 8px; --r-card: 14px; --r-pill: 999px;
  --shadow: 0 1px 3px rgba(20, 66, 94, .06);
  --card-pad: 20px 22px; --card-gap: 14px;
  --w-read: 760px; --w-wide: 1200px;
}
@media (max-width: 720px) { :root { --fs-h1: 26px; --fs-h2: 20px; } }
```

### 1-1 旧トークンは**別名**で残す(段階的に消す)
同じ `:root` に、旧名 → 新値 の別名を置く。**値は新トークンを参照させ、直接の色を書かない**:
```css
:root {
  --green: var(--c-primary); --green-dark: var(--c-primary-deep); --green-deep: var(--c-heading);
  --text: var(--c-text); --text-muted: var(--c-body-muted); --border: var(--c-border); --note-bg: var(--c-band);
  --platform-primary: var(--c-primary); --platform-link: var(--c-primary); --platform-link-hover: var(--c-primary-deep);
  --platform-heading: var(--c-heading); --platform-text: var(--c-text); --platform-muted: var(--c-body-muted);
  --platform-subtle: var(--c-meta); --platform-meta: var(--c-meta); --platform-faint: var(--c-meta);
  --platform-border: var(--c-border); --platform-band: var(--c-band); --platform-bg: #f7fbfe; --platform-surface: #fff;
  --radius-sm: var(--r-sm); --radius: var(--r-card); --radius-lg: var(--r-card); --radius-xl: var(--r-card);
  --shadow-xs: var(--shadow); --shadow-sm: var(--shadow); --shadow-md: var(--shadow); --shadow-lg: var(--shadow);
  --font-display: var(--font-heading);   /* 明朝 → ゴシック。これ 1 行で 47 本の見出しが揃う */
}
```
これで、**CSS の本文を触らなくても** faint/meta/subtle の AA 未達、主色の二重、明朝、影と角丸のばらつきが一度に消える。旧トークンの**直接参照**は残ってよい(別名なので)。ただし新規に書く CSS は新トークンだけを使う。

### 1-2 直接の色コードを消す
- `platform.css` と `globals.css` の中の `#0284c7`(13 箇所)→ `var(--c-primary)`。`#8aa5b6` `#6e8ba0` `#5b7a90` → `var(--c-meta)`。
- `--jc-*`(道具の 5 色)は**廃止**。道具カードは `--c-primary` の枠 + 道具名の文字で区別する(§3-6)。`--jc-*` の参照を全部置き換えてから定義を消す。
- `--mt-*`(申立書ツール)は `--c-*` の別名にする。
- それ以外の直接色(114 種)は、**見た目が変わらない範囲で**近い新トークンに寄せる。判断に迷うものは残して報告(一覧を `docs/verification/design-system-2026-09-05/leftover-colors.md` に)。

## §2 文字

- `h1 / h2 / h3` の基底(`globals.css` の要素セレクタ)を `--fs-h1/h2/h3` と `--font-heading` に。`.platform h1` 等の上書きも同じ変数に。**ハブの h2 31px・道具の h1 40px 級を含め、全ページで同じ段になる**。
- `Zen_Old_Mincho` の読み込み(`app/layout.tsx`)は**残す**(申立書の印刷など明朝が要る箇所があるため)。見出しに使わなくなるだけ。
- 本文 17px / 1.9 は変えない。1 行の幅(760px)も変えない。
- `font-size` の直接指定(98 種)は、8 段のどれかに寄せる。12.5px 未満は `--fs-note` に上げる(**12.5px より小さい文字を作らない**)。

## §3 部品の統一(1 部品 1 実装)

| 部品 | いま | 統一後 |
|---|---|---|
| 3-1 結論の箱 | コラム `.column-conclusion`(「この記事の結論」)/ 誤解 `.gokai-truth`(「結論」) | 1 つの `.p-conclusion`(左 4px `--c-primary`、背景 `--c-band`、角丸 0 14 14 0)。見出し語は「この記事の結論」で統一 |
| 3-2 表 | `.article-table-wrap`(コラム)/ `.suuji-table`(数字・ハブ) | `.p-table`(ヘッダー行 `--c-band`、罫線 `--c-border`、角丸 14、横スクロール)。両方のクラスを `.p-table` の別名にする |
| 3-3 FAQ | コラム: 見出し+段落 / ハブ: `<details>` | **見出し + 段落**に統一(`MarkdownArticle` の `faqAccordion` を外す)。JSON-LD は変えない |
| 3-4 更新日 | 「公開日/最終確認日」「最終更新日」「最終更新日・確認日」 | `PageDate` 1 つ。表示は「最終確認日 YYYY年M月D日」(公開日は `<time>` を残し、表示は確認日のみ)。全ページで同じ位置(h1 の直下) |
| 3-5 パンくず | `Breadcrumb`(新)と コラムの `meta-line` 内 | `Breadcrumb` に統一。文字色 `--c-meta`(いまの faint は AA 未達) |
| 3-6 道具カード | `--jc-*` 5 色 | 白地・`--c-border`・左 4px `--c-primary`・道具名を太字で。記事内の「→ どこに出せばいい?」の箱も同じ部品 |
| 3-7 カード | `.p-card` / `.column-card` / `.guide-*` | `.p-card`(角丸 14、padding 20 22、影 1 つ、hover で枠が主色)。旧クラスは別名 |
| 3-8 目次 | コラム `ArticleToc`(冒頭・非固定)のみ | 今回は**触らない**(コラム部品の指示書で、固定目次と一緒にやる) |
| 3-9 意味の色 | 実例のバッジのみ | `.is-ok / .is-warn / .is-danger`(左罫線 + バッジ)を共通クラスに。数字には塗らない |

## §4 ボタン
- 主ボタン: 背景 `--c-primary`、白文字(5.17)。`#0284c7` 背景は廃止。
- 高さ 44px 以上、文字 15px 以上。タップ領域 24×24 以上(WCAG 2.5.8)。
- 副ボタン: 白地・`--c-primary` の枠と文字。

## §5 変えないもの
- 記事・ハブ・誤解・道具の**文**(JSX の文字列、Markdown、JSON)。
- URL・h1 の文言・JSON-LD。
- 本文 17px/1.9、1 行 760px。
- 申立書の印刷 CSS(`.mt-paper*`、`@page`、`@media print`)。**触らない**(検査 9 が守っている領域)。
- 道具の動作。

## §6 検証(`docs/verification/design-system-2026-09-05/RESULT.md`)

1. **棚卸しスクリプト** `scripts/verify-design-tokens.mjs` を作り、`globals.css` + `platform.css` の 色 / font-size / border-radius / box-shadow の種類数を出す。目標: 色 ≤ 20、font-size ≤ 12、角丸 ≤ 3、影 ≤ 1。前後の数を表で。
2. **AA**: 同スクリプトで、全 `color:` 値と主な背景(白・帯・主色)の組み合わせのコントラストを計算し、**4.5 未満が 0**(12.5px 以上の本文・メタ)。ボタンの白文字も対象。
3. `#0284c7` `--jc-` の参照が 0。`--platform-faint` 等の旧名は別名として残るので参照はあってよい。
4. **見出しの統一**: Playwright で 8 ページ(`/` `/byoki` `/byoki/utsu-soukyoku` `/columns/shoshinbi-wakaranai` `/gokai/hataraitetara-muri` `/jitsurei` `/dougu/mitate` `/shinsei`)の `h1` `h2` の computed font-family / font-size を取り、**全部同じ**。
5. **並べて見る**: コラム 1 本とハブ 1 本を 1400px で撮り、結論の箱・表・更新日・カードが同じ見た目(RESULT に 2 枚並べる)。390px も。
6. **文が変わっていない**: 変更前後の HTML から `<p>` `<li>` `<h1-3>` のテキスト集合を取り、**完全一致**(部品の統一で文が消えていない)。8 ページで。
7. 申立書の検査 `npm run verify:moushitatesho:layout`(9/9)と `verify:moushitatesho`(9/9)が通る(印刷 CSS を触っていない証明)。
8. `npm run typecheck && npm run build && node scripts/prelaunch-check.mjs`(× が B-1・B-3・B-10 から増えない)。
9. リッチリザルトテストは使わない(FAQ は終了済み)。JSON-LD は schema.org バリデータで構文だけ。

## §7 コミット(この順)
1. `feat(design): トークンを 1 か所に定め、旧名を別名にする`(§1)
2. `fix(a11y): メタ文字とボタンのコントラストを AA に`(§1-2, §4)
3. `feat(design): 見出しをゴシック 8 段に統一する`(§2)
4. `feat(design): 結論の箱・表・FAQ・更新日・パンくず・道具カードを 1 実装にする`(§3)
5. `test(design): トークンの棚卸しとコントラストの検査を足す`(§6-1,2)
main に merge して push。デプロイ後に `/columns/shoshinbi-wakaranai` と `/byoki/utsu-soukyoku` を実機で開いて、見出しがゴシック・パンくずが読める・ボタンの文字が白く濃い、を目で確認。

## §8 貼るコマンド
```
cd ~/Projects/shougainenkin-public-pages && git checkout main && git pull --ff-only && git checkout -b codex/design-system && claude "docs/design-system-2026-09-05-instructions.md を読み、§1〜§4 を §7 の順にコミットしながら実装してください。§5 の変えないもの(文・URL・本文 17px・印刷 CSS)を守り、§6 の検証をすべて行って RESULT.md を書き、main に merge して push してください。判断に迷う色は勝手に決めず leftover-colors.md に残して報告してください。"
```
