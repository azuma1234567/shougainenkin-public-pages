#!/usr/bin/env python3
"""公式様式PDF → 背景用SVG(設計書 §3-1)。

  python3 scripts/forms-to-svg.py

設計書は pdftocairo を指定しているが、この環境には poppler が入らなかったので
PyMuPDF で同じことをする(どちらも PDF のベクターをそのまま SVG にする。
様式の文字はもともとアウトライン化されているのでフォント埋め込みは不要)。
座標を小数1桁に丸めて容量を落とす(pt座標なので誤差は最大 0.018mm)。
width/height は mm で書き、viewBox は pt のまま残す。
"""
import os, re, sys
import fitz

MM = 25.4 / 72
OUT = "public/forms/moushitatesho"
JOBS = [("docs/forms/moushitatesho/01.pdf", 0, "main-1.svg", 297.0, 420.0),
        ("docs/forms/moushitatesho/01.pdf", 1, "main-2.svg", 297.0, 420.0),
        ("docs/forms/moushitatesho/03.pdf", 0, "cont-1.svg", 210.0, 297.0),
        ("docs/forms/moushitatesho/03.pdf", 1, "cont-2.svg", 210.0, 297.0)]

NUM = re.compile(r"-?\d+\.\d{2,}")
# 小数1桁に丸める。用紙は pt 座標(1pt=0.353mm)なので、丸め誤差は最大 0.018mm。
round1 = lambda m: (f"{float(m.group()):.1f}".rstrip("0").rstrip(".") or "0")


def shrink(svg):
    """見た目を変えずに容量だけ落とす。"""
    svg = re.sub(r"\n\s*", "\n", svg)            # 行頭の空白
    svg = re.sub(r"\n(?=[^<])", "", svg)          # タグ途中の改行
    # inkscape の名前空間は使わないので、宣言と属性の両方を落とす。
    # 宣言だけ消すと属性が未定義になり、ブラウザが XML エラーで描画をやめる。
    svg = svg.replace(' xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape"', "")
    svg = re.sub(r'\s+inkscape:[\w-]+="[^"]*"', "", svg)
    svg = re.sub(r' data-text="[^"]*"', "", svg)  # 読み上げ用の複製。背景画像には要らない
    # 同じ中身の clipPath をまとめる
    seen, alias = {}, {}
    def keep(m):
        cid, body = m.group(1), m.group(2)
        first = seen.setdefault(body, cid)
        if first != cid:
            alias[cid] = first
            return ""
        return m.group(0)
    svg = re.sub(r'<clipPath id="([^"]+)">(.*?)</clipPath>\n?', keep, svg, flags=re.S)
    if alias:
        svg = re.sub(r'url\(#([^)]+)\)', lambda m: f"url(#{alias.get(m.group(1), m.group(1))})", svg)
    svg = dedupe_paths(svg)
    # いちばん多い塗り色を <svg> に上げて、各要素からは消す
    fills = re.findall(r'fill="(#[0-9a-fA-F]{6})"', svg)
    if fills:
        main = max(set(fills), key=fills.count)
        if fills.count(main) > 50:
            svg = svg.replace(f' fill="{main}"', "")
            svg = svg.replace("<svg ", f'<svg fill="{main}" ', 1)
    return svg


def dedupe_paths(svg):
    """同じ形の <path d> を defs に1つだけ置き、残りは <use> にする。
    様式は同じ字(年・月・日・昭和…)を何度も使うので、これがいちばん効く。"""
    import collections
    PATH = r'<path([^>]*?)\bd="([^"]+)"([^>]*?)/>'
    counts = collections.Counter(d for _, d, _ in re.findall(PATH, svg))
    shared = {d: f"s{i}" for i, (d, n) in enumerate(counts.items()) if n > 1}
    if not shared:
        return svg

    def swap(m):
        before, d, after = m.group(1), m.group(2), m.group(3)
        gid = shared.get(d)
        if not gid:
            return m.group(0)
        rest = (before + after).rstrip()
        return f'<use xlink:href="#{gid}"{rest}/>'

    svg = re.sub(PATH, swap, svg)
    defs = "".join(f'<path id="{gid}" d="{d}"/>' for d, gid in shared.items())
    if "<defs>" in svg:
        svg = svg.replace("<defs>", "<defs>" + defs, 1)
    else:
        svg = re.sub(r"(<svg[^>]*>)", r"\1<defs>" + defs + "</defs>", svg, count=1)
    return svg


def build(src, page, name, w_mm, h_mm):
    pg = fitz.open(src)[page]
    svg = pg.get_svg_image(text_as_path=True)
    svg = NUM.sub(round1, svg)
    svg = shrink(svg)
    # width/height を mm にする。viewBox(pt)はそのまま残すので拡大率に依存しない。
    svg = re.sub(r'width="[\d.]+" height="[\d.]+"',
                 f'width="{w_mm}mm" height="{h_mm}mm"', svg, count=1)
    path = os.path.join(OUT, name)
    open(path, "w").write(svg)
    return path, os.path.getsize(path)


def main():
    os.makedirs(OUT, exist_ok=True)
    total = 0
    for src, page, name, w, h in JOBS:
        path, size = build(src, page, name, w, h)
        total += size
        print(f"{path}  {size/1024:.1f} KB")
    print(f"合計 {total/1024/1024:.2f} MB  ({'OK' if total < 2*1024*1024 else '2MB超'})")
    return 0 if total < 2 * 1024 * 1024 else 1


if __name__ == "__main__":
    sys.exit(main())
