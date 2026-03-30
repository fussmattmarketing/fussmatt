import { NextResponse } from "next/server";
import { z } from "zod";
import { rateLimit, rateLimitResponse } from "@/lib/rate-limit";
import { subscribeToStock, getSubscriberCount } from "@/lib/stock-notify";

const subscribeSchema = z.object({
  email: z.string().email("Ungültige E-Mail-Adresse"),
  sku: z.string().min(1, "SKU erforderlich"),
  productName: z.string().min(1).max(200),
});

export async function POST(request: Request) {
  // Rate limit: 5 subscriptions per minute per IP
  const rl = await rateLimit(request, "general");
  if (!rl.success) return rateLimitResponse(rl.reset);

  try {
    const body = await request.json();
    const parsed = subscribeSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message || "Ungültige Eingabe" },
        { status: 400 }
      );
    }

    const { email, sku, productName } = parsed.data;

    // Check subscriber limit per product (prevent abuse)
    const count = await getSubscriberCount(sku);
    if (count >= 500) {
      return NextResponse.json(
        { error: "Maximale Anzahl an Benachrichtigungen für dieses Produkt erreicht." },
        { status: 429 }
      );
    }

    await subscribeToStock(sku, email);

    console.log(`Stock notify subscription: ${email} → ${sku} (${productName})`);

    return NextResponse.json({
      success: true,
      message: "Sie werden benachrichtigt, sobald das Produkt wieder verfügbar ist.",
    });
  } catch (error) {
    console.error("Stock notify error:", error);
    return NextResponse.json(
      { error: "Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut." },
      { status: 500 }
    );
  }
}
