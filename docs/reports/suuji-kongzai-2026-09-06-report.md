# 再認定の数字の混在(96.8/1.0 → 96.7/1.1)を直す(2026-09-06)結果報告

指示書: docs/suuji-kongzai-2026-09-06-instructions.md §1〜§3。文は変えず、数字と出典表記だけ。原稿 → `node scripts/import-columns.mjs` の順。push はしていない。

## §2 検証

| # | 内容 | 結果 |
|---|---|---|
| 1 | `304,456` と同じ文に `96.8` または「1.0%」(docs の指示書・報告・検証を除く) | **0**(コード・データ・原稿・誤解カードの下書きすべて)。残るのは計画メモ `docs/columns-rewrite-2026-09-03/00-spec.md` `01-mapping.md` の 3 行だけ(下記) |
| 2 | 残った `96.8` が全部「抽出10,000件」か「認定状況調査」と同じ文にある | ○ 一覧は下記。公開に出るものは `/suuji`(「抽出調査では継続 96.8%」「継続 9,681件・96.8%」= 抽出10,000件の図)だけ |
| 3 | 「障害年金受給者実態調査」が業務統計の出典として使われていない | **0**(サイト内の全出典表記から消えた。この資料名は実在せず、業務統計と認定状況調査を取り違えて付けていたもの) |
| 4 | typecheck / build / verify:columns(baseline 更新後)/ prelaunch | ○ / ○ / **10 項目 ○**(baseline の `intentionalUpdates["2026-09-06"]` に理由「業務統計との整合」・31 slug・fields lead/content/sources を記録)/ × は **B-3・B-10 だけ**(C-6 は変えたページの日付を 2026-09-06 にして ○、A-2 本文の減少 0、C-7 ○) |
| 5 | 置換箇所の一覧と、文が変わっていないこと | ○ 変更行 153(下記)。`git diff -U0` の削除行と追加行を、数字(96.7/96.8/1.0%/1.1%)と資料名を伏せて比べ、**それ以外が変わった行 0** |
| 6 | 公開 HTML の `/gokai/koushin-de-henkin` `/columns/koushin-kakuninhodo` `/nayami/koushin` `/suuji` | ○ 前 3 ページは `96.8` 0 件。`/suuji` の 3 件は「抽出調査では継続」「継続 9,681件・96.8%」の抽出調査の図で、資料名(厚生労働省の認定状況調査)が出典欄に付いている |

生ログ: docs/verification/suuji-kongzai-2026-09-06/(verify-columns.txt・prelaunch.txt)。

## 置換の規則(§1 を、資料名の混在にも当てた)

数字の出どころ(`data/stats/`): **業務統計**(`gyoumu-toukei-r06.json`)= 新規裁定 146,225件・非該当 13.0%・精神 12.1%・再認定 304,456件・継続 294,405件 96.7%・増額 1.4%・減額 0.8%・支給停止 3,241件 1.1%。**認定状況調査**(`nintei-chousa-r06.json`、抽出)= 精神 70.3%・等級 1級10.9%/2級53.9%/3級22.1%・不支給者の目安表分布 75.3%・再認定(10,000件)継続 96.8%/停止 1.0%。

1. `304,456` と同じ文(段落・カード・箇条書き)の `96.8%` → `96.7%`、`支給停止1.0%` → `1.1%`。
2. 出典表記「厚生労働省「障害年金受給者実態調査」令和6年度(…)」は、括弧の中の数字が業務統計のものなら **日本年金機構「障害年金業務統計(令和6年度決定分)」**、認定状況調査のもの(75.3%・70.3%・等級別)なら **厚生労働省「令和6年度の障害年金の認定状況についての調査」**、両方あれば両名を「・」でつないだ。括弧の中身は変えていない(1 の数字だけ)。
3. 「厚生労働省「障害年金の業務統計等(令和6年度)」」→ 日本年金機構「障害年金業務統計(令和6年度決定分)」(全角括弧の app 側も同じ文字列に)。

§2-3 は「実態調査という名が業務統計の出典に使われていないこと」を求めるが、同じ名前が認定状況調査の数字(75.3% など)の出典にも使われていたので、そちらは正しい資料名(認定状況調査)に直した。§1 の表に無い判断なので、ここに書く。

## 置換した箇所(153 行)

### 原稿(docs/columns-rewrite-2026-09-03/articles、31 本)→ import で content/columns の 31 本を再生成

数字(304,456 と同じ文): gaku-kaitei-seikyuu(152)・hatarakinagara(179・336)・hattatsu-shougai(298)・koushin-kakuninhodo(lead 6・14・257)・moushitatesho-a4-insatsu(251)・shikyuu-teishi-fukkatsu(lead 5・箇条書き 20/23・FAQ 320)・shinsei-kikan(226)。
出典表記(資料名の差し替え。数字も直したものは 96.7/1.1 に): daisansha-shomei, gaku-kaitei-seikyuu, hatarakinagara, hattatsu-shougai, hitorigurashi-furi, hitsuyou-shorui-seishin, ikura-moraeru, jibun-de-shinsei, kazoku-enjo-kakikata, kiso-kousei-chigai, koushin-kakuninhodo, moushitatesho-a4-insatsu, moushitatesho-kakikata, moushitatesho-kikan-kugiri, nenkin-jimusho-soudan, nichijo-seikatsu-7koumoku, shikyuu-teishi-fukkatsu, shindansho-irai-timing, shindansho-ishi-ni-tsutaeru, shindansho-jittai-chigau, shindansho-kaitekurenai, shindansho-kakunin, shindansho-tanomikata, shinsa-shikumi-nintei-i, shinsatsu-mae-memo, shinsei-kikan, shinsei-shindoi, shoshinbi-wakaranai, shoubyou-teatekin, shougaisha-koyou-nenkin, tokyu-hantei-guideline(各 出典 1 行)。

### `data/gokai-bodies.ts`(誤解カード本文)

本文の「再認定304,456件のうち、96.8%」→ 96.7%: koushin-de-henkin・omoku-misenai-to・wakai-kara(FAQ)・byoumei-bunsan・ishoku-uchikiri・koushin-maitoshi(description と本文)・hataraitetara-muri(計 9 行)。出典表記 24 行(資料名の差し替え。omoku-misenai-to の「再認定の継続 96.8%」は本文が 304,456 件と組んでいるので 96.7% に)。

### `data/gokai.ts`

`figure`「再認定304,456件のうち、96.8%」→ 96.7%(koushin-de-henkin・koushin-maitoshi)。出典 1 行の資料名。

### `data/hubs/*.json`(本文の出典行と 1 文)

byoki-utsu-soukyoku(FAQ「令和6年度の再認定304,456件のうち、96.8%」→ 96.7%、出典)、byoki-hattatsu・byoki-tekiou-fuan・byoki-tougou・erabu-jibun-ka-irai・joukyou-hatarakinagara・nayami-fushikyu・nayami-shindansho-komatta(出典の資料名のみ)。

### app

`app/hajimete/page.tsx`(出典 2 か所)、`app/jitsurei/page.tsx`(出典 1 か所)の「障害年金の業務統計等（令和6年度）」→ 日本年金機構「障害年金業務統計(令和6年度決定分)」。`app/suuji/page.tsx` は両資料を正しい名前で並べているので変更なし(復元報告の :113 の文は数字の問題ではなく言い方の問題で、今回の範囲外)。

### 誤解カードの下書き(docs/gokai、6 本・31 行)

`data/gokai-bodies.ts` の原稿にあたるので同じ置換をした(指示書の除外は「指示書・報告」だけ)。

### そのほか

- `docs/verification/columns-rewrite-2026-09-04/baseline.json`: `intentionalUpdates["2026-09-06"]`(31 slug)。
- `lib/sitemap-static-dates.ts`: `/hajimete` `/columns` を 2026-09-06(C-6)。`data/hubs/nayami-{fushikyu,shindansho-komatta,shoshinbi-karute,sokyuu}.json` の `dateModified` も 2026-09-06。
- `docs/_tmp-hubs-dump.json` を git の追跡から外した(ハブ本文の一時ダンプ。古い 96.8 の文を含み、参照されていない)。

## 残したもの(理由つき)

| 場所 | 内容 | 理由 |
|---|---|---|
| `docs/columns-rewrite-2026-09-03/articles/shikyuu-teishi-fukkatsu.md` 29 行目・FAQ 320 行目、`fushikyuu-shinsa-seikyu.md` 51 行目 | 「更新での支給停止は前年度1.1%→1.0%」「前年度1.1%からほぼ変わっていません」 | 認定状況調査報告書の**年度比較**(前年度 1.1% → 令和6年度 1.0%、抽出)で、304,456 件と組んでいない。出典行 368 に「調査報告書…再認定の支給停止1.1%→1.0%」と資料名がある。文を変えずに直せないので残した。ただし FAQ 320 は同じ文に 304,456 件があるので「支給停止は1.1%でした」に直しており、後半の「前年度1.1%から」は前年度の値のまま(意味は通る) |
| `docs/columns-rewrite-2026-09-03/00-spec.md` `01-mapping.md` | 「再認定304,456件・継続96.8%」など 3 行 | 執筆時の計画メモ(統計の割り当て表)。サイトに出ない |
| `docs/columns-rewrite-2026-09-03/articles/hatarakinagara.md` 10 行目 | HTML コメント内の「96.8」 | 変更履歴のコメント。描画されない |
| `scripts/verify-stats.mjs` `data/stats/nintei-chousa-r06.json` | 96.8 / 1.0 | 抽出調査の値そのもの |
| `data/gokai-bodies.ts` の資料名に「認定状況調査」を含む出典行 | 「不支給の目安分布 75.3%」など | 認定状況調査の数字なので正しい |

## §2-2 残った 96.8 の一覧(コード・データ・原稿)

- `scripts/verify-stats.mjs`: `expect("抽出 継続率", …, 96.8)`(抽出10,000件)
- `data/stats/nintei-chousa-r06.json`: 抽出調査のデータ
- `docs/columns-rewrite-2026-09-03/articles/hatarakinagara.md`: HTML コメント
- 計画メモ 3 行(上記)

## 検証で起きたこと

最初の prelaunch と §2-6 の確認が、古いビルドを配っていた別プロセス(:3000、ビルド前に起動)に向いていて 96.8 が残って見えた。プロセスを止めて作り直し、再確認した結果が上の表。verify:columns は新しいビルドの :3107 で実行しており影響なし。
