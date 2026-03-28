/**
 * GTIN-13 (EAN) Validation
 *
 * Validates and fixes GTIN-13 barcodes from the supplier feed.
 * Known issues: some GTINs have wrong check digits, some are 9-digit (invalid).
 */

export interface GTINValidation {
  original: string;
  valid: boolean;
  corrected?: string;
  error?: string;
}

/**
 * Validate a GTIN-13 barcode.
 */
export function validateGTIN(gtin: string): GTINValidation {
  const cleaned = gtin.replace(/\s+/g, "").replace(/[^0-9]/g, "");

  if (cleaned.length < 8 || cleaned.length > 14) {
    return {
      original: gtin,
      valid: false,
      error: `Invalid length: ${cleaned.length} digits`,
    };
  }

  let normalized = cleaned;
  if (cleaned.length === 12) {
    normalized = "0" + cleaned;
  } else if (cleaned.length === 8) {
    normalized = "00000" + cleaned;
  } else if (cleaned.length === 14) {
    normalized = cleaned;
  } else if (cleaned.length !== 13) {
    return {
      original: gtin,
      valid: false,
      error: `Unusual length: ${cleaned.length} digits`,
    };
  }

  const digits = normalized.slice(0, -1).split("").map(Number);
  const expectedCheck = calculateCheckDigit(digits);
  const actualCheck = parseInt(normalized.slice(-1));

  if (expectedCheck === actualCheck) {
    return { original: gtin, valid: true };
  }

  const corrected = normalized.slice(0, -1) + expectedCheck;
  return {
    original: gtin,
    valid: false,
    corrected,
    error: `Check digit mismatch: expected ${expectedCheck}, got ${actualCheck}`,
  };
}

function calculateCheckDigit(digits: number[]): number {
  let sum = 0;
  const length = digits.length;

  for (let i = 0; i < length; i++) {
    const multiplier = (length - i) % 2 === 0 ? 1 : 3;
    sum += digits[i] * multiplier;
  }

  const remainder = sum % 10;
  return remainder === 0 ? 0 : 10 - remainder;
}

export function validateGTINBatch(
  gtins: string[]
): {
  valid: number;
  corrected: number;
  invalid: number;
  results: GTINValidation[];
} {
  const results = gtins.filter(Boolean).map(validateGTIN);
  return {
    valid: results.filter((r) => r.valid).length,
    corrected: results.filter((r) => !r.valid && r.corrected).length,
    invalid: results.filter((r) => !r.valid && !r.corrected).length,
    results,
  };
}
