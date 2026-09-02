import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { SITE_NAME } from "@/lib/constants";

// 誤解カードのOG画像。空色×白。
// 誤解の一文だけが独り歩きしないよう、同じ画像に必ず「本当は」を入れる。

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = "image/png";

// 日本語フォントを同梱する(scripts/build-og-font.py で生成)。
// next/og は同梱外の文字をビルド時にネットワークへ取りに行き、失敗すると豆腐になるため。
const FONT_FAMILY = "Noto Sans JP";
const fontFiles = { 400: "NotoSansJP-Regular.ttf", 700: "NotoSansJP-Bold.ttf" } as const;
let fontsPromise: Promise<{ name: string; data: ArrayBuffer; weight: 400 | 700; style: "normal" }[]> | null = null;
function loadFonts() {
  fontsPromise ??= Promise.all(
    (Object.entries(fontFiles) as [string, string][]).map(async ([weight, file]) => {
      const buffer = await readFile(join(process.cwd(), "lib", "fonts", file));
      return { name: FONT_FAMILY, data: buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength) as ArrayBuffer, weight: Number(weight) as 400 | 700, style: "normal" as const };
    }),
  );
  return fontsPromise;
}

// 誤解の一文と「本当は」を1枚に必ず収める。文字数に応じて段階的に縮める。
function misconceptionFontSize(length: number) {
  if (length > 28) return 46;
  if (length > 22) return 52;
  if (length > 16) return 58;
  return 66;
}

function truthFontSize(length: number) {
  if (length > 100) return 24;
  if (length > 78) return 26;
  if (length > 56) return 28;
  return 31;
}

export async function gokaiOgImage(misconception: string, truth: string) {
  const fonts = await loadFonts();
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "#f7fbfe",
          color: "#14425e",
          fontFamily: FONT_FAMILY,
          padding: "44px",
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            border: "4px solid #0273ad",
            borderRadius: "28px",
            background: "#ffffff",
            padding: "46px 56px",
            overflow: "hidden",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "22px" }}>
            <div style={{ fontSize: 26, fontWeight: 700, color: "#0273ad" }}>よくある誤解</div>
            <div
              style={{
                fontSize: misconceptionFontSize(misconception.length),
                fontWeight: 700,
                lineHeight: 1.38,
              }}
            >
              {misconception}
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                borderLeft: "6px solid #0284c7",
                background: "#eef6fc",
                borderRadius: "0 14px 14px 0",
                padding: "20px 24px",
                fontSize: truthFontSize(truth.length),
                lineHeight: 1.62,
                color: "#14425e",
              }}
            >
              <span style={{ flexShrink: 0, whiteSpace: "nowrap", fontWeight: 700, color: "#0273ad", marginRight: "16px" }}>本当は</span>
              <span style={{ flex: 1, minWidth: 0 }}>{truth}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", fontSize: 24, fontWeight: 700, color: "#0273ad" }}>
              {SITE_NAME}
            </div>
          </div>
        </div>
      </div>
    ),
    { ...OG_SIZE, fonts },
  );
}
