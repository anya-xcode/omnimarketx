import { ImageResponse } from "next/og";

export const alt = "OmniMarketX - Trade what matters";
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
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "linear-gradient(135deg, #0b0d14 0%, #1a1030 60%, #3a1424 100%)",
          color: "#fff",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div style={{ width: 56, height: 56, borderRadius: 999, background: "linear-gradient(135deg,#ff7a45,#f0286b)" }} />
          <div style={{ display: "flex", fontSize: 40, fontWeight: 700 }}>
            <span>OmniMarket</span>
            <span style={{ color: "#ff4d86" }}>X</span>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ fontSize: 84, fontWeight: 800, letterSpacing: -2, lineHeight: 1 }}>Trade what matters.</div>
          <div style={{ fontSize: 32, color: "#c9cddb" }}>The social prediction market. Crypto, politics, sports, economy and more.</div>
        </div>
        <div style={{ display: "flex", gap: 14 }}>
          {["Yes 62¢", "No 38¢", "$16.5M traded", "Demo trading open"].map((t) => (
            <div key={t} style={{ padding: "12px 22px", borderRadius: 999, background: "rgba(255,255,255,0.1)", fontSize: 24, fontWeight: 600 }}>
              {t}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size },
  );
}
