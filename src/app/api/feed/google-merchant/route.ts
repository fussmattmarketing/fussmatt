import { NextResponse } from "next/server";
import { getAllProducts } from "@/lib/woocommerce";
import { stripHtml } from "@/lib/utils";
import type { WCProduct } from "@/types/woocommerce";

export const maxDuration = 60;
export const revalidate = 3600; // 1 hour cache

const SITE_URL = "https://fussmatt.com";
const BRAND = "FussMatt";
const GOOGLE_CATEGORY =
  "Vehicles & Parts > Vehicle Parts & Accessories > Motor Vehicle Interior Fittings > Motor Vehicle Floor Mats";
const GOOGLE_CATEGORY_ID = "8534";

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function getGtin(product: WCProduct): string | null {
  if (!product.meta_data) return null;
  const gtinMeta = product.meta_data.find(
    (m: { key: string; value: string }) =>
      m.key === "_gtin" || m.key === "gtin" || m.key === "_ean"
  );
  return gtinMeta?.value || null;
}

function getDescription(product: WCProduct): string {
  const raw =
    product.short_description || product.description || product.name;
  const text = stripHtml(raw).trim().replace(/\s+/g, " ");
  // Google requires at least 1 char, recommends 150+
  return text.length > 0 ? text.slice(0, 5000) : product.name;
}

function getProductType(product: WCProduct): string {
  if (product.categories && product.categories.length > 0) {
    return product.categories.map((c) => c.name).join(" > ");
  }
  return "Auto Fussmatten";
}

function productToXml(product: WCProduct): string {
  const id = product.sku || `gla_${product.id}`;
  const title = escapeXml(product.name.slice(0, 150));
  const description = escapeXml(getDescription(product));
  const link = `${SITE_URL}/produkt/${product.slug}`;
  const imageLink = product.images?.[0]?.src || "";
  const additionalImages = (product.images || []).slice(1, 6);
  const availability =
    product.stock_status === "instock" ? "in stock" : "out of stock";

  const price = product.regular_price || product.price;
  const salePrice = product.on_sale ? product.sale_price : null;
  const gtin = getGtin(product);
  const productType = escapeXml(getProductType(product));

  let xml = `    <item>\n`;
  xml += `      <g:id>${escapeXml(id)}</g:id>\n`;
  xml += `      <g:title>${title}</g:title>\n`;
  xml += `      <g:description>${description}</g:description>\n`;
  xml += `      <g:link>${escapeXml(link)}</g:link>\n`;

  if (imageLink) {
    xml += `      <g:image_link>${escapeXml(imageLink)}</g:image_link>\n`;
  }
  for (const img of additionalImages) {
    if (img.src) {
      xml += `      <g:additional_image_link>${escapeXml(img.src)}</g:additional_image_link>\n`;
    }
  }

  xml += `      <g:availability>${availability}</g:availability>\n`;

  if (price) {
    xml += `      <g:price>${parseFloat(price).toFixed(2)} CHF</g:price>\n`;
  }
  if (salePrice) {
    xml += `      <g:sale_price>${parseFloat(salePrice).toFixed(2)} CHF</g:sale_price>\n`;
  }

  xml += `      <g:brand>${BRAND}</g:brand>\n`;
  xml += `      <g:condition>new</g:condition>\n`;
  xml += `      <g:google_product_category>${GOOGLE_CATEGORY_ID}</g:google_product_category>\n`;
  xml += `      <g:product_type>${productType}</g:product_type>\n`;

  if (gtin) {
    xml += `      <g:gtin>${escapeXml(gtin)}</g:gtin>\n`;
    xml += `      <g:identifier_exists>true</g:identifier_exists>\n`;
  } else {
    xml += `      <g:identifier_exists>false</g:identifier_exists>\n`;
  }

  // Free shipping to Switzerland
  xml += `      <g:shipping>\n`;
  xml += `        <g:country>CH</g:country>\n`;
  xml += `        <g:price>0.00 CHF</g:price>\n`;
  xml += `      </g:shipping>\n`;

  xml += `    </item>\n`;
  return xml;
}

export async function GET() {
  try {
    const products = await getAllProducts();

    // Filter to published, non-draft products only
    const published = products.filter((p) => p.status === "publish");

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">\n`;
    xml += `  <channel>\n`;
    xml += `    <title>FussMatt — Premium Auto Fussmatten</title>\n`;
    xml += `    <link>${SITE_URL}</link>\n`;
    xml += `    <description>Premium 3D &amp; 5D Auto-Fussmatten für über 44 Marken</description>\n`;

    for (const product of published) {
      xml += productToXml(product);
    }

    xml += `  </channel>\n`;
    xml += `</rss>\n`;

    return new NextResponse(xml, {
      status: 200,
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
      },
    });
  } catch (error) {
    console.error("Google Merchant feed error:", error);
    return NextResponse.json(
      { error: "Failed to generate feed" },
      { status: 500 }
    );
  }
}
