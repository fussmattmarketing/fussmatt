import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "FussMatt | Premium 3D & 5D Auto-Fussmatten";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #111827 0%, #1f2937 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "60px",
        }}
      >
        <div
          style={{
            fontSize: 72,
            fontWeight: 700,
            color: "#f59e0b",
            marginBottom: 20,
          }}
        >
          FussMatt
        </div>
        <div
          style={{
            fontSize: 36,
            color: "#d1d5db",
            textAlign: "center",
            maxWidth: 800,
          }}
        >
          Premium 3D &amp; 5D Auto-Fussmatten
        </div>
        <div
          style={{
            fontSize: 24,
            color: "#9ca3af",
            marginTop: 16,
          }}
        >
          Massgefertigt &bull; Wasserdicht &bull; 44+ Marken
        </div>
      </div>
    ),
    { ...size }
  );
}
