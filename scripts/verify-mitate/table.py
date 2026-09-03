#!/usr/bin/env python3
"""原本PDFの表1を x 座標で読み直し、data/mitate.ts の MITATE_GRADE_TABLE と照合する。

PDFのテキスト抽出は空欄セルが落ちて行の値が左へ詰まるため、抽出順を信じてはいけない
(docs/mitate-tool-design-2026-09-02.md §5-3)。語の x 座標を列の中心へ割り当てる。
セル内が「１級/又は/２級」のように分かれるので、行ごとに近い語をまとめてから中心を出す。

  python3 scripts/verify-mitate/table.py <guideline.pdf>
"""
import json, sys
import fitz

COL_CENTERS = {5: 172.6, 4: 253.9, 3: 335.2, 2: 416.6, 1: 497.9}
ROWS = ["3.5以上", "3.0以上3.5未満", "2.5以上3.0未満", "2.0以上2.5未満", "1.5以上2.0未満", "1.5未満"]
ZEN = str.maketrans("０１２３４５６７８９ＡＢ（）", "0123456789AB()")

def norm(s):
    return s.replace(" ", "").replace("　", "").translate(ZEN)

def main(path):
    page = fitz.open(path)[6]  # PDF 7ページ目 / 紙面 -5-
    words = page.get_text("words")
    row_y = {}
    for w in words:
        t = norm(w[4])
        if t in ROWS and t not in row_y:
            row_y[t] = (w[1] + w[3]) / 2
    if len(row_y) != len(ROWS):
        raise SystemExit(f"行ラベルが揃わない: {sorted(row_y)}")

    # 行ごとに、行ラベルより右にある語を集めて、隣どうしが近いものを1セルにまとめる
    table = {}
    for row in ROWS:
        y = row_y[row]
        ws = sorted([w for w in words if abs((w[1] + w[3]) / 2 - y) <= 8 and w[0] > 120], key=lambda w: w[0])
        cells, cur = [], []
        for w in ws:
            if cur and w[0] - cur[-1][2] > 6:
                cells.append(cur); cur = []
            cur.append(w)
        if cur: cells.append(cur)
        out = {d: None for d in range(1, 6)}
        for cell in cells:
            text = norm("".join(w[4] for w in cell))
            center = (cell[0][0] + cell[-1][2]) / 2
            col = min(COL_CENTERS, key=lambda k: abs(COL_CENTERS[k] - center))
            if abs(COL_CENTERS[col] - center) > 30:
                raise SystemExit(f"{row}: 「{text}」の中心 {center:.1f} がどの列にも寄らない")
            if out[col] is not None:
                raise SystemExit(f"{row}: 程度({col}) に2つの値 {out[col]} / {text}")
            out[col] = text
        table[row] = out
    print(json.dumps(table, ensure_ascii=False))

if __name__ == "__main__":
    main(sys.argv[1])
