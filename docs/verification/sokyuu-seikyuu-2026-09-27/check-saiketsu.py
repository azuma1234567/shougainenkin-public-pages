# 検証1: data/saiketsu-cases-2026-08-26.json から、request_type に「認定日請求」を含む裁決を再集計。検証2: 本文で引く8件の id・結論・要旨。
#   python3 docs/verification/sokyuu-seikyuu-2026-09-27/check-saiketsu.py
import json, collections
d = json.load(open("data/saiketsu-cases-2026-08-26.json")); cases = d["cases"]
sel = [c for c in cases if "認定日請求" in (c.get("request_type") or "")]
print(f"## 検証1 裁決 {len(cases)} 件のうち request_type に「認定日請求」を含むもの: {len(sel)} 件(指示書: 24)")
print("ketsuron:", dict(collections.Counter(c["ketsuron"] for c in sel)), "(指示書: 容認15・一部容認1・棄却8)")
so = collections.Counter(x for c in sel for x in (c["soten"] if isinstance(c["soten"], list) else [c["soten"]]))
print("soten:", dict(so), "(指示書: 等級該当性16・診断書7・初診日5・手続4・納付2・因果関係1)")
print("verified:", dict(collections.Counter(c["verified"] for c in sel)))
print("棄却 8 件:", [(c["id"], c["soten"]) for c in sel if c["ketsuron"] == "棄却"])
print("\n## 検証2 本文で引く 8 件")
by = {c["id"]: c for c in cases}
for i in ["h28_29-16_03", "h28_29-16_04", "h28_29-16_05", "r02_03-12_02", "r07-07_02", "r06-07_02", "h28_29-07_13", "r04_05-06_02"]:
    c = by.get(i)
    if not c: print(f"× {i}: data に無い"); continue
    print(f"○ {i} | {c['shobyo']} | {c['ketsuron']} | {c['request_type']} | {c['soten']} | verified={c['verified']}\n   要旨: {c['youshi']}")
