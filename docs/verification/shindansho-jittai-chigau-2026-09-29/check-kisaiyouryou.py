# 検証2: 記載要領 PDF(https://www.nenkin.go.jp/shinsei/jukyu/shougai/shindansho/20140421-23.files/04-3.pdf)の本文と、記事の引用6か所を突き合わせる。
# PDF は全角英数・全角括弧なので NFKC で正規化し、空白を除いて比較する。
#   curl -sL -A Mozilla/5.0 -o kisai-04-3.pdf <URL> && python3 docs/verification/shindansho-jittai-chigau-2026-09-29/check-kisaiyouryou.py kisai-04-3.pdf
import sys, re, unicodedata, fitz
doc = fitz.open(sys.argv[1]); t = unicodedata.normalize("NFKC", re.sub(r"\s+", "", "".join(p.get_text() for p in doc)))
print(f"PDF: {len(doc)} ページ、{len(t)} 字(空白除く)")
md = open("docs/columns-rewrite-2026-09-03/articles/shindansho-jittai-chigau.md", encoding="utf8").read()
quotes = [l[2:].strip() for l in md.split("\n") if l.startswith("> ")]
print(f"記事の引用(> 行): {len(quotes)} 件")
for q in quotes:
    qn = unicodedata.normalize("NFKC", q).replace(" ", "")
    print(("○" if qn in t else "×"), q[:44] + ("…" if len(q) > 44 else ""))
for label, q in [("様式の見出し", "判断にあたっては、単身で生活するとしたら可能かどうかで判断してください"), ("陳述者欄", "陳述者の氏名"), ("記載例の陳述者", "義姉"), ("聴取年月日", "聴取年月日"), ("就労の援助・配慮", "援助や配慮"), ("休職の時期", "休職")]:
    print(("○" if unicodedata.normalize("NFKC", q) in t else "×"), label, "|", q)
print("「厚労省の記載要領」の残り:", md.count("厚労省の記載要領"))
