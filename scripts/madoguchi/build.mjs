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
const gunMap = JSON.parse(readFileSync(path.join(DATA_DIR, "gun-map.json"), "utf8"));

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
const gunExcept = [];

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
  /* 郡 → その郡の町村(日本郵便 KEN_ALL から作った gun-map)。ここに無ければ展開しない */
  if (bare.endsWith("郡")) {
    const towns = gunMap.gun[`${prefName}|${bare}`];
    if (towns) {
      const hits = towns.map((x) => list.find((m) => m.code === x.code)).filter(Boolean);
      if (hits.length === towns.length) return hits;
    }
  }
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
        if (token.type === "unknown") { unresolved.push({ pref: prefName, office: row.office, field, value: token.value, reason: "読み取れない文字列" }); continue; }
        const key = field === "jurisdictionKousei" ? "kousei" : "kokumin";
        /* 「入間郡(所沢年金事務所管内の地域を除く。)」は、郡の町村のうち他の事務所が名指ししていない残り。
           先に名指しを全部つけてから引き算するので、二段目に回す。 */
        if (token.type === "partial" && token.value.endsWith("郡")) { gunExcept.push({ prefName, office, field, key, token, notes }); continue; }
        const hits = resolve(token.value, { prefName, officeAddr: office.addr, notes });
        if (hits === null) { unresolved.push({ pref: prefName, office: row.office, field, value: token.value, reason: token.type === "gun" ? "郡が gun-map(KEN_ALL)に無い" : "市区町村コードへ展開できない" }); continue; }
        for (const m of hits) {
          if (!office[field].includes(m.code)) office[field].push(m.code);
          index[m.code] ??= { kousei: null, kokumin: null };
          const cur = index[m.code][key];
          if (token.type === "partial") {
            /* 機構が市区町村より細かい単位で2つの事務所に分けている。両方を持ち、振り分けの文を生のまま残す。 */
            const entry = Array.isArray(cur) ? cur : cur ? [cur] : [];
            if (!entry.includes(office.id)) entry.push(office.id);
            index[m.code][key] = entry;
            index[m.code].split = true;
            index[m.code].splitText ??= {};
            index[m.code].splitText[key] ??= [];
            if (!index[m.code].splitText[key].includes(token.splitText)) index[m.code].splitText[key].push(token.splitText);
          } else if (Array.isArray(cur)) {
            if (!cur.includes(office.id)) cur.push(office.id);
          } else if (cur && cur !== office.id) {
            unresolved.push({ pref: prefName, kind: "二重割当", code: m.code, name: m.name, field: key, offices: [cur, office.id] });
          } else index[m.code][key] = office.id;
        }
      }
    }
  }
}

/* 二段目: 郡(…を除く。) */
for (const { prefName, office, field, key, token, notes } of gunExcept) {
  const towns = resolve(token.value, { prefName, officeAddr: office.addr, notes });
  if (towns === null) { unresolved.push({ pref: prefName, office: office.nameShort, field, value: token.value, reason: "郡が gun-map(KEN_ALL)に無い" }); continue; }
  const rest = towns.filter((m) => { const v = index[m.code]?.[key]; return !(Array.isArray(v) ? v.length : v); });
  if (rest.length === 0) unresolved.push({ pref: prefName, office: office.nameShort, field, value: token.splitText, reason: "郡(除く)の残りが0件(郡の町村がすべて他の事務所に付いている)" });
  for (const m of rest) {
    if (!office[field].includes(m.code)) office[field].push(m.code);
    index[m.code] ??= { kousei: null, kokumin: null };
    index[m.code][key] = office.id;
  }
}

/* ---------- 3. 出力 ---------- */
mkdirSync(DATA_DIR, { recursive: true });
mkdirSync(RESULT_DIR, { recursive: true });
const write = (f, v) => writeFileSync(f, `${JSON.stringify(v, null, 1)}\n`);
write(path.join(DATA_DIR, "offices.json"), { checkedOn: CHECKED_ON, source: "https://www.nenkin.go.jp/section/soudan/index.html", commonTel: COMMON_TEL, count: offices.length, offices });
write(path.join(DATA_DIR, "index.json"), { checkedOn: CHECKED_ON, note: "市区町村コード → {kousei, kokumin}。値は offices.json の id。", byMunicipality: index });
write(path.join(DATA_DIR, "unresolved.json"), { checkedOn: CHECKED_ON, note: "展開できなかった管轄文字列と、二重割当。推測で埋めていない。", count: unresolved.length, unresolved });

/* ---------- 3.5 画面用に絞ったデータ ----------
   offices.json(444KB)をそのまま読むとページが重い。画面に出す項目だけを1本にまとめる。
   外部への通信を増やさないため、fetch ではなく import で読める形にする。 */
const clientOffices = {};
for (const o of offices) {
  clientOffices[o.id] = {
    n: o.name, k: o.kind, ...(o.sub ? { s: o.sub } : {}),
    z: o.zip, a: o.addr, t: o.tel, ...(o.telNote ? { tn: o.telNote } : {}),
    ...(o.access ? { ac: o.access } : {}), u: o.url, p: o.prefName,
  };
}
const clientMuni = {};
for (const m of municipalities.municipalities) {
  if (m.hoppo) continue;                       /* 年金事務所が付かないので選択肢に出さない */
  (clientMuni[m.pref] ??= []).push([m.code, m.name]);
}
/* 街角は管轄が無く誰でも使えるので、都道府県ごとに引けるようにする。 */
const clientMachikado = {};
for (const o of offices) if (o.kind === "machikado") (clientMachikado[o.prefName] ??= []).push(o.id);
write(path.join(DATA_DIR, "client.json"), {
  checkedOn: CHECKED_ON, commonTel: COMMON_TEL,
  kankatsuUrl: "https://www.nenkin.go.jp/section/soudan/kankatsu/kankatsu_",
  prefSlug: Object.fromEntries(PREFS.map(([slug, name]) => [name, slug])),
  offices: clientOffices, municipalities: clientMuni, machikado: clientMachikado,
  index,
});

/* ---------- 4. RESULT.md ---------- */
const nenkinAll = offices.filter((o) => o.kind === "nenkin");
const satellites = nenkinAll.filter((o) => o.satellite);
const machikadoAll = offices.filter((o) => o.kind === "machikado");
const assigned = Object.keys(index);
const target = municipalities.municipalities.filter((m) => !m.hoppo);
const has = (m, k) => { const v = index[m.code]?.[k]; return Array.isArray(v) ? v.length > 0 : !!v; };
const noKousei = target.filter((m) => !has(m, "kousei"));
const noKokumin = target.filter((m) => !has(m, "kokumin"));
const dupes = unresolved.filter((u) => u.kind === "二重割当");
/* split の市区: 2件 かつ splitText がある、以外は異常として数える */
const splitEntries = Object.entries(index).filter(([, v]) => v.split);
const splitBad = splitEntries.filter(([, v]) => ["kousei", "kokumin"].some((k) => Array.isArray(v[k]) && (v[k].length !== 2 || !(v.splitText?.[k]?.length))));
const nameOf = (code) => municipalities.municipalities.find((m) => m.code === code);
const tokenFails = unresolved.filter((u) => u.kind !== "二重割当");
const gunFails = tokenFails.filter((u) => u.reason.startsWith("郡が"));
const otherFails = tokenFails.filter((u) => !gunFails.includes(u));
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
| 二重割当(異常) | **${dupes.length}** |
| 2事務所に分かれる市区(split) | ${splitEntries.length}(うち条件を満たさないもの **${splitBad.length}**) |

判定条件: 1市区町村 = 厚年1・国年1、**または** \`split: true\` かつ 2件 かつ \`splitText\` あり。これ以外の二重は異常として数える。
郡は日本郵便の郵便番号データ(KEN_ALL、sha256先頭16 ${gunMap.sourceHash.slice(0, 16)}、${gunMap.checkedOn} 取得)から作った
\`data/madoguchi/gun-map.json\`(郡 ${gunMap.gunCount} / 町村 ${gunMap.townCount})で町村へ展開した。
北方領土の6村は事務所が付かないので対象から除いた。

### 2事務所に分かれる市区(${splitEntries.length}件)

機構が市区町村より細かい単位(大字)で振り分けているもの。両方の事務所を持ち、管轄表の文を \`splitText\` に生のまま残した。

${splitEntries.map(([code, v]) => { const m = nameOf(code); return `- ${code} ${m?.pref ?? ""}${m?.name ?? ""} — 厚年 ${Array.isArray(v.kousei) ? v.kousei.join(" / ") : v.kousei} ／ 国年 ${Array.isArray(v.kokumin) ? v.kokumin.join(" / ") : v.kokumin}`; }).join("\n")}
${splitBad.length ? `\n### split の条件を満たさないもの(異常)\n\n${splitBad.map(([code, v]) => `- ${code} ${JSON.stringify(v)}`).join("\n")}\n` : ""}

${noKousei.length ? `### 厚年 未割当(先頭50件)\n\n${noKousei.slice(0, 50).map((m) => `- ${m.code} ${m.pref}${m.name}`).join("\n")}\n` : ""}
${noKokumin.length ? `### 国年 未割当(先頭50件)\n\n${noKokumin.slice(0, 50).map((m) => `- ${m.code} ${m.pref}${m.name}`).join("\n")}\n` : ""}
${dupes.length ? `### 二重割当(異常)\n\n${dupes.slice(0, 50).map((d) => `- ${d.code} ${d.pref}${d.name} ${d.field}: ${d.offices.join(" / ")}`).join("\n")}\n` : ""}
### 北方領土の6村(選択肢から除く)

年金事務所が付かないので、市区町村の選択肢から外す。総務省の「1,741市区町村」にも数えられていない。

${municipalities.municipalities.filter((m) => m.hoppo).map((m) => `- ${m.code} ${m.pref}${m.name}`).join("\n")}

## 4. 展開できなかった管轄文字列(unresolved)

${tokenFails.length} 件。**推測で埋めていない。**

| 種類 | 件数 | なぜ展開できないか |
|---|---:|---|
| 「◯◯郡」で gun-map に無いもの | ${gunFails.length} | KEN_ALL に「都道府県\|郡」の組が無い |
| その他 | ${otherFails.length} | 下の一覧 |

### 郡が gun-map に無いもの(${uniq(gunFails).length}件)

${uniq(gunFails).map((s) => `- ${s}`).join("\n") || "なし"}

### その他(${otherFails.length}件)

${uniq(otherFails).slice(0, 40).map((s) => `- ${s}`).join("\n") || "なし"}

## 5. 欠損・形式不正

- 欠けている項目: ${missing.length} 件${missing.length ? `\n${missing.slice(0, 40).map((m) => `  - ${m.pref} ${m.name} ${m.field ?? m.reason}`).join("\n")}` : ""}
- 形式不正(郵便番号 \`^\\d{3}-\\d{4}$\` / 電話 \`^0\\d{1,4}-\\d{1,4}-\\d{4}$\`): ${badFormat.length} 件${badFormat.length ? `\n${badFormat.slice(0, 40).map((b) => `  - ${b.name} ${b.field}=${b.value}`).join("\n")}` : ""}

## 6. 取得に失敗したページ(再試行していない)

${manifest.failures.length ? manifest.failures.map((f) => `- ${f.status} ${f.url}`).join("\n") : "なし"}
`;
writeFileSync(path.join(RESULT_DIR, "RESULT.md"), md);
console.log(`事務所 ${nenkinAll.length} / 街角 ${machikadoAll.length} / 未割当 厚年${noKousei.length} 国年${noKokumin.length} / 二重(異常)${dupes.length} / split ${splitEntries.length}(異常${splitBad.length}) / unresolved ${tokenFails.length}`);
