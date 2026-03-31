/**
 * Update WooCommerce product prices by category.
 *
 * Usage: npx tsx --env-file=.env.local scripts/update-prices.ts
 */

const BASE_URL = process.env.WORDPRESS_URL;
const CK = process.env.WC_CONSUMER_KEY;
const CS = process.env.WC_CONSUMER_SECRET;

if (!BASE_URL || !CK || !CS) {
  console.error("Missing env vars: WORDPRESS_URL, WC_CONSUMER_KEY, WC_CONSUMER_SECRET");
  process.exit(1);
}

const AUTH = "Basic " + Buffer.from(`${CK}:${CS}`).toString("base64");

// ─── Price map: category name → { old, new } ───────────────────
const PRICE_MAP: Record<string, { old: string; new: string }> = {
  "5D Fussmatten": { old: "180", new: "159" },
  "3D Fussmatten": { old: "120", new: "99" },
  "Passend für LKW-Truck Fussmatten": { old: "110", new: "89" },
  "Passend für Kleinbus Pickup Fussmatten": { old: "110", new: "89" },
  "Universal Fussmatten": { old: "99", new: "79" },
  "Kofferraummatte": { old: "110", new: "89" },
  "Fuss-und Kofferraummatten Set": { old: "219", new: "199" },
};

interface WCCategory {
  id: number;
  name: string;
  slug: string;
  count: number;
}

interface WCProduct {
  id: number;
  name: string;
  regular_price: string;
  sale_price: string;
  on_sale: boolean;
  categories: { id: number; name: string }[];
}

async function wcFetch<T>(
  endpoint: string,
  params: Record<string, string | number> = {},
  init: RequestInit = {}
): Promise<{ data: T; totalPages: number }> {
  const url = new URL(`${BASE_URL}/wp-json/wc/v3${endpoint}`);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, String(v));

  const res = await fetch(url.toString(), {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: AUTH,
      ...(init.headers as Record<string, string> | undefined),
    },
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`WC API ${res.status} ${endpoint}: ${body.slice(0, 300)}`);
  }

  const totalPages = parseInt(res.headers.get("X-WP-TotalPages") || "1", 10);
  return { data: (await res.json()) as T, totalPages };
}

// Fetch all pages of products for a category
async function getAllProductsInCategory(categoryId: number): Promise<WCProduct[]> {
  const all: WCProduct[] = [];
  let page = 1;
  while (true) {
    const { data, totalPages } = await wcFetch<WCProduct[]>("/products", {
      category: categoryId,
      per_page: 100,
      page,
      status: "publish",
    });
    all.push(...data);
    if (page >= totalPages) break;
    page++;
  }
  return all;
}

// Batch update products (max 100 per batch per WC API)
async function batchUpdate(updates: { id: number; regular_price: string; sale_price?: string }[]) {
  if (updates.length === 0) return;
  // WC batch endpoint accepts max 100
  for (let i = 0; i < updates.length; i += 100) {
    const chunk = updates.slice(i, i + 100);
    await wcFetch("/products/batch", {}, {
      method: "POST",
      body: JSON.stringify({ update: chunk }),
    });
  }
}

async function main() {
  console.log("Fetching WooCommerce categories...");
  const { data: categories } = await wcFetch<WCCategory[]>("/products/categories", {
    per_page: 100,
    hide_empty: 0,
  });

  // Build lookup: name → id
  const catLookup = new Map<string, WCCategory>();
  for (const c of categories) catLookup.set(c.name, c);

  let totalUpdated = 0;
  let totalSkipped = 0;

  for (const [catName, prices] of Object.entries(PRICE_MAP)) {
    const cat = catLookup.get(catName);
    if (!cat) {
      console.warn(`  Category "${catName}" not found — skipping`);
      continue;
    }
    console.log(`\n── ${catName} (id=${cat.id}, ${cat.count} products) ──`);
    console.log(`   Price change: ${prices.old} → ${prices.new}`);

    const products = await getAllProductsInCategory(cat.id);
    const updates: { id: number; regular_price: string; sale_price?: string }[] = [];

    for (const p of products) {
      if (p.regular_price !== prices.old) {
        console.log(`   SKIP "${p.name}" — regular_price is ${p.regular_price}, expected ${prices.old}`);
        totalSkipped++;
        continue;
      }

      const update: { id: number; regular_price: string; sale_price?: string } = {
        id: p.id,
        regular_price: prices.new,
      };

      // If product is on sale, calculate proportional discount
      if (p.on_sale && p.sale_price) {
        const oldSale = parseFloat(p.sale_price);
        const oldRegular = parseFloat(prices.old);
        const newRegular = parseFloat(prices.new);
        // Preserve the same discount ratio
        const ratio = oldSale / oldRegular;
        const newSale = Math.round(newRegular * ratio);
        update.sale_price = String(newSale);
        console.log(`   UPDATE "${p.name}" — regular: ${p.regular_price}→${prices.new}, sale: ${p.sale_price}→${newSale}`);
      } else {
        console.log(`   UPDATE "${p.name}" — regular: ${p.regular_price}→${prices.new}`);
      }

      updates.push(update);
    }

    if (updates.length > 0) {
      console.log(`   Batch updating ${updates.length} products...`);
      await batchUpdate(updates);
      totalUpdated += updates.length;
    } else {
      console.log(`   No products to update in this category.`);
    }
  }

  console.log(`\n════════════════════════════════════════`);
  console.log(`Done. Updated: ${totalUpdated}, Skipped: ${totalSkipped}`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
