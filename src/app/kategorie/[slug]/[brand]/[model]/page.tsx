import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCategoryBySlug, getProducts, getCategories } from "@/lib/woocommerce";
import { getVehicleHierarchy, getBrandBySlug } from "@/lib/vehicle-data";
import { JsonLd, breadcrumbSchema, faqSchema } from "@/lib/seo";
import { generateCategoryBrandModelContent } from "@/lib/pseo-content";
import ProductCard from "@/components/product/ProductCard";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import Link from "next/link";

export const revalidate = 7200;
export const maxDuration = 60;

type PageParams = { slug: string; brand: string; model: string };

function findModel(brandSlug: string, modelSlug: string) {
  const brand = getBrandBySlug(brandSlug);
  if (!brand) return null;
  const model = brand.models.find((m) => m.slug === modelSlug);
  if (!model) return null;
  return { brand, model };
}

export async function generateStaticParams() {
  try {
    const [categories, hierarchy] = await Promise.all([
      getCategories(),
      Promise.resolve(getVehicleHierarchy()),
    ]);
    const params: PageParams[] = [];
    const mainCats = categories.filter(
      (c) => c.parent === 0 && c.slug !== "unkategorisiert"
    );
    for (const cat of mainCats) {
      for (const brand of hierarchy.brands) {
        for (const model of brand.models) {
          params.push({
            slug: cat.slug,
            brand: brand.slug,
            model: model.slug,
          });
        }
      }
    }
    return params;
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<PageParams>;
}): Promise<Metadata> {
  const { slug, brand: brandSlug, model: modelSlug } = await params;
  const category = await getCategoryBySlug(slug);
  const match = findModel(brandSlug, modelSlug);
  if (!category || !match) return { title: "Nicht gefunden" };

  const pseo = generateCategoryBrandModelContent(
    slug,
    category.name,
    match.brand.name,
    match.model.name,
    0
  );
  return {
    title: pseo.metaTitle.replace(" | FussMatt", ""),
    description: pseo.metaDescription,
  };
}

export default async function KategorieBrandModelPage({
  params,
}: {
  params: Promise<PageParams>;
}) {
  const { slug, brand: brandSlug, model: modelSlug } = await params;
  const category = await getCategoryBySlug(slug);
  const match = findModel(brandSlug, modelSlug);
  if (!category || !match) notFound();

  const { brand, model } = match;
  const hierarchy = getVehicleHierarchy();

  // Fetch products for this category filtered by brand + model
  const products = await getProducts({
    category: category.id,
    search: `${brand.name} ${model.name}`,
    per_page: 24,
  });

  const pseo = generateCategoryBrandModelContent(
    slug,
    category.name,
    brand.name,
    model.name,
    products.length
  );

  // Sibling models (same brand, different model)
  const siblingModels = brand.models
    .filter((m) => m.slug !== modelSlug)
    .slice(0, 10);

  // Sibling brands (same category, different brand)
  const siblingBrands = hierarchy.brands
    .filter((b) => b.slug !== brandSlug)
    .slice(0, 8);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <JsonLd
        data={breadcrumbSchema([
          { name: "Startseite", url: "/" },
          { name: category.name, url: `/kategorie/${slug}` },
          { name: brand.name, url: `/kategorie/${slug}/${brandSlug}` },
          {
            name: model.name,
            url: `/kategorie/${slug}/${brandSlug}/${modelSlug}`,
          },
        ])}
      />
      <JsonLd data={faqSchema(pseo.faqItems)} />

      <Breadcrumbs
        items={[
          { label: category.name, href: `/kategorie/${slug}` },
          { label: brand.name, href: `/kategorie/${slug}/${brandSlug}` },
          { label: model.name },
        ]}
      />

      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
        {pseo.h1}
      </h1>

      <p className="text-gray-600 mb-8 max-w-3xl">{pseo.introText}</p>

      {/* Year range links for this model */}
      {model.yearRanges.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">
            {brand.name} {model.name} nach Baujahr
          </h2>
          <div className="flex flex-wrap gap-2">
            {model.yearRanges.map((yr) => (
              <Link
                key={yr.slug}
                href={`/marke/${brandSlug}/${modelSlug}/${yr.slug}`}
                className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-amber-50 hover:text-amber-700 rounded-lg transition-colors"
              >
                {yr.label}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Products grid */}
      {products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 mb-12">
          <p className="text-gray-500">
            Derzeit keine {category.name} für {brand.name} {model.name}{" "}
            verfügbar.
          </p>
          <Link
            href={`/kategorie/${slug}/${brandSlug}`}
            className="text-amber-600 hover:text-amber-700 mt-2 inline-block"
          >
            Alle {category.name} für {brand.name} anzeigen
          </Link>
        </div>
      )}

      {/* FAQ Section */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Häufig gestellte Fragen
        </h2>
        <div className="space-y-4">
          {pseo.faqItems.map((faq, i) => (
            <details
              key={i}
              className="group border border-gray-200 rounded-xl"
            >
              <summary className="flex items-center justify-between px-4 py-3 cursor-pointer text-sm font-medium text-gray-900">
                {faq.question}
                <svg
                  className="w-4 h-4 text-gray-500 group-open:rotate-180 transition-transform"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </summary>
              <p className="px-4 pb-3 text-sm text-gray-600">{faq.answer}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Internal linking: other models of same brand */}
      {siblingModels.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">
            Weitere {brand.name} Modelle — {category.name}
          </h2>
          <div className="flex flex-wrap gap-2">
            {siblingModels.map((m) => (
              <Link
                key={m.slug}
                href={`/kategorie/${slug}/${brandSlug}/${m.slug}`}
                className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-amber-50 hover:text-amber-700 rounded-lg transition-colors"
              >
                {brand.name} {m.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Internal linking: other brands */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">
          Andere Marken — {category.name}
        </h2>
        <div className="flex flex-wrap gap-2">
          {siblingBrands.map((b) => (
            <Link
              key={b.slug}
              href={`/kategorie/${slug}/${b.slug}`}
              className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-amber-50 hover:text-amber-700 rounded-lg transition-colors"
            >
              {b.name}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
