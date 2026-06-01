/**
 * TrustStrip — single-line trust signal strip
 *
 * Honest, factual, no fake urgency / no fabricated scarcity / no fake reviews.
 * Sourced from CRT-SUSPENSION-002-remediation-copy DEL-004/005 (Creative).
 *
 * Used on:
 * - Category pages — below hero, builds Google policy trust signal on
 *   high-crawl-volume listings
 * - Checkout — above payment button, reassurance at the conversion moment
 */
export function TrustStrip({
  variant = "category",
}: {
  variant?: "category" | "checkout";
}) {
  if (variant === "checkout") {
    return (
      <p className="text-xs text-center text-gray-500 leading-relaxed">
        Sichere Bezahlung · Versand aus der Schweiz · 30 Tage Geld-zurück-Garantie
      </p>
    );
  }

  // category variant — single line, breathable, full-width strip
  return (
    <div className="border-y border-gray-100 bg-gray-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <p className="text-xs text-center text-gray-600 leading-relaxed">
          FussMatt — Royal Road GmbH, Zürich
          <span className="mx-2 text-gray-300">·</span>
          Schweizer Kundenservice
          <span className="mx-2 text-gray-300">·</span>
          Sichere Bezahlung in CHF
          <span className="mx-2 text-gray-300">·</span>
          30 Tage Rückgabe
        </p>
      </div>
    </div>
  );
}
