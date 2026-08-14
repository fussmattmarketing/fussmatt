import type { Metadata } from "next";
import { redirect } from "next/navigation";
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
import ProductPageTracking from "@/components/product/ProductPageTracking";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { TrustGrid } from "@/components/ui/TrustGrid";
import PaymentMethods from "@/components/ui/PaymentMethods";
import ProductFAQ from "@/components/ui/ProductFAQ";
import { TrustBadges } from "@/components/ui/TrustBadges";
import { SHIPPING_CONFIG } from "@/lib/shipping";

export const revalidate = 3600;
export const maxDuration = 60;
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
  // Unknown / retired items redirect to the homepage instead of
  // calling notFound(): inside these cached dynamic routes the
  // not-found boundary rendered with HTTP 200, so every invalid
  // slug (and every drafted product) was a soft 404. redirect()
  // emits a real 307, matching how other unknown URLs behave.
  if (!product) redirect("/");

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
      content: product.attributes.filter((a) => a.visible).length > 0
        ? `<table class="w-full text-sm"><tbody>${product.attributes
            .filter((a) => a.visible)
            .map(
              (a) =>
                `<tr class="border-b border-gray-100"><td class="py-3 pr-6 font-medium text-gray-700 whitespace-nowrap align-top w-1/3">${a.name}</td><td class="py-3 text-gray-600">${a.options.join(", ")}</td></tr>`
            )
            .join("")}</tbody></table>`
        : "Keine Angaben.",
      isHtml: true,
    },
    {
      title: "Versand",
      content: `<p>Wir liefern ausschliesslich innerhalb der Schweiz. <strong>Kostenloser Versand</strong> in der ganzen Schweiz — ohne Mindestbestellwert. Alle Preise verstehen sich in Schweizer Franken (CHF).</p>
      <h3>Lieferzeit</h3>
      <ul>
        <li><strong>Vorbereitungszeit der Bestellung:</strong> 0–1 Werktag</li>
        <li><strong>Gesamte Lieferzeit:</strong> ${SHIPPING_CONFIG.CH.deliveryDays} Werktage</li>
        <li><strong>Bestellzeitpunkt:</strong> Bestellungen nach 17:00 Uhr werden am nächsten Werktag versandt</li>
      </ul>
      <h3>Versandkosten</h3>
      <ul>
        <li><strong>Schweiz:</strong> Kostenlos — ohne Mindestbestellwert</li>
      </ul>
      <h3>Versandart</h3>
      <p>Alle Bestellungen werden per Standardversand verschickt. Sie erhalten eine Versandbestätigung per E-Mail mit Tracking-Informationen, sobald Ihre Bestellung das Lager verlässt.</p>
      <h3>Lieferadresse</h3>
      <p>Bitte stellen Sie sicher, dass Ihre Lieferadresse korrekt und vollständig ist. Bei fehlerhaften Adressen kann es zu Verzögerungen kommen.</p>`,
      isHtml: true,
    },
    {
      title: "Rückgabe & 30 Tage Geld-zurück-Garantie",
      content: `<h3>30 Tage Geld-zurück-Garantie</h3>
      <p>Bei FussMatt haben Sie <strong>30 Tage</strong> Zeit, Ihre Bestellung ohne Angabe von Gründen zurückzugeben. Die Rückgabefrist beträgt dreissig Tage ab dem Tag, an dem Sie oder ein von Ihnen benannter Dritter, der nicht der Beförderer ist, die Waren in Besitz genommen haben. So haben Sie ausreichend Zeit, unsere Produkte in Ihrem Fahrzeug zu testen.</p>
      <h3>Voraussetzungen für die Rückgabe</h3>
      <ul>
        <li>Die Fussmatten müssen sich in unbenutztem, neuwertigem Zustand befinden.</li>
        <li>Die Originalverpackung muss vorhanden sein.</li>
        <li>Normale Prüfung der Passform im Fahrzeug (Einlegen und wieder Herausnehmen) gilt nicht als Benutzung.</li>
      </ul>
      <h3>So geben Sie Ihre Bestellung zurück</h3>
      <p>Um Ihr Rückgaberecht auszuüben, kontaktieren Sie uns per E-Mail oder über unser Kontaktformular:</p>
      <ul>
        <li><strong>E-Mail:</strong> info@fussmatt.com</li>
        <li><strong>Kontaktformular:</strong> fussmatt.com/kontakt</li>
        <li><strong>Adresse:</strong> Royal Road GmbH, Dübendorfstrasse 4, 8051 Zürich</li>
      </ul>
      <p>Teilen Sie uns Ihre Bestellnummer und den Rückgabegrund mit. Wir senden Ihnen eine Rücksendebestätigung mit allen weiteren Informationen.</p>
      <h3>Rücksendung</h3>
      <p>Bitte senden Sie die Ware zeitnah nach Ihrer Rückgabemeldung an uns zurück. Die unmittelbaren Kosten der Rücksendung tragen Sie als Käufer.</p>
      <h3>Erstattung</h3>
      <p>Nach Eingang und Prüfung der zurückgesendeten Ware erstatten wir Ihnen den vollen Kaufpreis. Die Erstattung erfolgt innerhalb von 14 Tagen nach Eingang der Rücksendung über dasselbe Zahlungsmittel, das Sie bei der ursprünglichen Bestellung verwendet haben.</p>`,
      isHtml: true,
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

      <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 overflow-hidden">
        {/* Gallery */}
        <div className="min-w-0">
        <ProductGallery
          images={product.images}
          productName={product.name}
          onSale={product.on_sale}
        />
        </div>

        {/* Product Info */}
        <div className="min-w-0">
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
          {/* Royal Road GmbH is not VAT-registered (verified against the
              federal UID service, 2026-08), so the price line must not
              claim VAT is included. */}
          <p className="mt-1 text-xs text-gray-400">Preis in CHF · Kostenloser Versand</p>

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

          {/* GA4 view_item tracking */}
          <ProductPageTracking product={product} />

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

          {/* Accepted payment methods — under add-to-cart, reassures the
              buyer which cards we take via Stripe before checkout */}
          <div className="mt-5 pt-5 border-t border-gray-100">
            <PaymentMethods variant="inline" />
          </div>
        </div>
      </div>

      {/* Trust Badges (REQ-006 TS-001) — factual seals above-fold */}
      <div className="mt-8 -mx-4 sm:-mx-6 lg:-mx-8">
        <TrustBadges />
      </div>

      {/* Accordion */}
      <div className="mt-12">
        <ProductAccordion items={accordionItems} />
      </div>

      {/* FAQ — generic accordion + FAQ JSON-LD for SEO */}
      <ProductFAQ productLabel={product.name} />

      {/* Trust signals */}
      <div className="mt-12">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Warum FussMatt
        </h2>
        <TrustGrid />
      </div>
    </div>
  );
}
