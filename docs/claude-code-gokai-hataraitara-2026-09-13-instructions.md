# Claude Code 作業指示 — gokai 生成スクリプトを49枚で通す・prelaunch B-10 を解消（2026-09-13）

対象リポジトリ: `shougainenkin-public-pages`

## 現状（Cowork が確認した事実）
- `data/gokai.ts` は 49 枚（9/5 に `hataraitara-make` を追加）。`scripts/import-gokai-bodies.mjs` と `verify-gokai*.mjs` は 48 枚固定のままなので、`node scripts/import-gokai-bodies.mjs --check` と `npm run verify:gokai` が落ちる（「誤解カードは48枚 49 !== 48」）。
- `hataraitara-make` の本文は `data/gokai-bodies.ts` に直接書かれていて、節が「結論／自分の場合を確かめる／窓口で聞く一言／次に読む／出典」の5つしかない。「なぜ」「制度では」「数字で見ると」「よくある質問」が無いので、`verify-gokai-bodies.mjs` の「FAQPage は1つ」が 0 件で落ちる（重複ではなく欠落）。
- `scripts/verify-jukyuugo.mjs` 65行が `../jukyuugo-2026-09-05/07-gokai-hataraitara-make.md` を参照しているが、そのファイルは存在しない。
- prelaunch B-10「更新日が全ページに表示されている」の × は `/app` `/app/privacy` `/app/terms` の3ページ。`scripts/prelaunch-check.mjs` 89行の判定は `<time dateTime=` か「最終更新日／更新日／確認日」の文字が main 内にあるか。

## 作業A: hataraitara-make の原稿を正規の形式で入れ、生成を通す

1. Cowork が書いた原稿 `docs/gokai/gokai-body-hataraitara-make-2026-09-13.md`（同じフォルダに置いてある）を、`scripts/import-gokai-bodies.mjs` の `INPUTS` に追加する。
   ```js
   export const INPUTS = ["gokai-body-sample-techou-ga-nai.md", ...[1, 2, 3, 4].map(n => `gokai-body-batch${n}-2026-09-03.md`), "gokai-body-hataraitara-make-2026-09-13.md"];
   ```
2. 枚数の固定値を 48 → 49 に変える。
   - `scripts/import-gokai-bodies.mjs`: `assert.equal(Object.keys(bodies).length, 48)` と、生成物の `GOKAI_BODIES_UPDATED` を `"2026-09-13"` に。
   - `scripts/verify-gokai.mjs`: 37行・38行・114行の 48、160行のメッセージ。22行の `"/joukyou/hitorigurashi": [3, 48]` は配分表の値なので**触らない**（意味が違う）。
   - `scripts/verify-gokai-bodies.mjs`: 29行、78行・137行のメッセージ。
3. `node scripts/import-gokai-bodies.mjs` を実行して `data/gokai-bodies.ts` を再生成する。`hataraitara-make` の本文は原稿から生成されたものに置き換わる（9/5 に直接書いた5節版は消えてよい。原稿は同じ結論・check・ask・次に読む・出典を引き継いでいる）。
4. `scripts/verify-jukyuugo.mjs` 65行の参照先を `../gokai/gokai-body-hataraitara-make-2026-09-13.md` に変え、比較ロジックが原稿の形式（`=====` 区切り・frontmatter）に合わなければ、その1件だけ `import-gokai-bodies.mjs` の `parseManuscripts()` を使って本文を突き合わせる形にする。
5. 原稿の中で使っている裁決IDは `h30_r01-07_01` と `h28_29-07_09`。どちらも `data/saiketsu-cases-2026-08-26.json` で verified 済みで excluded でないことを確認済み。パーサーが弾いたら、原稿ではなくパーサーの想定と違う箇所を報告して止まる（原稿の数字・文言は変えない）。

原稿の制約（`parseManuscripts()` が検査する項目）は満たしてある: h2 の順序（結論→なぜ→制度では→固有1節→数字で見ると→同じ状況の人が、どうなったか→自分の場合を確かめる→窓口で聞く一言→よくある質問→次に読む→出典）、「自分の場合を確かめる」は `GOKAI` の `check` と完全一致、「窓口で聞く一言」は `ask` と完全一致、FAQ 3組、次に読む 3件、出典に確認日。

検証: `node scripts/import-gokai-bodies.mjs --check`、`npm run verify:gokai`、`node scripts/verify-gokai-bodies.mjs`、`node scripts/verify-jukyuugo.mjs`、`npm run build`。`/gokai/hataraitara-make` の生成 HTML に FAQPage が1つ、Question が3つあること。

コミット: `feat(gokai): hataraitara-make を原稿から生成する形に戻し、検証を49枚に更新`

## 作業B: /app /app/privacy /app/terms に更新日を出す（B-10）

- `lib/app-legal.ts` にある更新日の定数（サイト側の `SITE_LEGAL_UPDATED` に対応するアプリ側の定数）を、3ページの main 内に「最終更新日 YYYY-MM-DD」として表示する。既存の `/privacy` `/terms` が更新日を出している部品・クラスと同じものを使い、新しいスタイルは作らない。
- 定数が無ければ、`lib/app-legal.ts` に `APP_LEGAL_UPDATED = "<各文面の最終改定日>"` を1つ足す（日付は文面の履歴から取る。分からなければ最後にその文面を変えたコミットの日付）。
- `/app` はアプリ紹介ページなので、「最終更新日」ではなく「確認日」の表記でもよい（判定は「最終更新日／更新日／確認日」のいずれか）。

検証: `node scripts/prelaunch-check.mjs` で B-10 が ○ になり、他の項目が作業前から悪化しないこと。結果は `docs/verification/gokai-b10-2026-09-13/` に置く。

コミット: `fix(app): /app 配下3ページに更新日を表示して prelaunch B-10 を解消`

## やらないこと
- 他の48枚の原稿・本文には触らない。
- `hataraitara-make` のカード（`data/gokai.ts`）の check / ask / next / sources は変えない（原稿はそれに合わせて書いてある）。
- `GOKAI` の並び順・カテゴリ・ハブ配分は変えない。
