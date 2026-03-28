/**
 * XML Feed Parser
 *
 * Parses B2B product XML feed using fast-xml-parser.
 * Feed URL comes ONLY from environment variable (SSRF protection).
 */

import { XMLParser } from "fast-xml-parser";
import type { XMLProduct } from "./types";

const FETCH_TIMEOUT = 60_000; // 60 seconds

interface RawXMLProduct {
  sku?: string;
  SKU?: string;
  title?: string;
  name?: string;
  price?: string | number;
  regular_price?: string | number;
  sale_price?: string | number;
  stock_status?: string;
  stock?: string | number;
  weight?: string | number;
  images?: string | string[] | { image: string | string[] };
  categories?: string | string[] | { category: string | string[] };
  attributes?: Record<string, string>;
  gtin?: string;
  ean?: string;
  description?: string;
  short_description?: string;
}

function extractImages(raw: RawXMLProduct): string[] {
  if (!raw.images) return [];
  if (typeof raw.images === "string") return [raw.images];
  if (Array.isArray(raw.images)) return raw.images;
  if (raw.images.image) {
    return Array.isArray(raw.images.image)
      ? raw.images.image
      : [raw.images.image];
  }
  return [];
}

function extractCategories(raw: RawXMLProduct): string[] {
  if (!raw.categories) return [];
  if (typeof raw.categories === "string") return [raw.categories];
  if (Array.isArray(raw.categories)) return raw.categories;
  if (raw.categories.category) {
    return Array.isArray(raw.categories.category)
      ? raw.categories.category
      : [raw.categories.category];
  }
  return [];
}

function mapRawProduct(raw: RawXMLProduct): XMLProduct | null {
  const sku = String(raw.sku || raw.SKU || "").trim();
  if (!sku) return null;

  const title = String(raw.title || raw.name || "").trim();
  if (!title) return null;

  const price = String(raw.sale_price || raw.price || "0");
  const regularPrice = String(raw.regular_price || raw.price || "0");

  const stockRaw = String(raw.stock_status || raw.stock || "").toLowerCase();
  const stock_status: "instock" | "outofstock" =
    stockRaw === "outofstock" || stockRaw === "0" || stockRaw === "out"
      ? "outofstock"
      : "instock";

  return {
    sku,
    title,
    price,
    regular_price: regularPrice,
    stock_status,
    weight: String(raw.weight || ""),
    images: extractImages(raw),
    categories: extractCategories(raw),
    attributes: raw.attributes || {},
    gtin: String(raw.gtin || raw.ean || "").trim() || undefined,
    description: raw.description ? String(raw.description) : undefined,
    short_description: raw.short_description
      ? String(raw.short_description)
      : undefined,
  };
}

/**
 * Fetch and parse XML product feed.
 * feedUrl MUST come from environment variable — never from request body.
 */
export async function fetchAndParseXML(): Promise<XMLProduct[]> {
  const feedUrl = process.env.B2B_FEED_URL;
  if (!feedUrl) {
    throw new Error("B2B_FEED_URL is not configured");
  }

  // Validate URL is HTTPS
  const parsedUrl = new URL(feedUrl);
  if (parsedUrl.protocol !== "https:") {
    throw new Error("B2B_FEED_URL must use HTTPS");
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

  try {
    const response = await fetch(feedUrl, {
      signal: controller.signal,
      headers: { Accept: "application/xml, text/xml" },
    });

    if (!response.ok) {
      throw new Error(`Feed fetch failed: ${response.status}`);
    }

    const xmlText = await response.text();

    const parser = new XMLParser({
      ignoreAttributes: false,
      parseTagValue: true,
      trimValues: true,
      isArray: (name) => ["product", "image", "category"].includes(name),
    });

    const parsed = parser.parse(xmlText);

    // Navigate to products array (handle various XML structures)
    const products: RawXMLProduct[] =
      parsed?.products?.product ||
      parsed?.feed?.product ||
      parsed?.items?.item ||
      parsed?.product ||
      [];

    return products
      .map(mapRawProduct)
      .filter((p): p is XMLProduct => p !== null);
  } finally {
    clearTimeout(timeout);
  }
}
