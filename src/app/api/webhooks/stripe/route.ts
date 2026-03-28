import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { updateOrder } from "@/lib/woocommerce";

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
      case "checkout.session.completed": {
        const session = event.data.object;
        const wcOrderId = session.metadata?.wc_order_id;

        if (wcOrderId) {
          await updateOrder(parseInt(wcOrderId), {
            status: "processing",
            set_paid: true,
            transaction_id: session.payment_intent,
          });
          console.log(`Order ${wcOrderId} marked as paid (Stripe session: ${session.id})`);
        }
        break;
      }

      case "checkout.session.expired": {
        const session = event.data.object;
        const wcOrderId = session.metadata?.wc_order_id;

        if (wcOrderId) {
          await updateOrder(parseInt(wcOrderId), {
            status: "cancelled",
          });
          console.log(`Order ${wcOrderId} cancelled (session expired)`);
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
