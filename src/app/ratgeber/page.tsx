import type { Metadata } from "next";
import Link from "next/link";
import { RATGEBER_ARTICLES } from "@/lib/ratgeber-data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Ratgeber",
  description:
    "Alles rund um Auto-Fussmatten: Vergleiche, Materialien, Pflege-Tipps und häufig gestellte Fragen.",
};

export default function RatgeberIndexPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-gray-900 to-gray-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <h1 className="text-3xl lg:text-4xl font-bold">Ratgeber</h1>
          <p className="mt-3 text-gray-300 max-w-2xl">
            Tipps, Vergleiche und Wissenswertes rund um Auto-Fussmatten.
            Finden Sie die perfekte Lösung für Ihr Fahrzeug.
          </p>
        </div>
      </section>

      {/* Articles Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {RATGEBER_ARTICLES.map((article) => (
            <Link
              key={article.slug}
              href={`/ratgeber/${article.slug}`}
              className="group block bg-white rounded-2xl border border-gray-200 overflow-hidden hover:border-amber-300 hover:shadow-lg transition-all duration-300"
            >
              {/* Image */}
              <div className="relative aspect-[16/10] bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={article.image}
                  alt={article.title}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3">
                  <span className="bg-amber-500 text-white text-xs font-bold px-2.5 py-1 rounded-lg">
                    {article.category}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-5">
                <div className="flex items-center gap-3 text-xs text-gray-400 mb-2">
                  <time dateTime={article.date}>
                    {new Date(article.date).toLocaleDateString("de-CH", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </time>
                  <span>·</span>
                  <span>{article.readTime} Lesezeit</span>
                </div>

                <h2 className="text-lg font-semibold text-gray-900 group-hover:text-amber-700 transition-colors line-clamp-2">
                  {article.title}
                </h2>

                <p className="mt-2 text-sm text-gray-500 line-clamp-3">
                  {article.excerpt}
                </p>

                <span className="inline-flex items-center gap-1 mt-4 text-sm font-medium text-amber-600 group-hover:text-amber-700 transition-colors">
                  Weiterlesen
                  <svg
                    className="w-4 h-4 group-hover:translate-x-1 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                    />
                  </svg>
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
