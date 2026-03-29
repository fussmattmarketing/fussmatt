import { z } from "zod";

// Supported countries
export const SUPPORTED_COUNTRIES = ["CH", "DE", "AT", "FR", "IT", "NL"] as const;
export type SupportedCountry = (typeof SUPPORTED_COUNTRIES)[number];

// PLZ validation per country
export const plzPatterns: Record<SupportedCountry, RegExp> = {
  CH: /^\d{4}$/,
  DE: /^\d{5}$/,
  AT: /^\d{4}$/,
  FR: /^\d{5}$/,
  IT: /^\d{5}$/,
  NL: /^\d{4}\s?[A-Z]{2}$/i,
};

// PLZ helper for client-side validation
export function validatePlz(country: SupportedCountry, postcode: string): boolean {
  const pattern = plzPatterns[country];
  return pattern ? pattern.test(postcode) : true;
}

// Address schema (shared between checkout and contact)
export const addressSchema = z.object({
  first_name: z.string().min(2, "Vorname ist zu kurz"),
  last_name: z.string().min(2, "Nachname ist zu kurz"),
  company: z.string().optional().default(""),
  address_1: z.string().min(5, "Bitte vollständige Adresse eingeben"),
  address_2: z.string().optional().default(""),
  city: z.string().min(2, "Bitte Stadt eingeben"),
  state: z.string().optional().default(""),
  postcode: z.string().min(4, "Ungültige Postleitzahl"),
  country: z.enum(SUPPORTED_COUNTRIES, {
    errorMap: () => ({ message: "Bitte Land auswählen" }),
  }),
  email: z.string().email("Ungültige E-Mail-Adresse"),
  phone: z.string().min(6, "Bitte gültige Telefonnummer eingeben"),
});

// Shipping address schema (no email/phone needed)
export const shippingAddressSchema = z.object({
  first_name: z.string().min(2, "Vorname ist zu kurz"),
  last_name: z.string().min(2, "Nachname ist zu kurz"),
  company: z.string().optional().default(""),
  address_1: z.string().min(5, "Bitte vollständige Adresse eingeben"),
  address_2: z.string().optional().default(""),
  city: z.string().min(2, "Bitte Stadt eingeben"),
  state: z.string().optional().default(""),
  postcode: z.string().min(4, "Ungültige Postleitzahl"),
  country: z.enum(SUPPORTED_COUNTRIES, {
    errorMap: () => ({ message: "Bitte Land auswählen" }),
  }),
});

// Checkout schema with PLZ cross-validation
export const checkoutSchema = z
  .object({
    billing: addressSchema,
    shipping: shippingAddressSchema.optional(),
    different_shipping: z.boolean().default(false),
    line_items: z
      .array(
        z.object({
          product_id: z.number().int().positive(),
          variation_id: z.number().int().min(0),
          quantity: z.number().int().min(1).max(99),
          price: z.number().positive(),
        })
      )
      .min(1, "Warenkorb ist leer"),
    agb_accepted: z.literal(true, {
      errorMap: () => ({
        message: "Bitte akzeptieren Sie die AGB",
      }),
    }),
    honeypot: z.string().max(0).optional(),
  })
  // Billing PLZ validation
  .refine(
    (data) => {
      const pattern = plzPatterns[data.billing.country];
      return pattern ? pattern.test(data.billing.postcode) : true;
    },
    {
      message: "Postleitzahl passt nicht zum gewählten Land",
      path: ["billing", "postcode"],
    }
  )
  // Shipping PLZ validation (only if different shipping)
  .refine(
    (data) => {
      if (!data.different_shipping || !data.shipping) return true;
      const pattern = plzPatterns[data.shipping.country];
      return pattern ? pattern.test(data.shipping.postcode) : true;
    },
    {
      message: "Postleitzahl passt nicht zum gewählten Land",
      path: ["shipping", "postcode"],
    }
  )
  // Require shipping address when different_shipping is true
  .refine(
    (data) => {
      if (!data.different_shipping) return true;
      return !!data.shipping;
    },
    {
      message: "Bitte Lieferadresse eingeben",
      path: ["shipping"],
    }
  );

export type CheckoutInput = z.infer<typeof checkoutSchema>;

// Contact form schema
export const contactFormSchema = z.object({
  name: z.string().min(2, "Name ist zu kurz"),
  email: z.string().email("Ungültige E-Mail-Adresse"),
  subject: z.string().min(3, "Betreff ist zu kurz"),
  message: z.string().min(10, "Nachricht ist zu kurz").max(5000),
  honeypot: z.string().max(0).optional(),
});

export type ContactFormInput = z.infer<typeof contactFormSchema>;

// Sync request schema
export const syncRequestSchema = z.object({
  mode: z.enum(["full", "stock-only", "resume"]).default("full"),
  batchSize: z.number().int().min(1).max(10).default(5),
});

export type SyncRequestInput = z.infer<typeof syncRequestSchema>;
