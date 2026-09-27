// A-9-1: tokyu-hantei-guideline の表1(6行×5列=30セル)を、/dougu/mitate の MITATE_GRADE_TABLE(data/mitate.ts)と突き合わせる。
// 記事は「または」、data/mitate.ts は「又は」なので、比較は「又は」に正規化。空欄「—」は null と対応。
//   node --import ./scripts/lib/ts-alias.mjs docs/verification/tokyu-nichijo-2026-09-27/check-table1.mjs
import { readFileSync } from "node:fs";
const { MITATE_GRADE_TABLE } = await import("../../../data/mitate.ts");
const md = readFileSync("docs/columns-rewrite-2026-09-03/articles/tokyu-hantei-guideline.md", "utf8");
const start = md.indexOf("### 目安表(表1)の全体");
const rows = md.slice(start).split("\n").filter((l) => l.startsWith("| ") && !l.startsWith("| 判定の平均"));
const header = md.slice(start).split("\n").find((l) => l.startsWith("| 判定の平均"));
const cols = header.split("|").map((c) => c.trim()).filter(Boolean).slice(1); // (5) (4) (3) (2) (1)
const colIndex = cols.map((c) => Number(c.replace(/[()]/g, "")) - 1); // MITATE の配列は 程度(1)..(5) の順
let n = 0, bad = 0;
const out = [];
for (const r of rows) {
  const cells = r.split("|").map((c) => c.trim()).filter((c) => c !== "");
  const label = cells[0]; const values = cells.slice(1);
  const ref = MITATE_GRADE_TABLE[label]; if (!ref) { out.push(`× 行「${label}」が MITATE_GRADE_TABLE に無い`); bad += 1; continue; }
  values.forEach((v, k) => { n += 1; const mine = v === "—" ? null : v.replace(/または/g, "又は"); const theirs = ref[colIndex[k]]; const ok = mine === theirs; if (!ok) bad += 1; out.push(`${ok ? "○" : "×"} ${label} × 程度${cols[k]}: 記事「${v}」 / mitate「${theirs ?? "—"}」`); });
}
console.log(`表1 の突き合わせ: ${n} セル、不一致 ${bad}`);
console.log(out.join("\n"));
const oldWrong = md.includes("| 3.5以上 | 2級 |");
console.log(`\n旧表の誤り(3.5以上×程度(3)=2級)が残っているか: ${oldWrong ? "残っている" : "無い"}`);
