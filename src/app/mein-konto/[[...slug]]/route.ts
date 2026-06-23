import { NextRequest } from "next/server";

/**
 * /mein-konto proxy — keeps the URL on fussmatt.com while serving the
 * WooCommerce "Mein Konto" pages from wp.fussmatt.com.
 *
 * Why a route handler (not next.config rewrites): Next.js rewrites with an
 * external destination emit a 308 redirect rather than proxying (same note
 * as the Product-Feed XML proxy), which would bounce the user to
 * wp.fussmatt.com. This handler fetches + streams instead, so the address
 * bar stays fussmatt.com/mein-konto.
 *
 * Login/session: WooCommerce auth cookies are issued for the WP host. We
 * strip the `Domain=` attribute on every Set-Cookie so the browser stores
 * them host-only under fussmatt.com, and we forward them back to WP on each
 * request. WordPress validates auth cookies by hash (not by domain), so the
 * session survives the host swap. WP redirects (Location) and in-page
 * /mein-konto links are rewritten back to the fussmatt.com host; asset URLs
 * (wp-content / wp-includes / wp-json) are left pointing at wp.fussmatt.com
 * so CSS/JS/images keep loading without an extra asset proxy.
 */

const WP_ORIGIN = "https://wp.fussmatt.com";
const SELF_ORIGIN = "https://fussmatt.com";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

async function handle(
  req: NextRequest,
  ctx: { params: Promise<{ slug?: string[] }> }
): Promise<Response> {
  const { slug } = await ctx.params;
  const subPath = slug?.length ? "/" + slug.join("/") : "";
  const { search } = new URL(req.url);
  // Always request WP with a trailing slash. WooCommerce 301-redirects
  // /mein-konto → /mein-konto/; forwarding that 301 (combined with Next's
  // own trailing-slash handling) produced a 301↔308 loop the CDN cut off
  // with 429. Hitting the canonical /mein-konto/ form returns 200 directly.
  let wpPath = `/mein-konto${subPath}`;
  if (!wpPath.endsWith("/")) wpPath += "/";
  const target = `${WP_ORIGIN}${wpPath}${search}`;

  // --- forward request → WP ---
  const fwdHeaders = new Headers();
  const passReq = [
    "cookie",
    "content-type",
    "user-agent",
    "accept",
    "accept-language",
  ];
  for (const h of passReq) {
    const v = req.headers.get(h);
    if (v) fwdHeaders.set(h, v);
  }
  // WooCommerce nonce checks can look at Referer/Origin — present as WP host.
  fwdHeaders.set("referer", `${WP_ORIGIN}/mein-konto${subPath}`);
  fwdHeaders.set("origin", WP_ORIGIN);

  const init: RequestInit = {
    method: req.method,
    headers: fwdHeaders,
    redirect: "manual",
  };
  if (req.method !== "GET" && req.method !== "HEAD") {
    init.body = await req.arrayBuffer();
  }

  const wpRes = await fetch(target, init);

  // --- build response → browser ---
  const outHeaders = new Headers();

  // Set-Cookie: drop Domain= so cookies are host-only on fussmatt.com.
  const setCookies = wpRes.headers.getSetCookie();
  for (const sc of setCookies) {
    outHeaders.append(
      "set-cookie",
      sc.replace(/;\s*Domain=[^;]+/i, "")
    );
  }

  // Location: rewrite WP host → relative so redirects stay on fussmatt.com.
  const loc = wpRes.headers.get("location");
  if (loc) {
    outHeaders.set(
      "location",
      loc.replace(WP_ORIGIN, "").replace(SELF_ORIGIN, "")
    );
  }

  const contentType = wpRes.headers.get("content-type") || "";
  if (contentType) outHeaders.set("content-type", contentType);
  const cc = wpRes.headers.get("cache-control");
  if (cc) outHeaders.set("cache-control", cc);
  else outHeaders.set("cache-control", "private, no-store");

  // HTML: rewrite only My-Account links back on-host; leave asset hosts alone.
  if (contentType.includes("text/html")) {
    let html = await wpRes.text();
    html = html
      .replaceAll(`${WP_ORIGIN}/mein-konto`, "/mein-konto")
      .replaceAll(`${WP_ORIGIN}/wp-login.php`, "/wp-login.php")
      .replaceAll(`action="${WP_ORIGIN}/"`, `action="/"`);
    return new Response(html, { status: wpRes.status, headers: outHeaders });
  }

  return new Response(wpRes.body, {
    status: wpRes.status,
    headers: outHeaders,
  });
}

export const GET = handle;
export const POST = handle;
export const HEAD = handle;
