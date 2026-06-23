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

// Injected skin: hides the raw WP (twentytwentyfive) theme chrome and
// restyles the WooCommerce My-Account markup to match the fussmatt.com
// storefront (amber accent, rounded cards, system font). Broad + !important
// because the WP block theme ships heavy inline styles.
const FM_STYLE = `<style id="fm-account-skin">
:root{--fm:#d97706;--fm-d:#b45309}
header.wp-block-template-part,footer.wp-block-template-part,.wp-site-blocks>header,.wp-site-blocks>footer{display:none!important}
html,body.woocommerce-account{background:#f9fafb!important}
body.woocommerce-account *{font-family:ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,Helvetica,Arial,sans-serif!important}
.wp-site-blocks main,main.wp-block-group{max-width:520px!important;margin:0 auto!important;padding:8px 18px 64px!important}
.fm-account-bar{max-width:520px;margin:0 auto;padding:22px 18px 4px;display:flex;align-items:center;justify-content:space-between}
.fm-account-bar .fm-logo{font-size:1.3rem;font-weight:800;color:#111827;text-decoration:none;letter-spacing:-.02em}
.fm-account-bar .fm-back{font-size:.85rem;color:var(--fm);text-decoration:none;font-weight:600}
.fm-account-bar .fm-back:hover{text-decoration:underline}
.woocommerce{background:#fff;border:1px solid #eef0f2;border-radius:16px;padding:28px 24px;box-shadow:0 1px 3px rgba(0,0,0,.04);margin-top:18px}
.woocommerce h1,.woocommerce h2,.entry-title{font-size:1.35rem!important;font-weight:700!important;color:#111827!important;margin:0 0 18px!important}
.woocommerce-Input.input-text,body.woocommerce-account input[type=text],body.woocommerce-account input[type=email],body.woocommerce-account input[type=password],body.woocommerce-account input[type=tel]{width:100%!important;padding:11px 14px!important;border:1px solid #d1d5db!important;border-radius:10px!important;font-size:.95rem!important;box-sizing:border-box!important;background:#fff!important;color:#111827!important}
body.woocommerce-account input:focus{outline:none!important;border-color:var(--fm)!important;box-shadow:0 0 0 3px rgba(217,119,6,.15)!important}
.woocommerce-form-row label,body.woocommerce-account form label{display:block;font-size:.85rem;font-weight:600;color:#374151;margin-bottom:6px}
.woocommerce-form-row,.form-row{margin-bottom:16px!important}
.woocommerce-button,.woocommerce .button,.wp-element-button,body.woocommerce-account button[type=submit]{background:var(--fm)!important;color:#fff!important;border:none!important;border-radius:10px!important;padding:12px 22px!important;font-weight:600!important;font-size:.95rem!important;cursor:pointer!important;box-shadow:none!important;text-decoration:none!important;display:inline-block}
.woocommerce-button:hover,.wp-element-button:hover,body.woocommerce-account button[type=submit]:hover{background:var(--fm-d)!important}
.woocommerce-form-login__rememberme{font-weight:400!important;font-size:.85rem!important;color:#6b7280!important;display:flex;align-items:center;gap:6px}
.woocommerce-LostPassword a{color:var(--fm)!important;font-size:.85rem}
.woocommerce-MyAccount-navigation ul{list-style:none!important;padding:0!important;margin:0 0 20px!important;display:flex;flex-wrap:wrap;gap:8px}
.woocommerce-MyAccount-navigation li a{display:block;padding:8px 14px;border-radius:9px;background:#f3f4f6;color:#374151!important;text-decoration:none;font-size:.88rem;font-weight:500}
.woocommerce-MyAccount-navigation li.is-active a,.woocommerce-MyAccount-navigation li a:hover{background:var(--fm);color:#fff!important}
.woocommerce-message,.woocommerce-error,.woocommerce-info{border-radius:10px!important;border-left:3px solid var(--fm)!important;background:#fff!important}
</style>`;

const FM_BAR = `<div class="fm-account-bar"><a href="/" class="fm-logo">FussMatt</a><a href="/produkte" class="fm-back">← Zurück zum Shop</a></div>`;

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
  // Account/login pages are personal AND we inject a skin — never let the
  // browser or any CDN cache them (otherwise a pre-skin / wrong-user copy
  // gets served). Override whatever cache-control WP returned.
  outHeaders.set("cache-control", "private, no-store, max-age=0, must-revalidate");

  // HTML: rewrite only My-Account links back on-host; leave asset hosts alone.
  if (contentType.includes("text/html")) {
    let html = await wpRes.text();
    html = html
      .replaceAll(`${WP_ORIGIN}/mein-konto`, "/mein-konto")
      .replaceAll(`${WP_ORIGIN}/wp-login.php`, "/wp-login.php")
      .replaceAll(`action="${WP_ORIGIN}/"`, `action="/"`);
    // Inject the fussmatt skin + a minimal storefront bar.
    if (html.includes("</head>")) {
      html = html.replace("</head>", `${FM_STYLE}</head>`);
    }
    html = html.replace(/(<body[^>]*>)/i, `$1${FM_BAR}`);
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
