import { NextResponse } from "next/server";
import { contactFormSchema } from "@/lib/validations";
import { rateLimit, rateLimitResponse } from "@/lib/rate-limit";
import { sendContactFormNotification } from "@/lib/emails";

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

    console.log("Contact form submission:", { name, email, subject, messageLength: message.length });

    // Primary: send via Resend to info@fussmatt.com (reply-to = customer)
    const emailSent = await sendContactFormNotification({ name, email, subject, message });
    if (!emailSent) {
      console.error("Contact form: Resend notification failed for", email);
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
