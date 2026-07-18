import { ImageResponse } from "next/og";

export const size = { width: 512, height: 512 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#2e6350",
          color: "#f5f1e8",
          fontFamily: "sans-serif",
          fontSize: 270,
          fontWeight: 700,
          lineHeight: 1,
        }}
      >
        申
      </div>
    ),
    size,
  );
}
