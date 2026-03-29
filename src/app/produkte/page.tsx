import type { Metadata } from "next";
import { getProductsWithTotal, getCategories } from "@/lib/woocommerce";
import ProductCard from "@/components/product/ProductCard";
import Pagination from "@/components/ui/Pagination";
import Breadcrumbs from "@/components/ui/Breadcrumbs";

export const revalidate = 3600;
export const maxDuration = 60;

export const metadata: Metadata = {
  title: "Alle Fußmatten",
  description:
    "Entdecken Sie unser komplettes Sortiment an Premium 3D & 5D Auto-Fußmatten. Über 1100 Produkte für 44+ Automarken.",
};

export default async function ProduktePage({
  searchParams,
}: {
  searchParams: Promise<{ seite?: string; kategorie?: string; suche?: string }>;
}) {
  const params = await searchParams;
  const page = parseInt(params.seite || "1");
  const categorySlug = params.kategorie;
  const search = params.suche;

  let products: Awaited<ReturnType<typeof getProductsWithTotal>>["products"] = [];
  let totalPages = 1;

  try {
    const queryParams: Record<string, string | number> = {
      page,
      per_page: 20,
    };
    if (categorySlug) {
      const categories = await getCategories();
      const cat = categories.find((c) => c.slug === categorySlug);
      if (cat) queryParams.category = cat.id;
    }
    if (search) queryParams.search = search;

    const result = await getProductsWithTotal(queryParams);
    products = result.products;
    totalPages = result.totalPages;
  } catch (error) {
    console.error("Products page fetch failed:", error);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumbs items={[{ label: "Alle Produkte" }]} />

      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        {search
          ? `Suchergebnisse für "${search}"`
          : "Alle Fußmatten"}
      </h1>

      {products.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Keine Produkte gefunden.</p>
          <a
            href="/produkte"
            className="text-amber-600 hover:text-amber-700 mt-2 inline-block"
          >
            Alle Produkte anzeigen
          </a>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            baseUrl={`/produkte${categorySlug ? `?kategorie=${categorySlug}` : ""}${search ? `?suche=${search}` : ""}`}
          />
        </>
      )}
    </div>
  );
}
