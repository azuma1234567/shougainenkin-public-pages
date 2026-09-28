# 検証1: 公開対象(verified かつ !excluded)で request_type に「更新」か「支給停止」を含む裁決の再集計と、本文で引く4件の照合。
#   python3 docs/verification/koushin-kakuninhodo-2026-09-28/check-saiketsu.py
import json, collections
cases = json.load(open("data/saiketsu-cases-2026-08-26.json"))["cases"]
pub = [c for c in cases if c.get("verified") and not c.get("excluded")]
sel = [c for c in pub if any(k in (c.get("request_type") or "") for k in ("更新", "支給停止"))]
print(f"## 検証1 公開対象 {len(pub)} 件(全 {len(cases)} 件、excluded {[c['id'] for c in cases if c.get('excluded')]})のうち request_type に「更新」「支給停止」を含むもの: {len(sel)} 件(指示書: 11)")
print("ketsuron:", dict(collections.Counter(c["ketsuron"] for c in sel)), "(指示書: 容認9・棄却2)")
print("棄却:", [(c["id"], c["youshi"][:60]) for c in sel if c["ketsuron"] == "棄却"])
for c in sel: print(f"  {c['id']} | {c['ketsuron']} | {c['request_type']} | {c['shobyo']}")
by = {c["id"]: c for c in cases}
print("\n## 本文で引く 4 件")
for i in ["r06-03_05", "r07-03_05", "h28_29-16_01", "r07-03_04"]:
    c = by[i]; print(f"○ {i} | {c['shobyo']} | {c['ketsuron']} | {c['request_type']} | verified={c['verified']}\n   要旨: {c['youshi']}")
c = by["r02_03-05_04"]
print(f"\n## #4 の根拠(id は本文に出さない) r02_03-05_04 | excluded={c.get('excluded')} verified={c.get('verified')} | {c['url']}\n   要旨: {c['youshi']}")
print("   PDF の確認: 2026-09-29 に取得を試みたが https://www.mhlw.go.jp/topics/bukyoku/shinsa/syakai/dl/05-r2_r3/ 配下は 05_04.pdf を含め 404(05_01・05_03・05_05・12_06 も 404)。確認できないため指示どおり #4 の1文は入れていない。")
