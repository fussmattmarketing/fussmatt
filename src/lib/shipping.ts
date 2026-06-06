import type { SupportedCountry } from "./validations";

export interface ShippingRate {
  cost: number;
  freeAbove: number;
  currency: string;
  deliveryDays: string;
}

export const SHIPPING_CONFIG: Record<SupportedCountry, ShippingRate> = {
  // CH-only fulfillment. cost=0 + freeAbove=0 = unconditional free shipping.
  // deliveryDays surfaces in UI as "1-3 Werktage".
  CH: { cost: 0, freeAbove: 0, currency: "CHF", deliveryDays: "1-3" },
} as const;

export const COUNTRY_NAMES: Record<SupportedCountry, string> = {
  CH: "Schweiz",
} as const;

export function calculateShipping(
  country: SupportedCountry,
  subtotal: number
): { cost: number; isFree: boolean; freeAbove: number } {
  const config = SHIPPING_CONFIG[country];
  const isFree = subtotal >= config.freeAbove;
  return {
    cost: isFree ? 0 : config.cost,
    isFree,
    freeAbove: config.freeAbove,
  };
}

export function getDeliveryEstimate(country: SupportedCountry): string {
  return `${SHIPPING_CONFIG[country].deliveryDays} Werktage`;
}

export function formatShippingCost(country: SupportedCountry): string {
  const config = SHIPPING_CONFIG[country];
  if (config.cost === 0) return "Kostenlos";
  return `${config.currency} ${config.cost.toFixed(2)}`;
}
