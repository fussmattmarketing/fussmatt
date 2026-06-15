/**
 * PaymentMethods — accepted payment brands row.
 *
 * Renders the real card-scheme marks we accept through Stripe:
 * Stripe wordmark + Visa + Mastercard + American Express. Inline SVGs
 * (no external image, no third-party request, scales crisply, and can't
 * fall out of sync the way the old payment-methods.webp did — that one
 * still had a TWINT logo baked in).
 *
 * Used in three places:
 *   - Footer (variant="footer" — sits on the dark footer background)
 *   - Product page, under the add-to-cart button (variant="inline")
 *   - /zahlungsmethoden and anywhere payment methods are described
 *
 * The card marks always render on their own white chips so they stay
 * legible on any background; only the optional label + Stripe wordmark
 * adapt to the surface.
 */

interface PaymentMethodsProps {
  /** "footer" tints the label/Stripe for a dark bg; "inline" for light. */
  variant?: "footer" | "inline";
  /** Show the "Sichere Zahlung mit" lead-in label. Default true. */
  showLabel?: boolean;
  className?: string;
}

function VisaMark() {
  return (
    <span className="inline-flex h-7 w-11 items-center justify-center rounded-md border border-gray-200 bg-white">
      <svg viewBox="0 0 48 16" className="h-3.5 w-auto" role="img" aria-label="Visa">
        <text
          x="24"
          y="13"
          textAnchor="middle"
          fontFamily="Arial, Helvetica, sans-serif"
          fontWeight="700"
          fontStyle="italic"
          fontSize="15"
          fill="#1434CB"
          letterSpacing="0.5"
        >
          VISA
        </text>
      </svg>
    </span>
  );
}

function MastercardMark() {
  return (
    <span className="inline-flex h-7 w-11 items-center justify-center rounded-md border border-gray-200 bg-white">
      <svg viewBox="0 0 36 22" className="h-4 w-auto" role="img" aria-label="Mastercard">
        <circle cx="14" cy="11" r="8" fill="#EB001B" />
        <circle cx="22" cy="11" r="8" fill="#F79E1B" />
        <path
          d="M18 4.6a8 8 0 0 1 0 12.8 8 8 0 0 1 0-12.8Z"
          fill="#FF5F00"
        />
      </svg>
    </span>
  );
}

function AmexMark() {
  return (
    <span className="inline-flex h-7 w-11 items-center justify-center rounded-md border border-gray-200 bg-white">
      <svg viewBox="0 0 48 18" className="h-4 w-auto" role="img" aria-label="American Express">
        <rect width="48" height="18" rx="2" fill="#1F72CD" />
        <text
          x="24"
          y="8"
          textAnchor="middle"
          fontFamily="Arial, Helvetica, sans-serif"
          fontWeight="700"
          fontSize="5"
          fill="#fff"
          letterSpacing="0.2"
        >
          AMERICAN
        </text>
        <text
          x="24"
          y="14"
          textAnchor="middle"
          fontFamily="Arial, Helvetica, sans-serif"
          fontWeight="700"
          fontSize="5"
          fill="#fff"
          letterSpacing="0.2"
        >
          EXPRESS
        </text>
      </svg>
    </span>
  );
}

export default function PaymentMethods({
  variant = "inline",
  showLabel = true,
  className = "",
}: PaymentMethodsProps) {
  const labelColor = variant === "footer" ? "text-gray-400" : "text-gray-500";
  const stripeColor =
    variant === "footer" ? "text-indigo-400" : "text-indigo-600";

  return (
    <div className={`flex flex-wrap items-center gap-2.5 ${className}`}>
      {showLabel && (
        <span className={`text-xs ${labelColor}`}>Sichere Zahlung mit</span>
      )}
      <span className={`text-sm font-semibold tracking-tight ${stripeColor}`}>
        stripe
      </span>
      <span className="flex items-center gap-1.5">
        <VisaMark />
        <MastercardMark />
        <AmexMark />
      </span>
    </div>
  );
}
