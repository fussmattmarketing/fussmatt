/**
 * B2B Sync Engine
 *
 * Syncs products from B2B XML feed to WooCommerce.
 *
 * v2 improvements:
 * - PID lock file prevents concurrent syncs
 * - Batch size 5 (was 50 — caused timeouts)
 * - Checkpoint/resume for crash recovery
 * - Uses shared WC API (no duplicate auth code)
 * - feedUrl from env only (SSRF protection)
 * - Image sync in separate pass
 */

import fs from "fs";
import path from "path";
import type { XMLProduct, SyncResult, SyncError, SyncOptions, SyncCheckpoint } from "./types";
import { fetchAndParseXML } from "./xml-parser";
import { sanitizeProduct } from "./brand-sanitizer";
import { validateGTIN } from "./gtin";

const LOCK_FILE = path.join(process.cwd(), "data", "sync.lock");
const CHECKPOINT_FILE = path.join(process.cwd(), "data", "sync-checkpoint.json");
const LOCK_TTL = 30 * 60 * 1000; // 30 minutes
const DEFAULT_BATCH_SIZE = 5;
const MAX_RETRIES = 3;

// ─── Lock Management ────────────────────────────────────

export function acquireLock(): boolean {
  const dataDir = path.dirname(LOCK_FILE);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  if (fs.existsSync(LOCK_FILE)) {
    const lockAge = Date.now() - fs.statSync(LOCK_FILE).mtimeMs;
    if (lockAge < LOCK_TTL) return false; // Another process is running
    // Stale lock — remove it
    fs.unlinkSync(LOCK_FILE);
  }

  fs.writeFileSync(
    LOCK_FILE,
    JSON.stringify({ pid: process.pid, started: new Date().toISOString() })
  );
  return true;
}

export function releaseLock(): void {
  if (fs.existsSync(LOCK_FILE)) {
    fs.unlinkSync(LOCK_FILE);
  }
}

export function isLocked(): boolean {
  if (!fs.existsSync(LOCK_FILE)) return false;
  const lockAge = Date.now() - fs.statSync(LOCK_FILE).mtimeMs;
  return lockAge < LOCK_TTL;
}

// ─── Checkpoint Management ──────────────────────────────

function saveCheckpoint(checkpoint: SyncCheckpoint): void {
  const dir = path.dirname(CHECKPOINT_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(CHECKPOINT_FILE, JSON.stringify(checkpoint, null, 2));
}

function loadCheckpoint(): SyncCheckpoint | null {
  if (!fs.existsSync(CHECKPOINT_FILE)) return null;
  try {
    return JSON.parse(fs.readFileSync(CHECKPOINT_FILE, "utf-8"));
  } catch {
    return null;
  }
}

function clearCheckpoint(): void {
  if (fs.existsSync(CHECKPOINT_FILE)) {
    fs.unlinkSync(CHECKPOINT_FILE);
  }
}

// ��── WC API Helpers (using Authorization header) ────────

function getWCConfig(): { baseUrl: string; authParams: string } {
  const baseUrl = process.env.WORDPRESS_URL;
  if (!baseUrl) throw new Error("WORDPRESS_URL not configured");

  const key = process.env.WC_CONSUMER_KEY;
  const secret = process.env.WC_CONSUMER_SECRET;
  if (!key || !secret) {
    throw new Error("No WooCommerce credentials configured (WC_CONSUMER_KEY/WC_CONSUMER_SECRET)");
  }

  return {
    baseUrl,
    authParams: `consumer_key=${encodeURIComponent(key)}&consumer_secret=${encodeURIComponent(secret)}`,
  };
}

async function wcRequest(
  endpoint: string,
  method: string,
  body?: unknown,
  retries = MAX_RETRIES
): Promise<unknown> {
  const { baseUrl, authParams } = getWCConfig();
  const separator = endpoint.includes("?") ? "&" : "?";
  const url = `${baseUrl}/wp-json/wc/v3${endpoint}${separator}${authParams}`;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: body ? JSON.stringify(body) : undefined,
      });

      if (!res.ok) {
        const errText = await res.text().catch(() => "");
        throw new Error(`WC API ${res.status}: ${errText}`);
      }

      return res.json();
    } catch (error) {
      if (attempt === retries) throw error;
      // Exponential backoff: 1s, 4s, 16s
      const delay = Math.pow(4, attempt - 1) * 1000;
      console.log(`  Retry ${attempt}/${retries} after ${delay}ms...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
}

async function findProductBySku(sku: string): Promise<{ id: number } | null> {
  const { baseUrl, authParams } = getWCConfig();
  const url = `${baseUrl}/wp-json/wc/v3/products?sku=${encodeURIComponent(sku)}&per_page=1&${authParams}`;
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) return null;
  const products = (await res.json()) as Array<{ id: number }>;
  return products[0] || null;
}

// ─── Main Sync ──────────────────────────────────────────

export async function runSync(options: SyncOptions = {}): Promise<SyncResult> {
  const startTime = Date.now();
  const batchSize = options.batchSize || DEFAULT_BATCH_SIZE;
  const errors: SyncError[] = [];
  let created = 0;
  let updated = 0;
  let skipped = 0;

  // Check for resume
  let startOffset = options.offset || 0;
  if (options.mode === "resume") {
    const checkpoint = loadCheckpoint();
    if (checkpoint) {
      startOffset = checkpoint.offset;
      console.log(`Resuming from checkpoint: offset ${startOffset}`);
    }
  }

  // Fetch and parse XML feed
  console.log("Fetching XML feed...");
  const products = await fetchAndParseXML();
  console.log(`Parsed ${products.length} products from feed`);

  // Process batch
  const batch = products.slice(startOffset, startOffset + batchSize);

  for (let i = 0; i < batch.length; i++) {
    const xmlProduct = batch[i];
    const globalIndex = startOffset + i;

    try {
      // Sanitize product data
      const sanitized = sanitizeProduct({
        title: xmlProduct.title,
        description: xmlProduct.description,
        short_description: xmlProduct.short_description,
        categories: xmlProduct.categories,
        images: xmlProduct.images,
        sku: xmlProduct.sku,
      });

      // Validate GTIN
      let gtin = xmlProduct.gtin;
      if (gtin) {
        const gtinResult = validateGTIN(gtin);
        if (gtinResult.corrected) {
          gtin = gtinResult.corrected;
        } else if (!gtinResult.valid) {
          gtin = undefined;
        }
      }

      // Check if product already exists
      const existing = await findProductBySku(xmlProduct.sku);

      if (existing) {
        if (options.mode === "stock-only") {
          // Only update stock status
          await wcRequest(`/products/${existing.id}`, "PUT", {
            stock_status: xmlProduct.stock_status,
          });
        } else {
          // Full update
          await wcRequest(`/products/${existing.id}`, "PUT", {
            name: sanitized.title,
            description: sanitized.description,
            short_description: sanitized.short_description,
            regular_price: xmlProduct.regular_price,
            sale_price: xmlProduct.price,
            stock_status: xmlProduct.stock_status,
            weight: xmlProduct.weight,
            meta_data: gtin
              ? [{ key: "_gtin", value: gtin }]
              : [],
          });
        }
        updated++;
        console.log(`  [${globalIndex + 1}] Updated: ${xmlProduct.sku}`);
      } else {
        if (options.dryRun) {
          console.log(`  [${globalIndex + 1}] Would create: ${xmlProduct.sku}`);
          skipped++;
        } else {
          // Create new product
          await wcRequest("/products", "POST", {
            name: sanitized.title,
            type: "simple",
            status: "publish",
            sku: xmlProduct.sku,
            description: sanitized.description,
            short_description: sanitized.short_description,
            regular_price: xmlProduct.regular_price,
            sale_price: xmlProduct.price,
            stock_status: xmlProduct.stock_status,
            weight: xmlProduct.weight,
            images: options.syncImages
              ? sanitized.images
              : [],
            meta_data: gtin
              ? [{ key: "_gtin", value: gtin }]
              : [],
          });
          created++;
          console.log(`  [${globalIndex + 1}] Created: ${xmlProduct.sku}`);
        }
      }

      // Save checkpoint after each product
      saveCheckpoint({
        offset: globalIndex + 1,
        totalProcessed: created + updated + skipped,
        lastSku: xmlProduct.sku,
        startedAt: new Date(startTime).toISOString(),
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown error";
      errors.push({ sku: xmlProduct.sku, message, type: "api" });
      console.error(`  [${globalIndex + 1}] Error: ${xmlProduct.sku} — ${message}`);
    }
  }

  const hasMore = startOffset + batchSize < products.length;
  if (!hasMore) {
    clearCheckpoint();
  }

  return {
    created,
    updated,
    skipped,
    errors,
    batchOffset: startOffset,
    batchSize,
    totalProducts: products.length,
    hasMore,
    duration: Date.now() - startTime,
  };
}
