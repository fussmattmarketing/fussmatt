import type {
  WCProduct,
  WCCategory,
  WCProductVariation,
} from "@/types/woocommerce";

// Server-only: credentials are read at call time, not module init.
// All auth via Authorization header — NEVER query string (credentials leak in logs/CDN).

function getBaseUrl(): string {
  const url = process.env.WORDPRESS_URL;
  if (!url) throw new Error("WORDPRESS_URL is not configured");
  return url;
}

function getAuthHeader(): string {
  // Priority 1: Application Password (local dev)
  const user = process.env.WP_APPLICATION_USER;
  const pass = process.env.WP_APPLICATION_PASSWORD;
  if (user && pass) {
    return `Basic ${Buffer.from(`${user}:${pass}`).toString("base64")}`;
  }
  // Priority 2: Consumer Key/Secret via Basic auth header (production)
  const key = process.env.WC_CONSUMER_KEY;
  const secret = process.env.WC_CONSUMER_SECRET;
  if (key && secret) {
    return `Basic ${Buffer.from(`${key}:${secret}`).toString("base64")}`;
  }
  throw new Error("No WooCommerce credentials configured");
}

async function wcFetch<T>(
  endpoint: string,
  params: Record<string, string | number> = {},
  options: RequestInit & { revalidate?: number } = {}
): Promise<T> {
  const url = new URL(`${getBaseUrl()}/wp-json/wc/v3${endpoint}`);

  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, String(value));
  }

  const { revalidate = 3600, ...fetchOptions } = options;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: getAuthHeader(),
    ...(fetchOptions.headers as Record<string, string>),
  };

  const res = await fetch(url.toString(), {
    ...fetchOptions,
    headers,
    next: { revalidate },
  });

  if (!res.ok) {
    const errorBody = await res.text().catch(() => "");
    console.error(`WC API Error [${res.status}] ${endpoint}: ${errorBody}`);
    throw new Error(`WooCommerce API error: ${res.status}`);
  }

  return res.json();
}

async function wcFetchWithHeaders<T>(
  endpoint: string,
  params: Record<string, string | number> = {},
  revalidate = 3600
): Promise<{ data: T; total: number; totalPages: number }> {
  const url = new URL(`${getBaseUrl()}/wp-json/wc/v3${endpoint}`);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, String(value));
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: getAuthHeader(),
  };

  const res = await fetch(url.toString(), {
    headers,
    next: { revalidate },
  });

  if (!res.ok) {
    throw new Error(`WooCommerce API error: ${res.status}`);
  }

  const data = (await res.json()) as T;
  const total = parseInt(res.headers.get("X-WP-Total") || "0", 10);
  const totalPages = parseInt(res.headers.get("X-WP-TotalPages") || "1", 10);
  return { data, total, totalPages };
}

// ─── Products ───────────────────────────────────────────

export async function getProducts(
  params: Record<string, string | number> = {}
): Promise<WCProduct[]> {
  return wcFetch<WCProduct[]>("/products", {
    per_page: 20,
    status: "publish",
    ...params,
  });
}

export async function getProductsWithTotal(
  params: Record<string, string | number> = {}
): Promise<{ products: WCProduct[]; total: number; totalPages: number }> {
  const { data, total, totalPages } = await wcFetchWithHeaders<WCProduct[]>(
    "/products",
    { per_page: 20, status: "publish", ...params }
  );
  return { products: data, total, totalPages };
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

  return allProducts;
}

export async function getProductBySlug(
  slug: string
): Promise<WCProduct | null> {
  const products = await wcFetch<WCProduct[]>("/products", { slug });
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
