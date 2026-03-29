"use client";

import { useEffect } from "react";
import { useCartStore } from "@/lib/cart-store";

/**
 * Clears the cart when the order confirmation page mounts.
 * This ensures cart is only cleared AFTER successful Stripe payment,
 * not before redirect (which would lose cart if user cancels).
 */
export default function ClearCartOnMount() {
  const clearCart = useCartStore((s) => s.clearCart);

  useEffect(() => {
    clearCart();
  }, [clearCart]);

  return null;
}
