#!/usr/bin/env node
/* 止まり所(ここまでの要約)の置き場所を、原稿と突き合わせる。
 * docs/columns-parts-2026-09-05-instructions.md §1-2。
 *
 *   node --import ./scripts/lib/ts-alias.mjs scripts/check-checkpoints.mjs
 *   node --import ./scripts/lib/ts-alias.mjs scripts/check-checkpoints.mjs --fix
 *
 * 見るのは3つ:
 *   1. h2Title が、原稿の h2 番目の「## 」見出しと一致する。
 *   2. lead[k] の数字と leadHead の要点が、その節またはそれより前の本文に出ている。
 *      出ていなければ、最初に出る節の末尾へ「後ろに」動かす(前には動かさない)。
 *   3. 動かしても見つからないもの(リードにしかない数字)は、そのままにして報告する。
 * --fix を付けると 2 の移動を docs と data の JSON に書き戻す。
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";

const DOC_JSON = "docs/columns-parts-2026-09-05-checkpoints.json";
const DATA_JSON = "data/columns/checkpoints.json";
const fix = process.argv.includes("--fix");
/* 要約を置かない節(指示書 §2-3)。 */
const BANNED_SECTION = /^(よくある質問|まとめ|出典)/;

const checkpoints = JSON.parse(readFileSync(DOC_JSON, "utf8"));
const slugs = Object.keys(checkpoints);

/* 記号の差は無視して見出しを比べる(全角/半角のダッシュ・空白)。 */
const normalize = (text) => text
  .replace(/[—–―ー−-]/g, "-")
  .replace(/[（）]/g, (c) => (c === "（" ? "(" : ")"))
  .replace(/\s+/g, "")
  .trim();

/* lead から「本文に出ているはず」の数字を拾う。 */
const numbersIn = (text) => [...text.matchAll(/[\d,]+(?:\.\d+)?\s*(?:%|件|円|か月|年|日|級|通|本|人|割)/g)]
  .map((m) => m[0].replace(/\s+/g, ""));

const problems = [];
const moved = [];
const notInBody = [];
const titleMismatch = [];

for (const slug of slugs) {
  const entry = checkpoints[slug];
  const mod = await import(`../content/columns/${slug}.ts`).catch(() => null);
  if (!mod) { problems.push(`${slug}: content/columns/${slug}.ts が読めない`); continue; }
  const source = mod.default;
  const lead = mod.lead ?? [];

  /* 原稿の h2 を順番に取る。 */
  const headings = source.split("\n").map((l) => l.trim()).filter((l) => l.startsWith("## ")).map((l) => l.slice(3));
  /* h2 番号ごとの本文(その見出しから次の見出しまで)。 */
  const sections = [];
  let current = null;
  for (const line of source.split("\n")) {
    const t = line.trim();
    if (t.startsWith("## ")) { current = { title: t.slice(3), text: "" }; sections.push(current); continue; }
    if (current) current.text += t + "\n";
  }
  const upto = (n) => sections.slice(0, n + 1).map((s) => s.title + "\n" + s.text).join("\n");
  const whole = sections.map((s) => s.title + "\n" + s.text).join("\n");

  for (const cp of entry.checkpoints) {
    /* 1. 見出しの照合 */
    const actual = headings[cp.h2];
    if (actual === undefined || normalize(actual) !== normalize(cp.h2Title)) {
      titleMismatch.push(`${slug} / lead ${cp.lead} / h2 ${cp.h2}: JSON「${cp.h2Title}」 ≠ 原稿「${actual ?? "(無い)"}」`);
      continue;
    }
    /* 2. 数字と要点が、その節までに出ているか */
    const text = lead[cp.lead] ?? "";
    const wanted = numbersIn(text);
    const head = (cp.leadHead ?? "").slice(0, 12);
    const missingAt = (n) => {
      const seen = upto(n).replace(/\s+/g, "");
      const numsOk = wanted.every((w) => seen.includes(w.replace(/\s+/g, "")));
      const headOk = !head || seen.includes(head.replace(/\s+/g, ""));
      return !(numsOk || headOk);
    };
    if (!missingAt(cp.h2)) continue;
    /* 後ろの節を順に見て、最初に出るところへ動かす。
       ただし §2-3 のとおり「よくある質問」「まとめ」「出典」には置かない。
       同じ節に2件は置かない(要約が2つ並ぶため)。 */
    const taken = new Set(entry.checkpoints.filter((c) => c !== cp).map((c) => c.h2));
    let target = -1;
    for (let n = cp.h2 + 1; n < sections.length; n += 1) {
      if (BANNED_SECTION.test(sections[n].title)) continue;
      if (taken.has(n)) continue;
      if (!missingAt(n)) { target = n; break; }
    }
    if (target < 0) {
      notInBody.push(`${slug} / lead ${cp.lead}: ${wanted.join("・") || "(数字なし)"} が h2 ${cp.h2} までの本文に出ていない(置き場所は動かさない)`);
      continue;
    }
    moved.push({ slug, lead: cp.lead, from: cp.h2, to: target, title: sections[target].title });
    cp.h2 = target;
    cp.h2Title = sections[target].title;
  }
  /* 動かした結果、h2 昇順を保つ */
  entry.checkpoints.sort((a, b) => a.h2 - b.h2);
  const leads = entry.checkpoints.map((c) => c.lead).sort();
  if (leads.join(",") !== [0, 1, 2, 3].slice(0, leads.length).join(",")) {
    problems.push(`${slug}: lead の添字が 0..3 各1回になっていない(${leads.join(",")})`);
  }
  if (entry.checkpoints.length !== 4) problems.push(`${slug}: checkpoints が ${entry.checkpoints.length} 件`);
  const h2s = entry.checkpoints.map((c) => c.h2);
  if (new Set(h2s).size !== h2s.length) problems.push(`${slug}: 同じ h2 に2件以上ある(${h2s.join(",")})`);
  void whole;
}

console.log(`# 止まり所の照合(${slugs.length} slug × 4件)`);
console.log("");
console.log(`見出しの不一致: ${titleMismatch.length}`);
for (const m of titleMismatch) console.log(`  - ${m}`);
console.log(`後ろへ動かしたもの: ${moved.length}`);
for (const m of moved) console.log(`  - ${m.slug} / lead ${m.lead} / h2 ${m.from}→${m.to}(${m.title})`);
console.log(`本文未出(動かしても見つからない): ${notInBody.length}`);
for (const m of notInBody) console.log(`  - ${m}`);
console.log(`そのほかの問題: ${problems.length}`);
for (const m of problems) console.log(`  - ${m}`);

if (fix) {
  const text = JSON.stringify(checkpoints, null, 1) + "\n";
  writeFileSync(DOC_JSON, text);
  if (!existsSync("data/columns")) throw new Error("data/columns が無い");
  writeFileSync(DATA_JSON, text);
  console.log("");
  console.log(`書き戻した: ${DOC_JSON} と ${DATA_JSON}`);
}

if (titleMismatch.length > 0 || problems.length > 0) process.exitCode = 1;
