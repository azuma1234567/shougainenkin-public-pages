/* 総務省「全国地方公共団体コード」から市区町村の一覧を作る(設計書 §5-3.5)。
   市区町村の選択肢は、機構の管轄表ではなくこちらを正にする。
   政令指定都市は区まで展開する(管轄が区ごとに違うため)。
   実行: node scripts/madoguchi/municipalities.mjs */
import { createHash } from "node:crypto";
import { mkdirSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import path from "node:path";
import { CHECKED_ON, DATA_DIR, SOURCE_DIR, USER_AGENT } from "./config.mjs";

const XLSX = "https://www.soumu.go.jp/main_content/000925835.xlsx";
const PAGE = "https://www.soumu.go.jp/denshijiti/code.html";
const PY = process.env.PYTHON ?? "python3";

mkdirSync(SOURCE_DIR, { recursive: true });
mkdirSync(DATA_DIR, { recursive: true });

const res = await fetch(XLSX, { headers: { "User-Agent": USER_AGENT } });
if (!res.ok) throw new Error(`総務省コードの取得に失敗: ${res.status}`);
const buf = Buffer.from(await res.arrayBuffer());
const xlsxPath = path.join(SOURCE_DIR, "soumu-code.xlsx");
writeFileSync(xlsxPath, buf);
const sourceHash = createHash("sha256").update(buf).digest("hex").slice(0, 16);

/* xlsx は zip + XML。ルビ(rPh)を除いて読む。Node に依存を足さないので python の標準ライブラリで開く。 */
const script = `
import zipfile, re, json, sys, xml.etree.ElementTree as ET
NS="{http://schemas.openxmlformats.org/spreadsheetml/2006/main}"
z=zipfile.ZipFile(sys.argv[1])
def si_text(si):
    parts=[]
    for child in si:                       # rPh(ルビ)の中の t は取らない
        tag=child.tag.replace(NS,"")
        if tag=="t": parts.append(child.text or "")
        elif tag=="r":
            for t in child.findall(NS+"t"): parts.append(t.text or "")
    return "".join(parts)
shared=[si_text(si) for si in ET.fromstring(z.read("xl/sharedStrings.xml"))]
def rows(sheet):
    out=[]
    for row in ET.fromstring(z.read(sheet)).iter(NS+"row"):
        cells={}
        for c in row.iter(NS+"c"):
            ref=re.match(r"([A-Z]+)", c.get("r") or "").group(1)
            v=c.find(NS+"v"); t=c.get("t")
            cells[ref]= shared[int(v.text)] if (v is not None and t=="s") else (v.text if v is not None else "")
        out.append(cells)
    return out
print(json.dumps({"sheet1":rows("xl/worksheets/sheet1.xml"),"sheet2":rows("xl/worksheets/sheet2.xml")},ensure_ascii=False))
`;
const parsed = JSON.parse(execFileSync(PY, ["-c", script, xlsxPath], { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 }));

const clean = (s) => (s ?? "").replace(/\s+/g, "").trim();
const sheet1 = parsed.sheet1.slice(1).map((r) => ({ code: clean(r.A), pref: clean(r.B), name: clean(r.C) }));
const sheet2 = parsed.sheet2.slice(1).map((r) => ({ code: clean(r.A), pref: clean(r.B), name: clean(r.C) }));

/* 北方領土の6村。コード表には載るが「1,741市区町村」には数えない。除外せず kind に印を付けて残す。 */
const HOPPO = new Set(["016934", "016942", "016951", "016969", "016977", "016985"]);

const designatedCities = sheet2.filter((r) => !r.name.endsWith("区")).map((r) => r.name);
const wards = sheet2.filter((r) => r.name.endsWith("区"));

const kindOf = (pref, name) => {
  if (pref === "東京都" && name.endsWith("区")) return "特別区";
  if (name.endsWith("区")) return "区";
  if (name.endsWith("市")) return "市";
  if (name.endsWith("町")) return "町";
  if (name.endsWith("村")) return "村";
  return "?";
};

const out = [];
for (const r of sheet1) {
  if (!r.name) continue;                       // 都道府県だけの行
  if (designatedCities.includes(r.name)) continue; // 政令市は区に置き換える
  out.push({ code: r.code, pref: r.pref, name: r.name, kind: kindOf(r.pref, r.name), hoppo: HOPPO.has(r.code) || undefined });
}
for (const w of wards) {
  const city = designatedCities.find((c) => w.name.startsWith(c));
  out.push({ code: w.code, pref: w.pref, name: w.name, ward: city ? w.name.slice(city.length) : w.name, city, kind: "区" });
}
out.sort((a, b) => a.code.localeCompare(b.code));

writeFileSync(path.join(DATA_DIR, "municipalities.json"), `${JSON.stringify({
  source: PAGE, file: XLSX, sourceHash, checkedOn: CHECKED_ON,
  note: "政令指定都市は区に置き換えている(管轄が区ごとに違うため)。hoppo:true は北方領土の6村で、総務省の『1,741市区町村』には数えられていない。郡名はこの表に入っていない。",
  count: out.length, designatedCities, municipalities: out,
}, null, 1)}\n`);

const by = (k) => out.filter((m) => m.kind === k).length;
console.log(`市区町村 ${out.length}件(市 ${by("市")} / 特別区 ${by("特別区")} / 区 ${by("区")} / 町 ${by("町")} / 村 ${by("村")})`);
console.log(`政令指定都市 ${designatedCities.length}件を区 ${wards.length}件に展開。北方領土6村を含む。`);
console.log(`sha256(先頭16) ${sourceHash}`);
