"use client";

import { useState } from "react";
import { useCartStore } from "@/lib/cart-store";
import type { WCProduct, WCProductVariation } from "@/types/woocommerce";
import BackInStockNotify from "./BackInStockNotify";

interface AddToCartButtonProps {
  product: WCProduct;
  variations?: WCProductVariation[];
}

export default function AddToCartButton({
  product,
  variations = [],
}: AddToCartButtonProps) {
  const [quantity, setQuantity] = useState(1);
  const [selectedAttrs, setSelectedAttrs] = useState<Record<string, string>>(
    {}
  );
  const [added, setAdded] = useState(false);
  const addItem = useCartStore((s) => s.addItem);

  const isVariable = product.type === "variable" && variations.length > 0;
  const variationAttrs = isVariable
    ? product.attributes.filter((a) => a.variation)
    : [];

  // Find matching variation
  const selectedVariation = isVariable
    ? variations.find((v) =>
        v.attributes.every(
          (a) => !a.option || selectedAttrs[a.name] === a.option
        )
      )
    : undefined;

  const allSelected =
    !isVariable ||
    variationAttrs.every((a) => selectedAttrs[a.name]);

  const canAdd =
    product.stock_status === "instock" &&
    (!isVariable || (allSelected && selectedVariation));

  const price = selectedVariation?.price || product.price;

  function handleAdd() {
    if (!canAdd) return;
    addItem(product, quantity, selectedVariation, selectedAttrs);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  // Out of stock — show notification form instead
  if (product.stock_status !== "instock") {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-red-600">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
          <span className="text-sm font-medium">Derzeit nicht verfügbar</span>
        </div>
        <BackInStockNotify sku={product.sku} productName={product.name} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Variation selectors */}
      {variationAttrs.map((attr) => (
        <div key={attr.name}>
          <label
            htmlFor={`attr-${attr.name}`}
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {attr.name}
          </label>
          <select
            id={`attr-${attr.name}`}
            value={selectedAttrs[attr.name] || ""}
            onChange={(e) =>
              setSelectedAttrs((prev) => ({
                ...prev,
                [attr.name]: e.target.value,
              }))
            }
            className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm focus:border-amber-500 focus:ring-amber-500"
          >
            <option value="">Bitte wählen...</option>
            {attr.options.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
      ))}

      {/* Quantity + Add to cart */}
      <div className="flex items-center gap-3">
        <div className="flex items-center border border-gray-300 rounded-xl">
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="w-11 h-11 flex items-center justify-center text-gray-600 hover:text-gray-900 transition-colors"
            aria-label="Menge verringern"
          >
            -
          </button>
          <span className="w-10 text-center text-sm font-medium">
            {quantity}
          </span>
          <button
            onClick={() => setQuantity(Math.min(99, quantity + 1))}
            className="w-11 h-11 flex items-center justify-center text-gray-600 hover:text-gray-900 transition-colors"
            aria-label="Menge erhöhen"
          >
            +
          </button>
        </div>

        <button
          onClick={handleAdd}
          disabled={!canAdd}
          className={`flex-1 h-11 rounded-xl font-semibold text-sm transition-all ${
            added
              ? "bg-green-500 text-white"
              : canAdd
                ? "bg-amber-500 hover:bg-amber-600 text-white"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
          }`}
        >
          {added
            ? "\u2713 Hinzugefügt!"
            : !canAdd && isVariable
              ? "Variante wählen"
              : product.stock_status !== "instock"
                ? "Nicht verfügbar"
                : `In den Warenkorb \u2013 CHF ${parseFloat(price || "0").toFixed(2)}`}
        </button>
      </div>
    </div>
  );
}
