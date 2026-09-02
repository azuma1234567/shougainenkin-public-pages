# スマホの「右側の空白」— 原因特定と修正 指示書 (2026-08-14)

対象: `shougainenkin-public-pages` / `app/globals.css`
状況: `ea988dc` で一度直したはずだが、実機(iPhone Safari)で全ページまだ空白が残る。

---

## 0. 結論(先に)

原因は2つあり、**どちらも `text-wrap` プロパティ**。前回の修正が狙った
`word-break: auto-phrase` ではない。

| | 犯人 | 影響ブラウザ | 前回の修正で直ったか |
|---|---|---|---|
| **見出し h1/h2/h3** | `text-wrap: balance` | Chrome / Safari 両方 | **対象外にしていたので未修正** |
| **本文 p/li/dd** | `text-wrap: pretty`(推定) | **Safari のみ** | 直っていない可能性が高い |

そして重要な前提: **`word-break: auto-phrase` は Chrome 系だけの機能で、Safari は非対応。**
つまり前回の修正(auto-phrase を無効化)は、**iPhone では最初から何の効果もなかった。**
Chrome での計測値だけが 86.4% → 98.0% に改善し、実機は変わっていなかった、という筋。

---

## 1. 実測データ(この指示書の根拠)

本番相当のビルドを立てて、iPhone 相当のビューポートで**行ごとの充填率**を実測した。

- 計測環境: Chromium(Playwright)、viewport 390x844 / DPR3 / isMobile
- 対象: コラム5本(`kiso-kousei-chigai` / `nichijo-seikatsu-7koumoku` / `shinsei-shindoi` /
  `moushitatesho-kakikata` / `tokyu-hantei-guideline`)
- 方法: 各要素に Range を張って行ボックスを取得。行の中心座標を `line-height * 0.45` の
  許容で束ねて1行として扱う(`<strong>` で rect が割れるため、これをやらないと数字が壊れる)。
  最終行と、`<br>` を含む要素は除外。

### 1-1. 横スクロールの有無

**全ページ・全幅(346 / 390 / 430px)で `scrollWidth - clientWidth = 0`。**
「右側の空白」は**はみ出しではなく、行末の空き**であることが確定。
`main` も `0..390 / padding 21.25px 左右対称 / max-width 714px` で、左右の非対称はない。
→ **`overflow-x: hidden` の類は不要。入れないこと。**

### 1-2. 行の充填率(390px、5記事の合算)

| パッチ | p | li | h2 | h3 |
|---|---|---|---|---|
| **現状** | 97.8% (p10 94) | 96.0% (p10 92) | **69.2% (p10 52)** | **67.9% (p10 57)** |
| 本文に `text-wrap: auto` | 97.9% | 96.3% | 69.2% | 67.9% |
| 見出しに `text-wrap: wrap` のみ | 97.8% | 96.0% | 84.0% | 86.7% |
| **見出しに `text-wrap: wrap` + `word-break: normal` ほか** | 97.9% | 96.3% | **94.8% (p10 92)** | **96.6% (p10 95)** |

読み取れること:

1. **見出しが本文より 28ポイントも低い。** これが体感の主因。
2. 見出しは `text-wrap: wrap` だけでは 84% 止まり。**`word-break: normal` を併せて初めて 95%** に届く。
   `balance` と `auto-phrase` の両方が効いているため、片方だけ外しても足りない。
3. 本文への `text-wrap: auto` は Chromium では**ほぼ無変化**(97.8 → 97.9)。
   Chromium の `pretty` は最終行の孤立回避しかしないので、これは予想どおり。

---

## 2. なぜ Safari では本文も直っていないと考えるか

**ここは実測できていない。仮説として扱うこと。** この環境に WebKit を入れられなかった
(`playwright install webkit` がダウンロード不可)ため、Chromium でしか測れていない。

仮説の根拠:

- `word-break: auto-phrase` は Safari 非対応。前回の修正は iPhone では**空振り**。
- `text-wrap: pretty` は Safari 17.5 以降で対応済みだが、**実装が Chromium と違う**。
  Chromium は最終行の孤立回避に限定した軽い処理、Safari は段落全体を見て行長を整える処理。
  後者は**全行を意図的に短くする**方向に働く。
- 実機スクリーンショットの本文は、1行あたり16文字前後で折り返している。
  390px・15px相当なら22〜23文字入る計算で、**約7割**。Chromium の実測 97.8% とは明らかに違う。
  → iPhone 側だけで別の力が働いている、と考えるのが自然。

**この仮説の検証は実機でしかできない。** §4 の手順で必ず確かめること。
外れていた場合は、本文側の変更は戻してよい(見出し側の効果は独立している)。

---

## 3. 修正

`app/globals.css` の 124-137 行のブロックを、以下で置き換える。

### 置換前

```css
/*
 * スマホでは本文の word-break: auto-phrase を無効にする。
 * 1行が短い画面で文節単位に折り返すと、行末に文節ひとつ分の空きが毎行できて
 * 右側が大きく余って見える(実測で平均充填率 86% / 最短70%)。
 * 通常の禁則処理に戻すと 98% 前後まで埋まる。
 * 見出しは行数が少なく、text-wrap: balance で意図的に均等割りしているので対象外。
 */
@media (max-width: 720px) {
  p,
  li,
  dd {
    word-break: normal;
    line-break: strict;
    overflow-wrap: break-word;
  }
}
```

### 置換後

```css
/*
 * スマホでは、行を短くする方向に働く指定をまとめて外す。
 *
 * 2026-08-14 の実測(390px / 記事5本 / Chromium):
 *   本文 p 97.8% / li 96.0% に対して、見出しは h2 69.2% / h3 67.9% しかない。
 *   見出しには word-break: auto-phrase と text-wrap: balance が重なっていて、
 *   text-wrap を外すだけでは 84% 止まり。word-break も戻して 94.8% / 96.6% になる。
 *
 * 本文の text-wrap: pretty も外す。Chromium では効果がない(97.8 → 97.9)が、
 * Safari の pretty は段落全体で行長を整える実装で、全行を短くする方向に働く。
 * word-break: auto-phrase は Safari 非対応なので、ea988dc の修正は
 * iPhone では効いていなかった。ここが実機で空白が残っていた理由と見ている。
 */
@media (max-width: 720px) {
  p,
  li,
  dd {
    word-break: normal;
    line-break: strict;
    overflow-wrap: break-word;
    text-wrap: auto;
  }

  h1,
  h2,
  h3 {
    word-break: normal;
    line-break: strict;
    overflow-wrap: break-word;
    text-wrap: wrap;
  }
}
```

`text-wrap: pretty` / `balance` は 111-121 行にそのまま残す。**721px 以上(PC)の挙動は変えない。**

---

## 4. 検証(実機が必須)

### 4-1. Chromium での数値

上の表を再現すること。計測スクリプトは §5 に置いた。
**期待値: h2 が 69% → 94% 前後、p は 97〜98% のまま。**
p が下がったら、その変更は入れない。

### 4-2. iPhone Safari(これが本番)

**ここを飛ばさないこと。** 今回の失敗は、Chrome の数字だけを見て直したことが原因。

1. 修正前の状態で、コラム記事を iPhone で開いてスクリーンショットを撮る
2. 修正を当てたビルドで、同じ記事の同じ位置のスクリーンショットを撮る
3. 見出しと本文それぞれについて、行末の空きが減ったかを目視で比較する
4. **本文が変わらなかった場合** → §2 の仮説は外れ。`p, li, dd` の `text-wrap: auto` は
   外して、見出しの修正だけを残す。そのうえで本文側の原因を改めて調べる
   (次に疑うのは `font-feature-settings: "palt"` + `letter-spacing` の組み合わせと、
   `line-break: strict` による禁則の強さ)

### 4-3. 見た目の副作用

`balance` を外すと、**2行に収まる短い見出しで「1行目が長く、2行目に数文字だけ残る」形**が
出やすくなる。充填率は上がるが読み味は落ちうる。

- 各記事の h2 / h3 を 390px で描画し、2行以内の見出しを目視確認する
- 目立つものがあれば、**CSS ではなく見出しの文言を短くする方向**で直す
  (`content/columns/*.ts` の見出しテキスト)。CSS で balance に戻すのは最後の手段

---

## 5. 計測スクリプト

`next build && next start -p 3111` した状態で実行する。
Playwright 前提。`<strong>` で rect が割れる問題への対処が入っているので、
**簡略化しないこと**(簡略版だと p が 88% と誤って出る)。

```js
const { chromium } = require('playwright');
const PAGES = ['/columns/kiso-kousei-chigai','/columns/nichijo-seikatsu-7koumoku',
  '/columns/shinsei-shindoi','/columns/moushitatesho-kakikata','/columns/tokyu-hantei-guideline'];

(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport:{width:390,height:844}, deviceScaleFactor:3,
    isMobile:true, hasTouch:true });
  const page = await ctx.newPage();
  const agg = { p:[], li:[], h2:[], h3:[] };
  for (const path of PAGES) {
    await page.goto('http://127.0.0.1:3111' + path, { waitUntil:'load' });
    const r = await page.evaluate(() => {
      const stat = (sel) => {
        const fills = [];
        for (const el of document.querySelectorAll(sel)) {
          if (el.querySelector('br,time')) continue;
          if (el.closest('table,.article-table-wrap,nav,.site-footer,header')) continue;
          const c = getComputedStyle(el);
          const cw = el.getBoundingClientRect().width
            - parseFloat(c.paddingLeft) - parseFloat(c.paddingRight);
          const lh = parseFloat(c.lineHeight) || parseFloat(c.fontSize) * 1.6;
          if (cw <= 0) continue;
          const rg = document.createRange(); rg.selectNodeContents(el);
          const groups = [];
          for (const l of [...rg.getClientRects()].filter(x => x.width > 0.5)) {
            const mid = (l.top + l.bottom) / 2;
            const g = groups.find(g => Math.abs(g.mid - mid) < lh * 0.45);
            if (g) { g.left = Math.min(g.left, l.left); g.right = Math.max(g.right, l.right); }
            else groups.push({ mid, left: l.left, right: l.right });
          }
          groups.sort((a, b) => a.mid - b.mid);
          if (groups.length < 2) continue;
          for (let i = 0; i < groups.length - 1; i++)
            fills.push((groups[i].right - groups[i].left) / cw);
        }
        return fills;
      };
      return { p:stat('main p'), li:stat('main li'), h2:stat('main h2'), h3:stat('main h3') };
    });
    for (const k of Object.keys(agg)) agg[k].push(...r[k]);
  }
  const sum = a => { if (!a.length) return '—'; a = a.slice().sort((x,y)=>x-y);
    const avg = a.reduce((x,y)=>x+y,0)/a.length;
    return `${(avg*100).toFixed(1)}% (p10 ${(a[Math.floor(a.length*0.1)]*100).toFixed(0)}, n=${a.length})`; };
  for (const k of Object.keys(agg)) console.log(k.padEnd(3), sum(agg[k]));
  await b.close();
})();
```

---

## 6. やらないこと

- `html` / `body` への `overflow-x: hidden`。§1-1 のとおり横スクロールは発生していない。
- 見出しの `font-size` / `line-height` / `margin`(globals.css 169-186行)の変更。
  今回は折り返しの問題で、サイズの問題ではない。
- 721px 以上への変更。PC では `auto-phrase` / `balance` が意図どおり効いている。
- `content/columns/*.ts` の一括書き換え。§4-3 で個別に引っかかった見出しだけ。

---

## 7. 完了条件

- [ ] §5 のスクリプトで、修正前後の数値を出して比較表にした
- [ ] h2 / h3 が 94% 前後まで上がっている
- [ ] p / li が 96〜98% から下がっていない
- [ ] **iPhone Safari の実機スクリーンショットで、修正前後を比較した**
- [ ] 本文が実機で変わらなかった場合、`p, li, dd` の `text-wrap: auto` を外して報告した
- [ ] 2行以内の見出しに不自然な折り返しが出ていないか目視確認した
- [ ] `npm run build` が通る
- [ ] `docs/review-2026-08-14.md` の充填率の表に今回の結果を追記した
