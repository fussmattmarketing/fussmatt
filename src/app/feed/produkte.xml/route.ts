import { NextResponse } from "next/server";

// Force Node runtime + extend timeout to 60s. The XML can be 4 MB+ and
// the body-rewrite step is whole-string replace, which the default
// Vercel Function (10 s edge) was timing out on with 500.
export const runtime = "nodejs";
export const maxDuration = 60;

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
 * Cache: 5min edge cache + 1h stale-while-revalidate. Lowered from
 * 1h/24h (2026-08-08) because feed fields are being actively edited
 * (brand/material/size) and a 1h CDN HIT kept serving pre-edit XML —
 * a feed regenerated in Product Feed PRO looked "unchanged" on
 * fussmatt.com for up to an hour. 5min keeps GMC close to live while
 * still absorbing high-volume fetches. Raise back toward 1h once the
 * feed schema settles.
 */

const UPSTREAM =
  "https://wp.fussmatt.com/wp-content/uploads/woo-product-feed-pro/xml/zjhlflyous9kyegm29os7o8p9fx8p6xm.xml";

/* ─── Feed hygiene ──────────────────────────────────────────────────
 * Two things Feed PRO emits that Merchant Center shouldn't receive:
 *
 * 1. g:description carries the raw WooCommerce HTML (18k <strong>,
 *    17k <td>, whole spec tables). Google's description attribute is a
 *    plain-text field; the tables in particular collapse into an
 *    unreadable run once the markup is stripped on their side.
 * 2. g:link keeps WooCommerce's trailing slash (/produkt/slug/?utm=…)
 *    while the Next.js canonical is slash-less, so every landing page
 *    answered 308 before serving 200. Google follows it, but the feed
 *    link should equal the canonical URL.
 *
 * Both are fixed on the proxied copy only — the storefront keeps its
 * rich HTML and WooCommerce is untouched.
 */

const ENTITIES: Record<string, string> = {
  "&nbsp;": " ", "&amp;": "&", "&lt;": "<", "&gt;": ">",
  "&quot;": '"', "&#039;": "'", "&apos;": "'", "&euro;": "€",
  "&ndash;": "–", "&mdash;": "—", "&hellip;": "…", "&szlig;": "ß",
};

const GMC_DESCRIPTION_MAX = 4900; // spec allows 5000 — leave headroom

function htmlToPlainText(html: string): string {
  let t = html;
  t = t.replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/gi, "");

  // Structure → newlines; table cells → " | " so Eigenschaft/Beschreibung
  // rows stay readable as "key | value".
  t = t.replace(/<br\s*\/?>/gi, "\n");
  t = t.replace(/<\/(p|div|h[1-6]|tr|ul|ol|table|thead|tbody|blockquote)>/gi, "\n");
  t = t.replace(/<\/(td|th)>/gi, " | ");
  t = t.replace(/<li[^>]*>/gi, "• ").replace(/<\/li>/gi, "\n");

  t = t.replace(/<[^>]+>/g, "");
  for (const [ent, chr] of Object.entries(ENTITIES)) t = t.split(ent).join(chr);
  t = t.replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)));

  t = t.replace(/[ \t]*\|[ \t]*(?=\n)/g, "");
  t = t.replace(/[ \t]{2,}/g, " ");
  t = t.replace(/\n[ \t]+/g, "\n");
  t = t.replace(/\n{3,}/g, "\n\n");
  t = t.split("]]>").join("]] >"); // never terminate the CDATA early
  t = t.trim();

  if (t.length > GMC_DESCRIPTION_MAX) {
    t = t.slice(0, GMC_DESCRIPTION_MAX).replace(/\s+\S*$/, "") + "…";
  }
  return t;
}

function flattenDescriptions(xml: string): string {
  return xml.replace(
    /<g:description>([\s\S]*?)<\/g:description>/g,
    (whole, inner: string) => {
      try {
        const cdata = inner.match(/^\s*<!\[CDATA\[([\s\S]*?)\]\]>\s*$/);
        const plain = htmlToPlainText(cdata ? cdata[1] : inner);
        if (!plain) return whole; // never emit an empty description
        return `<g:description><![CDATA[${plain}]]></g:description>`;
      } catch {
        return whole; // any failure → leave this item as-is
      }
    }
  );
}

/** /produkt/slug/?utm=… → /produkt/slug?utm=…  (kills the 308 hop) */
function dropTrailingSlashOnLinks(xml: string): string {
  return xml.replace(
    /(<g:link>(?:<!\[CDATA\[)?)(.*?)((?:\]\]>)?<\/g:link>)/g,
    (whole, open: string, url: string, close: string) => {
      const fixed = url.replace(/\/(\?)/, "$1").replace(/\/$/, "");
      return fixed === url ? whole : `${open}${fixed}${close}`;
    }
  );
}

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

  // Buffer-based rewrite of any leftover wp.fussmatt.com host references
  // to the canonical fussmatt.com. Feed PRO's <g:image_link> values come
  // out of wp_get_attachment_url(), which bypasses the home_url filter
  // chain in the noindex plugin, so the feed file on disk ends up with
  // wp.fussmatt.com URLs for every product image. Rewriting here keeps
  // the canonical-host promise from the proxy without needing a second
  // round of plugin edits.
  //
  // Order matters: rewrite the wp-content/uploads/ path first so it
  // collapses to the shorter /uploads/ form that next.config's existing
  // rewrite already routes back to wp.fussmatt.com. Then a final
  // catch-all sweep handles any other wp.fussmatt.com references.
  //
  // Wrapped in try/catch so any encoding/runtime error surfaces in the
  // response body instead of a silent 500 (previous attempt's pain).
  try {
    const buf = Buffer.from(await res.arrayBuffer());
    let transformed = buf
      .toString("utf-8")
      .split("https://wp.fussmatt.com/wp-content/uploads/")
      .join("https://fussmatt.com/uploads/")
      .split("wp.fussmatt.com")
      .join("fussmatt.com");
    transformed = flattenDescriptions(transformed);
    transformed = dropTrailingSlashOnLinks(transformed);
    return new NextResponse(transformed, {
      status: 200,
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control":
          "public, max-age=300, s-maxage=300, stale-while-revalidate=3600",
        "X-Proxy-Source": "wp.fussmatt.com",
        "X-Proxy-Rewrite": "wp-to-fussmatt-plus-uploads",
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return new NextResponse(`Proxy transform failed: ${msg}`, {
      status: 500,
      headers: { "Content-Type": "text/plain" },
    });
  }
}
