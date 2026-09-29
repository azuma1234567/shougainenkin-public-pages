# 検証1: 公開対象(verified かつ !excluded)で soten に「診断書の信頼性・整合性」を含む裁決の再集計と、本文で引く5件の照合。
#   python3 docs/verification/shindansho-jittai-chigau-2026-09-29/check-saiketsu.py
import json, collections
cases = json.load(open("data/saiketsu-cases-2026-08-26.json"))["cases"]
pub = [c for c in cases if c.get("verified") and not c.get("excluded")]
lst = lambda c: c["soten"] if isinstance(c["soten"], list) else [c["soten"]]
sel = [c for c in pub if "診断書の信頼性・整合性" in lst(c)]
print(f"## 検証1 公開対象 {len(pub)} 件のうち soten に「診断書の信頼性・整合性」を含むもの: {len(sel)} 件(指示書: 15)")
print("ketsuron:", dict(collections.Counter(c["ketsuron"] for c in sel)), "(指示書: 容認7・棄却8)")
print("ids:", sorted(c["id"] for c in sel))
by = {c["id"]: c for c in cases}
print("\n## 本文で引く 5 件")
for i in ["r06-03_05", "h28_29-16_06", "h28_29-07_13", "r07-03_04", "r04_05-06_12"]:
    c = by[i]; print(f"○ {i} | {c['shobyo']} | {c['ketsuron']} | {c['request_type']} | {c['soten']} | 15件に含む={c in sel} | verified={c['verified']}\n   要旨: {c['youshi']}")
