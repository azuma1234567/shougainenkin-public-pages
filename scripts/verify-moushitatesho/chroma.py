#!/usr/bin/env python3
"""紙の上に、様式の線と自分たちの文字以外のインクが無いか(設計 §9-2 の9 / 指示書3 §3)。

  echo '{"files":["a.png"],"pdfs":["b.pdf"]}' | /usr/bin/python3 chroma.py

許すのは (a) 白 (b) 無彩色(R,G,B の最大差 ≤ 12。様式の #231f20 と本文の #111、そのアンチエイリアス)
の2つだけ。有彩色の画素が1つでもあれば、色と座標と件数を返す。
PDF は 300dpi で描画してから見る(本物の印刷経路)。

numpy を使う。この環境では anaconda の numpy が壊れているので /usr/bin/python3 で動かすこと。
"""
import json, sys
import fitz
import numpy as np

TOL = 12
DPI = 300


def scan(pm, allow=None, mm_per_px=None):
    """allow: 文字を書いてよい枠(mm)の一覧。その中の有彩色は「利用者が打った字」として別に数える。"""
    if pm.alpha:
        pm = fitz.Pixmap(fitz.csRGB, pm)
    a = np.frombuffer(pm.samples, dtype=np.uint8).reshape(pm.height, pm.width, pm.n)[:, :, :3].astype(np.int16)
    spread = a.max(axis=2) - a.min(axis=2)
    mask = spread > TOL
    total = int(mask.sum())
    out = {"total": total, "inSlots": 0, "size": [pm.width, pm.height], "colors": []}
    if not total:
        return out
    if allow and mm_per_px:
        inside = np.zeros(mask.shape, dtype=bool)
        for r in allow:
            x0 = max(0, int(r["x0"] / mm_per_px)); x1 = min(pm.width, int(r["x1"] / mm_per_px) + 1)
            y0 = max(0, int(r["y0"] / mm_per_px)); y1 = min(pm.height, int(r["y1"] / mm_per_px) + 1)
            if x1 > x0 and y1 > y0:
                inside[y0:y1, x0:x1] = True
        out["inSlots"] = int((mask & inside).sum())
        mask = mask & ~inside
        out["total"] = total = int(mask.sum())
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
    allow = req.get("allow", {})
    for item in req.get("files", []):
        f = item["file"] if isinstance(item, dict) else item
        pm = fitz.Pixmap(f)
        mmpp = (item.get("paperMm") / pm.width) if isinstance(item, dict) and item.get("paperMm") else None
        out[f] = scan(pm, allow.get(item.get("sheet")) if isinstance(item, dict) else None, mmpp)
    for f in req.get("pdfs", []):
        pages = []
        doc = fitz.open(f)
        for i, p in enumerate(doc):
            pm = p.get_pixmap(matrix=fitz.Matrix(DPI / 72, DPI / 72), colorspace=fitz.csRGB, alpha=False)
            names = req.get("pdfSheets", {}).get(f) or []
            sheet = names[i] if i < len(names) else None
            mmpp = (p.rect.width / 72 * 25.4) / pm.width
            pages.append(scan(pm, allow.get(sheet), mmpp))
        out[f] = {"total": sum(p["total"] for p in pages),
                  "inSlots": sum(p.get("inSlots", 0) for p in pages), "pages": pages}
    json.dump(out, sys.stdout)


if __name__ == "__main__":
    main()
