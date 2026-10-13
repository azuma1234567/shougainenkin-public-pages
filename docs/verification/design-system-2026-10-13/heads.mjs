#!/usr/bin/env node
/* 各ページの先頭 2600px だけを before|after で並べた確認用(50%)。 node heads.mjs <出力フォルダ名> [幅] */
import { mkdirSync, readdirSync } from "node:fs";
import sharp from "sharp";
const base = "docs/verification/design-system-2026-10-06/shots";
const name = process.argv[2] ?? "c7"; const width = Number(process.argv[3] ?? 375);
const out = `docs/verification/design-system-2026-10-13/${name}-heads`; mkdirSync(out, { recursive: true });
const H = 2600, SCALE = 0.5;
for (const f of readdirSync(`${base}/before`).filter((f) => f.endsWith(`-${width}.png`)).sort()) {
  const crop = async (p) => { const m = await sharp(p).metadata(); const h = Math.min(H, m.height); return sharp(p).extract({ left: 0, top: 0, width: m.width, height: h }).resize(Math.round(m.width * SCALE), Math.round(h * SCALE)).png().toBuffer(); };
  const [a, b] = await Promise.all([crop(`${base}/before/${f}`), crop(`${base}/after/${f}`)]);
  const w = Math.round(width * SCALE);
  await sharp({ create: { width: w * 2 + 12, height: Math.round(H * SCALE), channels: 4, background: "#9aa" } }).composite([{ input: a, left: 0, top: 0 }, { input: b, left: w + 12, top: 0 }]).png().toFile(`${out}/${f}`);
}
console.log(out);
