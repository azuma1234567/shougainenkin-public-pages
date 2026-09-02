# 指示書: 本番デプロイ + FAQ構造化データの本文一致（shougainenkin-public-pages）

作成日: 2026-08-14
対象リポジトリ: `~/Projects/shougainenkin-public-pages`（ブランチ `main`）

このドキュメントは Claude Code にそのまま渡すための作業指示です。**タスクA（デプロイ）→ タスクB（FAQ修正）の順**で実施してください。

---

## 0. 前提 — 着手前に読むこと

直前のセッションで、点検報告書 P1〜P3 の修正が12コミット積まれています（未プッシュ）。この12コミットは**別途検証済みで、そのまま出して問題ありません**。以下は検証で確認済みの事実です。

- `npx tsc --noEmit` 通過。作業ツリーはクリーン。
- 全43記事の本文文字数を `origin/main` と比較し、**欠落ゼロ**。増減2%超は5記事のみで、すべて「です・ます調」化による +2〜3% の増加。
- FAQ構造化データと本文の一致率は `HEAD` / `origin/main` ともに **252/285 で同数**。今回の12コミットによる悪化はない。

**重要な訂正:** 直前の報告書には「一致は134/285、残り25記事が不一致」と書かれていますが、**これは誤りです**。実際の不一致は **5記事・33件**です。報告書のチェッカーは、`faqs` 配列自身を本文として突き合わせていた（自己一致）か、本文が `` const content = ` ` `` 形式と `const content = "..."` 形式の2種類あることを扱えていなかったものと見られます。**§B-4 の検証スクリプトを正としてください。**

---

## タスクA — 本番デプロイ

### A-1. プッシュ

```bash
cd ~/Projects/shougainenkin-public-pages
git status --short          # 空であることを確認
git log --oneline @{u}..HEAD  # 12件出ることを確認
git push origin main
```

出る12コミットは以下です。報告書に載っているのは上9件で、**下3件も一緒に出ます**（内容に問題はありません）。

```
81c1635 style: 実測で残っていた9行段落4件を割る(P3-1の仕上げ)
8e4a4d1 style: 箇条書きは常体に戻して既存32記事と揃える(P1-2の追随修正)
a049bf1 docs: 被リンク0本だった4記事に内部リンクを足す(P3-2)
b302db2 style: スマホで9行以上になる段落を割る(P3-1)
f21c18f style: 太字を減らして強調を機能させる(P2-3)
726c883 docs: h3を導入して目次を短くする(P2-2)
ef422df style: 文体を「です・ます調」に統一(P1-2)
a253e61 a11y: 横スクロールする表をキーボードで読めるようにする(P2-1, P3-3)
288a0ee fix: 改行して書いた列挙行が1段落に連結される問題を解消(P1-1)
--- ここから下は報告書に載っていない3件 ---
ee4b964 docs: 全ページ点検レポートと修正指示書を追加
8337e36 fix: スマホの表の横スクロールを解消し、全角？を半角に統一
ea988dc style: スマホで本文の右側が大きく余る問題を修正
```

### A-2. 本番反映の確認

Vercel のデプロイ完了を待ってから、本番URLで以下を確認してください。

1. コラム一覧ページが200で返り、43本すべてリンクが生きていること
2. 抜き取りで3本（`/columns/fushikyuu-shinsa-seikyu`、`/columns/daisansha-shomei`、`/columns/hatarakinagara`）を開き、
   - 本文が「です・ます調」で表示されている
   - 表が横スクロールでき、Tabでフォーカスリング（緑3px）が出る
   - 3列以上の表の直前に注記が出る（幅720px以下のとき）
3. `view-source` で `FAQPage` の JSON-LD が壊れていないこと

問題があれば `git revert` ではなく、**`git reset --hard 3cb26ce` してforce pushではなく**、まず何が起きたかを報告してください（このリポジトリは公開サイトなので、履歴の書き換えはしない）。

---

## タスクB — FAQ構造化データを本文と一致させる

### B-1. 何が問題か

各記事の `export const faqs`（FAQPage の JSON-LD に使われる）が、記事本文の「よくある質問」セクションと**文言レベルで食い違っている**記事が5本あります。Google の構造化データのガイドラインでは、FAQ の質問・回答は**ページ上にそのまま表示されている必要があります**。

各ファイルには既に方針がコメントで書かれています。これに従ってください。

```
// 記事末尾のQ&Aと同一の文字列。構造化データ(FAQPage)にも使う。
// 本文を正とし、ここは本文からそのまま写す。片方だけ直さないこと。
```

### B-2. 対象 — 5記事・33件

すべて `content/columns/<slug>.ts` の中に `export const faqs` があります。

| slug | 不一致 | 本文Q数 / faqs数 | 種類 |
|---|---|---|---|
| `shindansho-ishi-ni-tsutaeru` | 6/6 | 6 / 6 | 文言のみ |
| `shindansho-jittai-chigau` | 7/7 | 7 / 7 | 文言のみ |
| `tekio-shogai-shogai-nenkin` | 8/9 | 9 / 9 | 文言のみ |
| `shoshinbi-karute-nashi` | 6/6 | **7 / 6** | 文言＋**1件欠落** |
| `shoshinbi-haiin` | 6/6 | **7 / 6** | 文言＋**1件欠落・以降ズレ** |

### B-3. 直し方

**原則: `faqs` 側を、本文の `**Q. ...**` / `A. ...` から一字一句そのまま写す。本文は書き換えない。**

不一致は2種類あります。

**(a) 文言の差（大半）** — 構造化データ側だけが検索向けに書き換えられている、または句読点・鉤括弧・言い回しが微妙に違う。

```
構造化: 障害年金の診断書の書き直しをお願いできますか?
本文  : 診断書の書き直しをお願いできますか?

構造化: …訂正は依頼できます。一方、日常生活能力の評価や等級について…
本文  : …訂正はお願いできます。一方、7項目の評価や等級についての…
```

→ **本文側を正として `faqs` を上書き**してください。構造化データ側の「障害年金の」などのキーワード付加は、FAQリッチリザルトが2023年以降ほぼ表示されなくなっているため維持する価値がありません。可読性とガイドライン適合を取ります。

**(b) 項目の欠落とズレ（`shoshinbi-haiin` / `shoshinbi-karute-nashi` の2本）** — 本文に7件あるQ&Aが `faqs` では6件になっており、`shoshinbi-haiin` では5件目以降が**1つずれて対応**しています。

```
shoshinbi-haiin の現状:
  faqs[5] のQ = 「保健所や法務局への問い合わせを家族が代わりにしてもいいですか?」
  本文 5番目のQ = 「診察券しか残っていません。」        ← faqs から脱落
  faqs[6] のQ = 「初診日の追跡に時間がかかり、遡及請求の時効が心配です。」
  本文 6番目のQ = 「保健所や法務局への問い合わせを、家族がやってもいいですか?」
```

→ **機械的なコピーをせず**、本文の7件を頭から順に読み直して `faqs` を7件で作り直してください。`shoshinbi-karute-nashi` も同様に本文7件で作り直します。

### B-4. 検証スクリプト（これを正とすること）

作業前後にこれを走らせ、**285/285 になったら完了**です。自作のチェッカーを書き直さないでください。前回の報告が誤ったのはここです。

```js
// /tmp/faqcheck.js
const {execSync}=require('child_process');
const rev=process.argv[2]||'HEAD';
const list=execSync(`git ls-tree -r --name-only ${rev} content app`).toString()
  .trim().split('\n').filter(f=>/\.tsx?$/.test(f));
function jstr(s,i){let out='',k=i+1;while(k<s.length){const c=s[k];
 if(c==='\\'){out+=(s[k+1]==='n'?'\n':s[k+1]);k+=2;continue;}
 if(c==='"')return[out,k+1];out+=c;k++;}return[out,k];}
const norm=x=>x.replace(/\s+/g,'').replace(/\*\*/g,'').replace(/\\n/g,'');
let tot=0,ok=0;const bad=[];
for(const f of list){
 let s;try{s=execSync(`git show ${rev}:${f}`,{maxBuffer:1e8}).toString();}catch(e){continue;}
 const idx=s.indexOf('export const faqs');if(idx<0)continue;
 const seg=s.slice(idx);const pairs=[];let i=0;
 while(true){
  let r=seg.slice(i).search(/"?question"?:/);if(r<0)break;const qi=i+r;
  let p=seg.indexOf('"',qi+9);if(p<0)break;const[q,a1]=jstr(seg,p);
  let r2=seg.slice(a1).search(/"?answer"?:/);if(r2<0)break;const ai=a1+r2;
  let p2=seg.indexOf('"',ai+7);const[a,a2]=jstr(seg,p2);pairs.push([q,a]);i=a2;}
 // 本文 = faqs定義より前だけ（faqs自身と突き合わせると必ず一致してしまう）
 let src=s.slice(0,idx);
 if(f.startsWith('app/')){const slug=f.split('/')[2];
  try{src+=execSync(`git show ${rev}:content/columns/${slug}.ts`,{maxBuffer:1e8}).toString();}catch(e){}}
 const nb=norm(src);let fb=0;
 for(const[q,a]of pairs){tot++;
  if(nb.includes(norm(q))&&nb.includes(norm(a)))ok++;else fb++;}
 if(fb)bad.push(`${f}: ${fb}/${pairs.length}件不一致`);
}
console.log(`${rev} → 一致 ${ok}/${tot}  不一致のある記事 ${bad.length}本`);
bad.forEach(b=>console.log('  '+b));
```

```bash
node /tmp/faqcheck.js HEAD
# 着手前:  一致 252/285  不一致のある記事 5本
# 完了時:  一致 285/285  不一致のある記事 0本
```

**スクリプトの注意点（ここを踏むと数字が壊れます）**

1. 本文は `` const content = ` ... ` `` 形式と `const content = "...\n..."` 形式の**2種類**ある。両方扱うこと。
2. `faqs` は同じファイル内にあることが多い。**`faqs` 定義より前だけを本文とみなす**こと。ファイル全体と突き合わせると自己一致して 285/285 になってしまう。
3. キーは `question:` と `"question":` の**両方の書き方**が混在している。

### B-5. 受け入れ基準

- [ ] `node /tmp/faqcheck.js HEAD` が **285/285・不一致0本**
- [ ] `npx tsc --noEmit` 通過
- [ ] `npm run build` 通過（101ページ）
- [ ] 本文（`const content`）の差分がゼロであること。`git diff --stat` で `faqs` 部分しか変わっていないことを確認
- [ ] `shoshinbi-haiin` / `shoshinbi-karute-nashi` の `faqs` が **7件**になっている
- [ ] コミットは記事単位ではなく **1コミットにまとめる**（例: `fix: FAQ構造化データを本文と一致させる(5記事33件)`）

---

## やらないこと

- 本文（`const content`）の書き換え。B-3 は `faqs` 側だけを直す作業です。
- `faqs` を持たない7記事（`hatachi-mae` / `moushitatesho-a4-insatsu` / `moushitatesho-kakikata` / `nofu-yoken` / `shindansho-kakunin` / `shinsatsu-mae-memo` / `techou-to-nenkin`）への `faqs` 新設。これらは `app/columns/<slug>/page.tsx` 側に定義があり、既に一致しています。
- 文体・見出し・太字・段落まわりの再調整。P1〜P3 は完了しており、追加で触る必要はありません。
- 履歴の書き換え（force push、rebase）。
