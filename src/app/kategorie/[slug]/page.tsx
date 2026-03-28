import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCategoryBySlug, getProductsWithTotal, getCategories } from "@/lib/woocommerce";
import { getVehicleHierarchy } from "@/lib/vehicle-data";
import { JsonLd, breadcrumbSchema } from "@/lib/seo";
import ProductCard from "@/components/product/ProductCard";
import Pagination from "@/components/ui/Pagination";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import VehicleFilter from "@/components/product/VehicleFilter";
import Link from "next/link";

export const revalidate = 3600;

export async function generateStaticParams() {
  try {
    const categories = await getCategories();
    return categories
      .filter((c) => c.parent === 0 && c.slug !== "unkategorisiert")
      .map((c) => ({ slug: c.slug }));
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
  const category = await getCategoryBySlug(slug);
  if (!category) return { title: "Kategorie nicht gefunden" };

  return {
    title: category.name,
    description: `${category.name} von FussMatt. ${category.count} Produkte. Premium Auto-Fußmatten, maßgefertigt und wasserdicht.`,
  };
}

export default async function KategoriePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ seite?: string }>;
}) {
  const { slug } = await params;
  const sp = await searchParams;
  const page = parseInt(sp.seite || "1");
  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const { products, totalPages } = await getProductsWithTotal({
    category: category.id,
    page,
    per_page: 20,
  });

  const hierarchy = getVehicleHierarchy();

  // Get brands for pSEO links
  const brandLinks = hierarchy.brands.slice(0, 12);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <JsonLd
        data={breadcrumbSchema([
          { name: "Startseite", url: "/" },
          { name: category.name, url: `/kategorie/${slug}` },
        ])}
      />

      <Breadcrumbs items={[{ label: category.name }]} />

      <div className="grid lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <VehicleFilter hierarchy={hierarchy} categorySlug={slug} />

          {/* pSEO: Category × Brand links */}
          {brandLinks.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-2">
                {category.name} nach Marke
              </h3>
              <ul className="space-y-1">
                {brandLinks.map((brand) => (
                  <li key={brand.slug}>
                    <Link
                      href={`/kategorie/${slug}/${brand.slug}`}
                      className="text-sm text-gray-600 hover:text-amber-600 transition-colors"
                    >
                      {category.name} für {brand.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Products */}
        <div className="lg:col-span-3">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            {category.name}
          </h1>

          {products.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Keine Produkte gefunden.</p>
              <Link href="/produkte" className="text-amber-600 hover:text-amber-700 mt-2 inline-block">
                Alle Produkte anzeigen
              </Link>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                baseUrl={`/kategorie/${slug}`}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
