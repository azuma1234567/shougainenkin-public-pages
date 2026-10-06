#!/usr/bin/env node
/* shots/before と shots/after のピクセル差分。寸法が違えばその旨、同じなら異なるピクセル数を出す。
 *   node docs/verification/design-system-2026-10-06/diff.mjs
 * 結果は diff.md に書く。差分のあるページは shots/diff/<name>-<width>.png に赤で印を付ける。 */
import { existsSync, mkdirSync, readdirSync, writeFileSync } from "node:fs";
import sharp from "sharp";

const base = "docs/verification/design-system-2026-10-06";
const files = readdirSync(`${base}/shots/before`).filter((f) => f.endsWith(".png")).sort();
mkdirSync(`${base}/shots/diff`, { recursive: true });
const rows = [];
let total = 0;
for (const f of files) {
  const after = `${base}/shots/after/${f}`;
  if (!existsSync(after)) { rows.push([f, "-", "-", "after が無い"]); total++; continue; }
  const a = sharp(`${base}/shots/before/${f}`).ensureAlpha().raw();
  const b = sharp(after).ensureAlpha().raw();
  const [ab, bb] = await Promise.all([a.toBuffer({ resolveWithObject: true }), b.toBuffer({ resolveWithObject: true })]);
  if (ab.info.width !== bb.info.width || ab.info.height !== bb.info.height) {
    rows.push([f, `${ab.info.width}×${ab.info.height}`, `${bb.info.width}×${bb.info.height}`, "寸法が違う"]); total++; continue;
  }
  let diff = 0;
  const mask = Buffer.alloc(ab.data.length);
  for (let i = 0; i < ab.data.length; i += 4) {
    if (ab.data[i] !== bb.data[i] || ab.data[i + 1] !== bb.data[i + 1] || ab.data[i + 2] !== bb.data[i + 2]) { diff++; mask[i] = 255; mask[i + 3] = 255; }
  }
  if (diff) {
    await sharp(mask, { raw: { width: ab.info.width, height: ab.info.height, channels: 4 } }).png().toFile(`${base}/shots/diff/${f}`);
    total++;
  }
  rows.push([f, `${ab.info.width}×${ab.info.height}`, `${bb.info.width}×${bb.info.height}`, diff === 0 ? "0" : `${diff} px`]);
}
const md = [`# before/after ピクセル差分(${new Date().toISOString().slice(0, 10)})`, "", `${files.length} 枚中、差分あり ${total} 枚。`, "", "| 画像 | before | after | 差分 |", "|---|---|---|---|", ...rows.map((r) => `| ${r.join(" | ")} |`), ""];
writeFileSync(`${base}/diff.md`, md.join("\n"));
console.log(md.join("\n"));
process.exit(total ? 1 : 0);
