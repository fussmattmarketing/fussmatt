import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

/**
 * POST /api/revalidate  { "paths": ["/produkt/foo", "/produkt/bar"] }
 *
 * Purges the ISR cache for specific paths. Needed because drafting a
 * product in WooCommerce does not evict its already-generated page:
 * getProductBySlug filters status=publish, so the route re-renders into
 * notFound() — but that not-found outcome is itself cached under the
 * product route's 1h revalidate window and served back as HTTP 200.
 * The result is a soft 404: a URL that no longer sells anything but
 * still answers 200 to Google and to customers.
 *
 * Redeploying does not help either — the cache entries survive it — so
 * an explicit purge is the only way to retire a drafted product's URL.
 * After the purge the next request re-renders, hits notFound(), and
 * not-found.tsx issues the 307 to the homepage (CEO policy 2026-06-09).
 *
 * Auth reuses SYNC_SECRET_KEY (same bearer scheme as /api/sync) so this
 * doesn't introduce another secret to manage.
 */

const MAX_PATHS = 500;

function authorized(request: Request): boolean {
  const key = process.env.SYNC_SECRET_KEY;
  if (!key) return false;
  return request.headers.get("authorization") === `Bearer ${key}`;
}

export async function POST(request: Request) {
  if (!authorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const paths: unknown = body?.paths;
  if (!Array.isArray(paths) || paths.length === 0) {
    return NextResponse.json(
      { error: "Body must be { paths: string[] }" },
      { status: 400 }
    );
  }
  if (paths.length > MAX_PATHS) {
    return NextResponse.json(
      { error: `Too many paths (max ${MAX_PATHS} per call)` },
      { status: 400 }
    );
  }

  const revalidated: string[] = [];
  const rejected: string[] = [];

  for (const p of paths) {
    // Only same-origin absolute paths — never a full URL or a traversal.
    if (typeof p !== "string" || !p.startsWith("/") || p.includes("..")) {
      rejected.push(String(p));
      continue;
    }
    try {
      revalidatePath(p);
      revalidated.push(p);
    } catch {
      rejected.push(p);
    }
  }

  return NextResponse.json({
    revalidated: revalidated.length,
    rejected: rejected.length,
    rejectedPaths: rejected.slice(0, 20),
  });
}
