/**
 * Back-in-Stock Notification System
 *
 * Uses Upstash Redis to store email subscriptions per product SKU.
 * When stock sync detects outofstock → instock change, emails are sent via Resend.
 *
 * Redis key format: notify:{sku} → Set of email addresses
 */

import { Resend } from "resend";

// ─── Redis Helpers ──────────────────────────────────────

async function getRedis() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) throw new Error("Upstash Redis not configured");

  const { Redis } = await import("@upstash/redis");
  return new Redis({ url, token });
}

function notifyKey(sku: string): string {
  return `notify:${sku}`;
}

// ─── Subscribe / Unsubscribe ────────────────────────────

export async function subscribeToStock(
  sku: string,
  email: string
): Promise<void> {
  const redis = await getRedis();
  await redis.sadd(notifyKey(sku), email.toLowerCase().trim());
  // Auto-expire after 6 months (subscribers don't wait forever)
  await redis.expire(notifyKey(sku), 60 * 60 * 24 * 180);
}

export async function getSubscribers(sku: string): Promise<string[]> {
  const redis = await getRedis();
  return (await redis.smembers(notifyKey(sku))) as string[];
}

export async function clearSubscribers(sku: string): Promise<void> {
  const redis = await getRedis();
  await redis.del(notifyKey(sku));
}

export async function getSubscriberCount(sku: string): Promise<number> {
  const redis = await getRedis();
  return await redis.scard(notifyKey(sku));
}

// ─── Send Notifications ─────────────────────────────────

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://fussmatt.com";
const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || "FussMatt";

export async function sendBackInStockEmails(
  sku: string,
  productName: string,
  productSlug: string
): Promise<{ sent: number; failed: number }> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("RESEND_API_KEY not configured — skipping notifications");
    return { sent: 0, failed: 0 };
  }

  const subscribers = await getSubscribers(sku);
  if (subscribers.length === 0) return { sent: 0, failed: 0 };

  const resend = new Resend(apiKey);
  const fromEmail = process.env.RESEND_FROM_EMAIL || "noreply@fussmatt.com";
  const productUrl = `${SITE_URL}/produkt/${productSlug}`;

  let sent = 0;
  let failed = 0;

  // Send in batches of 10
  const batchSize = 10;
  for (let i = 0; i < subscribers.length; i += batchSize) {
    const batch = subscribers.slice(i, i + batchSize);

    const results = await Promise.allSettled(
      batch.map((email) =>
        resend.emails.send({
          from: `${SITE_NAME} <${fromEmail}>`,
          to: email,
          subject: `Wieder verfügbar: ${productName}`,
          html: buildEmailHtml(productName, productUrl),
        })
      )
    );

    for (const r of results) {
      if (r.status === "fulfilled" && r.value.data) sent++;
      else failed++;
    }
  }

  // Clear subscribers after sending
  if (sent > 0) {
    await clearSubscribers(sku);
  }

  console.log(
    `Stock notify [${sku}]: sent=${sent}, failed=${failed}, total=${subscribers.length}`
  );

  return { sent, failed };
}

// ─── Email Template ─────────────────────────────────────

function buildEmailHtml(productName: string, productUrl: string): string {
  return `
<!DOCTYPE html>
<html lang="de">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;">
        <!-- Header -->
        <tr><td style="background:#0a0a0a;padding:24px 32px;text-align:center;">
          <span style="color:#f59e0b;font-size:24px;font-weight:700;letter-spacing:-0.5px;">${SITE_NAME}</span>
        </td></tr>
        <!-- Body -->
        <tr><td style="padding:40px 32px;">
          <h1 style="margin:0 0 16px;font-size:22px;color:#111;">Gute Neuigkeiten! 🎉</h1>
          <p style="margin:0 0 24px;font-size:16px;color:#444;line-height:1.6;">
            Das Produkt, auf das Sie gewartet haben, ist wieder verfügbar:
          </p>
          <div style="background:#fef3c7;border-left:4px solid #f59e0b;padding:16px 20px;border-radius:0 8px 8px 0;margin:0 0 32px;">
            <p style="margin:0;font-size:16px;font-weight:600;color:#111;">${productName}</p>
          </div>
          <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto;">
            <tr><td style="background:#f59e0b;border-radius:12px;">
              <a href="${productUrl}" style="display:inline-block;padding:14px 32px;color:#ffffff;font-size:16px;font-weight:600;text-decoration:none;">
                Jetzt bestellen
              </a>
            </td></tr>
          </table>
          <p style="margin:32px 0 0;font-size:13px;color:#999;line-height:1.5;">
            Sie erhalten diese E-Mail, weil Sie eine Benachrichtigung für dieses Produkt angefordert haben.
            Diese Benachrichtigung wird nicht wiederholt.
          </p>
        </td></tr>
        <!-- Footer -->
        <tr><td style="background:#f9fafb;padding:20px 32px;text-align:center;border-top:1px solid #e5e7eb;">
          <p style="margin:0;font-size:12px;color:#9ca3af;">
            &copy; ${new Date().getFullYear()} ${SITE_NAME} &middot; Royal Road GmbH, Zürich
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`.trim();
}
