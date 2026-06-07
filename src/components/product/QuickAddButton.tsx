"use client";

/**
 * QuickAddButton — full-width "Add to cart" button rendered at the
 * bottom of every product card.
 *
 * Replaces the earlier icon-only floating pill (CEO 2026-06-07: wanted
 * the action visible as text, not just an icon). Now reads as
 * "🛒 In den Warenkorb" so users on listing pages know exactly what
 * the click will do without hovering for a tooltip.
 *
 * Layout: full-width amber bar inside the card's info section, sitting
 * below the stock dot — flush with the card's left/right padding.
 *
 * Constraints (unchanged from icon version):
 *   - Variable products → no quick-add (need a variant choice).
 *     Renders nothing; ProductCard's Link to the detail page is the
 *     only path.
 *   - Out-of-stock → renders nothing too; the card surfaces stock
 *     status separately above this button.
 *   - The ProductCard wraps everything in a <Link>; this button calls
 *     preventDefault + stopPropagation on click so the click adds the
 *     item to the cart instead of navigating to the detail page.
 *
 * Analytics: fires trackAddToCart (same event as AddToCartButton on
 * the detail page) so quick-adds and full-page adds share one funnel.
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
      className={`mt-3 w-full inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
        added
          ? "bg-green-500 text-white"
          : "bg-amber-500 hover:bg-amber-600 text-white"
      }`}
    >
      {added ? (
        <>
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
          <span>Hinzugefügt</span>
        </>
      ) : (
        <>
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
          <span>In den Warenkorb</span>
        </>
      )}
    </button>
  );
}
