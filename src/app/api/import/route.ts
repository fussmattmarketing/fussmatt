import { NextResponse } from "next/server";
import { rateLimit, rateLimitResponse } from "@/lib/rate-limit";

function validateImportAuth(request: Request): boolean {
  const syncKey = process.env.SYNC_SECRET_KEY;
  if (!syncKey) return false;

  const authHeader = request.headers.get("authorization");
  if (!authHeader) return false;

  return authHeader === `Bearer ${syncKey}`;
}

export async function POST(request: Request) {
  // Rate limit
  const rl = await rateLimit(request, "import");
  if (!rl.success) return rateLimitResponse(rl.reset);

  // Auth check — no fallback
  if (!validateImportAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    if (!file.name.endsWith(".csv")) {
      return NextResponse.json(
        { error: "Only CSV files are accepted" },
        { status: 400 }
      );
    }

    const csvText = await file.text();

    // CSV parsing will be implemented with the csv-parse library
    // For now, return the file info
    const lineCount = csvText.split("\n").filter((l) => l.trim()).length;

    return NextResponse.json({
      message: "CSV received",
      filename: file.name,
      lines: lineCount,
      status: "pending_implementation",
    });
  } catch (error) {
    console.error("Import error:", error);
    return NextResponse.json(
      { error: "Import failed. Check server logs." },
      { status: 500 }
    );
  }
}
