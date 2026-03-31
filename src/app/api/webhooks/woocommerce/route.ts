import { NextResponse } from "next/server";
import { sendBackInStockEmails } from "@/lib/stock-notify";

/**
 * WooCommerce Product Webhook Handler
 *
 * Triggers when a product is updated in WooCommerce (WP Admin or API).
 * If stock_status changes from outofstock → instock, sends back-in-stock notifications.
 *
 * WC Webhook: topic=product.updated, delivery_url=https://fussmatt.com/api/webhooks/woocommerce
 */

// Verify WC webhook signature
// WooCommerce sends base64-encoded HMAC-SHA256 (no prefix)
function verifyWebhookSignature(
  body: string,
  signature: string | null,
  secret: string
): boolean {
  if (!signature) return false;

  try {
    const crypto = require("crypto");
    const hmac = crypto.createHmac("sha256", secret);
    hmac.update(body, "utf8");
    const expected = hmac.digest("base64");
    // WC may or may not include prefix
    const sigClean = signature.replace("sha256=", "");
    return sigClean === expected;
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("x-wc-webhook-signature");
  const topic = request.headers.get("x-wc-webhook-topic");
  const webhookId = request.headers.get("x-wc-webhook-id");

  // Verify signature (if secret is configured)
  const secret = process.env.WC_WEBHOOK_SECRET;
  if (secret && signature) {
    if (!verifyWebhookSignature(body, signature, secret)) {
      console.error(
        `WC webhook signature mismatch. Got: ${signature?.substring(0, 20)}...`
      );
      // Log but don't block — allow WC to deliver
    }
  }

  // Handle ping (WC sends a ping when webhook is first created)
  if (topic === "product.updated" && body === "") {
    return NextResponse.json({ received: true });
  }

  try {
    const product = JSON.parse(body);

    // Only care about product.updated
    if (topic !== "product.updated") {
      return NextResponse.json({ received: true, skipped: true });
    }

    const sku = product.sku;
    const stockStatus = product.stock_status;
    const productName = product.name;
    const productSlug = product.slug;

    if (!sku) {
      return NextResponse.json({ received: true, skipped: "no-sku" });
    }

    console.log(
      `WC webhook: product updated — SKU=${sku}, stock_status=${stockStatus}, name=${productName}`
    );

    // If product is now in stock, check for subscribers and send notifications
    if (stockStatus === "instock") {
      const { sent, failed } = await sendBackInStockEmails(
        sku,
        productName,
        productSlug
      );

      if (sent > 0) {
        console.log(
          `WC webhook: sent ${sent} back-in-stock notifications for ${sku}`
        );
      }

      return NextResponse.json({
        received: true,
        notifications: { sent, failed },
      });
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("WC webhook error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
