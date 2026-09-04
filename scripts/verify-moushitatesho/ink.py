#!/usr/bin/env python3
"""公式様式の「実際に紙に出るインク」と、こちらが描いた文字が重なるかを見る。

  echo '{"main-front":[{"id":"..","x0":..,"y0":..,"x1":..,"y1":..}]}' | python3 ink.py

設計 §9-2 の2番は、印字の矩形を PDF のオブジェクト一覧から採る想定だった。
しかし 01.pdf は**クリップされて描画されない図形**を content stream に持っており
(年・月・日の空欄の中にも黒い塗り図形の記述がある。実際には描かれない)、
オブジェクト一覧で判定すると偽の衝突が出る。
そこで「レンダリングした画素」を正とする。人が紙で見るものと同じ。
"""
import json, sys
import fitz

DPI = 300
PAGES = {"main-front": ("docs/forms/moushitatesho/01.pdf", 0),
         "main-back": ("docs/forms/moushitatesho/01.pdf", 1),
         "cont-front": ("docs/forms/moushitatesho/03.pdf", 0),
         "cont-back": ("docs/forms/moushitatesho/03.pdf", 1)}
INK = 200          # これより暗い画素をインクとみなす
MARGIN_MM = 0.05   # 触れているだけは許す(境界の丸め)
GAP_MM = 2.0       # これ以上の白で切れていたら別の字(隣の「・」までは6mm、字と字の間は最大1mm程度)

_cache = {}


def sheet_ink(sheet):
    if sheet not in _cache:
        src, page = PAGES[sheet]
        p = fitz.open(src)[page]
        zoom = DPI / 72
        pm = p.get_pixmap(matrix=fitz.Matrix(zoom, zoom), colorspace=fitz.csGRAY, alpha=False)
        _cache[sheet] = (pm, DPI / 25.4)      # 画素/mm
    return _cache[sheet]


def hits(sheet, r):
    pm, ppm = sheet_ink(sheet)
    x0 = int((r["x0"] + MARGIN_MM) * ppm); x1 = int((r["x1"] - MARGIN_MM) * ppm)
    y0 = int((r["y0"] + MARGIN_MM) * ppm); y1 = int((r["y1"] - MARGIN_MM) * ppm)
    x0, y0 = max(0, x0), max(0, y0)
    x1, y1 = min(pm.width - 1, x1), min(pm.height - 1, y1)
    if x1 <= x0 or y1 <= y0:
        return 0
    s, w = pm.samples, pm.width
    n = 0
    for y in range(y0, y1 + 1):
        row = y * w
        for x in range(x0, x1 + 1):
            if s[row + x] < INK:
                n += 1
    return n


def ink_bbox(sheet, r):
    """窓の中のインクの外接矩形(mm)。何も無ければ None。§9-2 の4番に使う。"""
    pm, ppm = sheet_ink(sheet)
    x0 = max(0, int(r["x0"] * ppm)); x1 = min(pm.width - 1, int(r["x1"] * ppm))
    y0 = max(0, int(r["y0"] * ppm)); y1 = min(pm.height - 1, int(r["y1"] * ppm))
    s, w = pm.samples, pm.width
    bx0 = by0 = 10 ** 9; bx1 = by1 = -1
    for y in range(y0, y1 + 1):
        row = y * w
        for x in range(x0, x1 + 1):
            if s[row + x] < INK:
                if x < bx0: bx0 = x
                if x > bx1: bx1 = x
                if y < by0: by0 = y
                if y > by1: by1 = y
    if bx1 < 0:
        return None
    return {"x0": bx0 / ppm, "y0": by0 / ppm, "x1": (bx1 + 1) / ppm, "y1": (by1 + 1) / ppm}


def ellipse_bbox(sheet, r):
    """楕円の内側にあるインクの外接矩形(mm)。四角い窓だと隣の「・」まで拾ってしまうので、
    楕円の内側だけを見る。§9-2 の4番。"""
    pm, ppm = sheet_ink(sheet)
    cx, cy, rx, ry = r["cx"] * ppm, r["cy"] * ppm, r["rx"] * ppm, r["ry"] * ppm
    x0 = max(0, int(cx - rx)); x1 = min(pm.width - 1, int(cx + rx))
    y0 = max(0, int(cy - ry)); y1 = min(pm.height - 1, int(cy + ry))
    s, w = pm.samples, pm.width
    # 楕円の内側で、列ごとにインクがあるかを見る
    cols = {}
    for y in range(y0, y1 + 1):
        dy = (y + 0.5 - cy) / ry
        if abs(dy) > 1: continue
        half = rx * (1 - dy * dy) ** 0.5
        for x in range(max(x0, int(cx - half)), min(x1, int(cx + half)) + 1):
            if s[y * w + x] < INK:
                a, b = cols.get(x, (10 ** 9, -1))
                cols[x] = (min(a, y), max(b, y))
    if not cols:
        return None
    # 中心にいちばん近い塊だけを採る。0.8mm 以上の白で切れていたら別の字(隣の「・」など)。
    gap = max(1, int(GAP_MM * ppm))
    center = min(cols, key=lambda x: abs(x + 0.5 - cx))
    keep = [center]
    x = center
    while True:
        nxt = [c for c in cols if 0 < c - x <= gap]
        if not nxt: break
        x = min(nxt); keep.append(x)
    x = center
    while True:
        prv = [c for c in cols if 0 < x - c <= gap]
        if not prv: break
        x = max(prv); keep.append(x)
    bx0, bx1 = min(keep), max(keep)
    by0 = min(cols[c][0] for c in keep); by1 = max(cols[c][1] for c in keep)
    return {"x0": bx0 / ppm, "y0": by0 / ppm, "x1": (bx1 + 1) / ppm, "y1": (by1 + 1) / ppm}


def gap_center(sheet, r):
    """帯(y0..y1)の中で、cx を含むインクの無い横方向の隙間の中央(mm)。§9-2 の3番に使う。"""
    pm, ppm = sheet_ink(sheet)
    y0 = max(0, int(r["y0"] * ppm)); y1 = min(pm.height - 1, int(r["y1"] * ppm))
    xa = max(0, int(r["x0"] * ppm)); xb = min(pm.width - 1, int(r["x1"] * ppm))
    s, w = pm.samples, pm.width
    col_ink = []
    for x in range(xa, xb + 1):
        has = False
        for y in range(y0, y1 + 1):
            if s[y * w + x] < INK:
                has = True; break
        col_ink.append(has)
    cx = int(r["cx"] * ppm) - xa
    if cx < 0 or cx >= len(col_ink) or col_ink[cx]:
        return None
    left = cx
    while left > 0 and not col_ink[left - 1]:
        left -= 1
    right = cx
    while right < len(col_ink) - 1 and not col_ink[right + 1]:
        right += 1
    return {"center": (xa + (left + right + 1) / 2) / ppm,
            "from": (xa + left) / ppm, "to": (xa + right + 1) / ppm}


def main():
    req = json.load(sys.stdin)
    out = {}
    for sheet, items in req.items():
        if sheet not in PAGES:
            continue
        res = []
        for r in items:
            mode = r.get("mode", "ink")
            if mode == "ink":
                res.append({"id": r["id"], "ink": hits(sheet, r)})
            elif mode == "ellipse":
                res.append({"id": r["id"], "bbox": ellipse_bbox(sheet, r)})
            elif mode == "bbox":
                res.append({"id": r["id"], "bbox": ink_bbox(sheet, r)})
            elif mode == "gap":
                res.append({"id": r["id"], "gap": gap_center(sheet, r)})
        out[sheet] = res
    json.dump(out, sys.stdout)


if __name__ == "__main__":
    main()
