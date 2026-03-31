import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { updateOrder } from "@/lib/woocommerce";
import { sendOrderConfirmationEmail, sendAdminNewOrderEmail } from "@/lib/emails";

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 }
    );
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET is not configured");
    return NextResponse.json(
      { error: "Server configuration error" },
      { status: 503 }
    );
  }

  try {
    const stripe = getStripe();
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);

    switch (event.type) {
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object;
        const wcOrderId = paymentIntent.metadata?.wc_order_id;

        if (wcOrderId) {
          // 1. Update WC order status
          const updatedOrder = await updateOrder(parseInt(wcOrderId), {
            status: "processing",
            set_paid: true,
            transaction_id: paymentIntent.id,
          });
          console.log(`Order ${wcOrderId} marked as paid (PaymentIntent: ${paymentIntent.id})`);

          // 2. Send confirmation emails (non-blocking)
          try {
            const order = updatedOrder as Record<string, unknown>;
            const billing = order.billing as Record<string, string>;
            const shipping = order.shipping as Record<string, string>;
            const lineItems = (order.line_items as Array<Record<string, unknown>>) || [];

            const emailData = {
              orderId: parseInt(wcOrderId),
              customerEmail: billing?.email || paymentIntent.receipt_email || "",
              customerName: `${billing?.first_name || ""} ${billing?.last_name || ""}`.trim(),
              items: lineItems.map((item) => ({
                name: String(item.name || ""),
                quantity: Number(item.quantity || 1),
                total: String(item.total || "0"),
              })),
              subtotal: String(order.total || "0"),
              shippingTotal: String((order as Record<string, unknown>).shipping_total || "0"),
              total: String(order.total || "0"),
              billingAddress: {
                first_name: billing?.first_name || "",
                last_name: billing?.last_name || "",
                address_1: billing?.address_1 || "",
                city: billing?.city || "",
                postcode: billing?.postcode || "",
                country: billing?.country || "",
              },
              shippingAddress: shipping?.address_1
                ? {
                    first_name: shipping.first_name || "",
                    last_name: shipping.last_name || "",
                    address_1: shipping.address_1 || "",
                    city: shipping.city || "",
                    postcode: shipping.postcode || "",
                    country: shipping.country || "",
                  }
                : undefined,
              paymentMethod: "Stripe",
            };

            // Send both emails concurrently
            await Promise.allSettled([
              sendOrderConfirmationEmail(emailData),
              sendAdminNewOrderEmail(emailData),
            ]);
          } catch (emailError) {
            // Don't fail the webhook if email sending fails
            console.error("Email sending error (non-critical):", emailError);
          }
        }
        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object;
        const wcOrderId = paymentIntent.metadata?.wc_order_id;

        if (wcOrderId) {
          console.log(`Payment failed for order ${wcOrderId} (PaymentIntent: ${paymentIntent.id})`);
          // Don't cancel immediately — user might retry
        }
        break;
      }

      default:
        console.log(`Unhandled Stripe event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Stripe webhook error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 400 }
    );
  }
}
