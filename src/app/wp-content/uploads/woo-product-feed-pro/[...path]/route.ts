import { NextResponse } from "next/server";

/**
 * GET /wp-content/uploads/woo-product-feed-pro/<...path>
 *
 * Server-side proxy for Product Feed PRO XML output.
 *
 * The plugin writes XML files to wp-content/uploads/woo-product-feed-pro/
 * on the WP backend host (wp.fussmatt.com). The customer/GMC-facing URL
 * must be the canonical hostname (fussmatt.com), so we fetch the WP file
 * server-side and stream it back under our own host with proper XML
 * content-type and cache headers.
 *
 * Next.js rewrites with external destinations issue a 308 redirect
 * rather than transparently proxying, which would leak wp.fussmatt.com
 * back into the final URL — defeating the point. A Route Handler is
 * the cleanest way to do a real server-side proxy.
 *
 * Cache: 1 hour browser/edge cache. Feed PRO regenerates daily; aligning
 * the cache lifetime under the regeneration cadence avoids serving stale
 * XML to GMC for more than an hour past a refresh.
 */

const WP_BASE = "https://wp.fussmatt.com/wp-content/uploads/woo-product-feed-pro";

export async function GET(
  req: Request,
  context: { params: Promise<{ path: string[] }> }
) {
  const { path } = await context.params;
  const cleanPath = path.map((seg) => encodeURIComponent(seg)).join("/");
  const upstream = `${WP_BASE}/${cleanPath}`;

  let res: Response;
  try {
    res = await fetch(upstream, {
      // Pass through ETag / If-None-Match so 304 still works
      headers: {
        "User-Agent": "fussmatt-feed-proxy/1.0",
      },
      // 30s upstream timeout — feed files can be a few MB
      signal: AbortSignal.timeout(30_000),
      // No Next.js caching here; we set our own cache header below
      cache: "no-store",
    });
  } catch {
    return new NextResponse("Upstream timeout", { status: 504 });
  }

  if (res.status === 404) {
    return new NextResponse("Feed not found", { status: 404 });
  }
  if (!res.ok) {
    return new NextResponse(`Upstream error ${res.status}`, {
      status: 502,
    });
  }

  const body = await res.arrayBuffer();

  // Pick a sensible content-type:
  //   - XML if the path ends in .xml (default Feed PRO output)
  //   - Otherwise pass-through whatever upstream said
  const contentType =
    cleanPath.toLowerCase().endsWith(".xml")
      ? "application/xml; charset=utf-8"
      : res.headers.get("content-type") ?? "application/octet-stream";

  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      // Edge + browser cache for 1h, allow stale-while-revalidate for 24h
      "Cache-Control":
        "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400",
      "X-Proxy-Source": "wp.fussmatt.com",
    },
  });
}
