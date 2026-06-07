import { NextResponse } from "next/server";
import { z } from "zod";
import { rateLimit, rateLimitResponse } from "@/lib/rate-limit";

/**
 * POST /api/order-tracking
 *
 * Body: { orderId: string|number, email: string }
 *
 * Looks up the order via the WooCommerce REST API on wp.fussmatt.com and,
 * ONLY IF the billing email on the order matches the email submitted by
 * the customer, returns a minimal sanitized status payload. Mismatches
 * (or missing orders) return a generic 404 — never reveal which of the
 * two fields was wrong (enumeration defence).
 *
 * Rate limited: 10 requests / minute / IP (general bucket).
 */

const Body = z.object({
  orderId: z.union([z.string(), z.number()]).transform((v) => String(v).trim()),
  email: z.string().trim().toLowerCase().email("Ungültige E-Mail-Adresse"),
});

const STATUS_LABELS: Record<string, { label: string; tone: "info" | "ok" | "warn" | "err" }> = {
  pending:     { label: "Zahlung ausstehend",      tone: "warn" },
  "on-hold":   { label: "Zahlung in Prüfung",      tone: "warn" },
  processing:  { label: "In Bearbeitung",          tone: "info" },
  completed:   { label: "Versendet / Abgeschlossen", tone: "ok"   },
  cancelled:   { label: "Storniert",               tone: "err"  },
  refunded:    { label: "Erstattet",               tone: "err"  },
  failed:      { label: "Zahlung fehlgeschlagen",  tone: "err"  },
};

const GENERIC_NOT_FOUND = NextResponse.json(
  {
    error:
      "Bestellung nicht gefunden. Bitte prüfen Sie Bestellnummer und E-Mail-Adresse.",
  },
  { status: 404 }
);

export async function POST(req: Request) {
  // 1) Rate limit
  const rl = await rateLimit(req, "general");
  if (!rl.success) return rateLimitResponse(rl.reset);

  // 2) Validate body
  let payload: z.infer<typeof Body>;
  try {
    payload = Body.parse(await req.json());
  } catch (err) {
    const msg =
      err instanceof z.ZodError
        ? err.issues[0]?.message || "Ungültige Eingabe"
        : "Ungültige Anfrage";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  // 3) Strip "#" if customer pasted it; allow alphanumeric IDs as some
  // installs use composite order numbers
  const orderId = payload.orderId.replace(/^#/, "").trim();
  if (!/^\d+$/.test(orderId)) {
    return GENERIC_NOT_FOUND;
  }

  // 4) Auth + fetch (server-side; never expose keys to the client)
  const base = process.env.WC_STORE_URL || process.env.WORDPRESS_URL;
  const key = process.env.WC_CONSUMER_KEY;
  const secret = process.env.WC_CONSUMER_SECRET;
  if (!base || !key || !secret) {
    return NextResponse.json(
      { error: "Service vorübergehend nicht verfügbar." },
      { status: 503 }
    );
  }

  const auth = Buffer.from(`${key}:${secret}`).toString("base64");
  let order: Record<string, unknown> | null = null;
  try {
    const res = await fetch(`${base}/wp-json/wc/v3/orders/${orderId}`, {
      headers: { Authorization: `Basic ${auth}` },
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });
    if (res.status === 404 || res.status === 401) {
      return GENERIC_NOT_FOUND;
    }
    if (!res.ok) {
      return NextResponse.json(
        { error: "Bestellstatus konnte nicht abgerufen werden." },
        { status: 502 }
      );
    }
    order = (await res.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json(
      { error: "Bestellstatus konnte nicht abgerufen werden." },
      { status: 502 }
    );
  }

  // 5) Email match (anti-enumeration)
  const billing = (order.billing ?? {}) as Record<string, unknown>;
  const billingEmail = String(billing.email ?? "").trim().toLowerCase();
  if (!billingEmail || billingEmail !== payload.email) {
    return GENERIC_NOT_FOUND;
  }

  // 6) Sanitized response
  const status = String(order.status ?? "");
  const lineItems = Array.isArray(order.line_items) ? order.line_items : [];
  const shipping = (order.shipping ?? {}) as Record<string, string>;

  return NextResponse.json({
    id: order.id,
    number: order.number ?? order.id,
    dateCreated: order.date_created,
    status,
    statusLabel: STATUS_LABELS[status]?.label ?? status,
    statusTone: STATUS_LABELS[status]?.tone ?? "info",
    total: order.total,
    currency: order.currency ?? "CHF",
    itemCount: lineItems.reduce(
      (sum: number, it: Record<string, unknown>) =>
        sum + Number(it.quantity ?? 0),
      0
    ),
    items: lineItems.map((it: Record<string, unknown>) => ({
      name: it.name,
      quantity: it.quantity,
      total: it.total,
    })),
    shipping: {
      firstName: shipping.first_name ?? "",
      lastName: shipping.last_name ?? "",
      city: shipping.city ?? "",
      postcode: shipping.postcode ?? "",
      country: shipping.country ?? "",
    },
  });
}
