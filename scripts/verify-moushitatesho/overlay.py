#!/usr/bin/env python3
"""記入済みの紙を、公式PDFの同じページに 50% で重ねる(設計 §9-3)。"""
import json, os, sys
import fitz

PAGES = {"main-front": ("docs/forms/moushitatesho/01.pdf", 0),
         "main-back": ("docs/forms/moushitatesho/01.pdf", 1),
         "cont-front": ("docs/forms/moushitatesho/03.pdf", 0),
         "cont-back": ("docs/forms/moushitatesho/03.pdf", 1)}


def main():
    made = json.load(sys.stdin)
    for item in made:
        f, kind = item["file"], item["kind"]
        ours = fitz.Pixmap(f)
        src, page = PAGES[kind]
        p = fitz.open(src)[page]
        official = p.get_pixmap(matrix=fitz.Matrix(ours.width / p.rect.width, ours.height / p.rect.height),
                                colorspace=fitz.csRGB, alpha=False)
        if ours.alpha:
            ours = fitz.Pixmap(fitz.csRGB, ours)
        a, b = ours.samples, official.samples
        out = bytearray(len(a))
        for i in range(len(a)):
            out[i] = (a[i] + b[i]) // 2          # 50% で重ねる
        blend = fitz.Pixmap(fitz.csRGB, ours.width, ours.height, bytes(out), False)
        dst = f.replace(".png", "-overlay.png")
        blend.save(dst)
        print(f"  {os.path.basename(dst)}  {ours.width}x{ours.height}")


if __name__ == "__main__":
    main()
