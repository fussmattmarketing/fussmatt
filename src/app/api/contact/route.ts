import { NextResponse } from "next/server";
import { contactFormSchema } from "@/lib/validations";
import { rateLimit, rateLimitResponse } from "@/lib/rate-limit";

export async function POST(request: Request) {
  // Rate limit
  const rl = await rateLimit(request, "general");
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

    // Validate with Zod
    const parsed = contactFormSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Bitte füllen Sie alle Pflichtfelder korrekt aus.", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { name, email, subject, message } = parsed.data;

    // Send via WooCommerce / WordPress REST API (wp-json/wp/v2/comments or custom endpoint)
    // For now: log + return success. In production, integrate with email service.
    console.log("Contact form submission:", { name, email, subject, messageLength: message.length });

    // Option A: Send via WordPress REST API as a note
    const wpUrl = process.env.WORDPRESS_URL;
    if (wpUrl) {
      try {
        const wpUser = process.env.WP_APPLICATION_USER;
        const wpPass = process.env.WP_APPLICATION_PASSWORD;
        if (wpUser && wpPass) {
          await fetch(`${wpUrl}/wp-json/wp/v2/comments`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Basic ${Buffer.from(`${wpUser}:${wpPass}`).toString("base64")}`,
            },
            body: JSON.stringify({
              post: 1, // Attach to a dummy post or a "Contact" page
              author_name: name,
              author_email: email,
              content: `[Kontaktformular] Betreff: ${subject}\n\n${message}`,
              status: "hold", // Don't publish, keep as pending
            }),
          });
        }
      } catch (error) {
        console.error("Failed to save contact form to WP:", error);
        // Don't fail the request — still return success to user
      }
    }

    return NextResponse.json({
      success: true,
      message: "Vielen Dank für Ihre Nachricht. Wir melden uns in Kürze bei Ihnen.",
    });
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      { error: "Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut." },
      { status: 500 }
    );
  }
}
