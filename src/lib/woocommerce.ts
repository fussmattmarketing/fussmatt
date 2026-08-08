import type {
  WCProduct,
  WCCategory,
  WCProductVariation,
} from "@/types/woocommerce";

// Server-only: credentials are read at call time, not module init.
// Auth via query string (consumer_key/consumer_secret) because the hosting
// CDN (hcdn) strips Authorization headers from Vercel's IP range.
// These calls are server-side only — credentials never reach the browser.

function getBaseUrl(): string {
  const url = process.env.WORDPRESS_URL;
  if (!url) throw new Error("WORDPRESS_URL is not configured");
  return url;
}

function getAuthParams(): Record<string, string> {
  const key = process.env.WC_CONSUMER_KEY;
  const secret = process.env.WC_CONSUMER_SECRET;
  if (key && secret) {
    return { consumer_key: key, consumer_secret: secret };
  }
  throw new Error("No WooCommerce credentials configured (WC_CONSUMER_KEY/WC_CONSUMER_SECRET)");
}

function getAuthHeader(): string | null {
  const user = process.env.WP_APPLICATION_USER;
  const pass = process.env.WP_APPLICATION_PASSWORD;
  if (user && pass) {
    return `Basic ${Buffer.from(`${user}:${pass}`).toString("base64")}`;
  }
  return null;
}

// Marker used by wcFetch when a response carries a retryable status code.
const TRANSIENT_STATUS_RE = /WooCommerce API error: (429|500|502|503|504)\b/;

// Retry wrapper for transient connect timeouts (UND_ERR_CONNECT_TIMEOUT)
// during high-volume builds when wp.fussmatt.com gets overwhelmed.
function isTransientError(err: unknown): boolean {
  if (!(err instanceof Error)) return false;
  const msg = err.message || "";
  const cause = (err as Error & { cause?: { code?: string } }).cause;
  const code = cause?.code || "";
  return (
    code === "UND_ERR_CONNECT_TIMEOUT" ||
    code === "UND_ERR_SOCKET" ||
    code === "ECONNRESET" ||
    code === "ETIMEDOUT" ||
    msg.includes("fetch failed") ||
    msg.includes("ConnectTimeoutError") ||
    msg.includes("aborted") ||
    // HTTP-level transients: Hostinger's MySQL drops connections under the
    // build's request concurrency and WP answers 500 "Error establishing a
    // database connection" (or 502/503/504 behind LiteSpeed) for a few
    // seconds. Without this the very first blip throws and aborts the
    // static export of ~3.4k pages — which is exactly how the 2026-08-08
    // deploys died. 429 is included for the same reason (rate limiting).
    TRANSIENT_STATUS_RE.test(msg)
  );
}

async function wcFetch<T>(
  endpoint: string,
  params: Record<string, string | number> = {},
  options: RequestInit & { revalidate?: number } = {}
): Promise<T> {
  const url = new URL(`${getBaseUrl()}/wp-json/wc/v3${endpoint}`);

  // Add auth as query params (CDN-safe)
  const authParams = getAuthParams();
  for (const [key, value] of Object.entries({ ...params, ...authParams })) {
    url.searchParams.set(key, String(value));
  }

  const { revalidate = 3600, ...fetchOptions } = options;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(fetchOptions.headers as Record<string, string>),
  };

  // Add Authorization header if available (local dev with Application Password)
  const authHeader = getAuthHeader();
  if (authHeader) {
    headers.Authorization = authHeader;
  }

  const isGet = !fetchOptions.method || fetchOptions.method === "GET";
  // Only retry idempotent GET requests on transient errors
  const maxAttempts = isGet ? 5 : 1;
  let lastErr: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);

    try {
      const res = await fetch(url.toString(), {
        ...fetchOptions,
        headers,
        signal: controller.signal,
        ...(isGet ? { next: { revalidate } } : { cache: "no-store" }),
      });

      if (!res.ok) {
        const errorBody = await res.text().catch(() => "");
        console.error(`WC API Error [${res.status}] ${endpoint}: ${errorBody}`);
        throw new Error(`WooCommerce API error: ${res.status}`);
      }

      return await res.json();
    } catch (err) {
      lastErr = err;
      if (attempt < maxAttempts && isTransientError(err)) {
        // Exponential backoff, capped: 0.5s, 1.5s, 4.5s, 13.5s
        const delay = Math.min(500 * Math.pow(3, attempt - 1), 15000);
        console.warn(
          `WC fetch transient error [${endpoint}] attempt ${attempt}/${maxAttempts}, retrying in ${delay}ms`
        );
        await new Promise((r) => setTimeout(r, delay));
        continue;
      }
      throw err;
    } finally {
      clearTimeout(timeout);
    }
  }
  throw lastErr;
}

async function wcFetchWithHeaders<T>(
  endpoint: string,
  params: Record<string, string | number> = {},
  revalidate = 3600
): Promise<{ data: T; total: number; totalPages: number }> {
  const url = new URL(`${getBaseUrl()}/wp-json/wc/v3${endpoint}`);

  // Add auth as query params (CDN-safe)
  const authParams = getAuthParams();
  for (const [key, value] of Object.entries({ ...params, ...authParams })) {
    url.searchParams.set(key, String(value));
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  const authHeader = getAuthHeader();
  if (authHeader) {
    headers.Authorization = authHeader;
  }

  const maxAttempts = 5;
  let lastErr: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);
    let res: Response;
    try {
      res = await fetch(url.toString(), {
        headers,
        signal: controller.signal,
        next: { revalidate },
      });
    } catch (err) {
      clearTimeout(timeout);
      lastErr = err;
      if (attempt < maxAttempts && isTransientError(err)) {
        const delay = Math.min(500 * Math.pow(3, attempt - 1), 15000);
        console.warn(
          `WC fetch transient error [${endpoint}] attempt ${attempt}/${maxAttempts}, retrying in ${delay}ms`
        );
        await new Promise((r) => setTimeout(r, delay));
        continue;
      }
      throw err;
    }
    clearTimeout(timeout);

    if (!res.ok) {
      const statusErr = new Error(`WooCommerce API error: ${res.status}`);
      // Retry 5xx/429 here too — this throw sits outside the try above, so
      // without it a single WP DB blip escapes the retry loop entirely.
      if (attempt < maxAttempts && isTransientError(statusErr)) {
        lastErr = statusErr;
        const delay = Math.min(500 * Math.pow(3, attempt - 1), 15000);
        console.warn(
          `WC fetch transient status ${res.status} [${endpoint}] attempt ${attempt}/${maxAttempts}, retrying in ${delay}ms`
        );
        await new Promise((r) => setTimeout(r, delay));
        continue;
      }
      throw statusErr;
    }

    const data = (await res.json()) as T;
    const total = parseInt(res.headers.get("X-WP-Total") || "0", 10);
    const totalPages = parseInt(res.headers.get("X-WP-TotalPages") || "1", 10);
    return { data, total, totalPages };
  }
  throw lastErr;
}

// ─── Products ───────────────────────────────────────────

export async function getProducts(
  params: Record<string, string | number> = {}
): Promise<WCProduct[]> {
  const data = await wcFetch<WCProduct[]>("/products", {
    per_page: 20,
    status: "publish",
    ...params,
  });
  // Exclude catalog_visibility=hidden — these must NOT appear in
  // category listings, product grids, or any browse surface (only
  // direct URL access keeps working). WC /products endpoint does not
  // support a robust "NOT hidden" query-side filter (catalog_visibility
  // takes a single value, so any positive filter would also exclude
  // legitimate `catalog`-only products), hence post-filter.
  return data.filter((p) => p.catalog_visibility !== "hidden");
}

export async function getProductsWithTotal(
  params: Record<string, string | number> = {}
): Promise<{ products: WCProduct[]; total: number; totalPages: number }> {
  const { data, total, totalPages } = await wcFetchWithHeaders<WCProduct[]>(
    "/products",
    { per_page: 20, status: "publish", ...params }
  );
  // Same post-filter as getProducts. Total/totalPages may overstate by
  // the number of hidden products in scope (minor cosmetic in
  // pagination footer); WC has no clean query-side "NOT hidden" filter.
  const visible = data.filter((p) => p.catalog_visibility !== "hidden");
  return { products: visible, total, totalPages };
}

export async function getAllProducts(): Promise<WCProduct[]> {
  const allProducts: WCProduct[] = [];
  let page = 1;
  const perPage = 100;

  while (true) {
    const { data, totalPages } = await wcFetchWithHeaders<WCProduct[]>(
      "/products",
      { per_page: perPage, page, status: "publish" }
    );
    allProducts.push(...data);
    if (page >= totalPages) break;
    page++;
  }

  // Exclude products explicitly marked catalog_visibility=hidden. Sitemap,
  // Google Merchant feed, and any "all products" iteration must not surface
  // hidden products to crawlers — direct URLs still work but they should
  // not appear in any discovery surface. WC /products endpoint does not
  // honor a robust catalog_visibility filter on the query side, so we
  // post-filter here.
  return allProducts.filter(
    (p) => p.catalog_visibility !== "hidden"
  );
}

export async function getProductBySlug(
  slug: string
): Promise<WCProduct | null> {
  // status:publish — a draft/private product must never render on the
  // storefront. Without this filter a drafted product's detail page still
  // returns HTTP 200 with a working add-to-cart button at the wrong price.
  const products = await wcFetch<WCProduct[]>("/products", {
    slug,
    status: "publish",
  });
  return products[0] || null;
}

export async function getProductById(id: number): Promise<WCProduct> {
  return wcFetch<WCProduct>(`/products/${id}`);
}

export async function getProductVariations(
  productId: number
): Promise<WCProductVariation[]> {
  return wcFetch<WCProductVariation[]>(
    `/products/${productId}/variations`,
    { per_page: 100 }
  );
}

// ─── Categories ─────────────────────────────────────────

export async function getCategories(
  params: Record<string, string | number> = {}
): Promise<WCCategory[]> {
  return wcFetch<WCCategory[]>("/products/categories", {
    per_page: 100,
    hide_empty: 1,
    ...params,
  });
}

export async function getCategoryBySlug(
  slug: string
): Promise<WCCategory | null> {
  const categories = await wcFetch<WCCategory[]>("/products/categories", {
    slug,
  });
  return categories[0] || null;
}

// ─── Orders ─────────────────────────────────────────────

export async function createOrder(
  orderData: Record<string, unknown>
): Promise<Record<string, unknown>> {
  return wcFetch<Record<string, unknown>>("/orders", {}, {
    method: "POST",
    body: JSON.stringify(orderData),
    revalidate: 0,
  });
}

export async function updateOrder(
  orderId: number,
  data: Record<string, unknown>
): Promise<Record<string, unknown>> {
  return wcFetch<Record<string, unknown>>(`/orders/${orderId}`, {}, {
    method: "PUT",
    body: JSON.stringify(data),
    revalidate: 0,
  });
}

// ─── Search ─────────────────────────────────────────────

export async function searchProducts(query: string): Promise<WCProduct[]> {
  return wcFetch<WCProduct[]>("/products", {
    search: query,
    per_page: 20,
    status: "publish",
  });
}
