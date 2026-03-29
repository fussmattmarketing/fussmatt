import Link from "next/link";
import { getProducts, getCategories } from "@/lib/woocommerce";
import { getVehicleHierarchy } from "@/lib/vehicle-data";
import ProductCard from "@/components/product/ProductCard";
import VehicleFilter from "@/components/product/VehicleFilter";

export const revalidate = 300;

const USPs = [
  { icon: "\ud83d\udee1\ufe0f", title: "Premium TPE Material", desc: "Wasserdicht, rutschfest, langlebig" },
  { icon: "\ud83d\udccd", title: "Maßgefertigt", desc: "Millimetergenau per 3D-Vermessung" },
  { icon: "\ud83d\ude9a", title: "Schneller Versand", desc: "3-5 Werktage Lieferzeit" },
  { icon: "\u2665\ufe0f", title: "Swiss Quality", desc: "Royal Road GmbH, Zürich" },
];

export default async function HomePage() {
  let products: Awaited<ReturnType<typeof getProducts>> = [];
  let categories: Awaited<ReturnType<typeof getCategories>> = [];
  try {
    [products, categories] = await Promise.all([
      getProducts({ per_page: 8, orderby: "date", order: "desc" }),
      getCategories(),
    ]);
  } catch (error) {
    console.error("Homepage data fetch failed:", error);
  }

  const hierarchy = getVehicleHierarchy();
  const mainCategories = categories.filter(
    (c) => c.parent === 0 && c.slug !== "unkategorisiert" && c.slug !== "uncategorized"
  );

  return (
    <div>
      {/* Hero */}
      <section className="bg-gray-950 text-white py-12 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight">
                Premium Auto-Fußmatten
                <span className="text-amber-500"> für Ihr Fahrzeug</span>
              </h1>
              <p className="mt-4 text-lg text-gray-300">
                Maßgefertigte 3D &amp; 5D Fußmatten aus hochwertigem
                TPE-Material. Wasserdicht, rutschfest und millimetergenau.
              </p>
              <div className="mt-6 flex gap-3">
                <Link
                  href="/produkte"
                  className="bg-amber-500 hover:bg-amber-600 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
                >
                  Alle Produkte
                </Link>
                <Link
                  href="/kategorie/5d-fussmatten"
                  className="border border-gray-600 hover:border-gray-400 text-white px-6 py-3 rounded-xl transition-colors"
                >
                  5D Premium
                </Link>
              </div>
            </div>
            <VehicleFilter hierarchy={hierarchy} variant="hero" />
          </div>
        </div>
      </section>

      {/* USPs */}
      <section className="py-12 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {USPs.map((usp) => (
              <div key={usp.title} className="text-center">
                <span className="text-3xl">{usp.icon}</span>
                <h3 className="mt-2 font-semibold text-gray-900 text-sm">
                  {usp.title}
                </h3>
                <p className="text-xs text-gray-500 mt-1">{usp.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      {mainCategories.length > 0 && (
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Kategorien
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {mainCategories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/kategorie/${cat.slug}`}
                  className="bg-gray-50 rounded-2xl p-6 text-center hover:bg-amber-50 hover:border-amber-200 border border-transparent transition-all"
                >
                  <h3 className="font-semibold text-gray-900">{cat.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {cat.count} Produkte
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Popular Brands — pSEO internal linking */}
      {hierarchy.brands.length > 0 && (
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Beliebte Marken
            </h2>
            <div className="flex flex-wrap gap-3">
              {hierarchy.brands.slice(0, 20).map((brand) => (
                <Link
                  key={brand.slug}
                  href={`/marke/${brand.slug}`}
                  className="px-4 py-2 bg-gray-50 hover:bg-amber-50 hover:text-amber-700 border border-gray-200 hover:border-amber-200 rounded-xl text-sm font-medium transition-all"
                >
                  {brand.name}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Products */}
      {products.length > 0 && (
        <section className="py-12 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Neueste Produkte
              </h2>
              <Link
                href="/produkte"
                className="text-sm font-medium text-amber-600 hover:text-amber-700"
              >
                Alle anzeigen &rarr;
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
