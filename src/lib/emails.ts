import { Resend } from "resend";

let _resend: Resend | null = null;

function getResend(): Resend {
  if (!_resend) {
    const key = process.env.RESEND_API_KEY;
    if (!key) throw new Error("RESEND_API_KEY is not configured");
    _resend = new Resend(key);
  }
  return _resend;
}

function getFromEmail(): string {
  return process.env.RESEND_FROM_EMAIL || "noreply@fussmatt.com";
}

// ─── Order Confirmation Email (Customer) ─────────────────

interface OrderItem {
  name: string;
  quantity: number;
  total: string;
}

interface OrderEmailData {
  orderId: number;
  customerEmail: string;
  customerName: string;
  items: OrderItem[];
  subtotal: string;
  shippingTotal: string;
  total: string;
  billingAddress: {
    first_name: string;
    last_name: string;
    address_1: string;
    city: string;
    postcode: string;
    country: string;
  };
  shippingAddress?: {
    first_name: string;
    last_name: string;
    address_1: string;
    city: string;
    postcode: string;
    country: string;
  };
  paymentMethod: string;
}

export async function sendOrderConfirmationEmail(data: OrderEmailData): Promise<boolean> {
  try {
    const resend = getResend();
    const html = buildOrderConfirmationHtml(data);

    await resend.emails.send({
      from: `FussMatt <${getFromEmail()}>`,
      to: data.customerEmail,
      subject: `Bestellbestätigung #${data.orderId} – FussMatt`,
      html,
    });

    console.log(`Order confirmation email sent for order #${data.orderId} to ${data.customerEmail}`);
    return true;
  } catch (error) {
    console.error("Failed to send order confirmation email:", error);
    return false;
  }
}

// ─── Admin New Order Email ───────────────────────────────

export async function sendAdminNewOrderEmail(data: OrderEmailData): Promise<boolean> {
  try {
    const resend = getResend();
    const adminEmail = "info@fussmatt.com";

    const itemsList = data.items
      .map((item) => `• ${item.name} x${item.quantity} — CHF ${item.total}`)
      .join("\n");

    await resend.emails.send({
      from: `FussMatt <${getFromEmail()}>`,
      to: adminEmail,
      subject: `Neue Bestellung #${data.orderId} – CHF ${data.total}`,
      html: buildAdminOrderHtml(data),
    });

    console.log(`Admin new order email sent for order #${data.orderId}`);
    return true;
  } catch (error) {
    console.error("Failed to send admin new order email:", error);
    return false;
  }
}

// ─── Order Status Update Email (Customer) ────────────────

export async function sendOrderStatusEmail(
  orderId: number,
  customerEmail: string,
  customerName: string,
  newStatus: string,
  trackingUrl?: string
): Promise<boolean> {
  try {
    const resend = getResend();

    const statusTexts: Record<string, { subject: string; heading: string; message: string }> = {
      processing: {
        subject: `Bestellung #${orderId} wird bearbeitet`,
        heading: "Ihre Bestellung wird bearbeitet",
        message: "Vielen Dank für Ihre Bestellung! Wir bereiten Ihre Sendung vor und informieren Sie, sobald sie versandt wurde.",
      },
      completed: {
        subject: `Bestellung #${orderId} wurde versendet`,
        heading: "Ihre Bestellung wurde versendet!",
        message: trackingUrl
          ? "Ihre Bestellung ist auf dem Weg zu Ihnen. Verfolgen Sie Ihre Sendung über den untenstehenden Link."
          : "Ihre Bestellung ist auf dem Weg zu Ihnen. Sie sollte in den nächsten Tagen bei Ihnen eintreffen.",
      },
      refunded: {
        subject: `Rückerstattung für Bestellung #${orderId}`,
        heading: "Ihre Rückerstattung wurde veranlasst",
        message: "Wir haben die Rückerstattung für Ihre Bestellung veranlasst. Der Betrag wird innerhalb von 5-10 Werktagen auf Ihrem Konto gutgeschrieben.",
      },
      cancelled: {
        subject: `Bestellung #${orderId} wurde storniert`,
        heading: "Ihre Bestellung wurde storniert",
        message: "Ihre Bestellung wurde storniert. Falls Sie eine Rückerstattung erwarten, wird diese automatisch veranlasst.",
      },
    };

    const statusInfo = statusTexts[newStatus];
    if (!statusInfo) return false;

    const html = buildStatusEmailHtml(orderId, customerName, statusInfo.heading, statusInfo.message, trackingUrl);

    await resend.emails.send({
      from: `FussMatt <${getFromEmail()}>`,
      to: customerEmail,
      subject: `${statusInfo.subject} – FussMatt`,
      html,
    });

    console.log(`Status email (${newStatus}) sent for order #${orderId}`);
    return true;
  } catch (error) {
    console.error(`Failed to send status email (${newStatus}):`, error);
    return false;
  }
}

// ─── HTML Templates ──────────────────────────────────────

function buildOrderConfirmationHtml(data: OrderEmailData): string {
  const addr = data.shippingAddress || data.billingAddress;
  const itemsHtml = data.items
    .map(
      (item) => `
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;font-size:14px;color:#374151;">
          ${item.name} <span style="color:#9ca3af;">x${item.quantity}</span>
        </td>
        <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;font-size:14px;color:#374151;text-align:right;white-space:nowrap;">
          CHF ${item.total}
        </td>
      </tr>`
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="de">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:20px;">
    <!-- Header -->
    <div style="background:#1f2937;border-radius:16px 16px 0 0;padding:32px 24px;text-align:center;">
      <h1 style="color:#ffffff;font-size:24px;margin:0;">fussmatt</h1>
    </div>

    <!-- Content -->
    <div style="background:#ffffff;padding:32px 24px;border-radius:0 0 16px 16px;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
      <h2 style="color:#111827;font-size:20px;margin:0 0 8px;">Vielen Dank für Ihre Bestellung!</h2>
      <p style="color:#6b7280;font-size:14px;margin:0 0 24px;">
        Hallo ${data.customerName}, Ihre Bestellung <strong>#${data.orderId}</strong> wurde erfolgreich aufgegeben.
      </p>

      <!-- Order Items -->
      <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
        <tr>
          <th style="text-align:left;padding:8px 0;border-bottom:2px solid #e5e7eb;font-size:12px;text-transform:uppercase;color:#9ca3af;letter-spacing:0.05em;">Artikel</th>
          <th style="text-align:right;padding:8px 0;border-bottom:2px solid #e5e7eb;font-size:12px;text-transform:uppercase;color:#9ca3af;letter-spacing:0.05em;">Preis</th>
        </tr>
        ${itemsHtml}
      </table>

      <!-- Totals -->
      <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
        <tr>
          <td style="padding:6px 0;font-size:14px;color:#6b7280;">Zwischensumme</td>
          <td style="padding:6px 0;font-size:14px;color:#374151;text-align:right;">CHF ${data.subtotal}</td>
        </tr>
        <tr>
          <td style="padding:6px 0;font-size:14px;color:#6b7280;">Versand</td>
          <td style="padding:6px 0;font-size:14px;color:#374151;text-align:right;">${parseFloat(data.shippingTotal) === 0 ? '<span style="color:#059669;">Kostenlos</span>' : `CHF ${data.shippingTotal}`}</td>
        </tr>
        <tr>
          <td style="padding:12px 0 0;font-size:16px;font-weight:700;color:#111827;border-top:2px solid #e5e7eb;">Gesamt</td>
          <td style="padding:12px 0 0;font-size:16px;font-weight:700;color:#111827;text-align:right;border-top:2px solid #e5e7eb;">CHF ${data.total}</td>
        </tr>
      </table>

      <!-- Shipping Address -->
      <div style="background:#f9fafb;border-radius:12px;padding:16px;margin-bottom:24px;">
        <h3 style="font-size:13px;text-transform:uppercase;color:#9ca3af;letter-spacing:0.05em;margin:0 0 8px;">Lieferadresse</h3>
        <p style="font-size:14px;color:#374151;margin:0;line-height:1.6;">
          ${addr.first_name} ${addr.last_name}<br>
          ${addr.address_1}<br>
          ${addr.postcode} ${addr.city}<br>
          ${addr.country}
        </p>
      </div>

      <!-- CTA -->
      <div style="text-align:center;margin-top:24px;">
        <a href="https://fussmatt.com" style="display:inline-block;background:#f59e0b;color:#ffffff;font-weight:600;padding:14px 32px;border-radius:12px;text-decoration:none;font-size:14px;">
          Weiter einkaufen
        </a>
      </div>
    </div>

    <!-- Footer -->
    <div style="text-align:center;padding:24px;color:#9ca3af;font-size:12px;">
      <p style="margin:0 0 4px;">FussMatt – Premium Auto-Fussmatten</p>
      <p style="margin:0;">Royal Road GmbH, Dübendorfstrasse 4, 8051 Zürich</p>
      <p style="margin:8px 0 0;">
        <a href="https://fussmatt.com/kontakt" style="color:#f59e0b;text-decoration:none;">Kontakt</a> &middot;
        <a href="https://fussmatt.com/agb" style="color:#f59e0b;text-decoration:none;">AGB</a> &middot;
        <a href="https://fussmatt.com/datenschutz" style="color:#f59e0b;text-decoration:none;">Datenschutz</a>
      </p>
    </div>
  </div>
</body>
</html>`;
}

function buildAdminOrderHtml(data: OrderEmailData): string {
  const itemsHtml = data.items
    .map((item) => `<li>${item.name} x${item.quantity} — CHF ${item.total}</li>`)
    .join("");

  const addr = data.billingAddress;

  return `<!DOCTYPE html>
<html lang="de">
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:20px;">
    <div style="background:#1f2937;border-radius:16px 16px 0 0;padding:24px;text-align:center;">
      <h1 style="color:#f59e0b;font-size:20px;margin:0;">Neue Bestellung #${data.orderId}</h1>
    </div>
    <div style="background:#ffffff;padding:24px;border-radius:0 0 16px 16px;">
      <p style="font-size:14px;color:#374151;margin:0 0 16px;">
        <strong>${data.customerName}</strong> hat eine neue Bestellung aufgegeben.
      </p>
      <h3 style="font-size:14px;color:#6b7280;margin:0 0 8px;">Artikel:</h3>
      <ul style="font-size:14px;color:#374151;padding-left:20px;margin:0 0 16px;">${itemsHtml}</ul>
      <p style="font-size:16px;font-weight:700;color:#111827;margin:0 0 16px;">Gesamt: CHF ${data.total}</p>
      <div style="background:#f9fafb;border-radius:8px;padding:12px;">
        <p style="font-size:13px;color:#6b7280;margin:0 0 4px;">Kunde:</p>
        <p style="font-size:14px;color:#374151;margin:0;line-height:1.5;">
          ${addr.first_name} ${addr.last_name}<br>
          ${addr.address_1}, ${addr.postcode} ${addr.city}
        </p>
        <p style="font-size:14px;color:#374151;margin:4px 0 0;">${data.customerEmail}</p>
      </div>
      <div style="text-align:center;margin-top:20px;">
        <a href="https://wp.fussmatt.com/wp-admin/post.php?post=${data.orderId}&action=edit" style="display:inline-block;background:#f59e0b;color:#fff;font-weight:600;padding:12px 24px;border-radius:10px;text-decoration:none;font-size:14px;">
          Bestellung ansehen
        </a>
      </div>
    </div>
  </div>
</body>
</html>`;
}

function buildStatusEmailHtml(
  orderId: number,
  customerName: string,
  heading: string,
  message: string,
  trackingUrl?: string
): string {
  return `<!DOCTYPE html>
<html lang="de">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:20px;">
    <div style="background:#1f2937;border-radius:16px 16px 0 0;padding:32px 24px;text-align:center;">
      <h1 style="color:#ffffff;font-size:24px;margin:0;">fussmatt</h1>
    </div>
    <div style="background:#ffffff;padding:32px 24px;border-radius:0 0 16px 16px;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
      <h2 style="color:#111827;font-size:20px;margin:0 0 8px;">${heading}</h2>
      <p style="color:#6b7280;font-size:14px;margin:0 0 8px;">
        Bestellung <strong>#${orderId}</strong>
      </p>
      <p style="color:#374151;font-size:14px;line-height:1.6;margin:16px 0 24px;">
        Hallo ${customerName}, ${message}
      </p>
      ${
        trackingUrl
          ? `<div style="text-align:center;margin-bottom:24px;">
              <a href="${trackingUrl}" style="display:inline-block;background:#f59e0b;color:#fff;font-weight:600;padding:14px 32px;border-radius:12px;text-decoration:none;font-size:14px;">
                Sendung verfolgen
              </a>
            </div>`
          : ""
      }
      <div style="text-align:center;">
        <a href="https://fussmatt.com" style="color:#f59e0b;text-decoration:none;font-size:14px;">Weiter einkaufen</a>
      </div>
    </div>
    <div style="text-align:center;padding:24px;color:#9ca3af;font-size:12px;">
      <p style="margin:0;">FussMatt – Premium Auto-Fussmatten</p>
      <p style="margin:4px 0 0;">Royal Road GmbH, Dübendorfstrasse 4, 8051 Zürich</p>
    </div>
  </div>
</body>
</html>`;
}
