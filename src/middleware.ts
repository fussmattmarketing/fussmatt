import { NextResponse, type NextRequest } from "next/server";

/**
 * Catch-all middleware for unknown URLs.
 *
 * Background: not-found.tsx with `redirect("/")` plus `force-dynamic`
 * was the first attempt (commits b7a312e + e3a44b5). The redirect()
 * call is correct, but Vercel's edge layer ships the build-time 404
 * output as a static asset and serves it back with `cache=HIT`. The
 * RSC never runs at request time, so the redirect never fires.
 *
 * Middleware runs at the Vercel Edge runtime BEFORE static asset
 * serving. From here we can detect an unknown root segment and issue
 * a real 307 response that bypasses every cache layer.
 *
 * Strategy:
 *   - Maintain an allow-list of every routable first-segment in the app
 *     directory (src/app/<segment>/page.tsx or route.ts).
 *   - Add `_next`, `api`, static-asset matchers in the matcher config so
 *     middleware doesn't touch them in the first place.
 *   - Anything else → 307 to /.
 *
 * Cost: ~1ms per request on bonafide routes (single Set lookup, no I/O).
 * When adding a new top-level segment under src/app/, update APP_ROOTS
 * — otherwise the new route 307s to / and you'll notice immediately.
 */

const APP_ROOTS = new Set([
  // Page routes (src/app/<seg>/page.tsx)
  "produkte",
  "kategorie",
  "produkt",
  "marke",
  "kasse",
  "warenkorb",
  "bestellung-bestaetigung",
  "bestellung-verfolgen",
  "kontakt",
  "faq",
  "ratgeber",
  "agb",
  "datenschutz",
  "impressum",
  "widerruf",
  "versand",
  "zahlungsmethoden",
  "ueber-uns",
  // Redirected via next.config redirects() — let through so the config
  // can transform them; if dropped here the redirect rule never fires.
  "shop",
  "mein-konto",
  // Route handlers
  "feed",
]);

export function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  // Root path is always valid
  if (pathname === "/" || pathname === "") return NextResponse.next();

  const firstSeg = pathname.split("/")[1];
  if (APP_ROOTS.has(firstSeg)) return NextResponse.next();

  // Unknown root segment → 307 to homepage
  const homeUrl = new URL("/", req.url);
  return NextResponse.redirect(homeUrl, 307);
}

export const config = {
  // Skip Next internals, static assets, the WP-uploads proxy rewrite,
  // and anything with a file extension (favicon, robots.txt, images).
  matcher: [
    "/((?!_next/static|_next/image|_next/data|api|favicon|robots|sitemap|opengraph-image|apple-icon|icon|uploads|.*\\..*).*)",
  ],
};
