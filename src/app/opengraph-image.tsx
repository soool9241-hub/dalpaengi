import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "달팽이아지트 펜션";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #2d5016 0%, #4a7c23 40%, #6b9b37 100%)",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "40px 60px",
            borderRadius: "32px",
            background: "rgba(255,255,255,0.12)",
            backdropFilter: "blur(10px)",
          }}
        >
          <div style={{ fontSize: 80, marginBottom: 8 }}>🐌</div>
          <div
            style={{
              fontSize: 56,
              fontWeight: 800,
              color: "#ffffff",
              letterSpacing: "-1px",
              marginBottom: 12,
            }}
          >
            달팽이아지트
          </div>
          <div
            style={{
              fontSize: 24,
              color: "rgba(255,255,255,0.85)",
              marginBottom: 32,
            }}
          >
            서로다른 우리의 이야기가 피어나는 공간
          </div>
          <div
            style={{
              display: "flex",
              gap: 16,
            }}
          >
            {["숙박", "바베큐", "단체 프로그램", "물놀이"].map((tag) => (
              <div
                key={tag}
                style={{
                  fontSize: 18,
                  color: "#ffffff",
                  background: "rgba(255,255,255,0.2)",
                  padding: "8px 20px",
                  borderRadius: "20px",
                }}
              >
                {tag}
              </div>
            ))}
          </div>
        </div>
        <div
          style={{
            position: "absolute",
            bottom: 30,
            fontSize: 18,
            color: "rgba(255,255,255,0.6)",
          }}
        >
          dalpaengi-five.vercel.app
        </div>
      </div>
    ),
    { ...size }
  );
}
