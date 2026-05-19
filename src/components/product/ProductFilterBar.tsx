"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import VehicleFilter from "@/components/product/VehicleFilter";
import type { VehicleHierarchy } from "@/types/woocommerce";

/**
 * Sticky horizontal filter bar for product-browsing pages (/produkte, /marke,
 * /kategorie). Combines the vehicle filter (Marke/Modell → brand pages) with a
 * free-text product search. Sticks just below the site header on scroll so a
 * visitor can re-filter without scrolling back up.
 *
 * Sticky offset matches the Header height: top bar (h-9) + main row
 * (h-16 / lg:h-20) + desktop category nav (lg: h-12) = 100px / lg:164px.
 */
export default function ProductFilterBar({
  hierarchy,
}: {
  hierarchy: VehicleHierarchy;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (q) router.push(`/produkte?suche=${encodeURIComponent(q)}`);
  }

  return (
    <div className="sticky top-[100px] lg:top-[164px] z-40 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col lg:flex-row lg:items-center gap-3">
          <VehicleFilter hierarchy={hierarchy} variant="horizontal" />
          <form onSubmit={handleSearch} className="relative lg:ml-auto lg:w-72">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Produkt suchen..."
              aria-label="Produkt suchen"
              className="w-full pl-4 pr-11 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
            <button
              type="submit"
              aria-label="Suche starten"
              className="absolute right-1 top-1/2 -translate-y-1/2 w-8 h-8 bg-amber-500 hover:bg-amber-600 rounded-md flex items-center justify-center transition-colors"
            >
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
