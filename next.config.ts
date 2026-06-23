import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "4mb",
    },
  },
  async rewrites() {
    return [
      // Canonical-hostname proxy for WP-hosted media. Schema.org Product
      // image fields emit fussmatt.com URLs (storefront-consistent) but
      // physical bytes live at wp.fussmatt.com. This rewrite serves them
      // transparently under fussmatt.com so Google's automated trust
      // signals see one consistent hostname.
      {
        source: "/uploads/:path*",
        destination: "https://wp.fussmatt.com/wp-content/uploads/:path*",
      },
      // (Product Feed PRO XML proxy lives in src/app/wp-content/uploads/
      // woo-product-feed-pro/[...path]/route.ts — Next.js rewrites with
      // external destinations send a 308 redirect rather than proxying,
      // so we use a Route Handler that fetches + streams the XML under
      // the canonical fussmatt.com hostname.)
    ];
  },
  async redirects() {
    return [
      // WooCommerce auto-registers /shop (page id=6) and /mein-konto
      // (page id=9) on the WP backend. Headless frontend has no matching
      // Next.js routes — pre-redirect, both URLs returned 403 from
      // Vercel's edge. /shop maps onto our canonical product list
      // (/produkte); /mein-konto is bounced to wp.fussmatt.com where the
      // WC My Account template is live (noindex'd, so SEO-safe).
      {
        source: "/shop",
        destination: "/produkte",
        permanent: true,
      },
      {
        source: "/shop/:path*",
        destination: "/produkte",
        permanent: true,
      },
      // /mein-konto is now served by a route-handler proxy
      // (src/app/mein-konto/[[...slug]]/route.ts) that streams the WC
      // My-Account pages under the fussmatt.com host, so the URL no longer
      // redirects to wp.fussmatt.com.
    ];
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
