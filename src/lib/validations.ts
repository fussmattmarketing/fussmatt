import { z } from "zod";

// Supported countries
export const SUPPORTED_COUNTRIES = ["CH", "DE", "AT", "FR", "IT", "NL"] as const;
export type SupportedCountry = (typeof SUPPORTED_COUNTRIES)[number];

// PLZ validation per country
const plzPatterns: Record<SupportedCountry, RegExp> = {
  CH: /^\d{4}$/,
  DE: /^\d{5}$/,
  AT: /^\d{4}$/,
  FR: /^\d{5}$/,
  IT: /^\d{5}$/,
  NL: /^\d{4}\s?[A-Z]{2}$/i,
};

// Address schema (shared between checkout and contact)
export const addressSchema = z.object({
  first_name: z.string().min(2, "Vorname ist zu kurz"),
  last_name: z.string().min(2, "Nachname ist zu kurz"),
  company: z.string().optional().default(""),
  address_1: z.string().min(5, "Bitte vollständige Adresse eingeben"),
  address_2: z.string().optional().default(""),
  city: z.string().min(2, "Bitte Stadt eingeben"),
  postcode: z.string().min(4, "Ungültige Postleitzahl"),
  country: z.enum(SUPPORTED_COUNTRIES, {
    errorMap: () => ({ message: "Bitte Land auswählen" }),
  }),
  email: z.string().email("Ungültige E-Mail-Adresse"),
  phone: z.string().optional().default(""),
});

// Checkout schema with PLZ cross-validation
export const checkoutSchema = z
  .object({
    billing: addressSchema,
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
  .refine(
    (data) => {
      const pattern = plzPatterns[data.billing.country];
      return pattern ? pattern.test(data.billing.postcode) : true;
    },
    {
      message: "Postleitzahl passt nicht zum gewählten Land",
      path: ["billing", "postcode"],
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
