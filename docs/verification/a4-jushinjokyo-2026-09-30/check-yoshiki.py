# 検証1: 機構の様式 PDF 2 本と、記事の引用・参考資料の項目・確認先を突き合わせる。
#   受診状況等証明書:            https://www.nenkin.go.jp/shinsei/jukyu/shougai/shindansho/20140421-20.files/0000012239XWI83snsjt.pdf
#   添付できない申立書:          https://www.nenkin.go.jp/shinsei/jukyu/shougai/shindansho/20140421-20.files/0000012240LLUrWQRKWy.pdf
# PDF は全角数字・全角括弧で、日付欄の空白もあるので、空白を除き NFKC で正規化して比較する(原文どおりの一致かも別に見る)。
#   python3 docs/verification/a4-jushinjokyo-2026-09-30/check-yoshiki.py <証明書.pdf> <申立書.pdf>
import sys, re, unicodedata, fitz
def load(p):
    raw = re.sub(r"\s+", "", "".join(pg.get_text() for pg in fitz.open(p))); return raw, unicodedata.normalize("NFKC", raw)
raw1, n1 = load(sys.argv[1]); raw2, n2 = load(sys.argv[2])
nz = lambda s: unicodedata.normalize("NFKC", re.sub(r"\s+", "", s))
md = open("docs/columns-rewrite-2026-09-03/articles/jushinjokyo-shomeisho.md", encoding="utf8").read()
quotes = [l[2:].strip() for l in md.split("\n") if l.startswith("> ")]
print("## 引用(> 行)と 受診状況等証明書の様式")
for q in quotes:
    rawhit = re.sub(r"\s+", "", q) in raw1; normhit = nz(q) in n1
    print(("○ 原文どおり" if rawhit else ("○ 正規化で一致(原文は全角数字・全角括弧)" if normhit else "×")), "|", q[:46] + "…")
print("\n## 参考資料の項目(添付できない申立書の様式)")
items = ["身体障害者手帳・療育手帳・精神障害者保健福祉手帳", "身体障害者手帳等の申請時の診断書", "生命保険・損害保険・労災保険の給付申請時の診断書", "事業所等の健康診断の記録", "母子健康手帳", "健康保険の給付記録(レセプトも含む)", "お薬手帳・糖尿病手帳・領収書・診察券(可能な限り診察日や診療科が分かるもの)", "小学校・中学校等の健康診断の記録や成績通知表", "盲学校・ろう学校の在学証明・卒業証書", "第三者証明", "交通事故証明", "インフォームド・コンセントによる医療情報サマリー", "次の受診医療機関への紹介状", "電子カルテ等の記録", "新聞記事"]
for it in items:
    inmd = it in md; inpdf = nz(it) in n2
    print(("○" if inmd and inpdf else "×"), it, "" if inpdf else "(PDF に無い)", "" if inmd else "(記事に無い)")
boxes = n2.count("□"); print(f"様式のチェック欄(□)の数: {boxes}")
i = n2.find("お持ちでない場合"); j = n2.find("添付できる参考資料は何もない", i + 30); print("様式の参考資料欄(原文):", n2[i:j + 16][:600])
print("\n## 確認先(裏面)")
for a, b in [("身体障害者手帳等の申請時の診断書", "市区町村の障害福祉の窓口"), ("生命保険・損害保険・労災保険の給付申請時の診断書", "労働基準監督署"), ("事業所等の健康診断の記録", "当時勤務していた事業所"), ("健康保険の給付記録", "協会けんぽ")]:
    print(("○" if nz(a) in n2 and nz(b) in n2 else "×"), a, "⇒", b)
