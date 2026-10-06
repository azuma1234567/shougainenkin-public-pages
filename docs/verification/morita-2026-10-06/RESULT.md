# 森田療法の区画 /morita/ 実装の検証(2026-10-06)

指示書: docs/claude-code-morita-2026-10-06-instructions.md。push・デプロイはしていない。

- build: 成功。生成ページ 6: /morita, /morita/qa/morita-ayashii, /morita/qa/morita-kouka, /morita/shoujou/shakou-fuan, /morita/shoujou/kyouhaku, /morita/shoujou/panic
- import:morita --check: 再現性 OK(import-check.txt)。未公開リンクの置換 6 path / 13 か所、README の旧 slug 2 path / 3 か所を公開 path に読み替え、箇条書きの矢印 3 か所をリンク化
- prelaunch:check(prelaunch.txt): A/B/C すべて ○(新ページ 6 本が対象に入り、500 字未満・更新日なし・孤立なし)
- verify:site-graph(verify-site-graph.txt): 11/11(フッターの表に /morita を追加)
- verify:hubs: verify-hub-content OK、verify-hub-map OK(origin を 3210 に指定)
- 配信 HTML(inspect.mjs): 6 ページとも lead の直後に SafetyNote、著者欄が末尾、広告・アプリCTA・道具カード・年金の参考リンク・出典一覧なし、ld+json は 1 script に Article + BreadcrumbList + FAQPage
- morita-hub-375.png / kyouhaku-375-top.png: 375px の描画。横スクロールなし、console error なし
