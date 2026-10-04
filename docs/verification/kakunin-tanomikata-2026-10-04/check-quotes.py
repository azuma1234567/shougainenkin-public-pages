# 引用の突き合わせ。A: 記載要領 04-3.pdf の原文4か所(jittai-chigau と同じ文字列か)。B: 機構の医師向けページ sakusei.html の2文と記載要領冒頭の1文。
#   python3 docs/verification/kakunin-tanomikata-2026-10-04/check-quotes.py kisai-04-3.pdf sakusei.html
import sys, re, html, unicodedata, fitz
nz = lambda s: unicodedata.normalize("NFKC", re.sub(r"\s+", "", s))
pdf = nz("".join(p.get_text() for p in fitz.open(sys.argv[1])))
page = nz(html.unescape(re.sub(r"<[^>]+>", "", open(sys.argv[2], encoding="utf8", errors="ignore").read())))
jit = open("docs/columns-rewrite-2026-09-03/articles/shindansho-jittai-chigau.md", encoding="utf8").read()
print("## A shindansho-kakunin")
md = open("docs/columns-rewrite-2026-09-03/articles/shindansho-kakunin.md", encoding="utf8").read()
for q in [l[2:].strip() for l in md.split("\n") if l.startswith("> ")]:
    print(("○" if nz(q) in pdf else "×") + " 04-3.pdf", ("○" if q in jit else "×") + " jittai-chigau と同文", "|", q[:40] + "…")
q11 = "相互の関係が必ずしも整合しない場合には、その理由を⑪欄にできるだけ具体的に記載してください"
print(("○" if nz(q11) in pdf else "×") + " 04-3.pdf", "| ⑪欄:", q11[:40] + "…", "(記事内:", "○" if q11 in md else "×", ")")
for k in ["陳述者の氏名", "義姉", "聴取年月日"]: print(("○" if k in pdf else "×"), "04-3.pdf |", k, "(記事内:", "○" if k in md else "×", ")")
print("\n## B shindansho-tanomikata")
md = open("docs/columns-rewrite-2026-09-03/articles/shindansho-tanomikata.md", encoding="utf8").read()
for q in [l[2:].strip() for l in md.split("\n") if l.startswith("> ")]:
    print(("○ sakusei.html 原文どおり" if nz(q) in page else ("○ 04-3.pdf" if nz(q) in pdf else "×")), "|", q[:46] + "…")
for q in ["作成していただく診断書の内容ができるかぎり詳細かつ具体的に記載されていることが大変重要になります", "オンライン診療の場合でも、「診断書記載要領」の必要事項が記入できる場合は、障害年金の診断書を作成していただけます"]:
    src = "04-3.pdf" if nz(q) in pdf else ("sakusei.html" if nz(q) in page else "×")
    print(("○ " + src) if src != "×" else "×", "|", q[:40] + "…", "(記事内:", "○" if q in md else "×", ")")
i = page.find("更新日"); print("sakusei.html の更新日:", page[i:i + 16])
