import { ImageResponse } from "next/og";
import { SITE_NAME } from "@/lib/constants";

// コラム記事用のOG画像テンプレート。
// 各記事フォルダの opengraph-image.tsx から呼び出す。
// トップ用(app/opengraph-image.tsx)と同じ配色に揃える。

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = "image/png";

export function columnOgImage(title: string) {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f5f1e8",
          color: "#234c3d",
          fontFamily: "sans-serif",
          padding: "54px",
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            border: "4px solid #2e6350",
            borderRadius: "28px",
            padding: "64px 70px",
          }}
        >
          <div
            style={{
              fontSize: title.length > 32 ? 52 : 58,
              fontWeight: 700,
              lineHeight: 1.4,
            }}
          >
            {title}
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "20px",
            }}
          >
            <div
              style={{
                width: "56px",
                height: "8px",
                borderRadius: "8px",
                background: "#2e6350",
              }}
            />
            <div style={{ fontSize: 32, color: "#2e6350", fontWeight: 700 }}>
              {SITE_NAME}
            </div>
          </div>
        </div>
      </div>
    ),
    OG_SIZE,
  );
}
