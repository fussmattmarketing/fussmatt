/**
 * B2B XML Feed → WooCommerce Sync Types
 */

export interface XMLProduct {
  sku: string;
  title: string;
  price: string;
  regular_price: string;
  stock_status: "instock" | "outofstock";
  weight: string;
  images: string[];
  categories: string[];
  attributes: Record<string, string>;
  gtin?: string;
  description?: string;
  short_description?: string;
}

export interface SyncResult {
  created: number;
  updated: number;
  skipped: number;
  errors: SyncError[];
  batchOffset: number;
  batchSize: number;
  totalProducts: number;
  hasMore: boolean;
  duration: number;
}

export interface SyncError {
  sku: string;
  message: string;
  type: "parse" | "api" | "validation" | "image";
}

export interface SyncOptions {
  batchSize?: number;
  offset?: number;
  syncImages?: boolean;
  dryRun?: boolean;
  mode?: "full" | "stock-only" | "resume";
}

export interface SyncLog {
  timestamp: string;
  action:
    | "sync_start"
    | "sync_end"
    | "product_created"
    | "product_updated"
    | "product_skipped"
    | "error"
    | "info";
  message: string;
  data?: Record<string, unknown>;
}

export interface SyncCheckpoint {
  offset: number;
  totalProcessed: number;
  lastSku: string;
  startedAt: string;
  updatedAt: string;
}
