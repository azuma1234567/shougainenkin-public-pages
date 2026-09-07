# -*- coding: utf-8 -*-
# §1 検証 2〜4: 変更前(HEAD b07233a のビルド)と変更後の HTML を比べる。
#   python3 docs/verification/jukyuugo-list-first-2026-09-07/diff-hubs.py <before-dir> <after-dir>
import re, json, difflib, sys
B, A = sys.argv[1], sys.argv[2]
def norm(t):
    t = re.sub(r'/_next/static/[^"\' )]+', '/_next/static/X', t)   # ビルドごとに変わるチャンク名
    t = re.sub(r'"buildId":"[^"]+"', '"buildId":"X"', t)
    t = re.sub(r'<!--[A-Za-z0-9_-]{15,}-->', '<!--BUILD-->', t)       # ビルドID のコメント
    return t
def dom(t):
    # 描画される HTML だけ(script の中身 = React の RSC ペイロード・ビルドIDを除く)
    return re.sub(r'<script[^>]*>.*?</script>', '<script/>', norm(t), flags=re.S)
print("# §1 検証 3: 他のハブ5本の HTML(ビルドのチャンク名だけ正規化)の diff")
for h in ['byoki', 'joukyou', 'nayami', 'okane', 'erabu']:
    b = norm(open(f'{B}/{h}.html', encoding='utf-8').read()); a = norm(open(f'{A}/{h}.html', encoding='utf-8').read())
    db, da = dom(b), dom(a)
    k = next((i for i in range(min(len(b), len(a))) if b[i] != a[i]), None)
    ctx = '' if k is None else repr(b[max(0, k - 40):k + 40]) + ' -> ' + repr(a[max(0, k - 40):k + 40])
    print(f"  /{h}: 描画される HTML(script の中身を除く) {len(db)} 字 → {len(da)} 字 {'○ 完全一致' if db == da else '× 差あり'} / 全体(RSC ペイロード込み): {'一致' if b == a else '差(最初の違い) ' + ctx}")
print("# §1 検証 2・4: /jukyuugo")
b = open(f'{B}/jukyuugo.html', encoding='utf-8').read(); a = open(f'{A}/jukyuugo.html', encoding='utf-8').read()
def cards(t): return [m.start() for m in re.finditer(r'class="hub-card"', t)]
def h2pos(t):
    m = re.search(r'<h2[^>]*>数字で見る、受給が始まってから', t); return m.start() if m else -1
def ld(t):
    for m in re.finditer(r'<script type="application/ld\+json">(.*?)</script>', t, flags=re.S):
        j = json.loads(m.group(1).replace('\\u003c', '<'))
        if j.get('@type') == 'CollectionPage': return j
ca, cb = cards(a), cards(b); ha, hb = h2pos(a), h2pos(b)
print(f"  hub-card 変更前 {len(cb)} 枚(数字で見る h2 の前 {sum(1 for p in cb if p < hb)} / 後 {sum(1 for p in cb if p > hb)}) → 変更後 {len(ca)} 枚(前 {sum(1 for p in ca if p < ha)} / 後 {sum(1 for p in ca if p > ha)}) 重複 {max(0, len(ca) - 5)}")
lh = re.search(r'<h2 class="hub-index-h2" id="list-heading">([^<]*)</h2>', a)
tl = a.find('id="timeline-heading"')
print(f"  見出し: {lh.group(1) if lh else '(無し)'} / 位置 年表 h2 < 一覧 h2 < 数字で見る h2: {tl < (lh.start() if lh else -1) < ha}")
la, lb = ld(a), ld(b)
print(f"  CollectionPage JSON-LD 変更前後で一致: {la == lb} / ItemList {la['mainEntity']['numberOfItems']}件: {[i['name'] for i in la['mainEntity']['itemListElement']]}")
EMPTY = '<section class="p-section"><div class="p-container"></div></section>'
print(f"  下の空の p-section: {a.count(EMPTY)}")
