import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 8,
          background: "#1a1a1a",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Stylised "R" for Rift & Root */}
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Leaf / sprout shape */}
          <path
            d="M10 17C10 17 4 13 4 8C4 5.239 6.686 3 10 3C13.314 3 16 5.239 16 8C16 13 10 17 10 17Z"
            fill="#c8a96e"
          />
          <line x1="10" y1="17" x2="10" y2="10" stroke="#1a1a1a" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>
    ),
    { ...size }
  );
}
