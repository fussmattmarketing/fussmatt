"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCartStore, useCartHydration } from "@/lib/cart-store";
import { formatPrice, wpMediaUrl } from "@/lib/utils";
import { trackViewCart, trackRemoveFromCart } from "@/lib/analytics";
import type { CartItem } from "@/types/woocommerce";

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
}

export default function CartDrawer({ open, onClose }: CartDrawerProps) {
  const mounted = useCartHydration();
  const items = useCartStore((s) => s.items);
  const totalPrice = useCartStore((s) => s.totalPrice());
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const drawerRef = useRef<HTMLDivElement>(null);

  // Fire view_cart when drawer opens with items
  useEffect(() => {
    if (open && mounted && items.length > 0) {
      trackViewCart(items);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function handleRemove(item: CartItem) {
    trackRemoveFromCart(item);
    removeItem(item.product.id, item.variation?.id);
  }

  // Close on Escape
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape" && open) onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  // Prevent body scroll
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        role="dialog"
        aria-label="Warenkorb"
        className="fixed right-0 top-0 h-full w-full sm:w-96 bg-white z-50 shadow-xl flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b">
          <h2 className="text-lg font-semibold">Warenkorb</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 focus-visible:ring-2 focus-visible:ring-amber-500 rounded-lg"
            aria-label="Warenkorb schließen"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {!mounted || items.length === 0 ? (
            <div className="text-center py-12">
              <svg
                className="w-16 h-16 mx-auto text-gray-300 mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
              <p className="text-gray-500">Ihr Warenkorb ist leer.</p>
              <Link
                href="/produkte"
                onClick={onClose}
                className="inline-block mt-4 text-sm font-medium text-amber-600 hover:text-amber-700"
              >
                Jetzt einkaufen
              </Link>
            </div>
          ) : (
            items.map((item) => {
              const key = `${item.product.id}-${item.variation?.id || 0}`;
              const image = item.variation?.image || item.product.images[0];
              const price = parseFloat(
                item.variation?.price || item.product.price || "0"
              );

              return (
                <div key={key} className="flex gap-3">
                  {image && (
                    <div className="w-16 h-16 flex-shrink-0 bg-gray-50 rounded-lg overflow-hidden relative">
                      <Image
                        src={wpMediaUrl(image.src)}
                        alt={image.alt || item.product.name}
                        fill
                        sizes="64px"
                        className="object-contain p-1"
                        unoptimized
                      />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {item.product.name}
                    </p>
                    {item.selectedAttributes && (
                      <p className="text-xs text-gray-500">
                        {Object.values(item.selectedAttributes).join(" / ")}
                      </p>
                    )}
                    <div className="mt-1 flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() =>
                            updateQuantity(
                              item.product.id,
                              item.quantity - 1,
                              item.variation?.id
                            )
                          }
                          className="w-7 h-7 flex items-center justify-center text-gray-500 hover:text-gray-700 border rounded"
                          aria-label="Menge verringern"
                        >
                          -
                        </button>
                        <span className="text-sm w-6 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(
                              item.product.id,
                              item.quantity + 1,
                              item.variation?.id
                            )
                          }
                          className="w-7 h-7 flex items-center justify-center text-gray-500 hover:text-gray-700 border rounded"
                          aria-label="Menge erhöhen"
                        >
                          +
                        </button>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">
                          {formatPrice(price * item.quantity)}
                        </span>
                        <button
                          onClick={() => handleRemove(item)}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                          aria-label="Entfernen"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        {mounted && items.length > 0 && (
          <div className="border-t p-4 space-y-3">
            <div className="flex justify-between text-base font-semibold">
              <span>Zwischensumme</span>
              <span>{formatPrice(totalPrice)}</span>
            </div>
            <Link
              href="/kasse"
              onClick={onClose}
              className="block w-full text-center bg-amber-500 hover:bg-amber-600 text-white font-semibold py-3 rounded-xl transition-colors"
            >
              Zur Kasse
            </Link>
            <button
              onClick={onClose}
              className="block w-full text-center text-sm text-gray-500 hover:text-gray-700"
            >
              Weiter einkaufen
            </button>
          </div>
        )}
      </div>
    </>
  );
}
