"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCartStore, useCartHydration } from "@/lib/cart-store";
import { formatPrice, wpMediaUrl } from "@/lib/utils";
import { calculateShipping, COUNTRY_NAMES } from "@/lib/shipping";
import { SUPPORTED_COUNTRIES } from "@/lib/validations";
import type { SupportedCountry } from "@/lib/validations";

export default function WarenkorbPage() {
  const mounted = useCartHydration();
  const items = useCartStore((s) => s.items);
  const totalPrice = useCartStore((s) => s.totalPrice());
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const [country, setCountry] = useState<SupportedCountry>("CH");

  const shipping = calculateShipping(country, totalPrice);

  if (!mounted) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="animate-pulse h-96 bg-gray-100 rounded-2xl" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <svg className="w-20 h-20 mx-auto text-gray-300 mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
        <h1 className="text-2xl font-bold text-gray-900">
          Ihr Warenkorb ist leer
        </h1>
        <p className="text-gray-500 mt-2">
          Entdecken Sie unsere Premium Fußmatten.
        </p>
        <Link
          href="/produkte"
          className="inline-block mt-6 bg-amber-500 hover:bg-amber-600 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
        >
          Jetzt einkaufen
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Warenkorb</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => {
            const key = `${item.product.id}-${item.variation?.id || 0}`;
            const image = item.variation?.image || item.product.images[0];
            const price = parseFloat(item.variation?.price || item.product.price || "0");

            return (
              <div key={key} className="flex gap-4 bg-white border border-gray-200 rounded-2xl p-4">
                {image && (
                  <div className="w-24 h-24 flex-shrink-0 bg-gray-50 rounded-xl overflow-hidden relative">
                    <Image
                      src={wpMediaUrl(image.src)}
                      alt={image.alt || item.product.name}
                      fill
                      sizes="96px"
                      className="object-contain p-2"
                      unoptimized
                    />
                  </div>
                )}
                <div className="flex-1">
                  <Link href={`/produkt/${item.product.slug}`} className="font-medium text-gray-900 hover:text-amber-700">
                    {item.product.name}
                  </Link>
                  {item.selectedAttributes && (
                    <p className="text-sm text-gray-500 mt-0.5">
                      {Object.values(item.selectedAttributes).join(" / ")}
                    </p>
                  )}
                  <div className="mt-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1, item.variation?.id)}
                        className="w-8 h-8 flex items-center justify-center border rounded-lg hover:bg-gray-50"
                        aria-label="Menge verringern"
                      >
                        -
                      </button>
                      <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1, item.variation?.id)}
                        className="w-8 h-8 flex items-center justify-center border rounded-lg hover:bg-gray-50"
                        aria-label="Menge erhöhen"
                      >
                        +
                      </button>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-semibold">{formatPrice(price * item.quantity)}</span>
                      <button
                        onClick={() => removeItem(item.product.id, item.variation?.id)}
                        className="text-gray-400 hover:text-red-500"
                        aria-label="Entfernen"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary */}
        <div className="bg-gray-50 rounded-2xl p-6 h-fit lg:sticky lg:top-24">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Bestellübersicht
          </h2>

          <div className="mb-4">
            <label htmlFor="shipping-country" className="block text-sm font-medium text-gray-700 mb-1">
              Lieferland
            </label>
            <select
              id="shipping-country"
              value={country}
              onChange={(e) => setCountry(e.target.value as SupportedCountry)}
              className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm"
            >
              {SUPPORTED_COUNTRIES.map((c) => (
                <option key={c} value={c}>{COUNTRY_NAMES[c]}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Zwischensumme</span>
              <span>{formatPrice(totalPrice)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Versand</span>
              <span>
                {shipping.isFree ? (
                  <span className="text-green-600">Kostenlos</span>
                ) : (
                  formatPrice(shipping.cost)
                )}
              </span>
            </div>
            <hr className="my-2" />
            <div className="flex justify-between text-base font-semibold">
              <span>Gesamt</span>
              <span>{formatPrice(totalPrice + shipping.cost)}</span>
            </div>
          </div>

          <Link
            href="/kasse"
            className="block w-full text-center bg-amber-500 hover:bg-amber-600 text-white font-semibold py-3 rounded-xl mt-6 transition-colors"
          >
            Zur Kasse
          </Link>

          <Link
            href="/produkte"
            className="block w-full text-center text-sm text-gray-500 hover:text-gray-700 mt-3"
          >
            Weiter einkaufen
          </Link>
        </div>
      </div>
    </div>
  );
}
