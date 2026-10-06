# 森田療法の区画 /morita/ 実装の検証(2026-10-06)

指示書: docs/claude-code-morita-2026-10-06-instructions.md。2026-10-06 の 2 点修正(slug を ayashii/kouka に、data-yougo-skip)後に push。用語辞典の自動リンクは /morita 配下で 0 本(コラムは 7 本)。

- build: 成功。生成ページ 6: /morita, /morita/qa/ayashii, /morita/qa/kouka, /morita/shoujou/shakou-fuan, /morita/shoujou/kyouhaku, /morita/shoujou/panic
- import:morita --check: 再現性 OK(import-check.txt)。未公開リンクの置換 6 path / 13 か所(原稿どおり /morita/qa/ayashii・/morita/qa/kouka は公開 path。読み替えなし)、箇条書きの矢印 3 か所をリンク化
- prelaunch:check(prelaunch.txt): A/B/C すべて ○(新ページ 6 本が対象に入り、500 字未満・更新日なし・孤立なし)
- verify:site-graph(verify-site-graph.txt): 11/11(フッターの表に /morita を追加)
- verify:hubs: verify-hub-content OK、verify-hub-map OK(origin を 3210 に指定)
- 配信 HTML(inspect.mjs): 6 ページとも lead の直後に SafetyNote、著者欄が末尾、広告・アプリCTA・道具カード・年金の参考リンク・出典一覧なし、ld+json は 1 script に Article + BreadcrumbList + FAQPage
- morita-hub-375.png / kyouhaku-375-top.png: 375px の描画。横スクロールなし、console error なし

## 2026-10-06 追加: dokode・nikki の 2 本

- 生成ページ 8: 上の 6 本 + /morita/qa/dokode、/morita/jissen/nikki
- import:morita --check OK。未公開リンクの置換は 6 path / 13 か所 → 4 path / 4 か所(yarikata・arugamama・naze・shintai 各 1)
- 既存 6 本の中の /morita/qa/dokode・/morita/jissen/nikki へのリンクは 9 か所すべて実リンク(morita 2、shakou-fuan 2、kyouhaku 2、panic 2、ayashii 1)。
  ayashii の FAQ 答えにある「森田療法はどこで受けられる?」(/morita/qa/dokode)は、文中の「ラベル」(/path) 形なので [「ラベル」](/path) にして素の path を本文に出さない
  (FAQ の JSON-LD では plain() でラベルだけになる)
- prelaunch A/B/C ○、verify:site-graph 11/11、配信 HTML 8 ページで禁止物なし・ld+json 1 本

## 2026-10-06 追加: arugamama・yarikata・shintai の 3 本

- 生成ページ 11: /morita + qa 3(ayashii・kouka・dokode)+ shoujou 4(shakou-fuan・kyouhaku・panic・shintai)+ jissen 2(nikki・yarikata)+ kangaekata 1(arugamama)
- import:morita --check OK。未公開リンクの置換 0 path / 0 か所(morita.md から E1(naze)の矢印行が外れたので置換対象なし)。「準備中」は 11 ページとも 0
- ハブの症状別カードは 4 枚(shakou-fuan・kyouhaku・panic・shintai)。640px 以上で 2 列 × 2 段(morita-hub-cards-375.png)
- prelaunch A/B/C ○、verify:site-graph 11/11、配信 HTML 11 ページで禁止物なし・ld+json 1 本・用語辞典リンク 0
