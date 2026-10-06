# デザインシステム棚卸し(2026-10-06・切り出し前 = 第1段の基準)

対象: app/globals.css・app/platform.css・app/columns/columns.css。宣言 6354 件。生成: inventory.mjs(手で直さない。ROOT=<HEAD を書き出した場所> で切り出し前を再現)。

## 1. 色

- 異なる色の値: **152**(hex 119、rgba/hsl 33)。うちトークン(カスタムプロパティ)として定義されている値 38、どのトークンにも無い「孤立色」 **114**。
- 孤立色の出現回数の合計 288(第1段で置換できるのは、既存トークンと完全一致する値だけ。それは下の表の「=トークン」欄に出る)。

### 1-1. 名前と実体のずれ

| トークン | 値 | 定義元 | 備考 |
|---|---|---|---|
| `--card-warm` | `#fbfdff` | globals.css | 旧・金色アクセントの名残(値は青系・中立色) |
| `--green` | `#0273ad` | globals.css | 名前は緑、実体は青 |
| `--green-dark` | `#015d8c` | globals.css | 名前は緑、実体は青 |
| `--green-softer` | `rgba(2, 132, 199, 0.045)` | globals.css | 名前は緑、実体は青 |
| `--green-tint` | `rgba(2, 132, 199, 0.06)` | globals.css | 名前は緑、実体は青 |
| `--green-tint-2` | `rgba(2, 132, 199, 0.12)` | globals.css | 名前は緑、実体は青 |
| `--marker` | `rgba(2, 132, 199, 0.13)` | globals.css | 旧・金色アクセントの名残(値は青系・中立色) |
| `--accent` | `#5b7a90` | globals.css | 旧・金色アクセントの名残(値は青系・中立色) |
| `--accent-soft` | `#a8c9dd` | globals.css | 旧・金色アクセントの名残(値は青系・中立色) |
| `--gold-wash` | `rgba(2, 132, 199, 0.05)` | globals.css | 旧・金色アクセントの名残(値は青系・中立色) |

### 1-2. 色の全一覧(出現回数順)

| 色 | 回数 | =トークン | prop | 使うセレクタ(抜粋) | ファイル |
|---|---|---|---|---|---|
| `#ffffff` | 157 | `--card` `--platform-surface` | --card, background, color, background-color | :root / .column-theme-links a / .mt-progress button | globals.css, platform.css |
| `#cfe6f5` | 25 | (無し) | border, border-top, background, border-color | .column-theme-block / table.kg-br tr.kg-total td,table.kg-br tr.kg-to… | globals.css, platform.css |
| `#0284c7` | 24 | `--mt-primary` `--platform-primary` `--jc-mitate` | background, border, color, border-color | .mi-start / .mi-start-alt / .mi-progress span | globals.css, platform.css |
| `#4a6a80` | 21 | `--text-muted` `--platform-muted` | --text-muted, color, --platform-muted | :root / .column-theme-title / .ads-sub | globals.css, platform.css |
| `#dcebf5` | 20 | `--border` `--platform-border` | --border, border, --platform-border, border-bottom | :root / .ads-form / .ads-opt | globals.css, platform.css |
| `#d7e9f5` | 19 | (無し) | border, border-bottom | .kg-card input[type=number],.kg-card select / .kg-chips button / .kg-… | globals.css, platform.css |
| `#14425e` | 15 | `--green-deep` `--platform-heading` | --green-deep, color, --platform-heading | :root / .ads-features strong / .ads-steps strong | globals.css, platform.css |
| `#0273ad` | 13 | `--green` `--platform-link` | --green, border-color, accent-color, color | :root / .ads-checks label:has(:checked) / .ads-checks input | globals.css, platform.css |
| `#eef6fc` | 11 | `--bg-deep` `--note-bg` `--platform-band` | --bg-deep, --note-bg, background, --platform-band | :root / .sr-decide / .sr-empty | globals.css, platform.css |
| `#000000` | 11 | (無し) | background, color, outline | .about-video video / .mi-doctor-sheet / .mi-printhead | globals.css |
| `#526575` | 11 | (無し) | color | .mi-intro>p / .mi-assurances span / .mi-mode-link | globals.css |
| `#263746` | 11 | (無し) | color | .mi-big-line / .mi-answer-list button / .mi-result-section h3 | globals.css |
| `#71808d` | 11 | (無し) | color | .mi-progress-text / .mi-back / .mi-formal-name | globals.css |
| `#cbd5df` | 10 | (無し) | border, border-color, border-left, border-top | .mi-assurances span / .mi-answer-list button / .mi-result-heading,.mi… | globals.css |
| `#e8f4fc` | 9 | `--mt-soft` `--jc-mitate-bg` | background, --mt-soft, --jc-mitate-bg, box-shadow | .sr-added / .md-answer / .mt-redesign | globals.css, platform.css |
| `#bbbbbb` | 8 | (無し) | border | .mi-note,.mi-warnbox,.mi-verdict / .mi-dirtag / .sr-note,.sr-warnbox | globals.css |
| `#fbfdff` | 7 | `--card-warm` | --card-warm, background | :root / .mi-opt:hover / .mi-next a:hover | globals.css, platform.css |
| `#9db9ca` | 6 | (無し) | border | .mt-field input,.mt-field textarea,.mt-fields input,.mt-fields textar… | globals.css, platform.css |
| `#fdf3dd` | 6 | (無し) | background | .kg-warnbox / .mi-warnbox / .mi-dir-eq | globals.css, platform.css |
| `#8b6a1f` | 6 | (無し) | color | .kg-warnbox b / .mi-savenote / .mi-warnbox strong | globals.css, platform.css |
| `#f4fafe` | 6 | (無し) | background | .md-answer / .md-where / .columns-toc a:hover | globals.css, platform.css |
| `#e3f2fc` | 5 | `--green-pale` `--platform-chip` | --green-pale, background, --platform-chip | :root / .ads-checks label:has(:checked) / .sr-chip[aria-pressed=true] | globals.css, platform.css |
| `#f7fbfe` | 4 | `--bg` `--platform-bg` | --bg, --platform-bg, background | :root / .p-hero / .p-page-hero | globals.css, platform.css |
| `#b9dced` | 4 | (無し) | border, border-top | .column-theme-links a / .hub-sibling-links a / .suuji-links a | globals.css, platform.css |
| `#f0e2bd` | 4 | (無し) | border | .kg-warnbox / .mi-warnbox / .sr-warnbox | globals.css |
| `#6b5316` | 4 | (無し) | color | .kg-warnbox / .mi-warnbox / .sr-warnbox | globals.css |
| `#6e8ba0` | 4 | `--platform-meta` | --platform-meta, color | :root / .columns-toc-label / .columns-count | platform.css |
| `#dbeefa` | 4 | (無し) | color | .hub-decision-next p / .p-primary-panel / .shinsei-app > .p-label | platform.css |
| `#40607a` | 4 | (無し) | color | .site-nav a / .site-mobile-menu nav a / .p-chip.is-soft | platform.css |
| `#b8d4e6` | 4 | (無し) | color | .site-footer / .footer-site-name / .site-footer a | platform.css |
| `#015d8c` | 3 | `--green-dark` `--platform-link-hover` | --green-dark, color, --platform-link-hover | :root / .sr-prefs a | globals.css, platform.css |
| `#1e3a4d` | 3 | `--text` `--platform-text` | --text, color, --platform-text | :root / .sr-chip | globals.css, platform.css |
| `#eef7fc` | 3 | (無し) | background | .mt-privacy,.mt-notice,.mt-overflow / .mt-print-note / .mt-capacity | globals.css |
| `#163c52` | 3 | (無し) | color | .mt-field input,.mt-field textarea,.mt-fields input,.mt-fields textar… | globals.css |
| `#8db4c9` | 3 | (無し) | border | .mt-actions button,.mt-data button,.mt-file,.mt-add,.mt-primary,.mt-p… | globals.css |
| `#21455b33` | 3 | (無し) | box-shadow | .mt-paper / .mt-a4-half | globals.css |
| `rgba(35,76,61,0.07)` | 3 | (無し) | box-shadow | .lp-step / .lp-feature / .lp-price-card | globals.css |
| `#067647` | 3 | (無し) | color | .mi-dir-up / .ads-toast / .p-label-success | globals.css, platform.css |
| `#9aa8b4` | 3 | (無し) | border, border-left-color | .mi-result-actions button / .mi-result .mi-quote / .mi-guide-mark | globals.css |
| `#333333` | 3 | (無し) | color, border | .mi-ds-meta / .mi-ds-src / .sr-box::before | globals.css |
| `rgba(20,66,94,.05)` | 3 | (無し) | box-shadow | .dougu-band-card / .dougu-card / .jc | globals.css, platform.css |
| `#b9dcec` | 3 | (無し) | border-color | .columns-toc a:hover / .columns-worry-chips a:hover / .columns-card:h… | platform.css |
| `#5b7a90` | 2 | `--accent` `--platform-subtle` | --accent, --platform-subtle | :root | globals.css, platform.css |
| `#f4faff` | 2 | (無し) | background | .column-theme-block / .suuji-definition-note | globals.css, platform.css |
| `#5ca7cf` | 2 | (無し) | border-left | .mt-privacy,.mt-notice,.mt-overflow / .sr-decide | globals.css |
| `#b3261e` | 2 | (無し) | outline, color | .mt-paper-text[data-overflow="true"] / .mt-print-overflow strong | globals.css |
| `rgba(255,255,255,0.88)` | 2 | (無し) | color | .site-nav a / .lp-final-cta .lp-cta-note | globals.css |
| `rgba(255,255,255,0.1)` | 2 | (無し) | background-color | .site-nav a:hover / .site-footer a:hover | globals.css |
| `rgba(255,255,255,0.85)` | 2 | (無し) | color | .site-footer a / .footer-copyright | globals.css |
| `rgba(255,255,255,0.75)` | 2 | (無し) | color, background-color | .footer-ad-disclosure / .guide-eyebrow | globals.css |
| `rgba(255,255,255,0.16)` | 2 | (無し) | border-bottom, border-top | .footer-guides / .site-footer .footer-bottom | globals.css, platform.css |
| `#e8f6ef` | 2 | (無し) | background | .mi-dir-up / .p-label-success | globals.css, platform.css |
| `#666666` | 2 | (無し) | border | .mi-ds-table th,.mi-ds-table td / .mi-ds-grade | globals.css |
| `#999999` | 2 | (無し) | border-top, border-bottom | .mi-ds-src / .mi-card | globals.css |
| `#b4232c` | 2 | (無し) | color, border-color | .ads-req / .ads-form [aria-invalid=true] | globals.css |
| `#e9b8bc` | 2 | (無し) | border | .ads-req / .ads-errors | globals.css |
| `#8a1c24` | 2 | (無し) | color | .ads-field-error / .ads-errors | globals.css |
| `#cfe4f2` | 2 | (無し) | border | .suuji-stat-tile / .suuji-definition-note | platform.css |
| `#c5dfea` | 2 | (無し) | background | .suuji-stacked .is-非該当, .suuji-dot.is-非該当 / .suuji-dot.renewal-支給停止 | platform.css |
| `rgba(20,66,94,0.14)` | 2 | (無し) | box-shadow | .site-mobile-menu nav / .app-screenshot-grid img | platform.css |
| `#8cc8e8` | 2 | (無し) | border-color | .gokai-card:hover / .hub-gokai-card:hover | platform.css |
| `rgba(2,132,199,0.045)` | 1 | `--green-softer` | --green-softer | :root | globals.css |
| `rgba(2,132,199,0.06)` | 1 | `--green-tint` | --green-tint | :root | globals.css |
| `rgba(2,132,199,0.12)` | 1 | `--green-tint-2` | --green-tint-2 | :root | globals.css |
| `rgba(2,115,173,0.2)` | 1 | `--card-border` | --card-border | :root | globals.css |
| `rgba(2,115,173,0.36)` | 1 | `--card-border-strong` | --card-border-strong | :root | globals.css |
| `rgba(2,132,199,0.13)` | 1 | `--marker` | --marker | :root | globals.css |
| `#a8c9dd` | 1 | `--accent-soft` | --accent-soft | :root | globals.css |
| `rgba(2,132,199,0.05)` | 1 | `--gold-wash` | --gold-wash | :root | globals.css |
| `rgba(20,66,94,0.04)` | 1 | (無し) | --shadow-xs | :root | globals.css |
| `rgba(20,66,94,0.06)` | 1 | (無し) | --shadow-sm | :root | globals.css |
| `rgba(20,66,94,0.07)` | 1 | (無し) | --shadow-md | :root | globals.css |
| `rgba(20,66,94,0.12)` | 1 | (無し) | --shadow-lg | :root | globals.css |
| `#026a9f` | 1 | (無し) | color | .column-theme-links a | globals.css |
| `#678399` | 1 | (無し) | color | .column-theme-primary | globals.css |
| `#b8daed` | 1 | (無し) | border | .mt-column-card | globals.css |
| `#f2f9fd` | 1 | (無し) | background | .mt-column-card | globals.css |
| `#876b2a` | 1 | (無し) | border-color | .mt-overflow | globals.css |
| `#fff9e8` | 1 | (無し) | background | .mt-overflow | globals.css |
| `#111111` | 1 | (無し) | color | .mt-paper-text | globals.css |
| `#f0c9c4` | 1 | (無し) | border | .mt-print-overflow | globals.css |
| `#fdf1ef` | 1 | (無し) | background | .mt-print-overflow | globals.css |
| `#6b2d26` | 1 | (無し) | color | .mt-print-overflow | globals.css |
| `rgba(255,255,255,0.7)` | 1 | (無し) | background | .site-title:hover .site-title-text::after | globals.css |
| `#c9a227` | 1 | (無し) | border | .ad-label | globals.css |
| `#fdf6e3` | 1 | (無し) | background | .ad-label | globals.css |
| `#7a5c05` | 1 | (無し) | color | .ad-label | globals.css |
| `#e6d9a8` | 1 | (無し) | border | .affiliate-notice | globals.css |
| `#fdfaf0` | 1 | (無し) | background | .affiliate-notice | globals.css |
| `#d9dee7` | 1 | (無し) | border | .legal-crosslink | globals.css |
| `#16665f` | 1 | (無し) | border-left | .legal-crosslink | globals.css |
| `#f4f8f8` | 1 | (無し) | background | .legal-crosslink | globals.css |
| `rgba(35,76,61,0.35)` | 1 | (無し) | box-shadow | .lp-sticky-cta-button | globals.css |
| `#45494b` | 1 | (無し) | color | .guide-faq-a | globals.css |
| `#7cc3e8` | 1 | (無し) | background | .mi-prog i.done | globals.css |
| `#0270a8` | 1 | (無し) | background | .mi-btn:hover | globals.css |
| `#b9d9ec` | 1 | (無し) | background | .mi-btn:disabled | globals.css |
| `#cfe9f9` | 1 | (無し) | background | table.mi-gt td.mi-hit | globals.css |
| `#c3d6e2` | 1 | (無し) | color | table.mi-gt td.mi-na | globals.css |
| `#f3f9fd` | 1 | (無し) | background | .mi-start-alt:hover | globals.css |
| `#d8e0e7` | 1 | (無し) | background | .mi-progress | globals.css |
| `#e6f4fb` | 1 | (無し) | background | .mi-result table.mi-gt td.mi-hit | globals.css |
| `#a5b0b9` | 1 | (無し) | color | .mi-result table.mi-gt td.mi-na | globals.css |
| `#eeeeee` | 1 | (無し) | background | .mi-ds-table thead th | globals.css |
| `#e6e6e6` | 1 | (無し) | background | table.mi-gt td.mi-hit | globals.css |
| `#f4f8fb` | 1 | (無し) | background | .md-card select:disabled | globals.css |
| `#d5e3ec` | 1 | `--mt-border` | --mt-border | .mt-redesign | globals.css |
| `#f1f4f6` | 1 | (無し) | background | .mt-reassurance span | globals.css |
| `#445566` | 1 | (無し) | color | .mt-reassurance span | globals.css |
| `#f5f7f8` | 1 | (無し) | background | .mt-life label | globals.css |
| `#1d4e68` | 1 | (無し) | color | .mt-capacity | globals.css |
| `#fff5f5` | 1 | (無し) | background | .ads-errors | globals.css |
| `#eaf7ef` | 1 | (無し) | background | .sr-tag-f | globals.css |
| `#0b5c33` | 1 | (無し) | color | .sr-tag-f | globals.css |
| `#8aa5b6` | 1 | `--platform-faint` | --platform-faint | :root | platform.css |
| `#e2eef7` | 1 | `--platform-border-soft` | --platform-border-soft | :root | platform.css |
| `#059669` | 1 | `--jc-kingaku` | --jc-kingaku | :root | platform.css |
| `#d97706` | 1 | `--jc-shorui` | --jc-shorui | :root | platform.css |
| `#7c3aed` | 1 | `--jc-madoguchi` | --jc-madoguchi | :root | platform.css |
| `#0e7490` | 1 | `--jc-moushitatesho` | --jc-moushitatesho | :root | platform.css |
| `#e6f6ef` | 1 | `--jc-kingaku-bg` | --jc-kingaku-bg | :root | platform.css |
| `#fdf3e3` | 1 | `--jc-shorui-bg` | --jc-shorui-bg | :root | platform.css |
| `#f0eafb` | 1 | `--jc-madoguchi-bg` | --jc-madoguchi-bg | :root | platform.css |
| `#e4f3f6` | 1 | `--jc-moushitatesho-bg` | --jc-moushitatesho-bg | :root | platform.css |
| `rgba(20,66,94,0.05)` | 1 | (無し) | box-shadow | .suuji-stat-tile | platform.css |
| `#e8f3fa` | 1 | (無し) | background | .suuji-bar-track | platform.css |
| `#075985` | 1 | (無し) | background | .suuji-stacked .is-1級, .suuji-dot.is-1級 | platform.css |
| `#69b7dd` | 1 | (無し) | background | .suuji-stacked .is-3級, .suuji-dot.is-3級 | platform.css |
| `#38a8dc` | 1 | (無し) | background | .suuji-dot.renewal-増額改定 | platform.css |
| `#8fc9e7` | 1 | (無し) | background | .suuji-dot.renewal-減額改定 | platform.css |
| `rgba(255,255,255,0.08)` | 1 | (無し) | background | .site-footer a:hover | platform.css |
| `rgba(255,255,255,0.25)` | 1 | (無し) | border-color | .site-footer .analytics-preference-button | platform.css |
| `rgba(2,132,199,0.10)` | 1 | (無し) | box-shadow | .p-search | platform.css |
| `#93aebf` | 1 | (無し) | color | .p-search-input::placeholder | platform.css |
| `#8ed2f4` | 1 | (無し) | outline | .p-search-action:focus-visible | platform.css |
| `rgba(20,66,94,0.1)` | 1 | (無し) | box-shadow | .p-search-results | platform.css |
| `#fef7ec` | 1 | (無し) | background | .p-label-misconception | platform.css |
| `#b45309` | 1 | (無し) | color | .p-label-misconception | platform.css |
| `#f4f9fd` | 1 | (無し) | background | .p-note | platform.css |
| `#6b7f92` | 1 | (無し) | color | .p-chip-label | platform.css |
| `#ecf4fa` | 1 | (無し) | border-top | .p-case-foot | platform.css |
| `#e6f4fc` | 1 | (無し) | color | .step-flow-tool.is-featured span | platform.css |
| `rgba(2,132,199,.25)` | 1 | (無し) | box-shadow | .step-flow-tool:hover | platform.css |
| `rgba(255,255,255,.5)` | 1 | (無し) | box-shadow | .step-flow-tool.is-featured:hover | platform.css |
| `#eaf3fa` | 1 | (無し) | background | .p-bar | platform.css |
| `rgba(247,251,254,0.94)` | 1 | (無し) | background | .columns-toc | platform.css |
| `rgba(20,66,94,.04)` | 1 | (無し) | box-shadow | .gokai-card | platform.css |
| `rgba(20,66,94,0.045)` | 1 | (無し) | box-shadow | .shinsei-step-card | platform.css |
| `rgba(255,255,255,.13)` | 1 | (無し) | background | .shinsei-app > .p-label | platform.css |
| `#f5fafc` | 1 | (無し) | background | .app-screenshots | platform.css |
| `rgba(20,66,94,.10)` | 1 | (無し) | box-shadow | .hub-card:hover | platform.css |
| `#f6fafd` | 1 | (無し) | background | .hub-index-how | platform.css |

## 2. 書体

- font-size の宣言 605 件、異なる値 **113**。line-height 251 件 / 20 種。font-weight 224 件 / 5 種。font ショートハンド 22 件。

### 2-1. font-size の値(回数順)

| font-size | 回数 |
|---|---|
| `13px` | 54 |
| `16px` | 44 |
| `15px` | 43 |
| `14px` | 41 |
| `12px` | 36 |
| `12.5px` | 34 |
| `13.5px` | 28 |
| `14.5px` | 21 |
| `11px` | 13 |
| `15.5px` | 12 |
| `17px` | 11 |
| `20px` | 11 |
| `10px` | 10 |
| `11.5px` | 10 |
| `1.02rem` | 9 |
| `19px` | 9 |
| `0.95rem` | 8 |
| `0.9rem` | 8 |
| `.88rem` | 7 |
| `.95rem` | 7 |
| `0.82rem` | 7 |
| `0.85rem` | 6 |
| `9.5px` | 6 |
| `0.88rem` | 5 |
| `0.8rem` | 5 |
| `0.94rem` | 5 |
| `0.96rem` | 5 |
| `22px` | 5 |
| `clamp(1.35rem,5.4vw,27px)` | 5 |
| `.82rem` | 4 |
| `.92rem` | 4 |
| `.93rem` | 4 |
| `1.15rem` | 4 |
| `10.5px` | 4 |
| `10pt` | 4 |
| `23px` | 4 |
| `.72rem` | 3 |
| `.78rem` | 3 |
| `.84rem` | 3 |
| `.8rem` | 3 |
| `.9rem` | 3 |
| `1rem` | 3 |
| `8pt` | 3 |
| `9pt` | 3 |
| `.85rem` | 2 |
| `.98rem` | 2 |
| `0.78rem` | 2 |
| `0.92rem` | 2 |
| `0.97rem` | 2 |
| `0.98rem` | 2 |
| `1.05rem` | 2 |
| `1.08rem` | 2 |
| `1.2rem` | 2 |
| `1.35rem` | 2 |
| `1.3rem` | 2 |
| `1.55rem` | 2 |
| `12.5px!important` | 2 |
| `12px!important` | 2 |
| `16.5px` | 2 |
| `18px` | 2 |
| `25px` | 2 |
| `27px` | 2 |
| `8.5pt` | 2 |
| `.45em` | 1 |
| `.75rem` | 1 |
| `0.68rem` | 1 |
| `0.75rem` | 1 |
| `0.76rem` | 1 |
| `0.86rem` | 1 |
| `1.15em` | 1 |
| `1.18rem` | 1 |
| `1.1rem` | 1 |
| `1.25rem` | 1 |
| `1.45rem` | 1 |
| `1.5rem` | 1 |
| `10.5pt` | 1 |
| `12.5pt` | 1 |
| `12pt` | 1 |
| `13px!important` | 1 |
| `14.5px!important` | 1 |
| `14pt` | 1 |
| `16pt` | 1 |
| `17.5px` | 1 |
| `24px` | 1 |
| `26px` | 1 |
| `28px` | 1 |
| `30px` | 1 |
| `7.5pt` | 1 |
| `9.5pt` | 1 |
| `clamp(1.05rem, 3vw, 1.3rem)` | 1 |
| `clamp(1.15rem, 2.4vw, 1.35rem)` | 1 |
| `clamp(1.25rem, 4.5vw, 1.5rem)` | 1 |
| `clamp(1.35rem, 4.8vw, 1.65rem)` | 1 |
| `clamp(1.3rem, 4.6vw, 1.6rem)` | 1 |
| `clamp(1.45rem, 3vw, 1.85rem)` | 1 |
| `clamp(1.4rem, 3vw, 1.82rem)` | 1 |
| `clamp(1.55rem, 5.4vw, 2.05rem)` | 1 |
| `clamp(1.5rem, 4vw, 2.05rem)` | 1 |
| `clamp(1.5rem,5.6vw,27px)` | 1 |
| `clamp(1.65rem, 6vw, 2.25rem)` | 1 |
| `clamp(1.8rem, 5vw, 2.35rem)` | 1 |
| `clamp(12.5px, 1.01vw, 14.5px)` | 1 |
| `clamp(17px,2.6vw,20px)` | 1 |
| `clamp(17px,4.6vw,20px)` | 1 |
| `clamp(18px,4.8vw,22px)` | 1 |
| `clamp(19px,5vw,24px)` | 1 |
| `clamp(26px,7vw,34px)` | 1 |
| `clamp(27px,5vw,38px)` | 1 |
| `clamp(28px, 3.4vw, 38px)` | 1 |
| `clamp(28px,8vw,40px)` | 1 |
| `clamp(29px, 2.7vw, 36px)` | 1 |
| `clamp(2rem, 5vw, 3rem)` | 1 |
| `clamp(32px, 3.2vw, 42px)` | 1 |

### 2-2. line-height の値

| line-height | 回数 |
|---|---|
| `1.5` | 39 |
| `1.7` | 33 |
| `1.6` | 29 |
| `1.8` | 25 |
| `1.85` | 23 |
| `1.9` | 21 |
| `1.55` | 17 |
| `1.45` | 15 |
| `1.75` | 9 |
| `1.4` | 8 |
| `1` | 6 |
| `1.65` | 6 |
| `1.95` | 6 |
| `1.2` | 3 |
| `2` | 3 |
| `1.3` | 2 |
| `1.35` | 2 |
| `1.8!important` | 2 |
| `0` | 1 |
| `10px` | 1 |

### 2-3. font-weight の値

| font-weight | 回数 |
|---|---|
| `700` | 158 |
| `600` | 34 |
| `400` | 17 |
| `500` | 10 |
| `800` | 5 |

### 2-4. 同じセレクタ内の font-size × line-height × font-weight の組み合わせ

組み合わせ **283** 種(セレクタ単位 698)。上位 40:

| font-size / line-height / font-weight | セレクタ数 |
|---|---|
| `- / - / 700` | 49 |
| `16px / - / -` | 30 |
| `13px / - / -` | 28 |
| `12px / - / -` | 20 |
| `15px / - / -` | 18 |
| `12.5px / - / -` | 17 |
| `14px / 1.85 / -` | 11 |
| `13.5px / - / -` | 11 |
| `- / - / 600` | 10 |
| `13px / - / 700` | 10 |
| `14px / - / -` | 9 |
| `19px / 1.5 / -` | 6 |
| `14.5px / - / -` | 6 |
| `9.5px / - / -` | 6 |
| `14px / - / 700` | 6 |
| `14px / 1.8 / -` | 6 |
| `.95rem / - / -` | 6 |
| `0.82rem / - / 700` | 5 |
| `- / 1.9 / -` | 5 |
| `0.88rem / - / -` | 5 |
| `0.96rem / - / -` | 5 |
| `- / - / 400` | 5 |
| `13.5px / 1.85 / -` | 5 |
| `20px / 1.5 / -` | 5 |
| `15px / 1.9 / -` | 5 |
| `- / 1.7 / 700` | 5 |
| `14.5px / 1.9 / -` | 5 |
| `13px / 1.8 / -` | 5 |
| `20px / - / -` | 5 |
| `.88rem / - / -` | 5 |
| `17px / - / -` | 4 |
| `- / 1.7 / -` | 4 |
| `0.95rem / - / -` | 4 |
| `- / 1.5 / -` | 4 |
| `11.5px / - / -` | 4 |
| `12.5px / 1.8 / -` | 4 |
| `11px / - / -` | 4 |
| `12px / 1.7 / -` | 4 |
| `- / 1.95 / -` | 4 |
| `.92rem / - / -` | 4 |

### 2-5. font-family

| font-family | 回数 |
|---|---|
| `inherit` | 24 |
| `var(--font-platform-heading),sans-serif` | 20 |
| `var(--font-platform-heading),"Hiragino Kaku Gothic ProN",sans-serif` | 15 |
| `var(--font-platform-heading), "Hiragino Kaku Gothic ProN", sans-serif` | 14 |
| `var(--font-display)` | 3 |
| `"MS Mincho","MS 明朝","Yu Mincho","YuMincho","Hiragino Mincho ProN",serif` | 2 |
| `"Hiragino Kaku Gothic ProN", "Yu Gothic", system-ui, sans-serif` | 1 |
| `"Hiragino Sans", "Hiragino Kaku Gothic ProN", "Yu Gothic",
    "Noto Sans JP", system-ui,…` | 1 |
| `ui-monospace,Menlo,monospace` | 1 |
| `var(--font-platform-heading), sans-serif` | 1 |

### 2-6. letter-spacing / font-variant-numeric

| prop | 値 | 回数 |
|---|---|---|
| letter-spacing | `0.08em` | 3 |
| letter-spacing | `.01em` | 2 |
| letter-spacing | `.02em` | 2 |
| letter-spacing | `0` | 2 |
| letter-spacing | `0.02em` | 2 |
| letter-spacing | `0.04em` | 2 |
| letter-spacing | `0.05em` | 2 |
| letter-spacing | `0.06em` | 2 |
| letter-spacing | `0.1em` | 2 |
| letter-spacing | `-.03em` | 1 |
| letter-spacing | `.06em` | 1 |
| letter-spacing | `.07em` | 1 |
| letter-spacing | `.08em` | 1 |
| letter-spacing | `.1em` | 1 |
| letter-spacing | `0.005em` | 1 |
| letter-spacing | `0.015em` | 1 |
| letter-spacing | `0.01em` | 1 |
| letter-spacing | `0.09em` | 1 |
| letter-spacing | `0.14em` | 1 |
| font-variant-numeric | `tabular-nums` | 5 |

## 3. 余白(margin / padding / gap)

- 余白の宣言 1455 件、値 2474 個、異なる値 **122**。単位の分布: px 1250、0 797、rem 364、em 31、auto 22、clamp 5、var 5。
- 8px 単位の格子(4px 刻み含む)に乗る値: 533 / 1645(html 17px 換算)。

### 3-1. 値の分布(回数順・上位 60)

| 値 | 回数 | px 換算 |
|---|---|---|
| `0` | 797 | - |
| `10px` | 120 | 10 |
| `14px` | 120 | 14 |
| `12px` | 108 | 12 |
| `8px` | 108 | 8 |
| `18px` | 98 | 18 |
| `16px` | 92 | 16 |
| `6px` | 85 | 6 |
| `22px` | 62 | 22 |
| `4px` | 56 | 4 |
| `20px` | 49 | 20 |
| `2px` | 49 | 2 |
| `1rem` | 41 | 17 |
| `24px` | 37 | 24 |
| `1.25rem` | 28 | 21.25 |
| `1.5rem` | 26 | 25.5 |
| `7px` | 26 | 7 |
| `0.5rem` | 25 | 8.5 |
| `9px` | 24 | 9 |
| `auto` | 22 | - |
| `0.6rem` | 21 | 10.2 |
| `26px` | 16 | 26 |
| `28px` | 15 | 28 |
| `0.35rem` | 14 | 5.95 |
| `0.4rem` | 14 | 6.8 |
| `0.75rem` | 13 | 12.75 |
| `13px` | 13 | 13 |
| `15px` | 13 | 15 |
| `32px` | 13 | 32 |
| `34px` | 13 | 34 |
| `5px` | 13 | 5 |
| `0.9rem` | 12 | 15.3 |
| `11px` | 12 | 11 |
| `3px` | 12 | 3 |
| `1.2em` | 11 | 20.4 |
| `0.7rem` | 9 | 11.9 |
| `0.85rem` | 9 | 14.45 |
| `1.1rem` | 9 | 18.7 |
| `2rem` | 8 | 34 |
| `56px` | 8 | 56 |
| `0.15rem` | 7 | 2.55 |
| `0.3rem` | 7 | 5.1 |
| `0.8rem` | 7 | 13.6 |
| `1.4rem` | 7 | 23.8 |
| `30px` | 7 | 30 |
| `38px` | 7 | 38 |
| `40px` | 7 | 40 |
| `44px` | 7 | 44 |
| `48px` | 7 | 48 |
| `0.1rem` | 6 | 1.7 |
| `0.2rem` | 6 | 3.4 |
| `0.45rem` | 6 | 7.65 |
| `0.55rem` | 6 | 9.35 |
| `0.65rem` | 6 | 11.05 |
| `1.35rem` | 6 | 22.95 |
| `1.4em` | 6 | 23.8 |
| `19px` | 6 | 19 |
| `1px` | 6 | 1 |
| `64px` | 6 | 64 |
| `72px` | 6 | 72 |

## 4. border-radius / box-shadow

| border-radius | 回数 |
|---|---|
| `999px` | 46 |
| `12px` | 37 |
| `10px` | 34 |
| `8px` | 28 |
| `14px` | 26 |
| `var(--radius-sm)` | 22 |
| `var(--radius)` | 13 |
| `50%` | 10 |
| `16px` | 9 |
| `4px` | 5 |
| `9px` | 5 |
| `0` | 4 |
| `var(--radius-lg)` | 4 |
| `0 10px 10px 0` | 3 |
| `0 8px 8px 0` | 3 |
| `0 var(--radius-sm) var(--radius-sm) 0` | 3 |
| `2px` | 3 |
| `5px` | 2 |
| `6px` | 2 |
| `inherit` | 2 |
| `0 12px 12px 0` | 1 |
| `18px` | 1 |
| `22px` | 1 |
| `3px` | 1 |
| `7px` | 1 |

| box-shadow | 回数 |
|---|---|
| `none` | 7 |
| `var(--shadow-xs)` | 4 |
| `0 3px 12px rgba(35, 76, 61, 0.07)` | 3 |
| `0 4px 18px #21455b33` | 3 |
| `0 0 0 3px #cfe6f5` | 2 |
| `0 1px 3px rgba(20, 66, 94, .05)` | 2 |
| `var(--shadow-md)` | 2 |
| `var(--shadow-sm)` | 2 |
| `0 0 0 4px #fff` | 1 |
| `0 0 0 4px #fff, 0 0 0 6px #e8f4fc` | 1 |
| `0 0 0 4px var(--card)` | 1 |
| `0 10px 32px rgba(20, 66, 94, 0.14)` | 1 |
| `0 12px 30px rgba(20, 66, 94, 0.1)` | 1 |
| `0 16px 34px rgba(20, 66, 94, 0.14)` | 1 |
| `0 1px 3px rgba(20, 66, 94, 0.05)` | 1 |
| `0 1px 3px rgba(20,66,94,.05)` | 1 |
| `0 4px 18px rgba(20, 66, 94, .10)` | 1 |
| `0 4px 18px rgba(20, 66, 94, 0.045)` | 1 |
| `0 4px 18px rgba(20,66,94,.04)` | 1 |
| `0 6px 20px rgba(35, 76, 61, 0.35)` | 1 |
| `0 8px 24px rgba(2,132,199,0.10)` | 1 |
| `inset 0 -2px 0 var(--platform-primary)` | 1 |
| `inset 0 0 0 2px #0284c7` | 1 |
| `inset 0 0 0 2px rgba(2, 132, 199, .25)` | 1 |
| `inset 0 0 0 2px rgba(255, 255, 255, .5)` | 1 |
| `inset 0 0 0 2px var(--platform-primary)` | 1 |

## 5. transition / animation

- transition 系の宣言 **21** 件(異なる値 18)、animation 系 **6** 件、@keyframes 2 個。
- 時間の分布: 0.2s ×15、0.15s ×11、12s ×6、0.25s ×2、15s ×2、160ms ×2、0.01ms ×1、0.3s ×1。
- イージング: `var(--ease)` ×29、`ease` ×2。
- prefers-reduced-motion: globals.css: @media (prefers-reduced-motion: no-preference) / globals.css: @media (prefers-reduced-motion: reduce) / globals.css: @media (prefers-reduced-motion: no-preference) / platform.css: @media (prefers-reduced-motion: reduce) / platform.css: @media (prefers-reduced-motion: reduce)。globals.css は reduce で animation/transition を 0.01ms に、no-preference でだけ scroll-behavior: smooth。

### 5-1. transition の全一覧

| 値 | 回数 | セレクタ(抜粋) |
|---|---|---|
| `background-color 0.15s var(--ease),
    border-color 0.15s var(--ease)` | 2 | .column-card / .guide-overview a |
| `border-color 0.15s var(--ease),
    background-color 0.15s var(--ease)` | 2 | .stage-nav a / .worry-nav a |
| `opacity 0.2s var(--ease),
    transform 0.2s var(--ease)` | 2 | .guide-overview a::after / .guide-related-links a::after |
| `0.01ms !important` | 1 | *, *::before, *::after |
| `background .12s, border-color .12s` | 1 | .jc |
| `background-color 0.15s var(--ease),
    color 0.15s var(--ease),
    border-color 0.15s v…` | 1 | .guide-btn |
| `background-color 0.2s var(--ease),
    color 0.2s var(--ease)` | 1 | .site-nav a |
| `background-size 0.3s var(--ease)` | 1 | .column-card-title a |
| `border-color .12s, background .12s` | 1 | .columns-card |
| `border-color .12s,background .12s` | 1 | .mi-opt |
| `border-color .15s, box-shadow .15s` | 1 | .hub-card |
| `border-color 0.2s var(--ease),
    box-shadow 0.2s var(--ease)` | 1 | .guide-faq-item |
| `box-shadow 0.25s var(--ease),
    border-color 0.25s var(--ease)` | 1 | .guide-step |
| `color 0.2s var(--ease),
    background-color 0.2s var(--ease)` | 1 | .site-footer a |
| `opacity 160ms ease, transform 160ms ease` | 1 | .app-store-badge-link |
| `text-decoration-color 0.2s var(--ease)` | 1 | main a:not([class]) |
| `transform 0.2s var(--ease)` | 1 | .guide-faq-item summary::after |
| `transform 0.2s var(--ease),
    box-shadow 0.2s var(--ease),
    border-color 0.2s var(--…` | 1 | .guide-related-links a |

### 5-2. animation

| prop | 値 | セレクタ |
|---|---|---|
| animation-duration | `0.01ms !important` | *, *::before, *::after |
| animation-iteration-count | `1 !important` | *, *::before, *::after |
| animation | `read-progress linear both` | body::after |
| animation-timeline | `scroll(root block)` | body::after |
| animation | `yougo-flash 2.2s ease-out 1` | .yougo-term:target |
| animation | `none` | .yougo-term:target |

## 6. :root のカスタムプロパティ(定義順)

| 名前 | 値 | 定義元 | 参照回数 |
|---|---|---|---|
| `--bg` | `#f7fbfe` | globals.css :root | 4 |
| `--bg-deep` | `#eef6fc` | globals.css :root | 0 |
| `--card` | `#ffffff` | globals.css :root | 29 |
| `--card-warm` | `#fbfdff` | globals.css :root | 3 |
| `--green` | `#0273ad` | globals.css :root | 71 |
| `--green-dark` | `#015d8c` | globals.css :root | 36 |
| `--green-deep` | `#14425e` | globals.css :root | 6 |
| `--green-softer` | `rgba(2, 132, 199, 0.045)` | globals.css :root | 1 |
| `--green-tint` | `rgba(2, 132, 199, 0.06)` | globals.css :root | 0 |
| `--green-tint-2` | `rgba(2, 132, 199, 0.12)` | globals.css :root | 0 |
| `--text` | `#1e3a4d` | globals.css :root | 3 |
| `--text-muted` | `#4a6a80` | globals.css :root | 23 |
| `--border` | `#dcebf5` | globals.css :root | 35 |
| `--card-border` | `rgba(2, 115, 173, 0.2)` | globals.css :root | 18 |
| `--card-border-strong` | `rgba(2, 115, 173, 0.36)` | globals.css :root | 7 |
| `--note-bg` | `#eef6fc` | globals.css :root | 2 |
| `--green-pale` | `#e3f2fc` | globals.css :root | 4 |
| `--marker` | `rgba(2, 132, 199, 0.13)` | globals.css :root | 0 |
| `--accent` | `#5b7a90` | globals.css :root | 0 |
| `--accent-soft` | `#a8c9dd` | globals.css :root | 1 |
| `--gold-wash` | `rgba(2, 132, 199, 0.05)` | globals.css :root | 0 |
| `--radius` | `10px` | globals.css :root | 13 |
| `--radius-sm` | `8px` | globals.css :root | 25 |
| `--radius-lg` | `12px` | globals.css :root | 4 |
| `--radius-xl` | `12px` | globals.css :root | 0 |
| `--shadow-xs` | `0 1px 1px rgba(20, 66, 94, 0.04)` | globals.css :root | 4 |
| `--shadow-sm` | `0 1px 3px rgba(20, 66, 94, 0.06)` | globals.css :root | 2 |
| `--shadow-md` | `0 2px 6px rgba(20, 66, 94, 0.07)` | globals.css :root | 2 |
| `--shadow-lg` | `0 4px 14px -4px rgba(20, 66, 94, 0.12)` | globals.css :root | 0 |
| `--content` | `42rem` | globals.css :root | 3 |
| `--gutter` | `1.25rem` | globals.css :root | 3 |
| `--ease` | `cubic-bezier(0.22, 0.72, 0.3, 1)` | globals.css :root | 15 |
| `--font-display` | `"Zen Old Mincho", "Hiragino Mincho ProN", "Yu Mincho", serif` | globals.css :root | 3 |
| `--mt-primary` | `#0284c7` | globals.css .mt-redesign | 7 |
| `--mt-soft` | `#e8f4fc` | globals.css .mt-redesign | 3 |
| `--mt-border` | `#d5e3ec` | globals.css .mt-redesign | 5 |
| `--platform-bg` | `#f7fbfe` | platform.css :root | 8 |
| `--platform-surface` | `#ffffff` | platform.css :root | 11 |
| `--platform-band` | `#eef6fc` | platform.css :root | 38 |
| `--platform-primary` | `#0284c7` | platform.css :root | 82 |
| `--platform-link` | `#0273ad` | platform.css :root | 35 |
| `--platform-link-hover` | `#015d8c` | platform.css :root | 5 |
| `--platform-chip` | `#e3f2fc` | platform.css :root | 16 |
| `--platform-heading` | `#14425e` | platform.css :root | 124 |
| `--platform-text` | `#1e3a4d` | platform.css :root | 39 |
| `--platform-muted` | `#4a6a80` | platform.css :root | 78 |
| `--platform-subtle` | `#5b7a90` | platform.css :root | 7 |
| `--platform-meta` | `#6e8ba0` | platform.css :root | 38 |
| `--platform-faint` | `#8aa5b6` | platform.css :root | 12 |
| `--platform-border` | `#dcebf5` | platform.css :root | 51 |
| `--platform-border-soft` | `#e2eef7` | platform.css :root | 3 |
| `--jc-mitate` | `#0284c7` | platform.css :root | 0 |
| `--jc-kingaku` | `#059669` | platform.css :root | 0 |
| `--jc-shorui` | `#d97706` | platform.css :root | 0 |
| `--jc-madoguchi` | `#7c3aed` | platform.css :root | 0 |
| `--jc-moushitatesho` | `#0e7490` | platform.css :root | 0 |
| `--jc-mitate-bg` | `#e8f4fc` | platform.css :root | 0 |
| `--jc-kingaku-bg` | `#e6f6ef` | platform.css :root | 0 |
| `--jc-shorui-bg` | `#fdf3e3` | platform.css :root | 0 |
| `--jc-madoguchi-bg` | `#f0eafb` | platform.css :root | 0 |
| `--jc-moushitatesho-bg` | `#e4f3f6` | platform.css :root | 0 |
| `--platform-container` | `1200px` | platform.css :root | 3 |
| `--platform-gutter` | `clamp(20px, 4.45vw, 64px)` | platform.css :root | 6 |

## 7. 部品の一覧(コンポーネント・クラス・定義場所・重複)

| 部品 | コンポーネント | クラス | 定義場所 | 重複・備考 |
|---|---|---|---|---|
| 結論の箱(lead) | components/ColumnArticle.tsx | .column-conclusion | app/columns/columns.css | — |
| 次に読む | components/ColumnArticle.tsx | .column-next .column-next-label | columns.css | — |
| 誤解カード(一覧) | app/gokai/page.tsx / components/platform/HubGokai.tsx | .gokai-card .gokai-card-category / .hub-gokai-card | platform.css 831-836 | 一覧用とハブ用の 2 系統(b の札だけ共通) |
| 誤解カード(本文) | components/platform/GokaiBody.tsx | .gokai-truth .gokai-block .gokai-check .gokai-ask .gokai-figure .gokai-next .gokai-sources .gokai-faq | platform.css | FAQ は .gokai-faq(h3+p)で、コラムの .column-faq-question とも hub の .hub-faq-item とも別 |
| 裁決リード(記事中・カード中) | components/platform/CaseLead.tsx(GokaiBody / MarkdownArticle から) | .gokai-case | columns.css(コラム用上書き)+ platform.css | 同じクラスをコラムと誤解カードで共有。コラム側だけ columns.css で padding を上書き |
| 裁決カード(jitsurei 一覧) | components/platform/Platform.tsx CaseCard / OutcomeBadge | .p-card .p-case .p-case-head .p-label-success .p-label-warning | platform.css 522-565 | 札の色 #067647 / #8b6a1f は意味色だが、ツールの .mi-dir-up・.kg-warnbox でも同じ hex を装飾として直書き |
| 表(横スクロール) | components/MarkdownArticle.tsx | .article-table-figure .article-table-wrap .article-table-hint | globals.css 301-430 + columns.css(コラム用に display:table を戻す) | globals.css 側はスマホで縦積み(td::before)、columns.css が横スクロールへ戻す 2 段構え |
| FAQ | MarkdownArticle(columnStyle)/ MarkdownArticle(faqAccordion)/ GokaiBody / ApplicationFlowPage | .column-faq-question / details.hub-faq-item / .gokai-faq / .guide-faq-item | globals.css + platform.css 58-60 | 4 系統。hub と guide は details(開閉あり)、コラムと誤解カードは開閉なし |
| 出典 | components/ColumnFooter.tsx / GokaiBody(出典) | .references .small-note / .gokai-sources | globals.css 1076-1096 / platform.css | 2 系統。文字サイズは本文と同じ(13px の規則は第2段) |
| CTA(App Store) | components/AppCta.tsx / AppStoreBadge.tsx | .app-cta .app-cta-title .app-store-badge-link | globals.css 1057-1074, 801 | — |
| Breadcrumb | components/Breadcrumb.tsx(コラム)/ Platform.tsx Breadcrumb(ハブ・道具)/ MitateTool(.mi-breadcrumb-wrap) | .breadcrumb ol li / .p-breadcrumb / .mi-breadcrumb-wrap | globals.css 816-855 / platform.css | 3 系統。構造(ol/li と span)も違う |
| ArticleToc | components/ArticleToc.tsx | details.article-toc | globals.css 856-985 | — |
| SiteHeader / SiteFooter | components/SiteHeader.tsx / SiteFooter.tsx | .site-header .site-header-inner .site-nav … / .site-footer .footer-links … | globals.css 435-560(旧・濃紺)→ platform.css 180-350(白地)が上書き | 同じクラスを 2 ファイルで定義し、後勝ちで platform.css が効いている。globals.css 側は死んだ定義 |
| ボタン | ApplicationFlowPage(.guide-btn)/ 各ツール(.mt-* .mi-start .kg-* .sr-* .md-*)/ platform(.p-chip .p-more .gokai-filters a) | .guide-btn(-primary/-secondary)ほか | globals.css 1294-1335 ほか | primary/secondary/text の 3 種に相当するものがツールごとに別実装(最低 6 系統) |
| ツール類(dougu) | components/tools/*.tsx / components/platform/DouguCard.tsx | .mt-* .mi-* .kg-* .sr-* .md-* .ko-* / .mt-column-card .dougu-band-card .dougu-hub-card | globals.css 後半(ほぼ 1 行 1 ツールの圧縮 CSS) | .mt-redesign は申立書ツール内だけの別トークン(--mt-primary/--mt-soft/--mt-border) |
| jitsurei の一覧カード | app/jitsurei/page.tsx + Platform.tsx CaseCard | .p-card .p-case .p-chip .p-filter-panel | platform.css | ページ側に style 属性で #f7fbfe を直書き(CSS 外) |
| hub の章カード | components/platform/HubIndexList.tsx / HubLanding.tsx | .hub-card .hub-card-meta / .p-card | platform.css 1187-1192, 522-535 | カード系は .p-card / .gokai-card / .hub-card / .columns-card / .column-card / .dougu-band-card / .jc の 7 系統 |

### 7-1. .mt-redesign と platform.css の役割

- `app/platform.css`(1,235 行)は 2026-09 の情報プラットフォーム(トップ・ハブ・一覧・道具・ヘッダー/フッター)用。`.platform` を全幅シェルにして、コラム本文(globals.css の `main` 42rem)と別の世界を作っている。トークンは `--platform-*` で、globals.css の旧トークンと値が同じもの 10 個を 2026-10-06 にエイリアス化した。`--platform-primary`(#0284c7)だけは `--primary`(#0273ad)と値が違う第 2 の青。
- `.mt-redesign`(globals.css 3087-3144)は申立書ツール(/dougu/moushitatesho)の中だけで効く別デザイン。`--mt-primary: #0284c7`・`--mt-soft: #e8f4fc`・`--mt-border: #d5e3ec` を持ち、ボタン・入力欄・パネルを platform 風に塗り替えている。範囲はそのページ内の `.mt-redesign` 配下のみ。
- 未定義のまま参照されているトークン: `--platform-navy`・`--platform-blue`・`--platform-blue-soft`(platform.css 53-62 の .hub-content)、`--platform-line`(.columns-toc)、`--heading`・`--muted`(代替値つき)。代替値の無いものは宣言が無効になり、親の色を継承している(= いまの見た目はその継承結果)。直すと見た目が変わるので第2段。
- ページ側の style 属性に色を直書きしている箇所: app/jitsurei/page.tsx(`background: #f7fbfe`)。CSS の棚卸しには出ない。
