import { NextResponse } from "next/server";
import { syncRequestSchema } from "@/lib/validations";
import { rateLimit, rateLimitResponse } from "@/lib/rate-limit";
import { acquireLock, releaseLock, isLocked, runSync } from "@/lib/sync";

function validateSyncAuth(request: Request): boolean {
  const syncKey = process.env.SYNC_SECRET_KEY;
  if (!syncKey) return false;

  const authHeader = request.headers.get("authorization");
  if (!authHeader) return false;

  return authHeader === `Bearer ${syncKey}`;
}

export async function GET(request: Request) {
  if (!validateSyncAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({
    locked: isLocked(),
    status: "ready",
  });
}

export async function POST(request: Request) {
  // Rate limit
  const rl = await rateLimit(request, "sync");
  if (!rl.success) return rateLimitResponse(rl.reset);

  // Auth check
  if (!validateSyncAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Parse options
  const body = await request.json().catch(() => ({}));
  const parsed = syncRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  // Acquire lock — prevent concurrent syncs
  if (!acquireLock()) {
    return NextResponse.json(
      { error: "Sync already in progress. Try again later." },
      { status: 409 }
    );
  }

  try {
    const result = await runSync({
      batchSize: parsed.data.batchSize,
      mode: parsed.data.mode,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Sync error:", error);
    return NextResponse.json(
      { error: "Sync failed. Check server logs." },
      { status: 500 }
    );
  } finally {
    releaseLock();
  }
}
