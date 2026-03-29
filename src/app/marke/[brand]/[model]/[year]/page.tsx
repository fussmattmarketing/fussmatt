import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProducts } from "@/lib/woocommerce";
import { getVehicleHierarchy, getBrandBySlug } from "@/lib/vehicle-data";
import { JsonLd, breadcrumbSchema, faqSchema } from "@/lib/seo";
import { generateModelYearContent } from "@/lib/pseo-content";
import ProductCard from "@/components/product/ProductCard";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import Link from "next/link";

export const revalidate = 7200;
export const maxDuration = 60;

export async function generateStaticParams() {
  const hierarchy = getVehicleHierarchy();
  const params: { brand: string; model: string; year: string }[] = [];
  for (const brand of hierarchy.brands) {
    for (const model of brand.models) {
      for (const yr of model.yearRanges) {
        params.push({ brand: brand.slug, model: model.slug, year: yr.slug });
      }
    }
  }
  return params;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ brand: string; model: string; year: string }>;
}): Promise<Metadata> {
  const { brand: bs, model: ms, year: ys } = await params;
  const brand = getBrandBySlug(bs);
  const model = brand?.models.find((m) => m.slug === ms);
  const yearRange = model?.yearRanges.find((y) => y.slug === ys);
  if (!brand || !model || !yearRange) return { title: "Nicht gefunden" };

  const pseoMeta = generateModelYearContent(brand.name, model.name, yearRange.label, 0);
  return {
    title: pseoMeta.metaTitle.replace(" | FussMatt", ""),
    description: pseoMeta.metaDescription,
  };
}

export default async function ModelYearPage({
  params,
}: {
  params: Promise<{ brand: string; model: string; year: string }>;
}) {
  const { brand: bs, model: ms, year: ys } = await params;
  const brand = getBrandBySlug(bs);
  const model = brand?.models.find((m) => m.slug === ms);
  const yearRange = model?.yearRanges.find((y) => y.slug === ys);
  if (!brand || !model || !yearRange) notFound();

  const products = await getProducts({
    search: `${brand.name} ${model.name} ${yearRange.label}`,
    per_page: 20,
  }).catch(() => []);

  // Generate unique pSEO content from template engine
  const pseo = generateModelYearContent(
    brand.name,
    model.name,
    yearRange.label,
    products.length
  );
  const faqItems = pseo.faqItems;

  const otherYears = model.yearRanges.filter((y) => y.slug !== ys);
  const otherModels = brand.models.filter((m) => m.slug !== ms).slice(0, 6);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <JsonLd
        data={breadcrumbSchema([
          { name: "Startseite", url: "/" },
          { name: brand.name, url: `/marke/${bs}` },
          { name: model.name, url: `/marke/${bs}/${ms}` },
          { name: yearRange.label, url: `/marke/${bs}/${ms}/${ys}` },
        ])}
      />
      <JsonLd data={faqSchema(faqItems)} />

      <Breadcrumbs
        items={[
          { label: brand.name, href: `/marke/${bs}` },
          { label: model.name, href: `/marke/${bs}/${ms}` },
          { label: yearRange.label },
        ]}
      />

      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
        {pseo.h1}
      </h1>

      <p className="text-gray-600 mb-8 max-w-3xl">
        {pseo.introText}
      </p>

      {/* Products */}
      {products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 mb-12">
          <p className="text-gray-500">
            Derzeit keine Fußmatten für {brand.name} {model.name} (
            {yearRange.label}) verfügbar.
          </p>
          <Link
            href={`/marke/${bs}/${ms}`}
            className="text-amber-600 hover:text-amber-700 mt-2 inline-block"
          >
            Alle {brand.name} {model.name} Fußmatten anzeigen
          </Link>
        </div>
      )}

      {/* FAQ */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Häufig gestellte Fragen
        </h2>
        <div className="space-y-4">
          {faqItems.map((faq, i) => (
            <details key={i} className="group border border-gray-200 rounded-xl">
              <summary className="flex items-center justify-between px-4 py-3 cursor-pointer text-sm font-medium text-gray-900">
                {faq.question}
                <svg className="w-4 h-4 text-gray-500 group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <p className="px-4 pb-3 text-sm text-gray-600">{faq.answer}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Other year ranges */}
      {otherYears.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">
            Andere Baujahre
          </h2>
          <div className="flex flex-wrap gap-2">
            {otherYears.map((y) => (
              <Link
                key={y.slug}
                href={`/marke/${bs}/${ms}/${y.slug}`}
                className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-amber-50 hover:text-amber-700 rounded-lg transition-colors"
              >
                {y.label}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Other models */}
      {otherModels.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">
            Weitere {brand.name} Modelle
          </h2>
          <div className="flex flex-wrap gap-2">
            {otherModels.map((m) => (
              <Link
                key={m.slug}
                href={`/marke/${bs}/${m.slug}`}
                className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-amber-50 hover:text-amber-700 rounded-lg transition-colors"
              >
                {brand.name} {m.name}
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
