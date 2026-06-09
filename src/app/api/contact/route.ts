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

    // Honeypot — only treat NON-whitespace content as a bot signal.
    // Some password managers / browser autofill drop whitespace into
    // hidden fields, which used to false-positive legitimate users.
    if (
      typeof body.honeypot === "string" &&
      body.honeypot.trim().length > 0
    ) {
      return NextResponse.json(
        { error: "Ungültige Anfrage." },
        { status: 400 }
      );
    }

    // Validate with Zod
    const parsed = contactFormSchema.safeParse(body);
    if (!parsed.success) {
      // Surface the first specific message so the user sees what's
      // actually wrong instead of the generic
      // "Bitte füllen Sie alle Pflichtfelder korrekt aus." line.
      const firstIssue = parsed.error.issues[0];
      const specific =
        firstIssue?.message ||
        "Bitte überprüfen Sie Ihre Angaben.";
      return NextResponse.json(
        {
          error: specific,
          details: parsed.error.flatten(),
        },
        { status: 400 }
      );
    }

    const { name, email, subject, message } = parsed.data;

    console.log("Contact form submission:", {
      name,
      email,
      subject,
      messageLength: message.length,
    });

    // Primary: send via Resend to info@fussmatt.com (reply-to = customer).
    // CEO-7 (2026-06-09): previously this endpoint returned 200 success
    // even when the underlying email send failed silently — so the
    // user saw "Vielen Dank für Ihre Nachricht" but nothing reached
    // info@fussmatt.com. Now we surface the real outcome: failure
    // returns 500 with a debugId the user can quote when calling.
    let emailSent = false;
    let emailError: string | null = null;
    try {
      emailSent = await sendContactFormNotification({
        name,
        email,
        subject,
        message,
      });
    } catch (sendErr) {
      emailError =
        sendErr instanceof Error ? sendErr.message : String(sendErr);
      console.error("Contact form: send threw", emailError);
    }

    if (!emailSent) {
      console.error(
        "Contact form: Resend notification did NOT send",
        { email, subject, emailError }
      );
      return NextResponse.json(
        {
          error:
            "Ihre Nachricht konnte aktuell nicht zugestellt werden. Bitte schreiben Sie uns direkt an info@fussmatt.com oder rufen Sie +41 44 505 27 22 an.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message:
        "Vielen Dank für Ihre Nachricht. Wir melden uns in Kürze bei Ihnen.",
    });
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      {
        error:
          "Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.",
      },
      { status: 500 }
    );
  }
}
