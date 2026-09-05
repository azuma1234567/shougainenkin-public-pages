# ページの型の精査 — 「選ぶページ」と「読ませるページ」 (2026-09-05)

東さんの言語化: サイトには 2 種類ある。**ユーザーに権限があって選んでもらうページ**(トップ、病気から探す)と、**離脱を防いで読んでもらうページ**(コラム)。設計の前に、この 2 つを外部の実測データで裏づけ、それぞれの原則を決める。
外部データは 34 件(§6)。数字はすべて出典から。**このメモは `design-seisa-2026-09-05.md` と同格で、4 本の指示書より優先。**

## §0 結論

| | 選ぶページ | 読ませるページ |
|---|---|---|
| 該当 | `/` `/byoki` `/joukyou` `/nayami` `/okane` `/erabu` `/jitsurei`(一覧) `/gokai`(一覧) `/columns`(一覧) | `/columns/*`(47本) `/byoki/*` `/joukyou/*` ほかハブ本文 44 本、`/gokai/*` `/hajimete` `/shinsei` `/suuji` |
| 読者の状態 | まだ自分の場所が分からない。**不安で、判断に自信がない** | 自分の場所は決めた。**答えが出るまでは読む** |
| 成功の定義 | **次の 1 クリックが正しく起きる**(2 ページ目に進む) | **答えに到達し、次の行動(道具・実例・次の記事)に進む** |
| 最大の敵 | 迷い・選択過多・「自分向けか分からない」 | 冒頭で価値が伝わらない・長さに負ける・途中で迷子 |
| 主役 | 選択肢(リンク)。本文は脇役 | 本文。リンクは要所だけ |
| 数字の役割 | 選択肢を**比べる**手がかり(件数・期限) | 主張を**裏づける**証拠(統計・金額) |

東さんの直感は外部データと一致する。ただし 1 点だけ足す: **このサイトには 3 つ目「使うページ」(`/dougu/*`)がある**。道具は「選ぶ」でも「読ませる」でもなく「完了させる」ページで、原則が別(送信なし・止めない・保存)。この精査では扱わないが、混ぜないために名前だけ置く。

## §1 なぜ 2 つに分けるのが正しいか(データ)

### 1-1 読者は最初の 10 秒で去る — どちらの型でも、冒頭が全部
- ページ滞在は Weibull 分布。**最初の 10 秒**で去るか決まり、30 秒を超えると離脱率が急に下がる(NN/g、20.5 万ページ分析)[2]。
- 目の時間の **57% は最初の 1 画面**、74% は 2 画面目まで(NN/g 2018 アイトラッキング)[21]。
- 読者は平均でページの語の **20%(最大 28%)** しか読まない[5]。
→ 選ぶページでは「自分の選択肢が 1 画面目にあるか」、読ませるページでは「答えの要約が 1 画面目にあるか」。**両方とも冒頭に賭ける**が、置くものが違う。

### 1-2 選ぶページ: 選択過多は「不安で自信がない人」にだけ起きる
- ジャムの実験(24 種→6 種で購入 10 倍)は再現が不安定だが、99 研究のメタ分析(Chernev 2015)は**選択過多が起きる 4 条件**を特定した: 手早く決めたい / 決定が重い / 選択肢の比較が難しい / **自分の好みに自信がない**[15]。
- 日本人は「医師の情報が自分に当てはまるか判断する」のが難しいと答えた人が **46.7%**(EU 平均 18.0%)。「情報を評価する」項目で EU との差がいちばん大きい(中山、ヨーロッパ調査との比較)[20]。
- 成人の **26% はコンピュータをほぼ使えず**、複雑な操作ができるのは 5%(日本 8%)(OECD PIAAC)[16]。
→ 障害年金を調べる人は 4 条件を**全部**満たす。だから `/byoki` の 21 枚に「一言」(自分に当てはまるかの手がかり)を付け、群に分け、件数を出す設計は正しい。**病名だけのカードは、この読者にとって選択過多そのもの**。

### 1-3 選ぶページ: 情報の匂い(information scent)
- 人は「次のリンクの先に何があるか」の匂いで進む。匂いが薄いと戻る・去る(NN/g)[1]。
- EC の一覧ページ研究(Baymard): 中間カテゴリページを置かない 13% / 現在地をナビで強調しない 66% / 過剰分類 75% が失敗[8]。
- 2 ページ目を見た訪問者は 1 ページで去った人より **2.75 倍**戻ってくる(8%→22%)。ランディングがトップページだった人の再訪 46%(Chartbeat、3 億セッション)[4]。
→ 選ぶページの KPI は「2 ページ目に進んだ割合」。一言・件数・群名・パンくず・現在地は全部この匂いのため。

### 1-4 読ませるページ: 長さは敵ではない。構造が無いのが敵
- Medium: 総読了時間が最大になるのは **7 分**の記事。ただし「良い記事は長さに関係なく読まれる」[17]。
- Google 上位 10 件の平均は **1,447 語**、語数と順位に相関なし。ただし「網羅度」は順位と強く相関、上位ページの滞在は平均 **2.5 分**(Backlinko、1,180 万件)[12]。
- 読者が止まる位置の中央値はページの **50〜60%**、1,600px を超えて読むのは **25%**(Chartbeat/Slate)[26]。
- AI 検索の引用の **44% はページの上 30%** から、中 30% から 31%、下 30% から 25%(Zyppy)。FAQ 構造化データは ChatGPT の引用重みを約 40% 上げる[11]。
- 簡潔(語数半分)+ 走査しやすい(見出し・箇条書き)+ 客観的 で、使いやすさ **+124%**(NN/g)[22]。
- 見出しが良いと「レイヤーケーキ」型で読まれ、F 型より効率が高い[31]。
- 長文の 5 技法: 要約(冒頭・途中・末尾)、強調は **30% 以下**、箇条書き、コールアウト、図(NN/g)[9]。
- 文の長さ: 14 語で理解 90%、43 語で 10% 未満(GOV.UK が 25 語上限にした根拠)[29]。NHS は 1 文 20 語・1 段落 3 文・対象年齢 9〜11 歳[7]。
- 目次: 長いページには置く。左右レールなら sticky + 現在地強調、本文内なら非 sticky。モバイルの折りたたみ目次は**気づかれにくい**[10]。
- アコーディオン: 読者が本文の大半を必要とするページでは**害**。FAQ など独立した断片には可[25]。
→ 47 本(1 本 1 万字)は、日本語の読み速度(1 分 500〜600 字)で **17〜20 分**。Medium の 7 分の 2.5 倍。切るのではなく、**2,000 字ごとに「ここまでの要約」**を置き、答えを上 30% に入れ、目次を左レールに固定し、末尾に「次に読む」で 2 ページ目を作る。

### 1-5 読ませるページ: 途中で止まらせない仕組み
- GOV.UK の step by step: 8 回のユーザーテストを経て、半年で 124 万回使われ、満足 77%[3]。
- GOV.UK の「複数タスクを完了する」パターン: 複数セッションにまたがる手続きで、**順不同・状態表示・完了は黒字で目立たせない**[32]。
- 手続きは「いま何番目か」が見えると続けられる。`/shinsei` の固定目次 + チェックはこの型。

### 1-6 患者ファースト = 健康リテラシーの前提で書く
- 英国: 成人の **4 割超**が公衆向け健康情報を理解できず、**6 割超**が数字を含む健康情報を理解できない(NHS)[6]。
- 日本: 上の 46.7%(当てはまるか判断できない)[20]。
→ **数字には必ず翻訳の 1 文を添える**(「10 人のうち 7 人が精神の診断書で」)。/suuji から抽出した C はここに根拠がある。数字を大きく置くだけでは、6 割の人に届かない。

### 1-7 端末と速度
- 日本のネット利用者の **74.4% がスマホ**、PC は 46.8%(総務省、令和 7 年版白書)[19]。
- 難しい文章はスマホだと 1 語あたり **30ms 遅く**読む(NN/g 2016)[34]。
- 3 秒超で **53% が離脱**(Google、モバイル)[13]。Core Web Vitals: LCP 2.5 秒・INP 200ms・CLS 0.1(75 パーセンタイル)[23]。
- タップ領域 **24×24px** 以上(WCAG 2.2 SC 2.5.8)[24]。行送りは文字の **1.5 倍以上**、1 行 **全角 40 字**程度(デジタル庁デザインシステム)[28]。

### 1-8 SEO / AIO の前提が変わった
- **FAQ リッチリザルトは 2026 年 5 月 7 日に終了**。マークアップは無害だが、Google 検索での表示効果はゼロ。6 月にリッチリザルトテストの FAQ 対応も終了[27]。HowTo は 2023 年に終了済み。
- 一方、AI 検索(ChatGPT 等)では FAQ 構造化データが引用に効くという測定がある[11]。
- Google の「人のためのコンテンツ」自己評価: 「読み終えて満足するか」「別のところで検索し直したくなるか」「誰が書いたか自明か」[33]。
- 内部リンク: 被リンク 0〜4 本のページに比べ 40〜44 本のページはクリック **4 倍**。45〜50 本を超えると逆に下がる。アンカーテキストの多様性が効く(Zyppy、2,300 万リンク)[18]。
→ T2 で入れたハブの FAQPage は残してよいが(AI 向け)、**FAQ リッチリザルトを目的にした検証(リッチリザルトテスト)は意味を失った**ので、検証は schema.org のバリデータに置き換える。ハブ→記事(T8)と記事→ハブ(ColumnThemeBlock)のリンクは、1 ページあたり 45 本を超えないよう見張る。

## §2 選ぶページの原則(このサイト用に確定)

1. **1 画面目に選択肢の先頭が見える**。本文の段落は選択肢の後(§1-1)。
2. **各選択肢に「自分に当てはまるか」の手がかり 1 行**(§1-2)。病名・状況名だけにしない。
3. **群は 7 以下、各群に 1 行の説明**。群の違いが「見る場所の違い」で語られていること(内部疾患は検査値、精神は診断書の 2 欄)。
4. **件数・期限・割合は選ぶための比較材料としてだけ出す**。黒、小さく、ラベルつき(§1-3、§1-6)。
5. **現在地とパンくずを必ず**(Baymard の 66%)。ナビで今いる入口を強調。
6. **21 件以上なら絞り込み**(端末内・送信なし)。9 件以下なら不要。
7. **本文(SEO 用の説明)は残すが下へ**。消さない。
8. **選ぶページの KPI = 2 ページ目に進んだ割合**。GA の「セッションあたりページ数」を入口別に見る。
9. JSON-LD は `CollectionPage` + `ItemList`。FAQPage は選ぶページには置かない(§1-8)。

## §3 読ませるページの原則(このサイト用に確定)

1. **冒頭 10 秒で答え**: リードは 4 点の結論(いまの形)。**1 画面目に読者の問いへの直答がある**こと。
2. **答えはページの上 30% に**(AI 引用の 44%)。詳細・背景・出典は下。
3. **2,000 字ごとに「ここまでの要約」**(コールアウト 1 段落)。読者が途中で戻ってきても続けられる(§1-4)。
4. **見出しはそれだけ読んで筋が分かる文**(レイヤーケーキ)。「はじめに」「その他」を見出しにしない。
5. **1 文は 40〜50 字まで、1 段落は 3 文まで、強調は本文の 30% 以下**。
6. **目次は左レールに固定 + 現在地**(PC)。モバイルは冒頭に非 sticky で全項目を見せる(折りたたまない)。
7. **本文をアコーディオンに入れない**。FAQ だけ可。
8. **数字には翻訳の 1 文**(§1-6)。数字は黒。
9. **末尾に「次に読む」3 本 + 道具 1 つ**(2 ページ目 = 再訪 2.75 倍)。
10. **手続きの記事(/shinsei)は「順不同・状態表示・完了は目立たせない」**(GOV.UK)。
11. JSON-LD は `Article`(+ AI 向けに `FAQPage`)。リッチリザルト目的の検証はしない。
12. **読ませるページの KPI = 滞在 30 秒超の割合 と 末尾リンクのクリック率**。

## §4 いまの指示書 4 本との突き合わせ

| 指示書 | 型 | 一致 | 変更 |
|---|---|---|---|
| stepflow-yokonarabi | 選ぶ(トップの部品) | 左→右、8 個を 4 組に、道具は段の下 = §2-1,3 | 無し |
| hub-index-sasshin | 選ぶ | 一言・群・件数・絞り込み・本文を下へ = §2-1〜7 | **FAQPage の検証をリッチリザルトテストからバリデータへ**。T2 のハブ FAQPage は残す(AI 向け) |
| hajimete-jitsurei-sasshin | /hajimete = 読ませる、/jitsurei = 選ぶ | ページ内ナビ・意味の色・帯グラフ | /hajimete: **セクションごとに 1 行の要約**を h2 直下に(§3-3)。/jitsurei: 絞り込みは選ぶページの原則どおり。FAQPage の検証は同上 |
| top-shinsei-sasshin | / = 選ぶ、/shinsei = 読ませる+手続き | 探すの型分け、固定目次、チェック | /shinsei のチェック: **完了を緑の ✓ で目立たせない**(GOV.UK は黒字)。目次の ✓ は小さく、進み具合の棒だけ緑 |

そして、**まだ指示書が無い最大の項目**: 47 本のコラム(読ませるページの本体)に §3-3(2,000 字ごとの要約)と §3-6(左レール目次)と §3-9(次に読む)を入れること。これは記事本文を変えずに `ColumnArticle` の部品で足せる。次の指示書にする。

## §5 東さんの言語化に足す 1 行

「選ぶページはユーザーに権限がある」— そのとおり。ただし**権限を渡すには、判断材料を先に渡す**必要がある(46.7% が「当てはまるか分からない」)。選択肢を並べるだけでは権限を渡したことにならない。一言・件数・群の説明は、権限を実際に使えるようにするための材料。

「読ませるページは離脱を防ぐ」— そのとおり。ただし**引き止めるのではなく、答えに早く着かせる**のが離脱を防ぐ(10 秒、上 30%)。長さを削らず、要約と目次で「いつでも降りられる階段」にする。

## §6 出典(34 件)

1. NN/g — Information Scent: https://www.nngroup.com/articles/information-scent/
2. NN/g — How Long Do Users Stay on Web Pages?(Weibull・10 秒・30 秒): https://www.nngroup.com/articles/how-long-do-users-stay-on-web-pages/
3. OECD OPSI — GOV.UK step-by-step navigation(124 万回・満足 77%・8 回のテスト): https://oecd-opsi.org/innovations/gov-uk-step-by-step-navigation/
4. Chartbeat — 2 ページ目で再訪 2.75 倍(8%→22%)、トップ着地の再訪 46%: https://chartbeat.com/resources/general/increase-return-visits-news-sites/
5. NN/g — How Little Do Users Read?(20%・28%・111 語): https://www.nngroup.com/articles/how-little-do-users-read/
6. NHS service manual — Health literacy(4 割超・6 割超): https://service-manual.nhs.uk/content/health-literacy
7. NHS service manual — How we write(20 語・3 文・9〜11 歳): https://service-manual.nhs.uk/content/how-we-write
8. Baymard — Homepage & Category UX(13%・66%・75%): https://baymard.com/blog/current-state-of-ecommerce-category-ux
9. NN/g — 5 Formatting Techniques for Long-Form Content(強調 30% 以下): https://www.nngroup.com/articles/formatting-long-form-content/
10. NN/g — Table of Contents(sticky/非 sticky・モバイル): https://www.nngroup.com/articles/table-of-contents/
11. Leapd — AI 引用の集計(Zyppy 44/31/25%、FAQ +40%、Ahrefs/BrightEdge/seoClarity): https://www.leapd.ai/blog/ai-visibility/how-chatgpt-google-ai-overviews-and-perplexity-source-information-in-2026
12. Backlinko — 1,180 万件(1,447 語・2.5 分・網羅度): https://backlinko.com/search-engine-ranking
13. Think with Google 経由(Marketing Dive)— 3 秒で 53% 離脱: https://www.marketingdive.com/news/google-53-of-mobile-users-abandon-sites-that-take-over-3-seconds-to-load/426070/
14. NN/g — Simplicity Wins over Abundance of Choice(100 種で作業時間 +500%): https://www.nngroup.com/articles/simplicity-vs-choice/
15. digitalwellbeing.org — ジャム研究と Chernev 2015 メタ分析(4 条件): https://digitalwellbeing.org/the-jam-study-strikes-back-when-less-choice-does-mean-more-sales/
16. NN/g — The Distribution of Users' Computer Skills(26%・5%・日本 8%): https://www.nngroup.com/articles/computer-skill-levels/
17. Medium Data Lab — The Optimal Post is 7 Minutes: https://medium.com/data-lab/the-optimal-post-is-7-minutes-74b9f41509b
18. Zyppy — 23 Million Internal Links(4 倍・45〜50 本で反転): https://zyppy.com/seo/internal-links/seo-study/
19. 総務省 — 令和 7 年版 情報通信白書(スマホ 74.4%・PC 46.8%): https://www.soumu.go.jp/johotsusintokei/whitepaper/ja/r07/html/nd21b120.html
20. 中山和弘 — 日本のヘルスリテラシー(EU 比較、46.7% vs 18.0%): https://www.healthliteracy.jp/kenkou/japan.html
21. NN/g — Scrolling and Attention(57%・74%): https://www.nngroup.com/articles/scrolling-and-attention/
22. NN/g — Concise, Scannable, and Objective(+58/+47/+27/+124%): https://www.nngroup.com/articles/concise-scannable-and-objective-how-to-write-for-the-web/
23. web.dev — Core Web Vitals の閾値: https://web.dev/articles/defining-core-web-vitals-thresholds
24. WCAG 2.2 SC 2.5.8 Target Size(24×24): https://wcag22aa.org/new-criteria/target-size/
25. NN/g — Accordions on Desktop: https://www.nngroup.com/articles/accordions-on-desktop/
26. Slate/Chartbeat — How People Read Online(中央値 50〜60%・1,600px で 25%): https://slate.com/technology/2013/06/how-people-read-online-why-you-wont-finish-this-article.html
27. Search Engine Journal — FAQ リッチリザルト終了(2026-05-07): https://www.searchenginejournal.com/google-drops-faq-rich-results-from-search/574429/
28. デジタル庁デザインシステム — タイポグラフィ(行送り 1.5 倍・40 字): https://design.digital.go.jp/dads/foundations/typography/accessibility/
29. Inside GOV.UK — 25 語上限の根拠(14 語 90%・43 語 10%): https://insidegovuk.blog.gov.uk/2014/08/04/sentence-length-why-25-words-is-our-limit/
30. NHS service manual — Contents list(8 ページまで・現在地): https://service-manual.nhs.uk/design-system/components/contents-list
31. NN/g — Layer-Cake Pattern: https://www.nngroup.com/articles/layer-cake-pattern-scanning/
32. GOV.UK Design System — Complete multiple tasks(順不同・黒字): https://design-system.service.gov.uk/patterns/complete-multiple-tasks/
33. Google Search Central — Creating helpful, reliable, people-first content: https://developers.google.com/search/docs/fundamentals/creating-helpful-content
34. NN/g — Reading Content on Mobile Devices(難文は 30ms/語 遅い): https://www.nngroup.com/articles/mobile-content/
