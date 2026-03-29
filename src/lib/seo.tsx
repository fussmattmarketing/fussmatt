/**
 * SEO Utilities — JSON-LD Structured Data
 */

import type { WCProduct } from "@/types/woocommerce";
import { stripHtml } from "@/lib/utils";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://fussmatt.com";
const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || "FussMatt";

// ─── Organization Schema ────────────────────────���───────

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      availableLanguage: ["German"],
    },
    sameAs: [],
  };
}

// ─── WebSite Schema ─────────────────────────────────────

export function webSiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/produkte?suche={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

// ─── Product Schema ─────────────────────────────────────

export function productSchema(product: WCProduct) {
  const url = `${SITE_URL}/produkt/${product.slug}`;
  const image = product.images[0]?.src || `${SITE_URL}/logo.png`;

  // Extract real brand from product attributes (NOT "FussMatt")
  const markeAttr = product.attributes.find(
    (a) => a.name.toLowerCase() === "marke" || a.name.toLowerCase() === "brand"
  );
  const brandName = markeAttr?.options[0] || SITE_NAME;

  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description:
      stripHtml(product.short_description || "") || product.name,
    image,
    url,
    sku: product.sku,
    brand: {
      "@type": "Brand",
      name: brandName,
    },
    offers: {
      "@type": "Offer",
      url,
      priceCurrency: "CHF",
      price: product.price,
      availability:
        product.stock_status === "instock"
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      seller: {
        "@type": "Organization",
        name: SITE_NAME,
      },
      priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      shippingDetails: {
        "@type": "OfferShippingDetails",
        shippingRate: {
          "@type": "MonetaryAmount",
          value: "0",
          currency: "CHF",
        },
        shippingDestination: {
          "@type": "DefinedRegion",
          addressCountry: ["DE", "AT", "CH", "FR", "IT", "NL"],
        },
        deliveryTime: {
          "@type": "ShippingDeliveryTime",
          handlingTime: {
            "@type": "QuantitativeValue",
            minValue: 1,
            maxValue: 2,
            unitCode: "d",
          },
          transitTime: {
            "@type": "QuantitativeValue",
            minValue: 2,
            maxValue: 5,
            unitCode: "d",
          },
        },
      },
    },
    category: product.categories.map((c) => c.name).join(" > "),
  };

  // Add GTIN if available
  const gtinMeta = product.meta_data?.find(
    (m) => m.key === "_global_unique_id" || m.key === "_gtin"
  );
  if (gtinMeta?.value) {
    schema.gtin13 = gtinMeta.value;
  }

  // Sale price
  if (product.on_sale && product.regular_price) {
    (schema.offers as Record<string, unknown>).priceSpecification = {
      "@type": "PriceSpecification",
      price: product.price,
      priceCurrency: "CHF",
      valueAddedTaxIncluded: true,
    };
  }

  return schema;
}

// ─── BreadcrumbList Schema ──────────────────────────────

export function breadcrumbSchema(
  items: { name: string; url: string }[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${SITE_URL}${item.url}`,
    })),
  };
}

// ─── FAQ Schema (for pSEO pages) ────────────────────────

export function faqSchema(
  items: { question: string; answer: string }[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

// ─── Helper: render JSON-LD script tag ──────────��───────

export function JsonLd({
  data,
}: {
  data: Record<string, unknown> | Record<string, unknown>[];
}) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
