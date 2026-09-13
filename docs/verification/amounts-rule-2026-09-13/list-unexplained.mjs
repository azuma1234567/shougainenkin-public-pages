// 金額の説明ルールの締め直し(2026-09-13)の前後で、「未説明」と「近似だけで説明済み」の金額を一覧にする。
// node --import ./scripts/lib/ts-alias.mjs docs/verification/amounts-rule-2026-09-13/list-unexplained.mjs <出力ファイル>
// 対象: .next の全ページの本文(prelaunch A-8 と同じ visible)、コラム原稿(lead+本文、検査6と同じ)、誤解カード本文、カードの figure。
import { readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
const { explainAmount, findAmounts, contextAround, amountTextFromHtml } = await import("../../../scripts/lib/amounts-derive.mjs");
const { ASSUMED_EXAMPLE_AMOUNTS } = await import("../../../scripts/lib/amounts-assumed.mjs");
const { AMOUNTS_2026, REFERENCE_AMOUNTS, STATISTICS } = await import("../../../data/amounts.ts");
const extra = { reference: REFERENCE_AMOUNTS, statistics: STATISTICS };
const { COLUMNS } = await import("../../../lib/columns.ts");
const { GOKAI } = await import("../../../data/gokai.ts");
const { GOKAI_BODIES } = await import("../../../data/gokai-bodies.ts");
const { blockText } = await import("../../../scripts/verify-gokai-bodies.mjs");
const { parseColumns } = await import("../../../scripts/import-columns.mjs");
const out = process.argv[2];
const rows = new Map(); // key: `${where}|${amount}` → {where, amount, kind, expr, pages:Set, ctx}
const add = (where, amount, expr, page, ctx, min) => {
  const value = Number(String(amount).replace(/[,円]/g, ""));
  const kind = expr == null ? (value >= min ? "未説明(検査対象)" : "未説明(検査対象外)") : expr.includes("≒") ? "近似" : expr.startsWith("仮定値") ? "仮定値" : "式";
  const k = `${where}|${amount}`;
  const r = rows.get(k) ?? { where, amount, value, kind, expr: expr ?? "", pages: new Set(), ctx: ctx.replace(/\s+/g, " ").trim().slice(0, 90) };
  r.pages.add(page); rows.set(k, r);
};
// 1. .next の全ページ(prelaunch A-8 と同じ。10万円以上が検査対象だが、一覧は1万円以上)
const root = ".next/server/app"; const files = [];
const walk = (d) => { for (const n of readdirSync(d)) { const f = path.join(d, n); if (statSync(f).isDirectory()) walk(f); else if (n.endsWith(".html")) files.push(f); } };
walk(root);
for (const f of files) {
  const html = readFileSync(f, "utf8");
  const title = (html.match(/<title[^>]*>([^<]*)<\/title>/)?.[1] ?? "").trim(); const desc = html.match(/<meta name="description" content="([^"]*)"/)?.[1] ?? "";
  const visible = amountTextFromHtml(html) + "\n" + title + "\n" + desc;
  const page = "/" + path.relative(root, f).replace(/\.html$/, "").replace(/^index$/, "");
  for (const a of findAmounts(visible, 10000)) {
    const assumed = ASSUMED_EXAMPLE_AMOUNTS[a.value];
    const assumedHere = assumed && assumed.split("。").some((part) => page.includes(part.split(":")[0]));
    const expr = (assumedHere ? `仮定値: ${assumed}` : null) ?? explainAmount(a.text, AMOUNTS_2026, contextAround(visible, a.index), extra) ?? (assumed ? `仮定値: ${assumed}` : null);
    add("ページ本文(A-8)", a.text, expr, page, contextAround(visible, a.index), 100000);
  }
}
// 2. コラム原稿(検査6と同じ: lead+本文、円省略も拾う、仮定値は slug 一致のみ)
for (const a of Object.values(parseColumns())) {
  const column = COLUMNS.find((c) => c.slug === a.slug);
  const text = [column.metaTitle ?? "", column.title, column.description, ...a.lead, a.content].join("\n");
  for (const m of text.matchAll(/\d{1,3}(?:,\d{3})+(?:円)?/g)) {
    if (/^(件|人|回|日|か所|カ所|ヶ所|事業所|票|世帯)/.test(text.slice(m.index + m[0].length, m.index + m[0].length + 3))) continue;
    const value = Number(m[0].replace(/[,円]/g, "")); if (value < 10000) continue;
    const ctx = contextAround(text, m.index);
    const reason = ASSUMED_EXAMPLE_AMOUNTS[value];
    const expr = reason?.split("。").some((part) => part.startsWith(`${a.slug}:`)) ? `仮定値: ${reason}` : explainAmount(value, AMOUNTS_2026, ctx, extra);
    add("コラム原稿(検査6)", m[0], expr, a.slug, ctx, 100000);
  }
}
// 3. 誤解カード本文(verify-gokai-bodies: 全金額、報告のみ)と figure(verify-gokai: 全金額、致命的)
for (const body of Object.values(GOKAI_BODIES)) for (const block of body.sections.flatMap((s) => s.blocks)) {
  const ctx = blockText(block);
  for (const [amount] of ctx.matchAll(/\d{1,3}(,\d{3})+円/g)) add("誤解カード本文", amount, explainAmount(amount, AMOUNTS_2026, ctx, extra), body.slug, ctx, 0);
}
for (const card of GOKAI) for (const a of findAmounts(card.figure ?? "")) add("誤解カード figure", a.text, explainAmount(a.text, AMOUNTS_2026, card.figure, extra), card.slug, card.figure, 0);
const list = [...rows.values()].sort((a, b) => a.where.localeCompare(b.where) || a.value - b.value);
const lines = [`# 金額の説明の一覧 (${new Date().toISOString().slice(0, 10)})`, "", "| 区分 | 金額 | 判定 | 式 | 出現 | 文脈(例) |", "|---|---|---|---|---|---|"];
for (const r of list) lines.push(`| ${r.where} | ${r.amount} | ${r.kind} | ${r.expr.replace(/\|/g, "／")} | ${r.pages.size}: ${[...r.pages].slice(0, 2).join(", ")} | ${r.ctx.replace(/\|/g, "／")} |`);
const summary = {}; for (const r of list) summary[`${r.where}/${r.kind}`] = (summary[`${r.where}/${r.kind}`] ?? 0) + 1;
lines.push("", "## 件数(金額の種類)", ...Object.entries(summary).sort().map(([k, v]) => `- ${k}: ${v}`));
writeFileSync(out, lines.join("\n") + "\n");
console.log(Object.entries(summary).sort().map(([k, v]) => `${k}: ${v}`).join("\n"));
