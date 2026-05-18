# FussMatt — B2B Stock Sync — Runbook

**Owner:** Growtify Development Dept
**Status:** working code, NO automation runner yet (see "Known gap" below)
**Last documented:** 2026-05-19

This is the operational runbook for the FussMatt automatic stock-update
("otomatik stok güncelleme") system. It exists so that anyone — or the
development dept — can understand, run, and fix this system without
reverse-engineering the code.

---

## 1. What it is

FussMatt is a reseller. Products come from a B2B supplier, **fussmattenprofi.com**,
which publishes a product **XML feed**. This system reads that feed and keeps the
**stock status** of products on the FussMatt store (`wp.fussmatt.com`, WooCommerce)
accurate.

It is part of the **FussMatt storefront** (this Next.js app, Vercel-hosted). It is
NOT part of the Growtify agency platform (growtify-env / Cloudflare D1) — different
system, different infra.

## 2. Data flow

```
fussmattenprofi.com  ──XML feed──▶  POST /api/sync  ──▶  sync-engine  ──▶  WooCommerce
   (B2B_FEED_URL)                   (Bearer auth)        (per SKU)         (wp.fussmatt.com)
```

1. `POST /api/sync` — authed with `Authorization: Bearer <SYNC_SECRET_KEY>`.
2. `xml-parser.ts` fetches + parses the feed (`B2B_FEED_URL`).
3. `sync-engine.ts` processes a **batch (default 5 products)**. Per SKU:
   - **Product exists in WooCommerce** → updates **ONLY `stock_status`**
     (instock / outofstock). It never touches price/name/description —
     feed prices are wholesale (~€59.9), WC has retail (~€159).
   - **Product is new** → creates it in WooCommerce.
4. When a product goes out-of-stock → in-stock, sends **back-in-stock emails**
   to subscribers (Resend).
5. Writes a **checkpoint** after each product (`data/sync-checkpoint.json`) and
   holds a **lock** (`data/sync.lock`, 30-min TTL) so two syncs can't overlap.
6. Response: `{ created, updated, skipped, hasMore, ... }`.

Batched → to sync the whole catalog you call `/api/sync` repeatedly with
`mode: "resume"` until `hasMore: false`.

## 3. Files

| File | Role |
|---|---|
| `src/app/api/sync/route.ts` | The endpoint — auth, lock, rate-limit, calls `runSync` |
| `src/lib/sync/sync-engine.ts` | Core: fetch → batch → WC update; lock + checkpoint |
| `src/lib/sync/xml-parser.ts` | B2B XML feed fetch + parse |
| `src/lib/sync/brand-sanitizer.ts` | Strips supplier branding from titles/descriptions |
| `src/lib/sync/gtin.ts` | GTIN/EAN validation + correction |
| `src/lib/sync/types.ts` | Types — `SyncOptions.mode` = `"stock-only" \| "resume"` |
| `data/sync-checkpoint.json` | Resume state (gitignored, local only) |
| `data/sync.lock` | Concurrency lock (gitignored, local only) |

## 4. Environment variables (`.env.local`)

Required for the sync to run:

| Var | Purpose | Present in current `.env.local`? |
|---|---|---|
| `B2B_FEED_URL` | Full HTTPS URL of the supplier XML feed | ❌ **MISSING — must be added** |
| `SYNC_SECRET_KEY` | Bearer token for `/api/sync` auth | ✅ |
| `WORDPRESS_URL` | `https://wp.fussmatt.com` | ✅ |
| `WC_CONSUMER_KEY` / `WC_CONSUMER_SECRET` | WooCommerce REST API auth | ✅ |
| `RESEND_API_KEY` / `RESEND_FROM_EMAIL` | Back-in-stock emails | check |

`.env.local` is gitignored — it does NOT transfer with `git clone`. On a new
machine it must be recreated. `B2B_FEED_URL` is documented in `.env.example`
but is currently absent from the live `.env.local` — this is the #1 reason a
fresh machine can't run the sync (`xml-parser.ts` throws
`"B2B_FEED_URL is not configured"` immediately).

## 5. How to run it (any Mac)

```bash
cd ~/Desktop/clients/fussmatt/fussmatt
npm install                                  # node_modules is gitignored
# Ensure .env.local has B2B_FEED_URL + the keys above
npm run dev                                  # or: npm run build && npm run start
```

Then drive the sync until the whole catalog is done:

```bash
KEY="<value of SYNC_SECRET_KEY>"
while true; do
  R=$(curl -s -X POST localhost:3000/api/sync \
        -H "Authorization: Bearer $KEY" -H "content-type: application/json" \
        -d '{"mode":"resume","batchSize":5}')
  echo "$R"
  echo "$R" | grep -q '"hasMore":false' && break
  sleep 2
done
```

`GET /api/sync` (same Bearer auth) returns `{ locked, status }` — a health check.

## 6. Failure modes

| Symptom | Cause | Fix |
|---|---|---|
| `B2B_FEED_URL is not configured` | env var missing | Add `B2B_FEED_URL` to `.env.local` |
| `No WooCommerce credentials configured` | WC keys missing | Add `WC_CONSUMER_KEY/SECRET` |
| 401 Unauthorized | wrong/missing Bearer token | Use the exact `SYNC_SECRET_KEY` value |
| 409 "Sync already in progress" | lock held | Wait, or delete `data/sync.lock` (auto-clears after 30 min) |
| `next` won't start | no `node_modules` | `npm install` |
| Sync stops mid-catalog | crash / timeout | re-run with `mode:"resume"` — checkpoint resumes |

## 7. Known gap — there is NO automation runner

The CODE supports automation but nothing triggers it on a schedule:
- No launchd job, no cron, no loop script anywhere.
- "Automatic" has, until now, meant a human running steps 5 above.
- The lock + checkpoint use the local filesystem (`data/`), so this currently
  only works on a machine with a persistent disk (a Mac) — not on Vercel
  serverless as-is.

**Target state (Mac-free):**
1. Move lock + checkpoint from `data/` files to **Upstash Redis** (already a
   dependency — `UPSTASH_REDIS_REST_*` in `.env`, used for rate-limiting).
2. Add a **Vercel Cron** entry to `vercel.json` that POSTs `/api/sync` daily.

Then the sync runs serverless, on schedule, with zero Mac dependency.
