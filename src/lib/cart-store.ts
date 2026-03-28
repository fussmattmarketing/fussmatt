"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useState, useEffect } from "react";
import type {
  CartItem,
  WCProduct,
  WCProductVariation,
} from "@/types/woocommerce";

interface CartState {
  items: CartItem[];
  addItem: (
    product: WCProduct,
    quantity?: number,
    variation?: WCProductVariation,
    selectedAttributes?: Record<string, string>
  ) => void;
  removeItem: (productId: number, variationId?: number) => void;
  updateQuantity: (
    productId: number,
    quantity: number,
    variationId?: number
  ) => void;
  clearCart: () => void;
  totalItems: () => number;
  totalPrice: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product, quantity = 1, variation, selectedAttributes) => {
        set((state) => {
          const existingIndex = state.items.findIndex(
            (item) =>
              item.product.id === product.id &&
              (variation
                ? item.variation?.id === variation.id
                : !item.variation)
          );

          if (existingIndex > -1) {
            const newItems = [...state.items];
            newItems[existingIndex] = {
              ...newItems[existingIndex],
              quantity: newItems[existingIndex].quantity + quantity,
            };
            return { items: newItems };
          }

          return {
            items: [
              ...state.items,
              { product, variation, quantity, selectedAttributes },
            ],
          };
        });
      },

      removeItem: (productId, variationId) => {
        set((state) => ({
          items: state.items.filter(
            (item) =>
              !(
                item.product.id === productId &&
                (variationId
                  ? item.variation?.id === variationId
                  : !item.variation)
              )
          ),
        }));
      },

      updateQuantity: (productId, quantity, variationId) => {
        if (quantity <= 0) {
          get().removeItem(productId, variationId);
          return;
        }
        set((state) => ({
          items: state.items.map((item) =>
            item.product.id === productId &&
            (variationId
              ? item.variation?.id === variationId
              : !item.variation)
              ? { ...item, quantity }
              : item
          ),
        }));
      },

      clearCart: () => set({ items: [] }),

      totalItems: () =>
        get().items.reduce((sum, item) => sum + item.quantity, 0),

      totalPrice: () =>
        get().items.reduce((sum, item) => {
          const price = parseFloat(
            item.variation?.price || item.product.price || "0"
          );
          return sum + price * item.quantity;
        }, 0),
    }),
    {
      name: "fussmatt-cart",
    }
  )
);

/**
 * Hydration-safe hook for cart state.
 * Returns 0/empty on SSR, actual values after hydration.
 * Prevents React Hydration Error #418.
 */
export function useCartHydration() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return mounted;
}
