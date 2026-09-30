# 検証1: 機構「記載要領(病歴・就労状況等申立書)」PDF(https://www.nenkin.go.jp/shinsei/jukyu/shougai/shindansho/20140516.files/05.pdf)と、記事の引用(> 行)を突き合わせる。
# 原文は全角の「1～5」「3～5年」「〇」。まず原文どおり(空白のみ除く)で比較し、合わなければ NFKC 正規化で比較する。
#   curl -sL -A Mozilla/5.0 -o kisai-05.pdf <URL> && python3 docs/verification/moushitatesho-kikan-kugiri-2026-09-30/check-kisaiyouryou.py kisai-05.pdf
import sys, re, unicodedata, fitz
doc = fitz.open(sys.argv[1]); raw = re.sub(r"\s+", "", "".join(p.get_text() for p in doc)); norm = unicodedata.normalize("NFKC", raw)
print(f"PDF: {len(doc)} ページ、{len(raw)} 字(空白除く)")
md = open("docs/columns-rewrite-2026-09-03/articles/moushitatesho-kikan-kugiri.md", encoding="utf8").read()
quotes = [l[2:].strip() for l in md.split("\n") if l.startswith("> ")]
print(f"記事の引用(> 行): {len(quotes)} 件")
for q in quotes:
    q0 = q.replace(" ", "")
    if q0 in raw: print("○ 原文一致 |", q[:50] + "…")
    else:
        # 文ごとに分けて原文にあるか(原文では見出し「医療機関に受診していなかった期間」が2文の間に入る)
        parts = [s + "。" for s in q0.split("。") if s]
        ok = all(p in raw for p in parts)
        print(("△ 文ごとに原文一致(原文では文の間に欄の見出しが入る)" if ok else "×") + " |", q[:50] + "…")
for label, q in [("裏面 障害認定日頃", "障害認定日頃"), ("裏面 現在(請求日頃)", "現在（請求日頃）"), ("1年以上離れている", "1年以上"), ("主治医に確認する必要はありません", "主治医に確認する必要はありません"), ("休職中の理由", "休職中だった場合にも理由を記入してください"), ("簡素化 令和2年10月", "令和2年10月"), ("No.1－2枚中", "No.1－2枚中")]:
    print(("○" if unicodedata.normalize("NFKC", q) in norm else "×"), label)
print("「70.3」の残り:", md.count("70.3"))
