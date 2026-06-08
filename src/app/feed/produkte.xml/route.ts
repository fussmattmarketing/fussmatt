import { NextResponse } from "next/server";

/**
 * GET /feed/produkte.xml
 *
 * Public, canonical-host URL for the Product Feed PRO XML output. The
 * file physically lives at wp.fussmatt.com under wp-content/uploads/
 * woo-product-feed-pro/ — we fetch it server-side and stream it back
 * under fussmatt.com so the URL registered in Google Merchant Center
 * matches the hostname customers see everywhere else.
 *
 * Previous attempt at /wp-content/uploads/woo-product-feed-pro/[...path]/
 * route.ts was shadowed by Vercel's edge routing (likely conflicting with
 * the /uploads/:path* image rewrite or wp-content path heuristics) — it
 * kept returning the rewrite's 308. This shorter, dedicated path lives
 * under /feed/ where no other rewrite or route matches it.
 *
 * Cache: 1h browser/edge cache + 24h stale-while-revalidate. Feed PRO
 * regenerates daily; this keeps GMC from seeing more than ~1h of stale
 * XML past a refresh while staying friendly to high-volume fetches.
 */

const UPSTREAM =
  "https://wp.fussmatt.com/wp-content/uploads/woo-product-feed-pro/xml/zjhlflyous9kyegm29os7o8p9fx8p6xm.xml";

export async function GET() {
  let res: Response;
  try {
    res = await fetch(UPSTREAM, {
      headers: { "User-Agent": "fussmatt-feed-proxy/1.0" },
      signal: AbortSignal.timeout(30_000),
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

  // Read as text so we can rewrite any leftover wp.fussmatt.com host
  // references to the canonical fussmatt.com host. Feed PRO is supposed
  // to emit fussmatt.com URLs (the noindex plugin's home_url filter
  // handles that), but if the feed was ever regenerated while the
  // filter wasn't active (e.g. during plugin maintenance windows) the
  // XML on disk can be left with wp.fussmatt.com URLs baked in. This
  // proxy-side rewrite makes the served bytes always show the canonical
  // host, regardless of how / when the upstream file was generated.
  const raw = await res.text();
  const canonical = raw.split("wp.fussmatt.com").join("fussmatt.com");

  return new NextResponse(canonical, {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control":
        "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400",
      "X-Proxy-Source": "wp.fussmatt.com",
      "X-Proxy-Rewrite": "wp.fussmatt.com→fussmatt.com",
    },
  });
}
