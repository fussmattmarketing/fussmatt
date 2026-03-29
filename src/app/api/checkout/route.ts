import { NextResponse } from "next/server";
import { checkoutSchema } from "@/lib/validations";
import { getProductById } from "@/lib/woocommerce";
import { createOrder } from "@/lib/woocommerce";
import { getStripe } from "@/lib/stripe";
import { calculateShipping } from "@/lib/shipping";
import { rateLimit, rateLimitResponse } from "@/lib/rate-limit";
import type { SupportedCountry } from "@/lib/validations";

export async function POST(request: Request) {
  // Rate limit
  const rl = await rateLimit(request, "checkout");
  if (!rl.success) return rateLimitResponse(rl.reset);

  try {
    const body = await request.json();

    // CSRF honeypot check
    if (body.honeypot) {
      return NextResponse.json(
        { error: "Ungültige Anfrage." },
        { status: 400 }
      );
    }

    // Validate input with Zod
    const parsed = checkoutSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validierungsfehler.", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { billing, shipping: shippingAddr, different_shipping, line_items, agb_accepted } = parsed.data;

    if (!agb_accepted) {
      return NextResponse.json(
        { error: "Bitte akzeptieren Sie die AGB." },
        { status: 400 }
      );
    }

    // Determine shipping address: separate or same as billing
    const effectiveShipping = different_shipping && shippingAddr
      ? shippingAddr
      : {
          first_name: billing.first_name,
          last_name: billing.last_name,
          company: billing.company || "",
          address_1: billing.address_1,
          address_2: billing.address_2 || "",
          city: billing.city,
          state: billing.state || "",
          postcode: billing.postcode,
          country: billing.country,
        };

    // SERVER-SIDE PRICE VALIDATION — fetch real prices from WC
    const verifiedItems: {
      product_id: number;
      variation_id: number;
      quantity: number;
      serverPrice: number;
    }[] = [];

    for (const item of line_items) {
      const product = await getProductById(item.product_id);
      const serverPrice = parseFloat(product.price);

      if (isNaN(serverPrice) || serverPrice <= 0) {
        return NextResponse.json(
          { error: "Ein Produkt ist derzeit nicht verfügbar." },
          { status: 400 }
        );
      }

      // Allow small rounding differences (< 0.02)
      if (Math.abs(serverPrice - item.price) > 0.02) {
        return NextResponse.json(
          {
            error:
              "Die Preise haben sich geändert. Bitte aktualisieren Sie Ihren Warenkorb.",
          },
          { status: 400 }
        );
      }

      verifiedItems.push({
        product_id: item.product_id,
        variation_id: item.variation_id,
        quantity: item.quantity,
        serverPrice,
      });
    }

    // Calculate totals with server prices
    // Shipping is based on the shipping destination country
    const shippingCountry = (effectiveShipping.country || billing.country) as SupportedCountry;
    const subtotal = verifiedItems.reduce(
      (sum, item) => sum + item.serverPrice * item.quantity,
      0
    );
    const shipping = calculateShipping(shippingCountry, subtotal);
    const total = subtotal + shipping.cost;

    // Create WooCommerce order (set_paid: false — paid after Stripe)
    const orderData = {
      payment_method: "stripe",
      payment_method_title: "Stripe (Karte / TWINT)",
      set_paid: false,
      currency: "CHF",
      billing: {
        first_name: billing.first_name,
        last_name: billing.last_name,
        company: billing.company || "",
        address_1: billing.address_1,
        address_2: billing.address_2 || "",
        city: billing.city,
        state: billing.state || "",
        postcode: billing.postcode,
        country: billing.country,
        email: billing.email,
        phone: billing.phone,
      },
      shipping: {
        first_name: effectiveShipping.first_name,
        last_name: effectiveShipping.last_name,
        company: effectiveShipping.company || "",
        address_1: effectiveShipping.address_1,
        address_2: effectiveShipping.address_2 || "",
        city: effectiveShipping.city,
        state: effectiveShipping.state || "",
        postcode: effectiveShipping.postcode,
        country: effectiveShipping.country,
      },
      line_items: verifiedItems.map((item) => ({
        product_id: item.product_id,
        variation_id: item.variation_id || undefined,
        quantity: item.quantity,
      })),
      shipping_lines: shipping.cost > 0
        ? [{ method_id: "flat_rate", method_title: "Versand", total: shipping.cost.toFixed(2) }]
        : [],
    };

    const wcOrder = (await createOrder(orderData)) as { id: number };

    // Create Stripe Checkout Session
    const stripe = getStripe();
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://fussmatt.com";

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card", "twint"],
      mode: "payment",
      currency: "chf",
      customer_email: billing.email,
      line_items: verifiedItems.map((item) => ({
        price_data: {
          currency: "chf",
          product_data: {
            name: `Produkt #${item.product_id}`,
          },
          unit_amount: Math.round(item.serverPrice * 100),
        },
        quantity: item.quantity,
      })),
      ...(shipping.cost > 0
        ? {
            shipping_options: [
              {
                shipping_rate_data: {
                  type: "fixed_amount" as const,
                  fixed_amount: {
                    amount: Math.round(shipping.cost * 100),
                    currency: "chf",
                  },
                  display_name: "Standardversand",
                },
              },
            ],
          }
        : {}),
      metadata: {
        wc_order_id: String(wcOrder.id),
      },
      success_url: `${siteUrl}/bestellung-bestaetigung?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/warenkorb`,
    });

    return NextResponse.json({ sessionUrl: session.url });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: "Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut." },
      { status: 500 }
    );
  }
}
