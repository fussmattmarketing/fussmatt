"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import type { VehicleHierarchy } from "@/types/woocommerce";

interface VehicleFilterProps {
  hierarchy: VehicleHierarchy;
  variant?: "hero" | "sidebar";
  categorySlug?: string;
}

export default function VehicleFilter({
  hierarchy,
  variant = "sidebar",
  categorySlug,
}: VehicleFilterProps) {
  const router = useRouter();
  const [selectedBrand, setSelectedBrand] = useState("");
  const [selectedModel, setSelectedModel] = useState("");

  const brands = hierarchy.brands;

  const currentBrand = useMemo(
    () => brands.find((b) => b.slug === selectedBrand),
    [selectedBrand, brands]
  );

  const models = currentBrand?.models || [];

  function handleSearch() {
    if (!selectedBrand) return;

    if (categorySlug) {
      router.push(`/kategorie/${categorySlug}/${selectedBrand}`);
    } else if (selectedModel) {
      router.push(`/marke/${selectedBrand}/${selectedModel}`);
    } else {
      router.push(`/marke/${selectedBrand}`);
    }
  }

  // ─── Hero variant: white card, stacked dropdowns, pill button ──────
  if (variant === "hero") {
    return (
      <div className="bg-white rounded-3xl shadow-2xl p-8 sm:p-10 max-w-md mx-auto lg:mx-0 text-center">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-8">
          Finden Sie Ihre Fussmatten
        </h2>

        <div className="space-y-4">
          {/* Brand */}
          <div className="relative">
            <select
              value={selectedBrand}
              onChange={(e) => {
                setSelectedBrand(e.target.value);
                setSelectedModel("");
              }}
              aria-label="Marke wählen"
              className="w-full px-5 py-4 bg-white border-2 border-gray-200 rounded-2xl text-base text-gray-700 focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none appearance-none cursor-pointer transition-colors"
            >
              <option value="">Marke wählen</option>
              {brands.map((b) => (
                <option key={b.slug} value={b.slug}>
                  {b.name}
                </option>
              ))}
            </select>
            <svg
              className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          </div>

          {/* Model */}
          <div className="relative">
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              disabled={!selectedBrand || models.length === 0}
              aria-label="Modell wählen"
              className={`w-full px-5 py-4 bg-white border-2 border-gray-200 rounded-2xl text-base text-gray-700 focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none appearance-none cursor-pointer transition-colors ${
                !selectedBrand ? "opacity-40 cursor-not-allowed" : ""
              }`}
            >
              <option value="">Modell wählen</option>
              {models.map((m) => (
                <option key={m.slug} value={m.slug}>
                  {currentBrand?.name} {m.name}
                </option>
              ))}
            </select>
            <svg
              className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          </div>
        </div>

        {/* Search button — pill shape */}
        <button
          onClick={handleSearch}
          disabled={!selectedBrand}
          className="mt-8 px-12 py-4 bg-amber-500 hover:bg-amber-400 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold text-base uppercase tracking-wider rounded-full transition-colors shadow-lg shadow-amber-500/25"
        >
          Suchen
        </button>
      </div>
    );
  }

  // ─── Sidebar variant ──────────────────────────────────
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5">
      <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">
        Fahrzeugfilter
      </h3>
      <div className="space-y-3">
        <div className="relative">
          <select
            value={selectedBrand}
            onChange={(e) => {
              setSelectedBrand(e.target.value);
              setSelectedModel("");
            }}
            aria-label="Marke wählen"
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none appearance-none cursor-pointer"
          >
            <option value="">Marke wählen</option>
            {brands.map((b) => (
              <option key={b.slug} value={b.slug}>
                {b.name}
              </option>
            ))}
          </select>
          <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        </div>

        <div className="relative">
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            disabled={!selectedBrand || models.length === 0}
            aria-label="Modell wählen"
            className={`w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none appearance-none cursor-pointer ${
              !selectedBrand ? "opacity-50" : ""
            }`}
          >
            <option value="">Modell wählen</option>
            {models.map((m) => (
              <option key={m.slug} value={m.slug}>
                {currentBrand?.name} {m.name}
              </option>
            ))}
          </select>
          <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        </div>

        <button
          onClick={handleSearch}
          disabled={!selectedBrand}
          className="w-full py-3 bg-amber-600 hover:bg-amber-500 disabled:bg-gray-200 disabled:cursor-not-allowed text-white font-medium text-sm rounded-xl transition-colors"
        >
          Suchen
        </button>
      </div>
    </div>
  );
}
