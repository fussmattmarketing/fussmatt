"use client";

import { useEffect, useRef } from "react";
import { trackViewItem } from "@/lib/analytics";
import type { WCProduct } from "@/types/woocommerce";

interface ProductPageTrackingProps {
  product: WCProduct;
}

/**
 * Fires GA4 `view_item` event once on mount.
 * Invisible (renders null) — drop into product detail page.
 */
export default function ProductPageTracking({
  product,
}: ProductPageTrackingProps) {
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    trackViewItem(product);
  }, [product]);

  return null;
}
