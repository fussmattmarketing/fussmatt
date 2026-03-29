import { NextRequest, NextResponse } from "next/server";

const isDev = process.env.NODE_ENV === "development";

// In development, React needs 'unsafe-eval' for error overlay and debugging.
// In production, 'unsafe-eval' is NOT included — this is intentional for security.
const scriptSrc = [
  "'self'",
  "'unsafe-inline'",
  ...(isDev ? ["'unsafe-eval'"] : []),
  "https://js.stripe.com",
  "https://www.googletagmanager.com",
  "https://www.google-analytics.com",
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
    "img-src 'self' data: https: blob:",
    "font-src 'self' https://fonts.gstatic.com",
    `connect-src 'self' https://api.stripe.com https://www.google-analytics.com https://*.fussmatt.com https://*.fussmattenprofi.com${isDev ? " ws://localhost:* http://localhost:*" : ""}`,
    "frame-src 'self' https://js.stripe.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join("; "),
};

export function proxy(request: NextRequest) {
  const response = NextResponse.next();

  for (const [key, value] of Object.entries(securityHeaders)) {
    response.headers.set(key, value);
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)" ],
};
