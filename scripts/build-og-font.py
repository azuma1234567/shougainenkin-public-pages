#!/usr/bin/env python3
"""OG画像用の日本語フォントを作る。

next/og(Satori)は同梱フォントにない文字をビルド時にGoogle Fontsへ取りに行く。
取得に失敗するとその画像の漢字が豆腐(□)になり、ビルドも遅く不安定になる。
そこで Noto Sans JP の可変フォントから、サイトの原稿に出てくる文字だけを
Regular(400)/Bold(700)の静的フォントに切り出して lib/fonts/ に置く。

使い方:
  python3 scripts/build-og-font.py <NotoSansJP[wght].ttf のパス>

必要なもの: fontTools (pip install fonttools)
入力の可変フォント: https://github.com/google/fonts/tree/main/ofl/notosansjp (OFL)
出力: lib/fonts/NotoSansJP-Regular.ttf, NotoSansJP-Bold.ttf, coverage.json
coverage.json は収録した符号位置の一覧で、scripts/verify-gokai.mjs が
OG画像の文字がすべて収録済みであることの検査に使う。
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

from fontTools.subset import Options, Subsetter
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont

ROOT = Path(__file__).resolve().parent.parent
OUT_DIR = ROOT / "lib" / "fonts"
TEXT_DIRS = ["app", "components", "content", "data", "lib"]
TEXT_SUFFIXES = {".ts", ".tsx", ".json", ".md"}

# 原稿に出てこなくても常に入れておく範囲。
ALWAYS_RANGES = [
    (0x0020, 0x007E),  # ASCII
    (0x00A0, 0x00FF),  # Latin-1 補助(×÷ など)
    (0x2010, 0x203B),  # ダッシュ・引用符・三点リーダ・※
    (0x2190, 0x2199),  # 矢印
    (0x2460, 0x24FF),  # ①〜⑳ などの丸数字
    (0x3000, 0x303F),  # 全角スペース・句読点・「」『』〜
    (0x3041, 0x309F),  # ひらがな
    (0x30A0, 0x30FF),  # カタカナ
    (0xFF01, 0xFF5E),  # 全角英数・記号
    (0xFFE5, 0xFFE5),  # ￥
]

WEIGHTS = {"Regular": 400, "Bold": 700}


def collect_codepoints() -> set[int]:
    points: set[int] = set()
    for start, end in ALWAYS_RANGES:
        points.update(range(start, end + 1))
    for directory in TEXT_DIRS:
        for path in (ROOT / directory).rglob("*"):
            if path.suffix in TEXT_SUFFIXES and "node_modules" not in path.parts:
                points.update(ord(ch) for ch in path.read_text(encoding="utf-8", errors="ignore"))
    # 制御文字は除く
    return {cp for cp in points if cp >= 0x20 and cp not in range(0x7F, 0xA0)}


def build(source: Path) -> None:
    wanted = collect_codepoints()
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    coverage: set[int] | None = None
    for name, weight in WEIGHTS.items():
        font = TTFont(source)
        instantiateVariableFont(font, {"wght": weight}, inplace=True)
        options = Options()
        options.notdef_outline = True
        options.name_IDs = ["*"]
        options.layout_features = ["*"]
        subsetter = Subsetter(options)
        subsetter.populate(unicodes=sorted(wanted))
        subsetter.subset(font)
        out = OUT_DIR / f"NotoSansJP-{name}.ttf"
        font.save(out)
        present = {cp for table in font["cmap"].tables for cp in table.cmap}
        coverage = present if coverage is None else coverage & present
        print(f"{out.name}: {out.stat().st_size // 1024} KB, {len(present)} code points")
    assert coverage is not None
    missing = sorted(cp for cp in wanted if cp not in coverage and cp > 0x7F)
    (OUT_DIR / "coverage.json").write_text(json.dumps(sorted(coverage)), encoding="utf-8")
    print(f"coverage.json: {len(coverage)} code points; 原稿にあってフォントにない文字: {len(missing)}")
    if missing:
        print("  例:", "".join(chr(cp) for cp in missing[:40]))


if __name__ == "__main__":
    if len(sys.argv) != 2:
        print(__doc__)
        sys.exit(2)
    build(Path(sys.argv[1]))
