# 検証2: 厚生労働省「令和6年度工賃(賃金)の実績について」(https://www.mhlw.go.jp/content/12200000/001637154.pdf、別紙1・3・4)の本文から、
# 記事の都道府県別20値・全国値・推移・比率・修正注記を確かめる。数値の前後の文字列で都道府県名との対応も見る。
#   curl -sL -A Mozilla/5.0 -o kougin-r06.pdf <URL> && python3 docs/verification/kougin-nenkin-tedori-2026-09-30/check-mhlw.py kougin-r06.pdf
import sys, re, unicodedata, fitz
doc = fitz.open(sys.argv[1]); t = unicodedata.normalize("NFKC", re.sub(r"\s+", "", "".join(p.get_text() for p in doc)))
print(f"PDF: {len(doc)} ページ、{len(t)} 字")
pairs = [("B型 全国平均", None, "24,141"), ("B型 前年比", None, "106.6"), ("B型 事業所数", None, "18,245"), ("A型 全国平均", None, "91,451"), ("A型 事業所数", None, "4,220"), ("A型 前年比", None, "105.4"),
  ("令和5年度 修正後", None, "22,649"), ("令和5年度 当初", None, "23,053"), ("平成24年度 B型", None, "14,190"),
  ("B上位1", "徳島県", "30,231"), ("B上位2", "福井県", "30,022"), ("B上位3", "島根県", "29,304"), ("B上位4", "高知県", "28,296"), ("B上位5", "宮崎県", "28,026"),
  ("B下位1", "大阪府", "19,747"), ("B下位2", "山形県", "19,621"), ("B下位3", "秋田県", "20,221"), ("B下位4", "兵庫県", "20,664"), ("B下位5", "茨城県", "21,399"),
  ("A上位1", "東京都", "111,818"), ("A上位2", "広島県", "107,968"), ("A上位3", "島根県", "107,724"), ("A上位4", "高知県", "102,740"), ("A上位5", "和歌山県", "101,751"),
  ("A下位1", "秋田県", "73,802"), ("A下位2", "宮崎県", "78,410"), ("A下位3", "群馬県", "82,046"), ("A下位4", "栃木県", "83,038"), ("A下位5", "沖縄県", "83,114")]
bad = 0
for label, pref, v in pairs:
    hits = [m.start() for m in re.finditer(re.escape(v), t)]
    if not hits: print("×", label, v, "PDF に無い"); bad += 1; continue
    if pref:
        ok = any(pref in t[max(0, i - 30):i] for i in hits)   # 都道府県名は数値の直前(R5値, R6値 の並び)
        print(("○" if ok else "△"), label, pref, v, "" if ok else "(都道府県名が直前に無い)"); bad += 0 if ok else 1
    else: print("○", label, v, f"{len(hits)} 回")
print(f"\n不一致 {bad}")
md = open("docs/columns-rewrite-2026-09-03/articles/kougin-nenkin-tedori.md", encoding="utf8").read()
for w in ["X", "投稿", "表示回数", "万回", "知恵袋", "動画", "クリニック"]: print(f"正本の「{w}」: {md.count(w)}")
