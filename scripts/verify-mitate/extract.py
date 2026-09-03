#!/usr/bin/env python3
"""原本PDFから、照合用の素材を取り出して fixtures/ に書き出す。

  curl -sLo /tmp/guideline.pdf https://www.mhlw.go.jp/file/04-Houdouhappyou-12512000-Nenkinkyoku-Jigyoukanrika/0000130045.pdf
  python3 scripts/verify-mitate/extract.py /tmp/guideline.pdf

  table.json … 表1「障害等級の目安」を x 座標で読み直したもの(table.py と同じ手順)
  hyou2.txt  … 〔表２〕総合評価の際に考慮すべき要素の例(PDF 8〜12ページ)の全文、空白除去
"""
import json, re, sys
from pathlib import Path
import fitz
sys.path.insert(0, str(Path(__file__).parent))
from table import main as table_main  # noqa: E402

OUT = Path(__file__).parent / "fixtures"

def main(pdf):
    OUT.mkdir(exist_ok=True)
    import io, contextlib
    buf = io.StringIO()
    with contextlib.redirect_stdout(buf):
        table_main(pdf)
    (OUT / "table.json").write_text(json.dumps(json.loads(buf.getvalue()), ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    doc = fitz.open(pdf)
    text = "".join(doc[i].get_text() for i in range(7, 12))
    (OUT / "hyou2.txt").write_text(re.sub(r"\s+", "", text) + "\n", encoding="utf-8")
    print(f"wrote {OUT}/table.json, {OUT}/hyou2.txt")

if __name__ == "__main__":
    main(sys.argv[1])
