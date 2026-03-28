import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCategoryBySlug, getProducts, getCategories } from "@/lib/woocommerce";
import { getVehicleHierarchy, getBrandBySlug } from "@/lib/vehicle-data";
import { JsonLd, breadcrumbSchema, faqSchema } from "@/lib/seo";
import { generateCategoryBrandContent } from "@/lib/pseo-content";
import ProductCard from "@/components/product/ProductCard";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import Link from "next/link";

export const revalidate = 7200;

export async function generateStaticParams() {
  try {
    const [categories, hierarchy] = await Promise.all([
      getCategories(),
      Promise.resolve(getVehicleHierarchy()),
    ]);
    const params: { slug: string; brand: string }[] = [];
    const mainCats = categories.filter(
      (c) => c.parent === 0 && c.slug !== "unkategorisiert"
    );
    for (const cat of mainCats) {
      for (const brand of hierarchy.brands) {
        params.push({ slug: cat.slug, brand: brand.slug });
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
  params: Promise<{ slug: string; brand: string }>;
}): Promise<Metadata> {
  const { slug, brand: brandSlug } = await params;
  const category = await getCategoryBySlug(slug);
  const brand = getBrandBySlug(brandSlug);
  if (!category || !brand) return { title: "Nicht gefunden" };

  const pseoMeta = generateCategoryBrandContent(slug, category.name, brand.name, 0);
  return {
    title: pseoMeta.metaTitle.replace(" | FussMatt", ""),
    description: pseoMeta.metaDescription,
  };
}

export default async function KategorieBrandPage({
  params,
}: {
  params: Promise<{ slug: string; brand: string }>;
}) {
  const { slug, brand: brandSlug } = await params;
  const category = await getCategoryBySlug(slug);
  const brand = getBrandBySlug(brandSlug);
  if (!category || !brand) notFound();

  const hierarchy = getVehicleHierarchy();

  // Fetch products for this category filtered by brand name in search
  const products = await getProducts({
    category: category.id,
    search: brand.name,
    per_page: 24,
  });

  // Generate unique pSEO content from template engine
  const pseo = generateCategoryBrandContent(
    slug,
    category.name,
    brand.name,
    products.length
  );
  const faqItems = pseo.faqItems;

  // Sibling brands for internal linking
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
        ])}
      />
      <JsonLd data={faqSchema(faqItems)} />

      <Breadcrumbs
        items={[
          { label: category.name, href: `/kategorie/${slug}` },
          { label: brand.name },
        ]}
      />

      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
        {pseo.h1}
      </h1>

      {/* Unique pSEO content from template engine */}
      <p className="text-gray-600 mb-8 max-w-3xl">
        {pseo.introText}
      </p>

      {/* Model links */}
      {brand.models.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">
            Alle {brand.name} Modelle
          </h2>
          <div className="flex flex-wrap gap-2">
            {brand.models.map((model) => (
              <Link
                key={model.slug}
                href={`/marke/${brandSlug}/${model.slug}`}
                className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-amber-50 hover:text-amber-700 rounded-lg transition-colors"
              >
                {brand.name} {model.name}
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
            Derzeit keine {category.name} für {brand.name} verfügbar.
          </p>
          <Link
            href={`/kategorie/${slug}`}
            className="text-amber-600 hover:text-amber-700 mt-2 inline-block"
          >
            Alle {category.name} anzeigen
          </Link>
        </div>
      )}

      {/* FAQ Section */}
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

      {/* Internal linking: other brands */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">
          Andere Marken in {category.name}
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
