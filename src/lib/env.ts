import { z } from "zod";

const serverSchema = z.object({
  WORDPRESS_URL: z.string().url(),
  WC_CONSUMER_KEY: z.string().min(1),
  WC_CONSUMER_SECRET: z.string().min(1),
  WP_APPLICATION_USER: z.string().min(1),
  WP_APPLICATION_PASSWORD: z.string().min(1),
  STRIPE_SECRET_KEY: z.string().min(1),
  STRIPE_WEBHOOK_SECRET: z.string().min(1),
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().min(1).optional(),
  SENTRY_DSN: z.string().optional(),
  SENTRY_AUTH_TOKEN: z.string().optional(),
  B2B_FEED_URL: z.string().url().optional(),
  SYNC_SECRET_KEY: z.string().min(32).optional(),
});

const clientSchema = z.object({
  NEXT_PUBLIC_WORDPRESS_URL: z.string().url(),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().min(1),
  NEXT_PUBLIC_SITE_URL: z.string().url(),
  NEXT_PUBLIC_SITE_NAME: z.string().min(1),
  NEXT_PUBLIC_GTM_ID: z.string().optional(),
});

function validateEnv() {
  // Client vars are always available
  const clientResult = clientSchema.safeParse({
    NEXT_PUBLIC_WORDPRESS_URL: process.env.NEXT_PUBLIC_WORDPRESS_URL,
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_SITE_NAME: process.env.NEXT_PUBLIC_SITE_NAME,
    NEXT_PUBLIC_GTM_ID: process.env.NEXT_PUBLIC_GTM_ID,
  });

  if (!clientResult.success) {
    console.error(
      "Missing client environment variables:",
      clientResult.error.flatten().fieldErrors
    );
    throw new Error("Missing required client environment variables");
  }

  // Server vars only available on server
  if (typeof window === "undefined") {
    const serverResult = serverSchema.safeParse({
      WORDPRESS_URL: process.env.WORDPRESS_URL,
      WC_CONSUMER_KEY: process.env.WC_CONSUMER_KEY,
      WC_CONSUMER_SECRET: process.env.WC_CONSUMER_SECRET,
      WP_APPLICATION_USER: process.env.WP_APPLICATION_USER,
      WP_APPLICATION_PASSWORD: process.env.WP_APPLICATION_PASSWORD,
      STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
      STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
      UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
      UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,
      SENTRY_DSN: process.env.SENTRY_DSN,
      SENTRY_AUTH_TOKEN: process.env.SENTRY_AUTH_TOKEN,
      B2B_FEED_URL: process.env.B2B_FEED_URL,
      SYNC_SECRET_KEY: process.env.SYNC_SECRET_KEY,
    });

    if (!serverResult.success) {
      console.error(
        "Missing server environment variables:",
        serverResult.error.flatten().fieldErrors
      );
      throw new Error("Missing required server environment variables");
    }

    return {
      ...clientResult.data,
      ...serverResult.data,
    };
  }

  return clientResult.data;
}

type ServerEnv = z.infer<typeof serverSchema> & z.infer<typeof clientSchema>;
type ClientEnv = z.infer<typeof clientSchema>;

// Lazy validation — only validates on first access
let _env: ServerEnv | ClientEnv | null = null;

export function getEnv(): ServerEnv | ClientEnv {
  if (!_env) {
    _env = validateEnv();
  }
  return _env;
}

// For server-only usage — throws if called on client
export function getServerEnv(): ServerEnv {
  if (typeof window !== "undefined") {
    throw new Error("getServerEnv() cannot be called on the client");
  }
  return getEnv() as ServerEnv;
}

// For client usage
export function getClientEnv(): ClientEnv {
  return getEnv() as ClientEnv;
}
