import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "4mb",
    },
  },
  images: {
    // Custom loader (src/lib/image-loader.ts) — routes remote images through
    // wsrv.nl for on-the-fly resize + WebP, fully bypassing Vercel's metered
    // image optimizer (whose quota exhaustion 402'd every image 2026-05-19).
    // No Vercel quota, no recurring cost. Supersedes the temporary
    // `unoptimized` bridge. deviceSizes/imageSizes still drive which widths
    // the loader is asked for; remotePatterns kept as allowed-source docs.
    loader: "custom",
    loaderFile: "./src/lib/image-loader.ts",
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "wp.fussmatt.com",
      },
      {
        protocol: "https",
        hostname: "**.fussmattenprofi.com",
      },
      {
        protocol: "https",
        hostname: "cdn.fussmattenprofi.com",
      },
      {
        protocol: "https",
        hostname: "secure.gravatar.com",
      },
      {
        protocol: "https",
        hostname: "placehold.co",
      },
    ],
  },
};

export default nextConfig;
