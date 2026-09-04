# T5 の baseline 判断 → (a)。ただし「狭く・見える形で」 (2026-09-04)

止めたのは正しい。`verify:columns` を緩めるのではなく、**基準を意図した分だけ動かす**。
検査を残したまま例外の口だけ作ると、次の本物のずれがそこを通る(申立書の検査9で見たとおり)。ただし「baseline を作り直す」は駄目で、他のずれまで黙って飲み込む。

## 1. 検査ごとの直し方(3つとも別の直し方をする)

### 検査1(本文が原稿と一致) → **原稿の方を直す**
baseline ではなく `docs/columns-rewrite-2026-09-03/articles/shikyuu-teishi-fukkatsu.md` を、実装した lead 1文と FAQ 1問ぶん**同じ内容に**書き換える。原稿はあの47本の正本なので、サイトだけ進んで原稿が古いままの方が問題。
- 書き換えたら、その .md の冒頭の `<!-- 変更: … -->` に相当する記録として、`dateModified` を 2026-09-04 に。
- 字数が rewrite 仕様の ±10%(本文、リード除く)に収まっていることを確認して数値を報告。

### 検査8(URL・slug・h1・title・metaTitle が作業前と一致) → **該当フィールドだけ baseline を更新**
- 触ってよいのは、T5 で実際に変えた slug の `metaTitle` と `htmlTitle` **だけ**。
- `slug` `h1` `canonical` は1つも動かさない(動いていたらそれは事故なので止めて報告)。
- `baseline.json` を**再生成しない**。該当エントリの該当キーだけを書き換える。差分は `git diff` で数行に収まるはず。収まらなければ何かがずれているので止めて報告。
- `baseline.json` に `intentionalUpdates` を1つ足し、`{ "2026-09-04": { "reason": "docs/seo-aio-audit-2026-09-04.md §4-3 / §6-2", "slugs": [...], "fields": ["metaTitle","htmlTitle"] } }` を記録する。将来の読み手が「勝手にずれた」と誤解しないため。

### 検査9(FAQPage と画面の Q/A が本文に一致) → **原稿と実装を揃えれば自然に通る**
FAQ を足したのは `shikyuu-teishi-fukkatsu` の1問だけのはず。検査1の直しで原稿側も揃うので、それで通るか確認する。通らないなら原因を報告(baseline は触らない)。

## 2. 完了条件

- `npm run verify:columns` が **10/10 ○**。
- `git diff main -- docs/verification/columns-rewrite-2026-09-04/baseline.json` が、metaTitle / htmlTitle と `intentionalUpdates` 以外を含まない。
- `docs/verification/seo-aio-2026-09-04-title-diff.md` に、slug ごとに「フィールド / 前 / 後 / 根拠(監査のどの検索語)」の表。
- `npm run typecheck && npm run build && node scripts/prelaunch-check.mjs`。

## 3. そのあと

1. `codex/seo-aio-2026-09-04` を main に merge(`--no-ff`)して push。
2. デプロイ後に確認: `sitemap.xml` の `<lastmod>` 数 = `<url>` 数、`/byoki/utsu-soukyoku` に `FAQPage`、`/llms.txt` が 200。
3. `npm run indexnow`(初回なので全 URL)。応答コードを報告。

## 4. 監査側の誤りの訂正(私の側)

- slug 2件が違っていた。`hitsuyou-shorui` → `hitsuyou-shorui-seishin`、`shoshinbi-fumei` → `shoshinbi-wakaranai`。実装済みの内容で正しい。
- `jushinjokyo-shomeisho` と `nenkin-jimusho-soudan` は既に満たしていた → 触らないでよい。
- `/erabu/hiyou-souba` に Q&A が無いので FAQPage を出さない → 正しい(見えない FAQ は入れない)。
- パンくずが二重になるので `breadcrumbJsonLd` を足さない → 正しい。

## 5. 別件(急がない。今回の merge には入れない)

`npm run verify:hubs` の `verify-hub-map.mjs` が、作業前の main でも `/jitsurei` の被リンク100本で exit=1 になっている。
`scripts/prelaunch-check.mjs` の B-2 では `LINK_HUBS = {"/jitsurei": …}` を上限の対象外にした(2026-09-04 の誤解ページの作業)。同じ除外を `verify-hub-map.mjs` にも入れて、常時赤を消す。**次の作業でよい**。
