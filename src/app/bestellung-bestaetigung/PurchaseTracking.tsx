"use client";

import { useEffect, useRef } from "react";
import { readAndClearPurchaseSnapshot, trackPurchase } from "@/lib/analytics";

export default function PurchaseTracking() {
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;

    const snapshot = readAndClearPurchaseSnapshot();
    if (!snapshot) return;

    trackPurchase(
      snapshot.transaction_id,
      snapshot.items,
      snapshot.value,
      snapshot.shipping,
      snapshot.tax
    );
  }, []);

  return null;
}
