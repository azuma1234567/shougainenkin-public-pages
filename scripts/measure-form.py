#!/usr/bin/env python3
"""公式様式PDFの罫線・印字の座標を mm で測る(設計書 §9-1)。

  python3 scripts/measure-form.py docs/forms/moushitatesho/03.pdf --page 1
  python3 scripts/measure-form.py docs/forms/moushitatesho/01.pdf --glyphs out.json

設計書は pdfplumber を指定しているが、この環境では pip が壊れていて入らないため
PyMuPDF(fitz)でも同じものを取れるようにしてある。どちらでも同じ数値が出る
(どちらも PDF のユーザー空間 pt をそのまま読み、72pt=25.4mm で mm に直すだけ)。

出すもの:
  lines  … 罫線(縦・横)を mm で。列(x)と行(y)の一覧
  chars  … 実文字(元号など)の外接矩形
  words  … アウトライン文字(見出し)を「行」→「語」にまとめた外接矩形
           縦に重なる図形を1行にまとめ、2.2mm を超える横の隙間で語を切る
"""
import argparse, json, sys

MM = lambda pt: pt / 72 * 25.4
R1 = lambda v: round(v, 1)
R2 = lambda v: round(v, 2)
WORD_GAP_MM = 2.2      # これより広い隙間で語を切る(設計書 §9-1)
LINE_OVERLAP = 0.5     # 縦にこれだけ重なっていれば同じ行とみなす(mm)
RULE_MM = 0.8          # 短辺がこれ未満の塗り矩形は罫線とみなす


def _load_pdfplumber(path, page_no):
    import pdfplumber
    pg = pdfplumber.open(path).pages[page_no]
    lines, rects, chars, shapes = [], [], [], []
    for l in pg.lines:
        lines.append((MM(l["x0"]), MM(l["top"]), MM(l["x1"]), MM(l["bottom"])))
    for r in pg.rects:
        box = (MM(r["x0"]), MM(r["top"]), MM(r["x1"]), MM(r["bottom"]))
        # 罫線は「細い塗り矩形」で描かれている(01.pdf / 03.pdf とも)
        (lines if min(box[2] - box[0], box[3] - box[1]) < RULE_MM else rects).append(box)
    for c in pg.chars:
        if not c["text"].strip():
            continue
        chars.append({"t": c["text"], "x0": MM(c["x0"]), "y0": MM(c["top"]),
                      "x1": MM(c["x1"]), "y1": MM(c["bottom"])})
    for c in pg.curves:
        shapes.append((MM(c["x0"]), MM(c["top"]), MM(c["x1"]), MM(c["bottom"])))
    return MM(pg.width), MM(pg.height), lines, rects, chars, shapes


def _load_fitz(path, page_no):
    import fitz
    pg = fitz.open(path)[page_no]
    lines, rects, chars, shapes = [], [], [], []
    for d in pg.get_drawings():
        for item in d["items"]:
            op = item[0]
            if op == "l":
                p, q = item[1], item[2]
                lines.append((MM(p.x), MM(p.y), MM(q.x), MM(q.y)))
            elif op == "re":
                r = item[1]
                box = (MM(r.x0), MM(r.y0), MM(r.x1), MM(r.y1))
                # 罫線は「細い塗り矩形」で描かれている(01.pdf / 03.pdf とも)。
                # 短辺が RULE_MM 未満なら線として扱う。
                if min(box[2] - box[0], box[3] - box[1]) < RULE_MM:
                    lines.append(box)
                else:
                    rects.append(box)
            else:
                r = d["rect"]
                shapes.append((MM(r.x0), MM(r.y0), MM(r.x1), MM(r.y1)))
    raw = pg.get_text("rawdict")
    for block in raw.get("blocks", []):
        for line in block.get("lines", []):
            for span in line.get("spans", []):
                for ch in span.get("chars", []):
                    x0, y0, x1, y1 = ch["bbox"]
                    if ch["c"].strip():
                        chars.append({"t": ch["c"], "x0": MM(x0), "y0": MM(y0),
                                      "x1": MM(x1), "y1": MM(y1)})
    return MM(pg.rect.width), MM(pg.rect.height), lines, rects, chars, shapes


def load(path, page_no):
    try:
        return _load_pdfplumber(path, page_no), "pdfplumber"
    except ImportError:
        return _load_fitz(path, page_no), "pymupdf"


def group_words(shapes):
    """アウトライン文字の外接矩形を、行にまとめてから語に切る(設計書 §9-1)。"""
    boxes = sorted(shapes, key=lambda b: (b[1], b[0]))
    rows = []
    for b in boxes:
        placed = False
        for row in rows:
            top = max(row["y0"], b[1]); bot = min(row["y1"], b[3])
            if bot - top > LINE_OVERLAP:
                row["y0"] = min(row["y0"], b[1]); row["y1"] = max(row["y1"], b[3])
                row["items"].append(b); placed = True; break
        if not placed:
            rows.append({"y0": b[1], "y1": b[3], "items": [b]})
    out = []
    for row in sorted(rows, key=lambda r: r["y0"]):
        items = sorted(row["items"], key=lambda b: b[0])
        cur = None
        for b in items:
            if cur and b[0] - cur["x1"] <= WORD_GAP_MM:
                cur["x1"] = max(cur["x1"], b[2])
                cur["y0"] = min(cur["y0"], b[1]); cur["y1"] = max(cur["y1"], b[3])
                cur["n"] += 1
            else:
                if cur: out.append(cur)
                cur = {"x0": b[0], "y0": b[1], "x1": b[2], "y1": b[3], "n": 1}
        if cur: out.append(cur)
    return out


def uniq(values, tol=0.15):
    out = []
    for v in sorted(values):
        if not out or v - out[-1] > tol:
            out.append(v)
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("pdf")
    ap.add_argument("--page", type=int, default=1, help="1始まり")
    ap.add_argument("--json", help="測った値をJSONで書き出す")
    ap.add_argument("--glyphs", help="印字(実文字+アウトライン語)の矩形だけをJSONで書き出す")
    args = ap.parse_args()

    (w, h, lines, rects, chars, shapes), engine = load(args.pdf, args.page - 1)
    words = group_words(shapes)
    verts = uniq([(l[0] + l[2]) / 2 for l in lines if abs(l[2] - l[0]) < RULE_MM])
    horis = uniq([(l[1] + l[3]) / 2 for l in lines if abs(l[3] - l[1]) < RULE_MM])

    print(f"# {args.pdf} p.{args.page}  ({engine})")
    print(f"用紙 {R2(w)} x {R2(h)} mm / 線 {len(lines)} 矩形 {len(rects)} 実文字 {len(chars)} 図形 {len(shapes)} → 語 {len(words)}")
    print(f"\n## 縦線 x (mm, {len(verts)}本)\n" + ", ".join(str(R2(v)) for v in verts))
    print(f"\n## 横線 y (mm, {len(horis)}本)\n" + ", ".join(str(R2(v)) for v in horis))
    if chars:
        print(f"\n## 実文字 ({len(chars)})")
        for c in chars:
            print(f"  {c['t']!r} x {R2(c['x0'])}–{R2(c['x1'])}  y {R2(c['y0'])}–{R2(c['y1'])}")
    print(f"\n## アウトライン文字の語 ({len(words)})")
    for wd in words:
        print(f"  x {R2(wd['x0'])}–{R2(wd['x1'])}  y {R2(wd['y0'])}–{R2(wd['y1'])}  (図形{wd['n']})")

    if args.json:
        json.dump({"pdf": args.pdf, "page": args.page, "engine": engine,
                   "paper": [R2(w), R2(h)], "verticals": [R2(v) for v in verts],
                   "horizontals": [R2(v) for v in horis],
                   "chars": [{k: (v if k == "t" else R2(v)) for k, v in c.items()} for c in chars],
                   "words": [{k: R2(v) for k, v in wd.items() if k != "n"} for wd in words]},
                  open(args.json, "w"), ensure_ascii=False, indent=1)
        print(f"\n→ {args.json}")
    if args.glyphs:
        glyphs = [{"x0": R2(c["x0"]), "y0": R2(c["y0"]), "x1": R2(c["x1"]), "y1": R2(c["y1"]), "t": c["t"]} for c in chars]
        glyphs += [{"x0": R2(wd["x0"]), "y0": R2(wd["y0"]), "x1": R2(wd["x1"]), "y1": R2(wd["y1"])} for wd in words]
        json.dump(glyphs, open(args.glyphs, "w"), ensure_ascii=False)
        print(f"\n→ {args.glyphs} ({len(glyphs)} 件)")


if __name__ == "__main__":
    sys.exit(main())
