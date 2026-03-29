import Link from "next/link";
import { getProducts } from "@/lib/woocommerce";
import { getVehicleHierarchy } from "@/lib/vehicle-data";
import ProductCard from "@/components/product/ProductCard";
import VehicleFilter from "@/components/product/VehicleFilter";
import type { WCProduct } from "@/types/woocommerce";

export const revalidate = 300;

export default async function HomePage() {
  let products: WCProduct[] = [];
  try {
    products = await getProducts({ per_page: 8, orderby: "date", order: "desc" });
  } catch (error) {
    console.error("Homepage data fetch failed:", error);
  }

  const hierarchy = getVehicleHierarchy();

  return (
    <>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white overflow-hidden">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-28">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
            <div className="flex-1 text-center lg:text-left">
              <span className="inline-block px-3 py-1 text-xs font-semibold tracking-wider uppercase bg-amber-600/20 text-amber-400 rounded-full mb-6">
                Premium TPE Material
              </span>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
                Passgenaue
                <br />
                <span className="text-amber-500">Auto-Fussmatten</span>
              </h1>
              <p className="mt-6 text-lg text-gray-300 leading-relaxed max-w-lg mx-auto lg:mx-0">
                3D &amp; 5D Fussmatten aus hochwertigem TPE-Material.
                Millimetergenau für Ihr Fahrzeug gefertigt. Wasser- und
                schmutzabweisend.
              </p>
            </div>
            <div className="w-full lg:w-auto flex-shrink-0">
              <VehicleFilter hierarchy={hierarchy} variant="hero" />
            </div>
          </div>
        </div>
      </section>

      {/* USPs */}
      <section className="border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: "\uD83D\uDE97", title: "Passgenau", desc: "Für Ihr Fahrzeugmodell" },
              { icon: "\uD83D\uDCA7", title: "Wasserdicht", desc: "TPE-Material" },
              { icon: "\uD83D\uDE9A", title: "Kostenloser Versand", desc: "Ab CHF 50 in CH" },
              { icon: "\u21A9\uFE0F", title: "30 Tage", desc: "Rückgaberecht" },
            ].map((usp) => (
              <div key={usp.title} className="flex items-center gap-3">
                <span className="text-2xl">{usp.icon}</span>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{usp.title}</p>
                  <p className="text-xs text-gray-500">{usp.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories — 3 large + 4 small cards */}
      <section className="bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Unsere Kategorien
            </h2>
            <p className="mt-2 text-gray-500">
              Finden Sie die passende Fussmatte für Ihr Fahrzeug
            </p>
          </div>

          {/* Top row: 3 large gradient cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            {[
              { label: "5D Premium", sub: "Auto-Fussmatten", href: "/kategorie/5d-fussmatten", icon: "\u2B50", gradient: "from-amber-500 to-amber-600" },
              { label: "3D Fussmatten", sub: "Aus Gummi", href: "/kategorie/3d-fussmatten", icon: "\uD83D\uDFE9", gradient: "from-gray-700 to-gray-900" },
              { label: "Fuss- & Kofferraum", sub: "Matten Set", href: "/kategorie/fuss-und-kofferraummatten-set", icon: "\uD83D\uDCE6", gradient: "from-slate-700 to-slate-900" },
            ].map((cat) => (
              <Link
                key={cat.href}
                href={cat.href}
                className="group relative overflow-hidden rounded-2xl h-44 flex flex-col justify-end p-6 text-white transition-transform hover:scale-[1.02]"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${cat.gradient}`} />
                <div className="absolute top-4 right-4 text-4xl opacity-30 group-hover:opacity-50 transition-opacity">
                  {cat.icon}
                </div>
                <div className="relative">
                  <h3 className="text-xl font-bold leading-tight">{cat.label}</h3>
                  <p className="text-sm text-white/70 mt-0.5">{cat.sub}</p>
                </div>
                <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <svg className="w-5 h-5 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>

          {/* Bottom row: 4 smaller cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "Kofferraummatte", href: "/kategorie/kofferraummatte", icon: "\uD83D\uDE97" },
              { label: "LKW & Truck", href: "/kategorie/passend-fuer-lkw-truck-fussmatten", icon: "\uD83D\uDE9A" },
              { label: "Kleinbus & Pickup", href: "/kategorie/passend-fuer-kleinbus-pickup-fussmatten", icon: "\uD83D\uDE90" },
              { label: "Universal", href: "/kategorie/universal-fussmatten", icon: "\u2699\uFE0F" },
            ].map((cat) => (
              <Link
                key={cat.href}
                href={cat.href}
                className="group bg-white rounded-2xl border border-gray-200 hover:border-amber-300 hover:shadow-lg hover:shadow-amber-100/50 p-5 flex flex-col items-center text-center gap-3 transition-all"
              >
                <span className="text-3xl group-hover:scale-110 transition-transform">{cat.icon}</span>
                <span className="text-sm font-semibold text-gray-800 group-hover:text-amber-700 transition-colors">
                  {cat.label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Neueste Produkte</h2>
          <Link
            href="/produkte"
            className="text-sm font-medium text-amber-600 hover:text-amber-700 transition-colors"
          >
            Alle anzeigen &rarr;
          </Link>
        </div>
        {products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-gray-50 rounded-2xl">
            <p className="text-gray-500">Produkte werden geladen...</p>
            <p className="text-sm text-gray-400 mt-2">
              WooCommerce-Backend wird eingerichtet.
            </p>
          </div>
        )}
      </section>

      {/* Why FussMatt */}
      <section className="bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Warum FussMatt?</h2>
            <p className="mt-3 text-gray-500 max-w-lg mx-auto">
              Qualität, Passgenauigkeit und Design — vereint in einer Fussmatte.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: "TPE Premium Material", desc: "Umweltfreundlich, geruchlos und extrem langlebig. Bis zu -40°C flexibel." },
              { title: "3D-Vermessung", desc: "Jede Matte wird per 3D-Scan millimetergenau für Ihr Fahrzeugmodell gefertigt." },
              { title: "Einfache Montage", desc: "Perfekte Passform ohne Zuschneiden. Einfach einlegen und fertig." },
            ].map((feature) => (
              <div key={feature.title} className="bg-white p-8 rounded-2xl border border-gray-100">
                <div className="w-14 h-14 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600 mb-5">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">{feature.title}</h3>
                <p className="mt-2 text-sm text-gray-500 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
