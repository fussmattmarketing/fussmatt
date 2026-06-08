import { NextRequest, NextResponse } from "next/server";

const isDev = process.env.NODE_ENV === "development";

// Tracking params that pollute CDN cache keys
const TRACKING_PARAMS = [
  "_gl", "_ga", "_ga_",
  "utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content",
  "fbclid", "gclid", "msclkid",
];

/**
 * Allow-list of every routable first-segment under src/app/. Anything
 * else gets 307'd to / (CEO policy 2026-06-09: dead URLs land on home,
 * not a 404 page).
 *
 * Why proxy and not not-found.tsx: Vercel ships the build-time 404
 * output as a cached static asset. RSC `redirect("/")` (with or without
 * force-dynamic) gets shadowed by that cache and the redirect never
 * runs at request time. The proxy hook runs at Vercel Edge runtime
 * BEFORE static asset serving — its 307 response is real and not
 * cacheable.
 *
 * When adding a new top-level segment under src/app/ (e.g. a new
 * /lp-landing/), append it here. Forgetting means the new route 307s
 * to / and you notice on first visit.
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
  // Routes that next.config redirects() rewrites — pass them through
  // so the config rule fires; dropping them here would 307 to / first
  // and the redirect rule would never see the URL.
  "shop",
  "mein-konto",
  // Route handler
  "feed",
  // Wp uploads media proxy (next.config rewrites to wp.fussmatt.com).
  // Not strictly needed since the existing matcher already excludes
  // dotted paths, but kept explicit for resilience.
  "uploads",
  // API routes — should bypass via the matcher but keep listed defensively
  "api",
]);

const scriptSrc = [
  "'self'",
  "'unsafe-inline'",
  ...(isDev ? ["'unsafe-eval'"] : []),
  "https://js.stripe.com",
  "https://www.googletagmanager.com",
  "https://www.google-analytics.com",
  "https://googletagmanager.com",
  "https://*.google-analytics.com",
  "https://*.googletagmanager.com",
  "https://tagmanager.google.com",
].join(" ");

const securityHeaders: Record<string, string> = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "X-XSS-Protection": "1; mode=block",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
  "Content-Security-Policy": [
    "default-src 'self'",
    `script-src ${scriptSrc}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https: blob: https://www.googletagmanager.com https://www.google-analytics.com https://*.google-analytics.com https://stats.g.doubleclick.net",
    "font-src 'self' https://fonts.gstatic.com",
    `connect-src 'self' https://api.stripe.com https://www.google-analytics.com https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com https://stats.g.doubleclick.net https://*.fussmatt.com https://*.fussmattenprofi.com${isDev ? " ws://localhost:* http://localhost:*" : ""}`,
    "frame-src 'self' https://js.stripe.com https://www.googletagmanager.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join("; "),
};

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // 1. Unknown-route catch-all → 307 to homepage (CEO-2 dead-link policy).
  //    Runs first so it short-circuits before UTM rewrites or security
  //    header attachment on URLs we're throwing away anyway.
  if (pathname !== "/" && pathname !== "") {
    const firstSeg = pathname.split("/")[1];
    if (firstSeg && !APP_ROOTS.has(firstSeg)) {
      return NextResponse.redirect(new URL("/", request.url), 307);
    }
  }

  // 2. Strip GA/UTM tracking params to prevent CDN cache pollution
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

  // 3. Security headers
  const response = NextResponse.next();
  for (const [key, value] of Object.entries(securityHeaders)) {
    response.headers.set(key, value);
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)" ],
};
