/**
 * Custom Next.js image loader.
 *
 * Replaces Vercel's built-in image optimizer (`/_next/image`), whose account
 * quota was exhausted on 2026-05-19 — it returned HTTP 402 for every remote
 * image and broke all storefront product images site-wide.
 *
 * Remote images are routed through wsrv.nl (images.weserv.nl) — a free,
 * no-account, Cloudflare-backed image CDN that resizes and converts to WebP.
 * No Vercel quota, no recurring cost.
 *
 * Verified 2026-05-19: a 145 KB source JPEG comes back as 15 KB (w=320),
 * 42 KB (w=640), 84 KB (w=1200) WebP — smaller/faster than both the old
 * Vercel optimizer and the temporary `unoptimized` (full-size) bridge.
 *
 * Configured via next.config.ts → images.loader = "custom" + loaderFile.
 */

const WSRV = "https://wsrv.nl/";

export default function fussmattImageLoader({
  src,
  width,
  quality,
}: {
  src: string;
  width: number;
  quality?: number;
}): string {
  // Local / static assets (relative paths, e.g. /logo.png, /_next/static/…) —
  // already served by the CDN at a fixed size; pass through untouched.
  if (src.startsWith("/")) return src;

  // Data URIs and already-wrapped wsrv URLs — pass through untouched.
  if (src.startsWith("data:") || src.startsWith(WSRV)) return src;

  // Remote images (wp.fussmatt.com, supplier CDNs, …) — resize + convert to
  // WebP via wsrv.nl. `we` = never upscale beyond the source dimensions.
  const q = quality && quality > 0 ? quality : 75;
  return `${WSRV}?url=${encodeURIComponent(src)}&w=${width}&q=${q}&output=webp&we`;
}
