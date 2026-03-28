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

  const models = useMemo(() => {
    if (!selectedBrand) return [];
    const brand = brands.find((b) => b.slug === selectedBrand);
    return brand?.models || [];
  }, [selectedBrand, brands]);

  function handleSearch() {
    if (!selectedBrand) return;

    let url = `/marke/${selectedBrand}`;
    if (selectedModel) {
      url += `/${selectedModel}`;
    }

    if (categorySlug) {
      url = `/kategorie/${categorySlug}/${selectedBrand}`;
    }

    router.push(url);
  }

  const isHero = variant === "hero";

  return (
    <div
      className={
        isHero
          ? "bg-gray-900 rounded-2xl p-6 sm:p-8"
          : "bg-gray-50 rounded-xl p-4"
      }
    >
      {isHero && (
        <h2 className="text-white text-lg font-semibold mb-4">
          Fußmatten für Ihr Fahrzeug finden
        </h2>
      )}

      <div
        className={
          isHero
            ? "grid grid-cols-1 sm:grid-cols-3 gap-3"
            : "space-y-3"
        }
      >
        {/* Brand */}
        <div>
          <label
            htmlFor="vf-brand"
            className={`block text-sm font-medium mb-1 ${
              isHero ? "text-gray-300" : "text-gray-700"
            }`}
          >
            Marke
          </label>
          <select
            id="vf-brand"
            value={selectedBrand}
            onChange={(e) => {
              setSelectedBrand(e.target.value);
              setSelectedModel("");
            }}
            className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm bg-white focus:border-amber-500 focus:ring-amber-500"
          >
            <option value="">Marke wählen...</option>
            {brands.map((b) => (
              <option key={b.slug} value={b.slug}>
                {b.name} ({b.productCount})
              </option>
            ))}
          </select>
        </div>

        {/* Model */}
        <div>
          <label
            htmlFor="vf-model"
            className={`block text-sm font-medium mb-1 ${
              isHero ? "text-gray-300" : "text-gray-700"
            }`}
          >
            Modell
          </label>
          <select
            id="vf-model"
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            disabled={!selectedBrand}
            className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm bg-white focus:border-amber-500 focus:ring-amber-500 disabled:bg-gray-100 disabled:text-gray-400"
          >
            <option value="">
              {selectedBrand ? "Modell wählen..." : "Erst Marke wählen"}
            </option>
            {models.map((m) => (
              <option key={m.slug} value={m.slug}>
                {m.name}
              </option>
            ))}
          </select>
        </div>

        {/* Search button */}
        <div className={isHero ? "flex items-end" : ""}>
          <button
            onClick={handleSearch}
            disabled={!selectedBrand}
            className={`w-full rounded-xl font-semibold text-sm transition-all ${
              isHero ? "py-2.5" : "py-2.5 mt-1"
            } ${
              selectedBrand
                ? "bg-amber-500 hover:bg-amber-600 text-white"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            Fußmatten suchen
          </button>
        </div>
      </div>
    </div>
  );
}
