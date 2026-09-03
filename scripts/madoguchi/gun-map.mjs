/* 日本郵便の郵便番号データ(KEN_ALL)から「都道府県 + 郡 → 町村」の対応表を作る。
   総務省の全国地方公共団体コードには郡名が入っていない(町村名だけ)。
   KEN_ALL は市区町村名が「石狩郡当別町」のように郡込みなので、そこから郡を取る。
   同名の郡が複数県にあるので、キーは「都道府県|郡」。
   実行: node scripts/madoguchi/gun-map.mjs */
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { CHECKED_ON, DATA_DIR, SOURCE_DIR, USER_AGENT } from "./config.mjs";

/* 案内ページ /zipcode/dl/kogaki-zip.html は /service/search/zipcode/download/ へ転送される。zip はその配下。 */
const ZIP = "https://www.post.japanpost.jp/service/search/zipcode/download/kogaki/zip/ken_all.zip";
const PAGE = "https://www.post.japanpost.jp/service/search/zipcode/download/kogaki-zip.html";
const PY = process.env.PYTHON ?? "python3";

mkdirSync(SOURCE_DIR, { recursive: true });
const res = await fetch(ZIP, { headers: { "User-Agent": USER_AGENT } });
if (!res.ok) throw new Error(`KEN_ALL の取得に失敗: ${res.status}`);
const buf = Buffer.from(await res.arrayBuffer());
const zipPath = path.join(SOURCE_DIR, "ken_all.zip");
writeFileSync(zipPath, buf);
const sourceHash = createHash("sha256").update(buf).digest("hex");

/* KEN_ALL.CSV は Shift_JIS。0列目=全国地方公共団体コード(5桁)、6列目=都道府県、7列目=市区町村。 */
const script = `
import zipfile, csv, io, json, sys
z = zipfile.ZipFile(sys.argv[1])
name = [n for n in z.namelist() if n.upper().endswith("KEN_ALL.CSV")][0]
seen = {}
for r in csv.reader(io.TextIOWrapper(z.open(name), encoding="cp932")):
    if len(r) < 8: continue
    seen[(r[0], r[6], r[7])] = True
print(json.dumps({"name": name, "rows": [{"code5": a, "pref": b, "city": c} for (a, b, c) in seen]}, ensure_ascii=False))
`;
const parsed = JSON.parse(execFileSync(PY, ["-c", script, zipPath], { encoding: "utf8", maxBuffer: 256 * 1024 * 1024 }));

const municipalities = JSON.parse(readFileSync(path.join(DATA_DIR, "municipalities.json"), "utf8"));
/* 総務省は6桁(検査数字つき)、KEN_ALL は5桁。先頭5桁で突き合わせる。 */
const byCode5 = new Map(municipalities.municipalities.map((m) => [m.code.slice(0, 5), m]));

const map = {};
const unmatched = [];
for (const row of parsed.rows) {
  const idx = row.city.indexOf("郡");
  if (idx < 0) continue;
  const gun = row.city.slice(0, idx + 1);
  const town = row.city.slice(idx + 1);
  if (!town) continue;
  const m = byCode5.get(row.code5);
  if (!m) { unmatched.push({ code5: row.code5, pref: row.pref, city: row.city }); continue; }
  const key = `${row.pref}|${gun}`;
  map[key] ??= [];
  if (!map[key].some((x) => x.code === m.code)) map[key].push({ code: m.code, name: m.name, kenAllName: town });
}
for (const key of Object.keys(map)) map[key].sort((a, b) => a.code.localeCompare(b.code));

writeFileSync(path.join(DATA_DIR, "gun-map.json"), `${JSON.stringify({
  source: PAGE, file: ZIP, sourceHash, checkedOn: CHECKED_ON,
  note: "都道府県|郡 → その郡に属する町村(総務省の団体コードつき)。KEN_ALL の市区町村名が郡込みなので、そこから作った。同名の郡が複数県にあるためキーに都道府県を含める。",
  gunCount: Object.keys(map).length,
  townCount: Object.values(map).reduce((n, v) => n + v.length, 0),
  unmatched,
  gun: map,
}, null, 1)}\n`);

console.log(`郡 ${Object.keys(map).length} / 町村 ${Object.values(map).reduce((n, v) => n + v.length, 0)} / コード未一致 ${unmatched.length}`);
console.log(`sha256 ${sourceHash.slice(0, 16)}`);
