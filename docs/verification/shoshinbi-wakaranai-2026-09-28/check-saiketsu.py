# 検証1: data/saiketsu-cases-2026-08-26.json から soten に「初診日」を含む裁決を再集計し、本文で引く16件の id・病名・結論・要旨を出す。
#   python3 docs/verification/shoshinbi-wakaranai-2026-09-28/check-saiketsu.py
import json, collections
cases = json.load(open("data/saiketsu-cases-2026-08-26.json"))["cases"]
lst = lambda c: c["soten"] if isinstance(c["soten"], list) else [c["soten"]]
sel = [c for c in cases if "初診日" in lst(c)]
print(f"## 検証1 裁決 {len(cases)} 件のうち soten に「初診日」を含むもの: {len(sel)} 件(指示書: 35)")
print("ketsuron:", dict(collections.Counter(c["ketsuron"] for c in sel)), "(指示書: 容認22・一部容認4・棄却9)")
print("verified:", dict(collections.Counter(c["verified"] for c in sel)))
print("社会的治癒を含む:", [(c["id"], c["ketsuron"]) for c in sel if "社会的治癒" in lst(c)])
ids = "r02_03-12_08 r04_05-06_01 r06-07_01 r04_05-06_06 r04_05-06_09 r02_03-05_07 r02_03-12_03 h30_r01-16_04 r04_05-06_04 r04_05-06_05 r02_03-12_07 r06-03_02 r04_05-06_14 r02_03-05_03 r02_03-05_05 r02_03-12_06".split()
by = {c["id"]: c for c in cases}
print(f"\n## 本文で引く {len(ids)} 件")
for i in ids:
    c = by.get(i)
    if not c: print(f"× {i}: data に無い"); continue
    print(f"{'○' if c in sel else '△'} {i} | {c['shobyo']} | {c['ketsuron']} | {c['request_type']} | {c['soten']} | verified={c['verified']}\n   要旨: {c['youshi']}")
