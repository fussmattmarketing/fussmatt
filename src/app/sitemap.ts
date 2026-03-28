import type { MetadataRoute } from "next";
import { getVehicleHierarchy } from "@/lib/vehicle-data";
import { getAllProducts } from "@/lib/woocommerce";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://fussmatt.com";

// Known category slugs
const CATEGORY_SLUGS = [
  "5d-fussmatten",
  "3d-fussmatten",
  "kofferraummatte",
  "universal-fussmatten",
  "fussmatten-set",
  "kofferraummatte-set",
  "zubehoer",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const hierarchy = getVehicleHierarchy();
  const now = new Date().toISOString();

  const entries: MetadataRoute.Sitemap = [];

  // Static pages
  const staticPages = [
    { url: "", priority: 1.0, changeFrequency: "daily" as const },
    { url: "/produkte", priority: 0.9, changeFrequency: "daily" as const },
    { url: "/kontakt", priority: 0.3, changeFrequency: "monthly" as const },
    { url: "/versand", priority: 0.3, changeFrequency: "monthly" as const },
    { url: "/impressum", priority: 0.1, changeFrequency: "yearly" as const },
    { url: "/datenschutz", priority: 0.1, changeFrequency: "yearly" as const },
    { url: "/agb", priority: 0.1, changeFrequency: "yearly" as const },
    { url: "/widerruf", priority: 0.1, changeFrequency: "yearly" as const },
    { url: "/ratgeber/faq", priority: 0.4, changeFrequency: "monthly" as const },
  ];

  for (const page of staticPages) {
    entries.push({
      url: `${SITE_URL}${page.url}`,
      lastModified: now,
      changeFrequency: page.changeFrequency,
      priority: page.priority,
    });
  }

  // Category pages
  for (const slug of CATEGORY_SLUGS) {
    entries.push({
      url: `${SITE_URL}/kategorie/${slug}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    });
  }

  // Brand pages
  for (const brand of hierarchy.brands) {
    entries.push({
      url: `${SITE_URL}/marke/${brand.slug}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    });

    // Model pages
    for (const model of brand.models) {
      entries.push({
        url: `${SITE_URL}/marke/${brand.slug}/${model.slug}`,
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.6,
      });

      // pSEO: Model x Year pages
      for (const yr of model.yearRanges) {
        entries.push({
          url: `${SITE_URL}/marke/${brand.slug}/${model.slug}/${yr.slug}`,
          lastModified: now,
          changeFrequency: "monthly",
          priority: 0.5,
        });
      }
    }

    // pSEO: Category x Brand pages
    for (const catSlug of CATEGORY_SLUGS) {
      entries.push({
        url: `${SITE_URL}/kategorie/${catSlug}/${brand.slug}`,
        lastModified: now,
        changeFrequency: "monthly",
        priority: 0.5,
      });
    }
  }

  // Product pages — fetch all product slugs from WC API
  try {
    const products = await getAllProducts();
    for (const product of products) {
      entries.push({
        url: `${SITE_URL}/produkt/${product.slug}`,
        lastModified: product.date_modified || now,
        changeFrequency: "weekly",
        priority: 0.6,
      });
    }
  } catch {
    // WC API not available during build without credentials — skip products
  }

  return entries;
}
