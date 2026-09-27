// 検証1: 75.3% の旧い読み方の語が残っていないか。検証2: 75.3 を含む文がすべて「届いていた」か「総合評価」を同じ文に含むか。
//   node docs/verification/fix-75-3-2026-09-27/check-753.mjs
import { readFileSync, readdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
const files = [
  ...readdirSync("docs/columns-rewrite-2026-09-03/articles").map((f) => `docs/columns-rewrite-2026-09-03/articles/${f}`),
  ...readdirSync("data/hubs").map((f) => `data/hubs/${f}`),
  "data/gokai-bodies.ts", "data/gokai.ts", "lib/columns.ts",
  ...readdirSync("content/columns").map((f) => `content/columns/${f}`),
  ...readdirSync("docs/gokai").filter((f) => f.endsWith(".md")).map((f) => `docs/gokai/${f}`),
];
console.log("## 検証1 grep 軽い側|目安表の下位|目安表で下位|下のほうにあ|目安の下位");
const g = execFileSync("grep", ["-rn", "軽い側\\|目安表の下位\\|目安表で下位\\|下のほうにあ\\|目安の下位", "docs/columns-rewrite-2026-09-03/articles", "data/hubs", "data/gokai-bodies.ts", "content", "lib", "docs/gokai"], { encoding: "utf8" }).trim().split("\n").filter(Boolean);
console.log(`該当 ${g.length} 行`);
for (const l of g) { const [p, n, ...rest] = l.split(":"); const t = rest.join(":"); const i = t.search(/軽い側|目安表の下位|目安表で下位|下のほうにあ|目安の下位/); console.log(`- ${p}:${n} 75.3を含む=${t.includes("75.3") ? "○" : "×"} …${t.slice(Math.max(0, i - 40), i + 30)}…`); }
console.log("\n## 検証2 75.3 を含む文(正本・生成物・JSON の source)");
let total = 0, bad = 0;
const rows = [];
for (const f of files) {
  let text = readFileSync(f, "utf8");
  if (f.endsWith(".json")) { const d = JSON.parse(text); text = [d.source, d.metaDescription ?? "", d.metaTitle ?? ""].join("\n"); }
  if (f.startsWith("content/") || f === "data/gokai-bodies.ts" || f === "data/gokai.ts" || f === "lib/columns.ts") text = text.replace(/\\n/g, "\n");
  for (const line of text.split("\n")) {
    if (!line.includes("75.3")) continue;
    for (const s of line.split(/(?<=。)/)) {
      if (!s.includes("75.3")) continue;
      total += 1;
      const ok = /届いていた|届く可能性|総合評価/.test(s);
      if (!ok) bad += 1;
      rows.push(`${ok ? "○" : "×"} ${f}: ${s.trim().slice(0, 140)}`);
    }
  }
}
for (const r of rows) console.log(r);
console.log(`\n75.3 を含む文 ${total}、「届いていた/届く可能性/総合評価」を含まない文 ${bad}`);
