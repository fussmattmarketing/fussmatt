import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "4mb",
    },
  },
  images: {
    // TEMPORARY (2026-05-19) — Vercel Image Optimization quota is exhausted:
    // /_next/image returns HTTP 402 for every remote (wp.fussmatt.com) image,
    // so all storefront product images broke site-wide. `unoptimized` bypasses
    // Vercel's metered optimizer — <Image> serves images straight from
    // wp.fussmatt.com, so they work again with no quota dependency.
    // Trade-off: full-size images (heavier pages). PERMANENT FIX = a custom
    // image loader that resizes/optimizes without Vercel's quota (follow-up).
    unoptimized: true,
    formats: ["image/avif", "image/webp"],
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
