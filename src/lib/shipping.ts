import type { SupportedCountry } from "./validations";

export interface ShippingRate {
  cost: number;
  freeAbove: number;
  currency: string;
  deliveryDays: string;
}

export const SHIPPING_CONFIG: Record<SupportedCountry, ShippingRate> = {
  CH: { cost: 0, freeAbove: 50, currency: "CHF", deliveryDays: "3-5" },
  DE: { cost: 5.9, freeAbove: 50, currency: "EUR", deliveryDays: "5-7" },
  AT: { cost: 5.9, freeAbove: 50, currency: "EUR", deliveryDays: "5-7" },
  FR: { cost: 7.9, freeAbove: 75, currency: "EUR", deliveryDays: "7-10" },
  IT: { cost: 7.9, freeAbove: 75, currency: "EUR", deliveryDays: "7-10" },
  NL: { cost: 7.9, freeAbove: 75, currency: "EUR", deliveryDays: "7-10" },
} as const;

export const COUNTRY_NAMES: Record<SupportedCountry, string> = {
  CH: "Schweiz",
  DE: "Deutschland",
  AT: "Österreich",
  FR: "Frankreich",
  IT: "Italien",
  NL: "Niederlande",
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
