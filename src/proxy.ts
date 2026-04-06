import { NextRequest, NextResponse } from "next/server";

const isDev = process.env.NODE_ENV === "development";

// Tracking params that pollute CDN cache keys
const TRACKING_PARAMS = [
  "_gl", "_ga", "_ga_",
  "utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content",
  "fbclid", "gclid", "msclkid",
];

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
  // Strip GA/UTM tracking params to prevent CDN cache pollution
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
  for (const [key, value] of Object.entries(securityHeaders)) {
    response.headers.set(key, value);
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)" ],
};
