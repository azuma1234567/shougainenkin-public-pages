#!/usr/bin/env python3
"""紙の上に、様式の線と自分たちの文字以外のインクが無いか(設計 §9-2 の9 / 指示書3 §3)。

  echo '{"files":["a.png"],"pdfs":["b.pdf"]}' | /usr/bin/python3 chroma.py

許すのは (a) 白 (b) 無彩色(R,G,B の最大差 ≤ 12。様式の #231f20 と本文の #111、そのアンチエイリアス)
の2つだけ。**例外は作らない**(指示書3 §7)。有彩色の画素が1つでもあれば、色と座標と件数を返す。
PDF は 300dpi で描画してから見る(本物の印刷経路)。

numpy を使う。この環境では anaconda の numpy が壊れているので /usr/bin/python3 で動かすこと。
"""
import json, sys
import fitz
import numpy as np

TOL = 12
DPI = 300


def scan(pm):
    if pm.alpha:
        pm = fitz.Pixmap(fitz.csRGB, pm)
    a = np.frombuffer(pm.samples, dtype=np.uint8).reshape(pm.height, pm.width, pm.n)[:, :, :3].astype(np.int16)
    spread = a.max(axis=2) - a.min(axis=2)
    mask = spread > TOL
    total = int(mask.sum())
    out = {"total": total, "size": [pm.width, pm.height], "colors": []}
    if not total:
        return out
    ys, xs = np.nonzero(mask)
    px = a[ys, xs]
    # 色ごとにまとめる(上位6色)
    key = (px[:, 0].astype(np.int32) << 16) | (px[:, 1].astype(np.int32) << 8) | px[:, 2].astype(np.int32)
    uniq, inv, counts = np.unique(key, return_inverse=True, return_counts=True)
    for idx in np.argsort(-counts)[:6]:
        sel = inv == idx
        v = int(uniq[idx])
        out["colors"].append({
            "color": f"{(v >> 16) & 255},{(v >> 8) & 255},{v & 255}",
            "n": int(counts[idx]),
            "x0": int(xs[sel].min()), "x1": int(xs[sel].max()),
            "y0": int(ys[sel].min()), "y1": int(ys[sel].max()),
        })
    return out


def main():
    req = json.load(sys.stdin)
    out = {}
    for item in req.get("files", []):
        f = item["file"] if isinstance(item, dict) else item
        out[f] = scan(fitz.Pixmap(f))
    for f in req.get("pdfs", []):
        pages = []
        for p in fitz.open(f):
            pages.append(scan(p.get_pixmap(matrix=fitz.Matrix(DPI / 72, DPI / 72),
                                           colorspace=fitz.csRGB, alpha=False)))
        out[f] = {"total": sum(p["total"] for p in pages), "pages": pages}
    json.dump(out, sys.stdout)


if __name__ == "__main__":
    main()
