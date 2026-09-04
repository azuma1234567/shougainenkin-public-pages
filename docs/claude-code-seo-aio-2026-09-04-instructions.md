# Claude Code 指示書: SEO/AIO 作業 1〜6 を全部やる (2026-09-04)

監査の本体は `docs/seo-aio-audit-2026-09-04.md`(以下「監査」)。この指示書は、監査の §3 の 1〜6 を Claude Code が一人で最後まで進めるための手順。
東さんがやることは、(a) 下のコマンドを貼る、(b) ブラウザにログイン画面が出たらログインする、(c) 最後に結果を読む、の 3 つだけ。

## 0. 前提と確認済みの状態

- `codex/columns-rewrite` は main に merge 済み(`2dbcfac Merge codex/columns-rewrite`)。監査 §3 の 1 は「push して本番に出す」だけが残っている可能性がある。origin/main が 2dbcfac、ローカル main が d88123b(docs コミット)なので、未 push 分がある。
- 今回は Claude Code が commit と push を行う(通常は Codex だけが push する取り決めだが、今回は東さんの指示で Claude Code に任せる)。**この作業中は Codex を同じリポジトリで動かさない。**
- worktree `/Users/azumataisuke/Projects/shougainenkin-columns-rewrite` と `…-gokai-bodies` は prunable。`git worktree prune` してよい(ディレクトリは消さない)。
- `.git/index.lock` が残っていたら、他の git プロセスが無いことを `ps aux | grep '[g]it'` で確認してから `rm -f .git/index.lock`。
- ブラウザ操作(Phase C・D)は Claude Code の Chrome 連携で行う。ログインは東さんが手でやる。Claude Code は ID・パスワードを入力しない、アカウントを作らない、Cookie 同意は「拒否」または最小を選ぶ。

## 1. 貼るコマンド(1 本目: Phase A + B、実装と push)

```
cd ~/Projects/shougainenkin-public-pages && claude "docs/claude-code-seo-aio-2026-09-04-instructions.md の Phase 0 と Phase A と Phase B を実行してください。Phase ごとに、終わったら何をしたか 5 行以内で報告し、次に進んでください。止まる条件は指示書の各 Phase に書いてあります。"
```

### Phase 0: 申立書ツールを本番に出す(先にこれ)

`codex/moushitatesho-youshiki`(`12bceb9` まで)は完成している。SEO の作業より先に main へ入れる。

1. `git worktree prune`。`git checkout main && git pull --ff-only`。
2. `git merge --no-ff codex/moushitatesho-youshiki`。conflict が出たら止まって報告。
3. `npm run typecheck && npm run test:moushitatesho && npm run build && node scripts/prelaunch-check.mjs && npm run verify:moushitatesho:layout && npm run verify:moushitatesho`。
   `prelaunch-check` の × が B-1・B-3・B-10 以外に増えていたら止まって報告(この3つは作業前から同じ)。
4. 通れば Phase A に進む(push は Phase A でまとめて行う)。

### Phase A: 47 本の書き直しを本番に出す(監査 §3-1)

1. `git worktree prune`。`git checkout main && git pull --ff-only`。conflict が出たら止まって報告。
2. `git log --oneline origin/main..main` で未 push を確認。`git log --oneline main..codex/columns-rewrite` が 0 件であること(merge 済みの確認)。0 件でなければ止まって報告(merge 判断は東さん)。
3. 未コミットの `docs/` ファイル(`docs/seo-aio-audit-2026-09-04.md`、この指示書、`docs/moushitatesho-youshiki-saigen-…` など)があれば `docs: SEO/AIO 監査と指示書を追加` で commit。`docs/` 以外の未コミット変更があれば触らず報告。
4. `npm run typecheck && npm run build && node scripts/prelaunch-check.mjs` が通ることを確認。通らなければ push せず止まる。
5. `git push origin main`(Vercel が自動デプロイ)。
6. デプロイ完了を待ち(`curl -s -o /dev/null -w '%{http_code}' https://shougainenkin-note.net/columns/shinsei-kikan` が 200、かつ本文に `2026年9月3日` の更新日が含まれる)、次の 3 URL を curl で取り、`/dougu/` `/gokai/` `/jitsurei` へのリンクが本文に含まれることを確認: `/columns/shinsei-kikan`, `/columns/hitorigurashi-furi`, `/columns/moushitatesho-a4-insatsu`。含まれなければ止まって報告。

### Phase B: 実装 T1〜T6(監査 §3-2, 3, 4, 6 と §4 の仕様)

ブランチ `codex/seo-aio-2026-09-04` を main から切る。T ごとに commit。仕様は監査 §4 を正とし、ここには差分だけ書く。

- **T1 sitemap lastModified**(§4-1)。静的ページの初期日付は `git log -1 --format=%cs -- app/<path>/page.tsx`、ハブは `git log -1 --format=%cs -- data/hubs/<file>.json`。`prelaunch-check` に C-2 を追加。commit: `feat(seo): sitemap の全 URL に lastModified を付ける`
- **T2 ハブ JSON-LD**(§4-2)。`extractHubFaqs()` の抽出規則は `MarkdownArticle` の `faqAccordion` 分岐(`**Q.` で始まる行〜空行まで)と同一にする。テストは `scripts/verify-hub-content.mjs` に追加(40 ハブで、抽出 question と画面 summary が一致)。commit: `feat(seo): ハブにパンくずと FAQ の構造化データを出す`
- **T3 ハブ更新日**(§4-2 末尾)。commit: `feat(seo): ハブに最終更新日を表示する`
- **T4 IndexNow**(§4-4)。鍵ファイル・送信スクリプト・`npm run indexnow`。送信はまだしない。commit: `feat(seo): IndexNow の鍵と送信スクリプトを置く`
- **T5 惜しい語 5 本**(§4-3)+ **監査 §6-2「打ち切り」の語追加**(shikyuu-teishi-fukkatsu のリード 1 文と FAQ 1 問、`data/hubs/nayami-shikyuu-teishi.json` のリード 1 文)。URL/slug/h1/h2 構成は変えない。字数 ±3%。`docs/verification/seo-aio-2026-09-04-title-diff.md` に変更前後の title/description を表で。commit: `fix(seo): 惜しい検索語 5 本の title と冒頭を合わせ、支給停止に「打ち切り」の語を足す`
- **T6 llms.txt**(§4-6)。commit: `feat(seo): llms.txt を sitemap から生成する`

全 T のあと: `npm run typecheck && npm run build && node scripts/prelaunch-check.mjs && npm run verify:hubs && npm run verify:columns` が通ること。`docs/verification/seo-aio-2026-09-04.md` に各 T の変更ファイル・検証コマンドと結果を書き、commit。
main に merge(`git checkout main && git merge --no-ff codex/seo-aio-2026-09-04`)して push。デプロイ後に:
- `curl -s https://shougainenkin-note.net/sitemap.xml | grep -c '<lastmod>'` と `grep -c '<url>'` が一致
- `curl -s https://shougainenkin-note.net/byoki/utsu-soukyoku | grep -o 'FAQPage'` が出る
- `curl -s https://shougainenkin-note.net/llms.txt | head -5` が出る
- `npm run indexnow`(全 URL 送信。初回なので `--since` なし)。HTTP 200 または 202 を報告。

止まる条件: build/check が通らない、T2 のテストで Q/A 不一致が直せない、push が拒否される。

## 2. 貼るコマンド(2 本目: Phase C + D、ブラウザ)

Phase A・B の push とデプロイが終わってから。Chrome を開いた状態で:

```
cd ~/Projects/shougainenkin-public-pages && claude --chrome "docs/claude-code-seo-aio-2026-09-04-instructions.md の Phase C と Phase D を実行してください。ログイン画面が出たら操作を止めて『ログインしてください』とだけ言い、私がログインしたら続けてください。ID・パスワードは絶対に入力しないでください。Cookie や同意のバナーは拒否か最小を選んでください。"
```

`--chrome` が使えない環境なら、`claude` を起動してから `/chrome` で連携を有効にする。それも無理なら Phase C・D の手順を画面に出して止まり、東さんが手でやる。

### Phase C: Bing Webmaster Tools(監査 §4-4 後半)

1. https://www.bing.com/webmasters を開く。ログイン画面 → 止まって東さんに渡す(Microsoft アカウント。無ければ東さんが作る。Claude Code は作らない)。
2. 「Google Search Console からインポート」を選ぶ。Google の認可画面が出たら止まって東さんに渡す。
3. `shougainenkin-note.net` がインポートされたら、サイトマップに `https://shougainenkin-note.net/sitemap.xml` を送信。
4. IndexNow の欄(Bing Webmaster の「IndexNow」)で鍵が認識されているか確認。認識されていなければ、鍵 URL `https://shougainenkin-note.net/<key>.txt` が 200 で返るかを curl で確認し、結果を報告。
5. 完了条件: サイトマップが「送信済み」、URL 数が 166 前後。スクリーンショットを `docs/verification/bing-2026-09-04.png` に保存(個人情報が写る部分は写さない)。

### Phase D: Search Console の URL 検査(監査 §4-5)

Google の URL 検査「インデックス登録をリクエスト」は 1 日 10〜12 件で上限が来る。3 日に分ける。上限のメッセージが出たら、その日はそこで止め、残りを翌日に回す(`docs/verification/gsc-request-log.md` に「日付・URL・結果」を追記していく。**このログは commit しない**。`.gitignore` に `docs/verification/gsc-request-log.md` を足す)。

1. https://search.google.com/search-console?resource_id=sc-domain:shougainenkin-note.net を開く。ログイン画面 → 止まって東さんに渡す。プロパティが URL プレフィックス型なら、一覧から `shougainenkin-note.net` を選ぶ。
2. 上部の URL 検査欄に URL を入れ、Enter。「URL が Google に登録されていません」なら「インデックス登録をリクエスト」→ 完了まで待つ(1〜2 分)。「登録されています」なら何もしないでログに「登録済み」と書く。
3. 順番(監査 §4-5 と同じ。上から 10〜12 件/日):

   Day 1: /byoki/utsu-soukyoku, /byoki/tekiou-fuan, /byoki/hattatsu, /byoki/tougou, /byoki/tenkan, /nayami/fushikyu, /nayami/shoshinbi-karute, /nayami/shikyuu-teishi, /nayami/koushin, /dougu/mitate
   Day 2: /dougu/kingaku, /dougu/shorui, /dougu/madoguchi, /dougu/moushitatesho, /erabu/hiyou-souba, /erabu/jibun-ka-irai, /joukyou/hatarakinagara, /joukyou/hitorigurashi, /joukyou/hatachi-mae, /jitsurei
   Day 3: /gokai, /suuji, /yougo, /hajimete, /shinsei, /byoki, /nayami, /okane/ikura, /okane/zeikin, /erabu/fushikyu-no-ato
   Day 4 以降: 残りの /byoki と /joukyou を、表示の付きそうな順(精神系 → 内部 → 外部)。

4. 各日の終わりに、Search Console 左メニュー「ページ」(インデックス作成)を開き、「登録済み」の数と、未登録の内訳(「検出 - インデックス未登録」「クロール済み - インデックス未登録」など)の件数を読み取って `docs/verification/gsc-request-log.md` に書く。**内訳の理由が「クロール済み - インデックス未登録」に偏っていたら**、それは発見性ではなく品質判定の問題なので、その URL 一覧を報告に含める(監査 §6-5 の判断材料)。
5. Day 2・Day 3 は東さんが翌日に 2 本目のコマンドをもう一度貼る。Claude Code はログを読んで、済んだ URL を飛ばす。

## 3. 完了報告の形

Phase ごとに `docs/verification/seo-aio-2026-09-04.md` に追記:
- A: push したコミット、デプロイ確認の curl 結果
- B: T1〜T6 の変更ファイル、検証コマンド、indexnow の応答コード
- C: Bing のサイトマップ送信状態、IndexNow 鍵の認識可否
- D: 各日のリクエスト件数、登録済み数の推移(49 → ?)、未登録内訳

4 週間後(2026-10-02 前後)に監査 §7 の項目を見る。それは別の指示書にする。

## 4. やらないこと

- Google/Microsoft のアカウント作成、パスワード入力、2 段階認証の操作
- 既存 47 記事の URL・slug・h1 の変更
- `/dougu/*` から訪問者のブラウザがサーバーへ送信する処理の追加
- Search Console の設定変更(所有者追加、プロパティ削除、削除リクエスト)
- Bing Webmaster の設定変更(サイトマップ送信と IndexNow 確認以外)
- 記事の新規追加(監査 §6 の 4 本は別の指示書。原稿は先に書く)
