import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Middleware: strip tracking query params (_gl, _ga, utm_*, fbclid, gclid)
 * These create unique cache keys in Vercel CDN, causing cache misses
 * and serving stale/empty pages.
 */

const TRACKING_PARAMS = [
  "_gl",
  "_ga",
  "_ga_",
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "fbclid",
  "gclid",
  "msclkid",
];

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  let stripped = false;

  for (const key of [...url.searchParams.keys()]) {
    if (TRACKING_PARAMS.some((p) => key.startsWith(p))) {
      url.searchParams.delete(key);
      stripped = true;
    }
  }

  if (stripped) {
    return NextResponse.redirect(url, 301);
  }

  // Security headers
  const response = NextResponse.next();
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Strict-Transport-Security",
    "max-age=63072000; includeSubDomains; preload"
  );

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico, robots.txt, sitemap.xml
     * - API routes
     */
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|api/).*)",
  ],
};
