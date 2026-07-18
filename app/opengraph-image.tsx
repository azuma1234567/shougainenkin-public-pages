import { ImageResponse } from "next/og";

export const alt =
  "障害年金申請サポート — 障害年金の申請準備を、ひとつずつ。";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
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
            justifyContent: "center",
            border: "4px solid #2e6350",
            borderRadius: "28px",
            padding: "70px 76px",
          }}
        >
          <div style={{ fontSize: 68, fontWeight: 700, lineHeight: 1.25 }}>
            障害年金申請サポート
          </div>
          <div
            style={{
              width: "120px",
              height: "8px",
              margin: "36px 0",
              borderRadius: "8px",
              background: "#2e6350",
            }}
          />
          <div style={{ fontSize: 38, lineHeight: 1.5 }}>
            障害年金の申請準備を、ひとつずつ。
          </div>
        </div>
      </div>
    ),
    size,
  );
}
