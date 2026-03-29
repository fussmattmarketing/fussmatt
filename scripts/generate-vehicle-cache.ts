/**
 * Generate Vehicle Hierarchy Cache
 *
 * Run: npm run generate-vehicle-cache
 *
 * Fetches all products from WooCommerce, extracts vehicle attributes,
 * builds the brand → model → year hierarchy, and writes it to
 * data/vehicle-hierarchy.json for use at build time.
 *
 * Requires .env.local with WORDPRESS_URL, WP_APPLICATION_USER, WP_APPLICATION_PASSWORD
 */

import fs from "fs";
import path from "path";
import { buildVehicleHierarchy } from "../src/lib/vehicle-data";

// Load env from .env.local
const envPath = path.join(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;
    const key = trimmed.substring(0, eqIdx).trim();
    const value = trimmed.substring(eqIdx + 1).trim();
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

const WP_URL = process.env.WORDPRESS_URL;
const WP_USER = process.env.WP_APPLICATION_USER || "";
const WP_PASS = process.env.WP_APPLICATION_PASSWORD || "";
const WC_KEY = process.env.WC_CONSUMER_KEY || "";
const WC_SECRET = process.env.WC_CONSUMER_SECRET || "";

if (!WP_URL) {
  console.error("WORDPRESS_URL is not set. Check .env.local");
  process.exit(1);
}

function getAuthHeader(): string {
  if (WP_USER && WP_PASS) {
    return `Basic ${Buffer.from(`${WP_USER}:${WP_PASS}`).toString("base64")}`;
  }
  if (WC_KEY && WC_SECRET) {
    return `Basic ${Buffer.from(`${WC_KEY}:${WC_SECRET}`).toString("base64")}`;
  }
  console.error("No WooCommerce credentials found in env");
  process.exit(1);
}

async function main() {
  console.log(`Fetching products from ${WP_URL}...`);

  const vehicleStrings: string[] = [];
  let page = 1;
  const maxPages = 20;

  while (page <= maxPages) {
    const url = new URL(`${WP_URL}/wp-json/wc/v3/products`);
    url.searchParams.set("per_page", "100");
    url.searchParams.set("page", String(page));
    url.searchParams.set("status", "publish");
    url.searchParams.set("_fields", "id,attributes");

    const res = await fetch(url.toString(), {
      headers: {
        "Content-Type": "application/json",
        Authorization: getAuthHeader(),
      },
    });

    if (!res.ok) {
      console.error(`API error: ${res.status} ${res.statusText}`);
      break;
    }

    const products = (await res.json()) as Array<{
      id: number;
      attributes: Array<{ name: string; options: string[] }>;
    }>;

    if (products.length === 0) break;

    for (const product of products) {
      const fahrzeugAttr = product.attributes.find(
        (a) =>
          a.name.toLowerCase() === "fahrzeug" ||
          a.name.toLowerCase() === "vehicle"
      );
      if (fahrzeugAttr?.options) {
        vehicleStrings.push(...fahrzeugAttr.options);
      }
    }

    console.log(`  Page ${page}: ${products.length} products, ${vehicleStrings.length} vehicle strings total`);

    if (products.length < 100) break;
    page++;
  }

  console.log(`\nBuilding hierarchy from ${vehicleStrings.length} vehicle strings...`);
  const brands = buildVehicleHierarchy(vehicleStrings);

  const hierarchy = {
    brands,
    lastUpdated: new Date().toISOString(),
  };

  // Write to data/vehicle-hierarchy.json
  const dataDir = path.join(process.cwd(), "data");
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const outputPath = path.join(dataDir, "vehicle-hierarchy.json");
  fs.writeFileSync(outputPath, JSON.stringify(hierarchy, null, 2));

  console.log(`\nDone!`);
  console.log(`  Brands: ${brands.length}`);
  console.log(`  Models: ${brands.reduce((sum, b) => sum + b.models.length, 0)}`);
  console.log(`  Output: ${outputPath}`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
