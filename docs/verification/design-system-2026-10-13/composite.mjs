#!/usr/bin/env node
/* before/after を左右に並べた比較画像(40% 縮小)。 node composite.mjs <出力フォルダ名> */
import { mkdirSync, readdirSync } from "node:fs";
import sharp from "sharp";
const base = "docs/verification/design-system-2026-10-06/shots";
const out = `docs/verification/design-system-2026-10-13/${process.argv[2] ?? "c7"}`;
mkdirSync(out, { recursive: true });
const SCALE = 0.4;
for (const f of readdirSync(`${base}/before`).filter((f) => f.endsWith(".png")).sort()) {
  const a = sharp(`${base}/before/${f}`), b = sharp(`${base}/after/${f}`);
  const [ma, mb] = await Promise.all([a.metadata(), b.metadata()]);
  const w = Math.round(ma.width * SCALE), ha = Math.round(ma.height * SCALE), hb = Math.round(mb.height * SCALE);
  const h = Math.max(ha, hb);
  const [ba, bb] = await Promise.all([a.resize(w, ha).png().toBuffer(), b.resize(w, hb).png().toBuffer()]);
  await sharp({ create: { width: w * 2 + 16, height: h, channels: 4, background: "#9aa" } })
    .composite([{ input: ba, left: 0, top: 0 }, { input: bb, left: w + 16, top: 0 }]).png().toFile(`${out}/${f}`);
}
console.log("composites in", out);
