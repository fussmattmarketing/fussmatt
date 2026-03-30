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
export const dynamicParams = false;

export async function generateStaticParams() {
  const hierarchy = getVehicleHierarchy();
  const params: { brand: string; model: string }[] = [];
  for (const brand of hierarchy.brands) {
    for (const model of brand.models) {
      params.push({ brand: brand.slug, model: model.slug });
    }
  }
  return params;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ brand: string; model: string }>;
}): Promise<Metadata> {
  const { brand: brandSlug, model: modelSlug } = await params;
  const brand = getBrandBySlug(brandSlug);
  const model = brand?.models.find((m) => m.slug === modelSlug);
  if (!brand || !model) return { title: "Nicht gefunden" };

  return {
    title: `${brand.name} ${model.name} Fußmatten`,
    description: `Maßgefertigte Fußmatten für ${brand.name} ${model.name}. Premium TPE-Material, wasserdicht und rutschfest.`,
  };
}

export default async function ModelPage({
  params,
}: {
  params: Promise<{ brand: string; model: string }>;
}) {
  const { brand: brandSlug, model: modelSlug } = await params;
  const brand = getBrandBySlug(brandSlug);
  const model = brand?.models.find((m) => m.slug === modelSlug);
  if (!brand || !model) notFound();

  const products = await getProducts({
    search: `${brand.name} ${model.name}`,
    per_page: 20,
  }).catch(() => []);

  const otherModels = brand.models.filter((m) => m.slug !== modelSlug).slice(0, 8);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <JsonLd
        data={breadcrumbSchema([
          { name: "Startseite", url: "/" },
          { name: brand.name, url: `/marke/${brandSlug}` },
          { name: model.name, url: `/marke/${brandSlug}/${modelSlug}` },
        ])}
      />

      <Breadcrumbs
        items={[
          { label: brand.name, href: `/marke/${brandSlug}` },
          { label: model.name },
        ]}
      />

      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
        {brand.name} {model.name} Fußmatten
      </h1>
      <p className="text-gray-600 mb-8 max-w-3xl">
        Passgenaue Fußmatten für Ihren {brand.name} {model.name}. Per
        3D-Vermessung millimetergenau gefertigt aus hochwertigem TPE-Material.
      </p>

      {/* Year range links for pSEO */}
      {model.yearRanges.length > 0 && (
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-gray-700 mb-2">
            Nach Baujahr
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
            Derzeit keine Fußmatten für {brand.name} {model.name} verfügbar.
          </p>
        </div>
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
                href={`/marke/${brandSlug}/${m.slug}`}
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
