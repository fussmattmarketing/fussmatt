import { readFileSync } from "fs";
import { resolve } from "path";

// Load .env.local manually
const envPath = resolve(process.cwd(), ".env.local");
const envContent = readFileSync(envPath, "utf-8");
for (const line of envContent.split("\n")) {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) process.env[match[1].trim()] = match[2].trim();
}

const BASE = process.env.WORDPRESS_URL || "https://wp.fussmatt.com";
const KEY = process.env.WC_CONSUMER_KEY!;
const SECRET = process.env.WC_CONSUMER_SECRET!;
const AUTH = `Basic ${Buffer.from(`${KEY}:${SECRET}`).toString("base64")}`;

// Correct pricing: regular_price stays original, sale_price is the new discounted price
const CATEGORY_PRICES: Record<number, { regular: string; sale: string }> = {
  17: { regular: "180", sale: "159" },   // 5D Fussmatten
  16: { regular: "120", sale: "99" },    // 3D Fussmatten
  29: { regular: "110", sale: "89" },    // LKW-Truck
  28: { regular: "110", sale: "89" },    // Kleinbus Pickup
  30: { regular: "99", sale: "79" },     // Universal
  24: { regular: "110", sale: "89" },    // Kofferraummatte
  22: { regular: "219", sale: "199" },   // Set
};

async function fetchAll(categoryId: number) {
  const products: any[] = [];
  let page = 1;
  while (true) {
    const url = `${BASE}/wp-json/wc/v3/products?category=${categoryId}&per_page=100&page=${page}&status=publish`;
    const res = await fetch(url, { headers: { Authorization: AUTH } });
    if (!res.ok) throw new Error(`API error ${res.status}`);
    const data = await res.json();
    if (data.length === 0) break;
    products.push(...data);
    const totalPages = parseInt(res.headers.get("X-WP-TotalPages") || "1");
    if (page >= totalPages) break;
    page++;
  }
  return products;
}

async function batchUpdate(updates: { id: number; regular_price: string; sale_price: string; }[]) {
  // WC batch max 100
  for (let i = 0; i < updates.length; i += 100) {
    const batch = updates.slice(i, i + 100);
    const res = await fetch(`${BASE}/wp-json/wc/v3/products/batch`, {
      method: "POST",
      headers: { Authorization: AUTH, "Content-Type": "application/json" },
      body: JSON.stringify({ update: batch }),
    });
    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Batch error ${res.status}: ${body}`);
    }
    console.log(`  Batch ${i / 100 + 1}: ${batch.length} products updated`);
  }
}

async function main() {
  for (const [catId, prices] of Object.entries(CATEGORY_PRICES)) {
    const id = parseInt(catId);
    console.log(`\nCategory ${id}: regular=${prices.regular}, sale=${prices.sale}`);

    const products = await fetchAll(id);
    console.log(`  Found ${products.length} products`);

    const updates = products.map((p: any) => ({
      id: p.id,
      regular_price: prices.regular,
      sale_price: prices.sale,
    }));

    await batchUpdate(updates);
    console.log(`  ✅ Done: ${products.length} products fixed`);
  }

  console.log("\n🎉 All prices corrected!");
}

main().catch(console.error);
