/**
 * XML Feed Parser
 *
 * Parses B2B product XML feed from fussmattenprofi.com using fast-xml-parser.
 * Feed URL comes ONLY from environment variable (SSRF protection).
 *
 * Feed structure:
 * <Products>
 *   <Product>
 *     <Id>4020</Id>
 *     <Sku>FTPE-1140</Sku>
 *     <Price>59.9</Price>
 *     <InStock>True</InStock>
 *     <Categories><Category>5D Fussmatten</Category></Categories>
 *     <Titles><Title lang="DE">...</Title></Titles>
 *     <Images><Image pos="0">https://...</Image></Images>
 *   </Product>
 * </Products>
 */

import { XMLParser } from "fast-xml-parser";
import type { XMLProduct } from "./types";

const FETCH_TIMEOUT = 60_000; // 60 seconds

/* eslint-disable @typescript-eslint/no-explicit-any */
interface RawXMLProduct {
  // PascalCase (actual feed)
  Id?: number | string;
  Sku?: string;
  Price?: string | number;
  InStock?: string | boolean;
  Categories?: { Category?: string | string[] };
  Titles?: { Title?: any };
  Images?: { Image?: any };
  // lowercase fallbacks (generic feeds)
  id?: number | string;
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
/* eslint-enable @typescript-eslint/no-explicit-any */

function extractTitle(raw: RawXMLProduct): string {
  // PascalCase: <Titles><Title lang="DE">text</Title></Titles>
  if (raw.Titles?.Title) {
    const t = raw.Titles.Title;
    if (typeof t === "string") return t.trim();
    // fast-xml-parser with attributes: { "#text": "...", "@_lang": "DE" }
    if (t["#text"]) return String(t["#text"]).trim();
    // Array of titles — pick DE or first
    if (Array.isArray(t)) {
      const de = t.find((x: any) => x["@_lang"] === "DE");
      const picked = de || t[0];
      return String(picked?.["#text"] || picked || "").trim();
    }
  }
  // lowercase fallbacks
  return String(raw.title || raw.name || "").trim();
}

function extractSku(raw: RawXMLProduct): string {
  return String(raw.Sku || raw.sku || raw.SKU || "").trim();
}

function extractPrice(raw: RawXMLProduct): string {
  return String(raw.Price || raw.sale_price || raw.price || "0");
}

function extractRegularPrice(raw: RawXMLProduct): string {
  return String(raw.regular_price || raw.Price || raw.price || "0");
}

function extractStockStatus(raw: RawXMLProduct): "instock" | "outofstock" {
  // PascalCase: <InStock>True</InStock>
  if (raw.InStock !== undefined) {
    const val = String(raw.InStock).toLowerCase();
    return val === "true" || val === "1" || val === "yes"
      ? "instock"
      : "outofstock";
  }
  // lowercase fallbacks
  const stockRaw = String(raw.stock_status || raw.stock || "").toLowerCase();
  if (stockRaw === "outofstock" || stockRaw === "0" || stockRaw === "out" || stockRaw === "false") {
    return "outofstock";
  }
  return "instock";
}

function extractImages(raw: RawXMLProduct): string[] {
  // PascalCase: <Images><Image pos="0">url</Image></Images>
  if (raw.Images?.Image) {
    const imgs = Array.isArray(raw.Images.Image)
      ? raw.Images.Image
      : [raw.Images.Image];
    return imgs
      .map((img: any) => {
        if (typeof img === "string") return img;
        if (img["#text"]) return String(img["#text"]);
        return "";
      })
      .filter(Boolean);
  }
  // lowercase fallbacks
  if (!raw.images) return [];
  if (typeof raw.images === "string") return [raw.images];
  if (Array.isArray(raw.images)) return raw.images;
  if (typeof raw.images === "object" && "image" in raw.images) {
    const img = raw.images.image;
    return Array.isArray(img) ? img : [img];
  }
  return [];
}

function extractCategories(raw: RawXMLProduct): string[] {
  // PascalCase: <Categories><Category>name</Category></Categories>
  if (raw.Categories?.Category) {
    const cats = raw.Categories.Category;
    if (typeof cats === "string") return [cats];
    if (Array.isArray(cats)) return cats.map(String);
  }
  // lowercase fallbacks
  if (!raw.categories) return [];
  if (typeof raw.categories === "string") return [raw.categories];
  if (Array.isArray(raw.categories)) return raw.categories.map(String);
  if (typeof raw.categories === "object" && "category" in raw.categories) {
    const cat = raw.categories.category;
    return Array.isArray(cat) ? cat.map(String) : [String(cat)];
  }
  return [];
}

function mapRawProduct(raw: RawXMLProduct): XMLProduct | null {
  const sku = extractSku(raw);
  if (!sku) return null;

  const title = extractTitle(raw);
  if (!title) return null;

  const price = extractPrice(raw);
  const regularPrice = extractRegularPrice(raw);

  return {
    sku,
    title,
    price,
    regular_price: regularPrice,
    stock_status: extractStockStatus(raw),
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
      isArray: (name) =>
        ["product", "Product", "image", "Image", "category", "Category"].includes(name),
    });

    const parsed = parser.parse(xmlText);

    // Navigate to products array (handle PascalCase and lowercase)
    const products: RawXMLProduct[] =
      parsed?.Products?.Product ||
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
