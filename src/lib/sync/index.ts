export { runSync, acquireLock, releaseLock, isLocked } from "./sync-engine";
export { fetchAndParseXML } from "./xml-parser";
export { validateGTIN, validateGTINBatch } from "./gtin";
export { sanitizeProduct, sanitizeText } from "./brand-sanitizer";
export type {
  XMLProduct,
  SyncResult,
  SyncError,
  SyncOptions,
  SyncLog,
  SyncCheckpoint,
} from "./types";
