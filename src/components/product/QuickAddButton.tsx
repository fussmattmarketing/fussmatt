"use client";

/**
 * QuickAddButton — small "Add to cart" affordance for product cards.
 *
 * Renders a 36×36 amber pill in the bottom-right corner of the card
 * image. Click adds the product to the cart and flashes a green
 * checkmark for 1.5s.
 *
 * Constraints handled here (so ProductCard can stay declarative):
 *   - Variable products → no quick-add (need a variant choice).
 *     Button is hidden; ProductCard's Link to the detail page is
 *     the only path.
 *   - Out-of-stock → button is hidden too; the card itself surfaces
 *     stock status separately.
 *   - The ProductCard wraps everything in a <Link>; this button
 *     calls preventDefault + stopPropagation so click doesn't
 *     navigate to the detail page.
 *
 * Analytics: fires trackAddToCart (same event the full AddToCart
 * button on the detail page emits), so quick-adds and full-page
 * adds end up in the same funnel.
 */

import { useState } from "react";
import { useCartStore } from "@/lib/cart-store";
import { trackAddToCart } from "@/lib/analytics";
import type { WCProduct } from "@/types/woocommerce";

export default function QuickAddButton({ product }: { product: WCProduct }) {
  const [added, setAdded] = useState(false);
  const addItem = useCartStore((s) => s.addItem);

  const isVariable = product.type === "variable";
  const inStock = product.stock_status === "instock";

  // Variable products need variant picking — defer to detail page.
  // Out-of-stock — nothing to add.
  if (isVariable || !inStock) return null;

  function handleClick(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    e.stopPropagation();
    if (!inStock || added) return;
    addItem(product, 1);
    trackAddToCart(product, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={`${product.name} in den Warenkorb`}
      title="In den Warenkorb"
      className={`absolute bottom-3 right-3 z-10 inline-flex items-center justify-center w-9 h-9 rounded-full shadow-md transition-all ${
        added
          ? "bg-green-500 text-white scale-110"
          : "bg-amber-500 hover:bg-amber-600 text-white"
      }`}
    >
      {added ? (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-4 h-4"
          aria-hidden="true"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ) : (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-4 h-4"
          aria-hidden="true"
        >
          <path d="M9 22a1 1 0 1 0 0-2 1 1 0 0 0 0 2z" />
          <path d="M20 22a1 1 0 1 0 0-2 1 1 0 0 0 0 2z" />
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
        </svg>
      )}
    </button>
  );
}
