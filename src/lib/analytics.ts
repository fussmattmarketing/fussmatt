/**
 * GA4 Enhanced Ecommerce Tracking
 *
 * Pushes events to dataLayer / gtag for Google Analytics 4.
 * All functions are SSR-safe (no-op on server).
 *
 * Funnel: view_item → add_to_cart → view_cart → begin_checkout
 *         → add_payment_info → purchase
 */

import type {
  CartItem,
  WCProduct,
  WCProductVariation,
} from "@/types/woocommerce";

// ─── Types ─────────────────────────────────────────────

interface GA4Item {
  item_id: string;
  item_name: string;
  item_brand: string;
  item_category?: string;
  item_variant?: string;
  price: number;
  quantity: number;
  index?: number;
}

type GA4Params = Record<string, unknown>;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

// ─── Constants ────────────────────────────────────────

const BRAND = "FussMatt";
const CURRENCY = "CHF";
const PURCHASE_SNAPSHOT_KEY = "fussmatt-pending-purchase";
const PURCHASE_SNAPSHOT_MAX_AGE_MS = 2 * 60 * 60 * 1000; // 2 hours

// ─── Core push helper ─────────────────────────────────

export function pushEvent(name: string, params: GA4Params = {}): void {
  if (typeof window === "undefined") return;
  if (!window.dataLayer) window.dataLayer = [];

  // Reset ecommerce object before each event (GA4 best practice)
  if (params.items) {
    window.dataLayer.push({ ecommerce: null });
  }

  window.dataLayer.push({
    event: name,
    ...params,
  });

  // Also fire via gtag if available — direct path to GA4
  if (typeof window.gtag === "function") {
    window.gtag("event", name, params);
  }
}

// ─── Item builders ────────────────────────────────────

function priceOf(
  product: WCProduct,
  variation?: WCProductVariation
): number {
  const raw = variation?.price || product.price || product.regular_price || "0";
  const n = parseFloat(raw);
  return isNaN(n) ? 0 : n;
}

export function productToItem(
  product: WCProduct,
  variation?: WCProductVariation,
  quantity: number = 1,
  selectedAttributes?: Record<string, string>,
  index?: number
): GA4Item {
  const item: GA4Item = {
    item_id: product.sku || `wc_${product.id}`,
    item_name: product.name,
    item_brand: BRAND,
    price: priceOf(product, variation),
    quantity,
  };

  const cat = product.categories?.[0]?.name;
  if (cat) item.item_category = cat;

  if (selectedAttributes && Object.keys(selectedAttributes).length > 0) {
    item.item_variant = Object.values(selectedAttributes).join(" / ");
  } else if (variation?.attributes && variation.attributes.length > 0) {
    item.item_variant = variation.attributes
      .map((a) => a.option)
      .filter(Boolean)
      .join(" / ");
  }

  if (typeof index === "number") item.index = index;

  return item;
}

export function cartItemToItem(item: CartItem, index?: number): GA4Item {
  return productToItem(
    item.product,
    item.variation,
    item.quantity,
    item.selectedAttributes,
    index
  );
}

function itemsValue(items: GA4Item[]): number {
  return items.reduce((sum, i) => sum + i.price * i.quantity, 0);
}

// ─── Event functions ──────────────────────────────────

export function trackViewItem(product: WCProduct): void {
  const item = productToItem(product);
  pushEvent("view_item", {
    currency: CURRENCY,
    value: item.price,
    items: [item],
  });
}

export function trackAddToCart(
  product: WCProduct,
  quantity: number,
  variation?: WCProductVariation,
  selectedAttributes?: Record<string, string>
): void {
  const item = productToItem(product, variation, quantity, selectedAttributes);
  pushEvent("add_to_cart", {
    currency: CURRENCY,
    value: item.price * item.quantity,
    items: [item],
  });
}

export function trackRemoveFromCart(cartItem: CartItem): void {
  const item = cartItemToItem(cartItem);
  pushEvent("remove_from_cart", {
    currency: CURRENCY,
    value: item.price * item.quantity,
    items: [item],
  });
}

export function trackViewCart(cartItems: CartItem[]): void {
  if (cartItems.length === 0) return;
  const items = cartItems.map((c, i) => cartItemToItem(c, i));
  pushEvent("view_cart", {
    currency: CURRENCY,
    value: itemsValue(items),
    items,
  });
}

export function trackBeginCheckout(cartItems: CartItem[]): void {
  if (cartItems.length === 0) return;
  const items = cartItems.map((c, i) => cartItemToItem(c, i));
  pushEvent("begin_checkout", {
    currency: CURRENCY,
    value: itemsValue(items),
    items,
  });
}

export function trackAddPaymentInfo(
  cartItems: CartItem[],
  paymentType: string = "stripe"
): void {
  if (cartItems.length === 0) return;
  const items = cartItems.map((c, i) => cartItemToItem(c, i));
  pushEvent("add_payment_info", {
    currency: CURRENCY,
    value: itemsValue(items),
    payment_type: paymentType,
    items,
  });
}

export function trackPurchase(
  transactionId: string | number,
  items: GA4Item[],
  value: number,
  shipping: number = 0,
  tax: number = 0
): void {
  pushEvent("purchase", {
    transaction_id: String(transactionId),
    currency: CURRENCY,
    value,
    shipping,
    tax,
    items,
  });
}

// ─── Purchase snapshot (sessionStorage bridge) ───────

export interface PurchaseSnapshot {
  transaction_id: string;
  value: number;
  currency: string;
  shipping: number;
  tax: number;
  items: GA4Item[];
  timestamp: number;
}

export function savePurchaseSnapshot(
  transactionId: string | number,
  cartItems: CartItem[],
  value: number,
  shipping: number = 0
): void {
  if (typeof window === "undefined") return;
  const snapshot: PurchaseSnapshot = {
    transaction_id: String(transactionId),
    value,
    currency: CURRENCY,
    shipping,
    tax: 0,
    items: cartItems.map((c, i) => cartItemToItem(c, i)),
    timestamp: Date.now(),
  };
  try {
    sessionStorage.setItem(PURCHASE_SNAPSHOT_KEY, JSON.stringify(snapshot));
  } catch {
    // sessionStorage may be unavailable (private mode); fail silently
  }
}

export function readAndClearPurchaseSnapshot(): PurchaseSnapshot | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(PURCHASE_SNAPSHOT_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as PurchaseSnapshot;
    sessionStorage.removeItem(PURCHASE_SNAPSHOT_KEY);
    if (!data.timestamp || Date.now() - data.timestamp > PURCHASE_SNAPSHOT_MAX_AGE_MS) {
      return null;
    }
    return data;
  } catch {
    return null;
  }
}
