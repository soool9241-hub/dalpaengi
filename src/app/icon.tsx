import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#4a7c23",
          borderRadius: "8px",
          fontSize: 20,
        }}
      >
        🐌
      </div>
    ),
    { ...size }
  );
}
