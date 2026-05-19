# FussMatt — B2B Stock Sync — Runbook

**Owner:** Growtify Development Dept
**Status:** working — runs manually; NO scheduled automation runner yet (see §7)
**Last documented:** 2026-05-19 (WC key rotated to Read/Write + vaulted; `/api/sync` rate-limit fix)

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
   - **Product is new** → in `resume` mode, created in WooCommerce; in
     `stock-only` mode (the default), skipped. ⚠️ The create path publishes
     the product LIVE at the feed's wholesale price — see §6a.
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

`.env.local` is gitignored — it does NOT transfer with `git clone`. On a fresh
machine it must be recreated. **Every value the sync needs now has a single
source of truth in the Growtify Credential Vault** (DEBT-047) — so a new
machine is no longer blocked on tribal knowledge. This is the fix for the
2026-05-19 new-Mac incident, where `B2B_FEED_URL` lived only in one Mac's
`.env.local` and the dept could not run the sync anywhere else.

| Var | Purpose | Vault source of truth |
|---|---|---|
| `B2B_FEED_URL` | Full HTTPS URL of the supplier XML feed | `fussmatt-b2b-sync.json` |
| `SYNC_SECRET_KEY` | Bearer token for `/api/sync` auth | `fussmatt-b2b-sync.json` |
| `WC_CONSUMER_KEY` / `WC_CONSUMER_SECRET` | WooCommerce REST API auth — **must be a Read/Write key** | `fussmatt-wc-api.json` |
| `WORDPRESS_URL` | `https://wp.fussmatt.com` | `fussmatt-wc-api.json` (`.wc.wp_url`) |
| `RESEND_API_KEY` / `RESEND_FROM_EMAIL` | Back-in-stock emails — optional; the stock sync runs without it | not vaulted (secondary feature) |

### Populate `.env.local` on a fresh machine

The Credential Vault is the env-wide source of truth. From any machine that
has `~/.growtify/ops-master-token`:

```bash
cd ~/Desktop/growtify-env          # or ~/Growtify OS/growtify-env

node scripts/vault.mjs get fussmatt-wc-api.json
#   .wc.consumer_key    -> WC_CONSUMER_KEY
#   .wc.consumer_secret -> WC_CONSUMER_SECRET
#   .wc.wp_url          -> WORDPRESS_URL

node scripts/vault.mjs get fussmatt-b2b-sync.json
#   .B2B_FEED_URL       -> B2B_FEED_URL
#   .SYNC_SECRET_KEY    -> SYNC_SECRET_KEY
```

The WooCommerce key MUST have **Read/Write** permission. A Read-only key
parses the feed fine but fails every product write with
`WC API 401: woocommerce_rest_cannot_create` (see §6). The current vaulted
key (`ck_98448…`, permission `read_write`, rotated 2026-05-18) is correct.
If a credential is missing or rotated, see
`growtify-env/docs/operational/SECRETS-REGISTRY.md`.

## 5. How to run it (any Mac)

```bash
cd ~/Desktop/clients/fussmatt/fussmatt
npm install                                  # node_modules is gitignored
# If .env.local is missing/incomplete, recreate it from the vault — see §4
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
| `B2B_FEED_URL is not configured` | env var missing | Add `B2B_FEED_URL` from vault `fussmatt-b2b-sync.json` (§4) |
| `No WooCommerce credentials configured` | WC keys missing | Add `WC_CONSUMER_KEY/SECRET` from vault `fussmatt-wc-api.json` (§4) |
| `WC API 401: woocommerce_rest_cannot_create` | WC key is **Read-only** — feed parses fine, every product write fails | Use the **Read/Write** key from vault `fussmatt-wc-api.json` (`.wc.permission` must be `read_write`) |
| 401 Unauthorized | wrong/missing Bearer token | Use the exact `SYNC_SECRET_KEY` value |
| `batchSize: Number must be less than or equal to 10` | `batchSize` over the cap | `batchSize` max is **10**; for a full catalog, loop `mode:"resume"` |
| HTTP 429 `Zu viele Anfragen` | rate limit | Only **unauthenticated** calls are rate-limited now (fix 2026-05-19). A 429 on an authed call means the Bearer token is wrong → see 401 row |
| 409 "Sync already in progress" | lock held | Wait, or delete `data/sync.lock` (auto-clears after 30 min) |
| `next` won't start | no `node_modules` | `npm install` |
| Sync stops mid-catalog | crash / timeout | re-run with `mode:"resume"` — checkpoint resumes |

## 6a. Sync modes & the create-path caveat

`POST /api/sync` takes `mode` (`stock-only` | `resume`, default `stock-only`)
and `batchSize` (1–10, default 5). Both modes resume from the saved checkpoint.

| Mode | Existing SKUs | New SKUs (not in WooCommerce) |
|---|---|---|
| `stock-only` (default) | `stock_status` updated | **skipped** — logged, never created |
| `resume` | `stock_status` updated | **created LIVE** — see caveat below |

⚠️ **Create-path caveat (`resume` mode).** When `resume` hits a feed SKU that
does not exist in WooCommerce it `POST`s a new product with `status:"publish"`
and `regular_price` taken from the feed. The feed only carries the
**wholesale** price (`<Price>`, ~€59.9) — there is no retail field — so a
newly-created product goes **live at ~1/3 of its intended retail price**
(~€159). This is a known defect (surfaced 2026-05-19). Until it is fixed
(create as `draft`, or apply a retail markup — a pricing decision for the
dept/CEO), use **`stock-only`** for routine stock refreshes. Only use `resume`
when new-product import is explicitly intended AND someone will review and
reprice the created products before they sell.

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
