import { inflateSync } from "node:zlib";

// 検証用の最小PNGデコーダ。next/og が出すのは8bit RGBA・非インターレースなので、
// その形式だけを読む。行フィルタ(0〜4)を戻して生のRGBAを返す。
export function decodePng(buffer) {
  if (buffer.readUInt32BE(0) !== 0x89504e47) throw new Error("PNGではない");
  let offset = 8;
  let width = 0;
  let height = 0;
  const idat = [];
  while (offset < buffer.length) {
    const length = buffer.readUInt32BE(offset);
    const type = buffer.toString("ascii", offset + 4, offset + 8);
    const data = buffer.subarray(offset + 8, offset + 8 + length);
    if (type === "IHDR") {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      if (data[8] !== 8 || data[9] !== 6 || data[12] !== 0) throw new Error("8bit RGBA・非インターレースのみ対応");
    } else if (type === "IDAT") {
      idat.push(data);
    } else if (type === "IEND") {
      break;
    }
    offset += length + 12;
  }
  const raw = inflateSync(Buffer.concat(idat));
  const stride = width * 4;
  const pixels = Buffer.alloc(height * stride);
  for (let y = 0; y < height; y += 1) {
    const filter = raw[y * (stride + 1)];
    const line = raw.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1));
    for (let x = 0; x < stride; x += 1) {
      const a = x >= 4 ? pixels[y * stride + x - 4] : 0;
      const b = y > 0 ? pixels[(y - 1) * stride + x] : 0;
      const c = x >= 4 && y > 0 ? pixels[(y - 1) * stride + x - 4] : 0;
      let value = line[x];
      if (filter === 1) value += a;
      else if (filter === 2) value += b;
      else if (filter === 3) value += Math.floor((a + b) / 2);
      else if (filter === 4) {
        const p = a + b - c;
        const pa = Math.abs(p - a);
        const pb = Math.abs(p - b);
        const pc = Math.abs(p - c);
        value += pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
      }
      pixels[y * stride + x] = value & 0xff;
    }
  }
  return { width, height, pixels };
}

// 指定した行に、背景色以外の画素があるか。枠外へのはみ出し検査に使う。
export function rowHasInk({ width, pixels }, y, background) {
  for (let x = 0; x < width; x += 1) {
    const index = (y * width + x) * 4;
    if (pixels[index] !== background[0] || pixels[index + 1] !== background[1] || pixels[index + 2] !== background[2]) return true;
  }
  return false;
}

// 指定した列に、背景色以外の画素があるか。左右へのはみ出し検査に使う。
export function colHasInk({ width, height, pixels }, x, background) {
  for (let y = 0; y < height; y += 1) {
    const index = (y * width + x) * 4;
    if (pixels[index] !== background[0] || pixels[index + 1] !== background[1] || pixels[index + 2] !== background[2]) return true;
  }
  return false;
}
