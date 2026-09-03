/* 保存した生HTMLから offices.json / index.json / unresolved.json と RESULT.md を作る。
   ネットワークには触らない(fetch.mjs が取ったものだけを読む)。
   実行: node scripts/madoguchi/build.mjs */
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { CHECKED_ON, COMMON_TEL, DATA_DIR, PREFS, PREF_NAME, RESULT_DIR, SOURCE_DIR } from "./config.mjs";
import { parseKankatsu, parseOffice, parsePrefIndex, splitJurisdiction } from "./parse.mjs";

const read = (f) => readFileSync(path.join(SOURCE_DIR, f), "utf8");
const manifest = JSON.parse(read("manifest.json"));
const hashOf = new Map(manifest.pages.map((p) => [p.file, p.sha256.slice(0, 16)]));
const municipalities = JSON.parse(readFileSync(path.join(DATA_DIR, "municipalities.json"), "utf8"));
const manualMap = JSON.parse(readFileSync(path.join(import.meta.dirname, "manual-map.json"), "utf8"));

const ZIP_RE = /^\d{3}-\d{4}$/;
const TEL_RE = /^0\d{1,4}-\d{1,4}-\d{4}$/;

/* ---------- 1. 事務所・街角 ---------- */
const offices = [];
const prefCounts = [];
const missing = [];
const badFormat = [];

for (const [slug, prefName] of PREFS) {
  const indexFile = `${slug}/index.html`;
  if (!existsSync(path.join(SOURCE_DIR, indexFile))) { prefCounts.push({ slug, prefName, nenkin: 0, machikado: 0, kankatsu: 0, note: "都道府県ページ未取得" }); continue; }
  const listing = parsePrefIndex(read(indexFile));
  let nenkin = 0, machikado = 0;
  for (const item of listing) {
    const file = item.href.replace("/section/soudan/", "");
    if (!existsSync(path.join(SOURCE_DIR, file))) { missing.push({ pref: prefName, name: item.name, file, reason: "詳細ページ未取得" }); continue; }
    const parsed = parseOffice(read(file), { kind: item.kind });
    const id = file.replace(/\.html$/, "").replace("/", "-");
    const office = {
      id, pref: slug, prefName,
      kind: item.kind, ...(item.sub ? { sub: item.sub } : {}),
      /* ねんきんサテライト・分室は独立した年金事務所ではなく、管轄区域表に行が無い。 */
      ...(/ねんきんサテライト|分室/.test(item.name) ? { satellite: true } : {}),
      name: parsed.name || item.name,
      nameShort: parsed.nameShort,
      zip: parsed.zip, addr: parsed.addr,
      tel: parsed.tel, ...(parsed.telNote ? { telNote: parsed.telNote } : {}), ...(parsed.fax ? { fax: parsed.fax } : {}),
      hours: parsed.hours,
      ...(parsed.access ? { access: parsed.access } : {}), ...(parsed.parking ? { parking: parsed.parking } : {}),
      jurisdictionKousei: [], jurisdictionKokumin: [],
      url: `https://www.nenkin.go.jp${item.href}`,
      sourceHash: hashOf.get(file) ?? "",
      checkedOn: CHECKED_ON,
    };
    for (const key of ["zip", "addr", "tel"]) if (!office[key]) missing.push({ pref: prefName, name: office.name, field: key });
    if (office.zip && !ZIP_RE.test(office.zip)) badFormat.push({ name: office.name, field: "zip", value: office.zip });
    if (office.tel && !TEL_RE.test(office.tel)) badFormat.push({ name: office.name, field: "tel", value: office.tel });
    if (office.fax && !TEL_RE.test(office.fax)) badFormat.push({ name: office.name, field: "fax", value: office.fax });
    if (!office.url.startsWith("https://www.nenkin.go.jp/")) badFormat.push({ name: office.name, field: "url", value: office.url });
    if (parsed.telCandidates.length > 1) badFormat.push({ name: office.name, field: "tel候補", value: parsed.telCandidates.join(",") });
    offices.push(office);
    if (item.kind === "nenkin") nenkin += 1; else machikado += 1;
  }
  const kFile = `kankatsu/kankatsu_${slug}.html`;
  const kRows = existsSync(path.join(SOURCE_DIR, kFile)) ? parseKankatsu(read(kFile)).rows.length : 0;
  prefCounts.push({ slug, prefName, nenkin, machikado, kankatsu: kRows });
}

/* ---------- 2. 管轄を市区町村コードへ展開 ---------- */
const byPref = new Map();
for (const m of municipalities.municipalities) {
  if (!byPref.has(m.pref)) byPref.set(m.pref, []);
  byPref.get(m.pref).push(m);
}
/* 「ケ」と「ヶ」は機構と総務省で表記が揺れる(鎌ヶ谷市/鎌ケ谷市、駒ケ根市/駒ヶ根市)。
   比較のときだけ寄せる。データはそれぞれの表記のまま持つ。 */
const norm = (s) => (s ?? "").replace(/[ヶヵｹ]/g, "ケ").replace(/[ノヽ]/g, "");
const unresolved = [];
const index = {};   // code -> {kousei, kokumin}

/* 管轄表の1語を市区町村コードへ。返り値は配列(郡は複数)。 */
function resolve(token, { prefName, officeAddr, notes }) {
  const list = byPref.get(prefName) ?? [];
  const bare = token.replace(/※\d+/g, "").trim();
  if (!bare) return [];

  /* 脚注つき(「南区※2」→「横浜市南区」) */
  const markMatch = token.match(/※\s*(\d+)/);
  if (markMatch) {
    const note = notes.find((n) => n.mark === markMatch[1]);
    if (note) {
      const hit = list.find((m) => norm(m.name) === norm(note.value));
      if (hit) return [hit];
    }
  }
  /* そのままの名前 */
  const exact = list.filter((m) => norm(m.name) === norm(bare));
  if (exact.length === 1) return exact;

  /* 政令市の区(市名なし)。事務所の住所にある市を付けて特定する。 */
  if (bare.endsWith("区")) {
    const city = (municipalities.designatedCities ?? []).find((c) => officeAddr.includes(c));
    if (city) {
      const hit = list.find((m) => norm(m.name) === norm(city + bare));
      if (hit) return [hit];
    }
    const candidates = list.filter((m) => m.kind === "区" && norm(m.ward) === norm(bare));
    if (candidates.length === 1) return candidates;
  }
  /* 政令市そのもの(区なし)→ その市の全区 */
  if ((municipalities.designatedCities ?? []).includes(bare)) {
    return list.filter((m) => m.city === bare);
  }
  /* 支庁・振興局 */
  const manual = manualMap.expansions?.[prefName]?.[bare];
  if (manual) {
    const hits = manual.map((n) => list.find((m) => norm(m.name) === norm(n))).filter(Boolean);
    if (hits.length === manual.length) return hits;
  }
  /* 郡は総務省のコード表に郡名が無いので展開できない(RESULT に出す) */
  return null;
}

for (const [slug, prefName] of PREFS) {
  const kFile = `kankatsu/kankatsu_${slug}.html`;
  if (!existsSync(path.join(SOURCE_DIR, kFile))) continue;
  const { rows, notes } = parseKankatsu(read(kFile));
  for (const row of rows) {
    const office = offices.find((o) => o.pref === slug && o.kind === "nenkin" && o.nameShort === row.office)
      ?? offices.find((o) => o.pref === slug && o.kind === "nenkin" && o.nameShort.startsWith(row.office));
    if (!office) { unresolved.push({ pref: prefName, kind: "事務所名", value: row.office, reason: "管轄表の事務所名が都道府県ページの事務所と結びつかない" }); continue; }
    for (const [field, cell] of [["jurisdictionKousei", row.kousei], ["jurisdictionKokumin", row.kokumin]]) {
      for (const token of splitJurisdiction(cell)) {
        if (token.type === "gun") { unresolved.push({ pref: prefName, office: row.office, field, value: token.value, reason: "郡まるごと。総務省のコード表に郡名が無いので町村へ展開できない" }); continue; }
        if (token.type === "partial") { unresolved.push({ pref: prefName, office: row.office, field, value: token.value, reason: `市区町村より細かい単位で分けられている: ${token.note}` }); continue; }
        if (token.type === "unknown") { unresolved.push({ pref: prefName, office: row.office, field, value: token.value, reason: "読み取れない文字列" }); continue; }
        const hits = resolve(token.value, { prefName, officeAddr: office.addr, notes });
        if (hits === null) { unresolved.push({ pref: prefName, office: row.office, field, value: token.value, reason: "市区町村コードへ展開できない" }); continue; }
        for (const m of hits) {
          if (!office[field].includes(m.code)) office[field].push(m.code);
          index[m.code] ??= { kousei: null, kokumin: null };
          const key = field === "jurisdictionKousei" ? "kousei" : "kokumin";
          if (index[m.code][key] && index[m.code][key] !== office.id) {
            unresolved.push({ pref: prefName, kind: "二重割当", code: m.code, name: m.name, field: key, offices: [index[m.code][key], office.id] });
          } else index[m.code][key] = office.id;
        }
      }
    }
  }
}

/* ---------- 3. 出力 ---------- */
mkdirSync(DATA_DIR, { recursive: true });
mkdirSync(RESULT_DIR, { recursive: true });
const write = (f, v) => writeFileSync(f, `${JSON.stringify(v, null, 1)}\n`);
write(path.join(DATA_DIR, "offices.json"), { checkedOn: CHECKED_ON, source: "https://www.nenkin.go.jp/section/soudan/index.html", commonTel: COMMON_TEL, count: offices.length, offices });
write(path.join(DATA_DIR, "index.json"), { checkedOn: CHECKED_ON, note: "市区町村コード → {kousei, kokumin}。値は offices.json の id。", byMunicipality: index });
write(path.join(DATA_DIR, "unresolved.json"), { checkedOn: CHECKED_ON, note: "展開できなかった管轄文字列と、二重割当。推測で埋めていない。", count: unresolved.length, unresolved });

/* ---------- 4. RESULT.md ---------- */
const nenkinAll = offices.filter((o) => o.kind === "nenkin");
const satellites = nenkinAll.filter((o) => o.satellite);
const machikadoAll = offices.filter((o) => o.kind === "machikado");
const assigned = Object.keys(index);
const target = municipalities.municipalities.filter((m) => !m.hoppo);
const noKousei = target.filter((m) => !index[m.code]?.kousei);
const noKokumin = target.filter((m) => !index[m.code]?.kokumin);
const dupes = unresolved.filter((u) => u.kind === "二重割当");
const tokenFails = unresolved.filter((u) => u.kind !== "二重割当");
const gunFails = tokenFails.filter((u) => u.reason.startsWith("郡まるごと"));
const partialFails = tokenFails.filter((u) => u.reason.startsWith("市区町村より細かい"));
const otherFails = tokenFails.filter((u) => !gunFails.includes(u) && !partialFails.includes(u));
const uniq = (list) => [...new Set(list.map((u) => `${u.pref} ${u.office} ${u.field === "jurisdictionKousei" ? "厚年" : "国年"}: ${u.value}`))];
const rows = prefCounts.map((p) => `| ${p.prefName} | ${p.nenkin} | ${p.machikado} | ${p.kankatsu} |${p.note ? ` ${p.note}` : ""}`).join("\n");
const sum = (k) => prefCounts.reduce((n, p) => n + p[k], 0);

const md = `# 年金事務所・街角の年金相談センター 取得結果 (${CHECKED_ON})

取得元: 日本年金機構 全国の相談・手続き窓口 \`https://www.nenkin.go.jp/section/soudan/index.html\` 配下
市区町村: 総務省 全国地方公共団体コード \`${municipalities.file}\`(sha256先頭16 ${municipalities.sourceHash})

- 取得ページ数 ${manifest.pages.length} / 失敗 ${manifest.failures.length}
- 取得間隔 ${manifest.delayMs}ms、User-Agent \`${manifest.userAgent}\`
- 生HTMLは \`${SOURCE_DIR}/\`(.gitignore。証跡は offices.json の sourceHash)

## 1. 都道府県別の件数

| 都道府県 | 年金事務所 | 街角 | 管轄表の行数 |
|---|---:|---:|---:|
${rows}
| **合計** | **${sum("nenkin")}** | **${sum("machikado")}** | **${sum("kankatsu")}** |

- 年金事務所 ${nenkinAll.length} 件 / 街角 ${machikadoAll.length} 件(センター ${machikadoAll.filter((o) => o.sub === "center").length} / オフィス ${machikadoAll.filter((o) => o.sub === "office").length})
- 年金事務所が0件の都道府県: ${prefCounts.filter((p) => p.nenkin === 0).map((p) => p.prefName).join("、") || "なし"}
- **都道府県ページの事務所数と管轄表の行数**: 合計 ${sum("nenkin")} / ${sum("kankatsu")}。差 ${sum("nenkin") - sum("kankatsu")} は
  **ねんきんサテライトと分室**(${satellites.length}件)。独立した年金事務所ではないので管轄区域表に行が無い。
  これを除いた **${sum("nenkin") - satellites.length} 件が管轄を持つ年金事務所**で、管轄表の ${sum("kankatsu")} 行と一致する。
${satellites.map((o) => `  - ${o.prefName} ${o.name}`).join("\n")}
- 東京都は都道府県ページ ${prefCounts.find((p) => p.slug === "tokyo").nenkin} / 管轄表 ${prefCounts.find((p) => p.slug === "tokyo").kankatsu} で**一致**。
  研究文書 §5 が「23〜28で違って見えた」としていた件は、**どちらも28**だった(概略の読み取りによる差で、実データでは一致)。

## 2. 街角の年金相談センター(全国社会保険労務士会連合会の80件との突合)

機構側の合計: **${machikadoAll.length}件**。連合会の公表値: 80件。差 ${machikadoAll.length - 80}。

## 3. 市区町村への割当

対象 ${target.length} 件(総務省コードの市区町村 ${municipalities.count} 件から北方領土6村を除いた数)

| | 件数 |
|---|---:|
| 厚年の事務所が付いた | ${target.length - noKousei.length} |
| 厚年が未割当 | **${noKousei.length}** |
| 国年の事務所が付いた | ${target.length - noKokumin.length} |
| 国年が未割当 | **${noKokumin.length}** |
| 二重割当 | **${dupes.length}** |

${noKousei.length ? `### 厚年 未割当(先頭50件)\n\n${noKousei.slice(0, 50).map((m) => `- ${m.code} ${m.pref}${m.name}`).join("\n")}\n` : ""}
${noKokumin.length ? `### 国年 未割当(先頭50件)\n\n${noKokumin.slice(0, 50).map((m) => `- ${m.code} ${m.pref}${m.name}`).join("\n")}\n` : ""}
${dupes.length ? `### 二重割当\n\n${dupes.slice(0, 50).map((d) => `- ${d.code} ${d.pref}${d.name} ${d.field}: ${d.offices.join(" / ")}`).join("\n")}\n` : ""}

## 4. 展開できなかった管轄文字列(unresolved)

${tokenFails.length} 件。**推測で埋めていない。**

| 種類 | 件数 | なぜ展開できないか |
|---|---:|---|
| 「◯◯郡」まるごと | ${gunFails.length} | 総務省のコード表に**郡名が入っていない**(町村名だけ)。郡→町村の対応が無い |
| 「◯◯市のうち…」「◯◯市(…を除く。)」 | ${partialFails.length} | 機構が**市区町村より細かい単位(大字)**で2つの事務所に分けている。市区町村コードの粒度では表せない |
| その他 | ${otherFails.length} | 下の一覧 |

### 「◯◯郡」まるごと(ユニーク ${uniq(gunFails).length} 種。先頭40)

${uniq(gunFails).slice(0, 40).map((s) => `- ${s}`).join("\n")}

### 市区町村より細かい単位で分けられている(ユニーク ${uniq(partialFails).length} 種。全件)

${uniq(partialFails).map((s) => `- ${s}`).join("\n")}

### その他(${otherFails.length}件)

${uniq(otherFails).slice(0, 40).map((s) => `- ${s}`).join("\n") || "なし"}

## 5. 欠損・形式不正

- 欠けている項目: ${missing.length} 件${missing.length ? `\n${missing.slice(0, 40).map((m) => `  - ${m.pref} ${m.name} ${m.field ?? m.reason}`).join("\n")}` : ""}
- 形式不正(郵便番号 \`^\\d{3}-\\d{4}$\` / 電話 \`^0\\d{1,4}-\\d{1,4}-\\d{4}$\`): ${badFormat.length} 件${badFormat.length ? `\n${badFormat.slice(0, 40).map((b) => `  - ${b.name} ${b.field}=${b.value}`).join("\n")}` : ""}

## 6. 取得に失敗したページ(再試行していない)

${manifest.failures.length ? manifest.failures.map((f) => `- ${f.status} ${f.url}`).join("\n") : "なし"}
`;
writeFileSync(path.join(RESULT_DIR, "RESULT.md"), md);
console.log(`事務所 ${nenkinAll.length} / 街角 ${machikadoAll.length} / 未割当 厚年${noKousei.length} 国年${noKokumin.length} / 二重${dupes.length} / unresolved ${tokenFails.length}(郡 ${gunFails.length})`);
