import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProducts } from "@/lib/woocommerce";
import { getVehicleHierarchy, getBrandBySlug } from "@/lib/vehicle-data";
import { JsonLd, breadcrumbSchema } from "@/lib/seo";
import ProductCard from "@/components/product/ProductCard";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import Link from "next/link";

export const revalidate = 3600;
export const maxDuration = 60;

export async function generateStaticParams() {
  const hierarchy = getVehicleHierarchy();
  return hierarchy.brands.map((b) => ({ brand: b.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ brand: string }>;
}): Promise<Metadata> {
  const { brand: brandSlug } = await params;
  const brand = getBrandBySlug(brandSlug);
  if (!brand) return { title: "Marke nicht gefunden" };

  return {
    title: `${brand.name} Fussmatten`,
    description: `Premium Auto-Fussmatten für ${brand.name}. ${brand.models.length} Modelle verfügbar. Massgefertigt, wasserdicht, rutschfest.`,
  };
}

export default async function MarkePage({
  params,
}: {
  params: Promise<{ brand: string }>;
}) {
  const { brand: brandSlug } = await params;
  const brand = getBrandBySlug(brandSlug);
  if (!brand) notFound();

  const hierarchy = getVehicleHierarchy();
  const products = await getProducts({
    search: brand.name,
    per_page: 12,
  }).catch(() => []);

  const otherBrands = hierarchy.brands
    .filter((b) => b.slug !== brandSlug)
    .slice(0, 10);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <JsonLd
        data={breadcrumbSchema([
          { name: "Startseite", url: "/" },
          { name: brand.name, url: `/marke/${brandSlug}` },
        ])}
      />

      <Breadcrumbs items={[{ label: brand.name }]} />

      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
        {brand.name} Fussmatten
      </h1>
      <p className="text-gray-600 mb-8 max-w-3xl">
        Premium Auto-Fussmatten für {brand.name}. Wählen Sie Ihr Modell für
        massgefertigte Fussmatten aus hochwertigem TPE-Material.
      </p>

      {/* Category links + Brand guide */}
      <div className="flex flex-wrap gap-2 mb-8">
        <Link
          href={`/kategorie/5d-fussmatten/${brandSlug}`}
          className="px-4 py-2 text-sm font-medium bg-amber-50 text-amber-800 hover:bg-amber-100 rounded-lg transition-colors"
        >
          5D Fussmatten
        </Link>
        <Link
          href={`/kategorie/3d-fussmatten/${brandSlug}`}
          className="px-4 py-2 text-sm font-medium bg-amber-50 text-amber-800 hover:bg-amber-100 rounded-lg transition-colors"
        >
          3D Fussmatten
        </Link>
        <Link
          href={`/kategorie/kofferraummatte/${brandSlug}`}
          className="px-4 py-2 text-sm font-medium bg-amber-50 text-amber-800 hover:bg-amber-100 rounded-lg transition-colors"
        >
          Kofferraummatten
        </Link>
        <Link
          href={`/ratgeber/fussmatten-fuer-${brandSlug}`}
          className="px-4 py-2 text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
        >
          Ratgeber &amp; Kaufberatung
        </Link>
      </div>

      {/* Model grid */}
      {brand.models.length > 0 && (
        <section className="mb-12">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {brand.name} Modelle
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {brand.models.map((model) => (
              <Link
                key={model.slug}
                href={`/marke/${brandSlug}/${model.slug}`}
                className="bg-gray-50 rounded-xl p-4 text-center hover:bg-amber-50 hover:border-amber-200 border border-transparent transition-all"
              >
                <span className="font-semibold text-gray-900">
                  {brand.name} {model.name}
                </span>
                <span className="block text-xs text-gray-500 mt-1">
                  {model.productCount} Produkte
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Products */}
      {products.length > 0 && (
        <section className="mb-12">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Beliebte {brand.name} Fussmatten
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* Other brands */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">
          Weitere Marken
        </h2>
        <div className="flex flex-wrap gap-2">
          {otherBrands.map((b) => (
            <Link
              key={b.slug}
              href={`/marke/${b.slug}`}
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
