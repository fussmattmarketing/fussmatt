import { NextResponse } from "next/server";

// Rate limit configurations per endpoint type
const RATE_LIMITS = {
  checkout: { tokens: 5, window: "1m" },
  sync: { tokens: 2, window: "1m" },
  import: { tokens: 2, window: "1m" },
  general: { tokens: 10, window: "1m" },
} as const;

type RateLimitType = keyof typeof RATE_LIMITS;

interface RateLimitResult {
  success: boolean;
  remaining: number;
  reset: number;
}

// In-memory fallback when Upstash is not configured
const memoryStore = new Map<string, { count: number; resetAt: number }>();

async function checkRateLimitMemory(
  identifier: string,
  limit: { tokens: number; window: string }
): Promise<RateLimitResult> {
  const windowMs = 60_000; // 1 minute
  const now = Date.now();
  const entry = memoryStore.get(identifier);

  if (!entry || now > entry.resetAt) {
    memoryStore.set(identifier, { count: 1, resetAt: now + windowMs });
    return { success: true, remaining: limit.tokens - 1, reset: now + windowMs };
  }

  entry.count++;
  if (entry.count > limit.tokens) {
    return { success: false, remaining: 0, reset: entry.resetAt };
  }

  return {
    success: true,
    remaining: limit.tokens - entry.count,
    reset: entry.resetAt,
  };
}

async function checkRateLimitUpstash(
  identifier: string,
  limit: { tokens: number; window: string }
): Promise<RateLimitResult> {
  try {
    const { Ratelimit } = await import("@upstash/ratelimit");
    const { Redis } = await import("@upstash/redis");

    const redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    });

    const ratelimit = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(
        limit.tokens,
        limit.window as `${number}${"s" | "m" | "h" | "d"}`
      ),
    });

    const result = await ratelimit.limit(identifier);
    return {
      success: result.success,
      remaining: result.remaining,
      reset: result.reset,
    };
  } catch {
    // Fallback to memory if Upstash fails
    return checkRateLimitMemory(identifier, limit);
  }
}

export async function rateLimit(
  request: Request,
  type: RateLimitType = "general"
): Promise<RateLimitResult> {
  const limit = RATE_LIMITS[type];
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "anonymous";
  const identifier = `${type}:${ip}`;

  const hasUpstash =
    process.env.UPSTASH_REDIS_REST_URL &&
    process.env.UPSTASH_REDIS_REST_TOKEN;

  if (hasUpstash) {
    return checkRateLimitUpstash(identifier, limit);
  }

  return checkRateLimitMemory(identifier, limit);
}

export function rateLimitResponse(reset: number): NextResponse {
  const retryAfter = Math.ceil((reset - Date.now()) / 1000);
  return NextResponse.json(
    { error: "Zu viele Anfragen. Bitte versuchen Sie es später erneut." },
    {
      status: 429,
      headers: { "Retry-After": String(Math.max(retryAfter, 1)) },
    }
  );
}
