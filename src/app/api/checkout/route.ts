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
      name: string;
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
        name: product.name || `Produkt #${item.product_id}`,
      });
    }

    // Calculate totals with server prices
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

    // Create Stripe PaymentIntent (embedded payment, no redirect)
    const stripe = getStripe();

    // Build description for Stripe
    const description = verifiedItems
      .map((item) => `${item.name} x${item.quantity}`)
      .join(", ");

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(total * 100),
      currency: "chf",
      automatic_payment_methods: { enabled: true },
      metadata: {
        wc_order_id: String(wcOrder.id),
      },
      description: description.slice(0, 500),
      receipt_email: billing.email,
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      orderId: wcOrder.id,
    });
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    const errStack = error instanceof Error ? error.stack : "";
    console.error("Checkout error:", errMsg, errStack);
    return NextResponse.json(
      { error: "Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.", debug: process.env.NODE_ENV === "development" ? errMsg : undefined },
      { status: 500 }
    );
  }
}
