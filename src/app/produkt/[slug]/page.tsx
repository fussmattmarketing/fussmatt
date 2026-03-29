import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getProductBySlug,
  getProductVariations,
  getProducts,
} from "@/lib/woocommerce";
import { JsonLd, productSchema, breadcrumbSchema } from "@/lib/seo";
import { formatPrice, sanitizeHtml, stripHtml } from "@/lib/utils";
import ProductGallery from "@/components/product/ProductGallery";
import AddToCartButton from "@/components/product/AddToCartButton";
import ProductAccordion from "@/components/product/ProductAccordion";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { SHIPPING_CONFIG } from "@/lib/shipping";

export const revalidate = 3600;
export const dynamicParams = true;

export async function generateStaticParams() {
  try {
    const products = await getProducts({ per_page: 100 });
    return products.map((p) => ({ slug: p.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Produkt nicht gefunden" };

  return {
    title: product.name,
    description: stripHtml(product.short_description || product.name).slice(0, 160),
    openGraph: {
      title: `${product.name} | FussMatt`,
      description: stripHtml(product.short_description || product.name).slice(0, 160),
      images: product.images[0]?.src ? [product.images[0].src] : [],
    },
  };
}

export default async function ProduktPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const variations =
    product.type === "variable"
      ? await getProductVariations(product.id)
      : [];

  const category = product.categories.find(
    (c) => c.slug !== "unkategorisiert" && c.slug !== "uncategorized"
  );

  const breadcrumbs = [
    ...(category
      ? [{ label: category.name, href: `/kategorie/${category.slug}` }]
      : []),
    { label: product.name },
  ];

  const accordionItems = [
    {
      title: "Beschreibung",
      content: product.description || "Keine Beschreibung verfügbar.",
      isHtml: true,
    },
    {
      title: "Eigenschaften",
      content: product.attributes
        .filter((a) => a.visible)
        .map((a) => `${a.name}: ${a.options.join(", ")}`)
        .join("\n") || "Keine Angaben.",
      isHtml: false,
    },
    {
      title: "Versand",
      content: `Kostenloser Versand in der Schweiz ab CHF ${SHIPPING_CONFIG.CH.freeAbove}. Deutschland und Österreich: EUR ${SHIPPING_CONFIG.DE.cost.toFixed(2)} (kostenlos ab EUR ${SHIPPING_CONFIG.DE.freeAbove}). Lieferzeit: ${SHIPPING_CONFIG.CH.deliveryDays} Werktage (CH).`,
      isHtml: false,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <JsonLd data={productSchema(product)} />
      <JsonLd
        data={breadcrumbSchema([
          { name: "Startseite", url: "/" },
          ...(category
            ? [{ name: category.name, url: `/kategorie/${category.slug}` }]
            : []),
          { name: product.name, url: `/produkt/${product.slug}` },
        ])}
      />

      <Breadcrumbs items={breadcrumbs} />

      <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Gallery */}
        <ProductGallery
          images={product.images}
          productName={product.name}
          onSale={product.on_sale}
        />

        {/* Product Info */}
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">{product.name}</h1>

          {/* Key Attributes — v1 style chips */}
          {product.attributes.filter((a) => a.visible).length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {product.attributes
                .filter((a) => a.visible)
                .slice(0, 4)
                .map((attr) => (
                  <span
                    key={attr.name}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium"
                  >
                    <span className="text-gray-400">{attr.name}:</span>
                    {attr.options[0]}
                  </span>
                ))}
            </div>
          )}

          {/* Price */}
          <div className="mt-4 flex items-center gap-3">
            <span className={`text-3xl font-bold ${product.on_sale ? "text-red-600" : "text-gray-900"}`}>
              {formatPrice(product.price)}
            </span>
            {product.on_sale && product.regular_price && (
              <>
                <span className="text-lg text-gray-400 line-through">
                  {formatPrice(product.regular_price)}
                </span>
                <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-0.5 rounded">
                  -{Math.round((1 - parseFloat(product.price) / parseFloat(product.regular_price)) * 100)}%
                </span>
              </>
            )}
          </div>
          <p className="mt-1 text-xs text-gray-400">Inkl. MwSt. zzgl. Versandkosten</p>

          {/* Stock */}
          <div className="mt-3 flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                product.stock_status === "instock"
                  ? "bg-green-500"
                  : "bg-red-500"
              }`}
            />
            <span className="text-sm text-gray-600">
              {product.stock_status === "instock"
                ? "Auf Lager – Sofort lieferbar"
                : "Derzeit nicht verfügbar"}
            </span>
          </div>

          {/* Short description */}
          {product.short_description && (
            <div
              className="mt-4 text-sm text-gray-600 prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{
                __html: sanitizeHtml(product.short_description),
              }}
            />
          )}

          {/* Add to Cart */}
          <div className="mt-6">
            <AddToCartButton product={product} variations={variations} />
          </div>

          {/* SKU */}
          {product.sku && (
            <p className="mt-4 text-xs text-gray-400">
              Artikelnummer: {product.sku}
            </p>
          )}

          {/* USP Features — v1 style */}
          <div className="mt-6 grid grid-cols-2 gap-3">
            {[
              { icon: "\uD83C\uDFAF", text: "Passgenaue Fertigung" },
              { icon: "\uD83D\uDCA7", text: "Wasserdicht & rutschfest" },
              { icon: "\u2699\uFE0F", text: "Premium TPE-Material" },
              { icon: "\uD83D\uDE9A", text: "Kostenloser Versand" },
            ].map((usp) => (
              <div key={usp.text} className="flex items-center gap-2 text-xs text-gray-500">
                <span>{usp.icon}</span>
                <span>{usp.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Accordion */}
      <div className="mt-12">
        <ProductAccordion items={accordionItems} />
      </div>
    </div>
  );
}
