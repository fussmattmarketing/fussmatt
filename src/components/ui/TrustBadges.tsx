/**
 * TrustBadges — 6 factual badges (REQ-006)
 *
 * Pre-GMC-final-submit hardening. Google's "Setup and policy issues"
 * checklist wants visible reviews/badges/seals. FussMatt is new, no
 * real reviews exist — so we surface FACTUAL credentials only:
 *   - SSL (real, verifiable)
 *   - Payment providers (real, contractual)
 *   - Schweizer Unternehmen (Royal Road GmbH 2021 — Handelsregister
 *     CHE-473.347.068)
 *   - Versand 1-3 Tage (real shipping SLA — CH only)
 *   - 30 Tage Geld-zurück (real return policy)
 *   - Phone +41 44 505 27 22 (real, answered Mo-Fr 9-17)
 *
 * Used on product page (above-fold), homepage (below hero), and
 * a compact horizontal version on checkout via `variant="checkout"`.
 *
 * NO fake reviews / star ratings / testimonials. Constraint-checked
 * against REQ-006 brief.
 */

import Link from "next/link";

type SVGIcon = React.FC<React.SVGProps<SVGSVGElement>>;

const Icon = {
  Shield: ((props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  )) as SVGIcon,
  Card: ((props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <line x1="2" y1="10" x2="22" y2="10" />
    </svg>
  )) as SVGIcon,
  Swiss: ((props) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <rect x="2" y="2" width="20" height="20" rx="2" fill="#dc2626" />
      <rect x="10" y="6" width="4" height="12" fill="white" />
      <rect x="6" y="10" width="12" height="4" fill="white" />
    </svg>
  )) as SVGIcon,
  Truck: ((props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="1" y="6" width="13" height="11" rx="1" />
      <path d="M14 9h4l3 3v5h-7" />
      <circle cx="6.5" cy="18.5" r="2" />
      <circle cx="17.5" cy="18.5" r="2" />
    </svg>
  )) as SVGIcon,
  Return: ((props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M3 7v6h6" />
      <path d="M3 13a9 9 0 1 0 3-7.7L3 8" />
    </svg>
  )) as SVGIcon,
  Phone: ((props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.37 1.9.72 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.35 1.85.59 2.81.72A2 2 0 0 1 22 16.92z" />
    </svg>
  )) as SVGIcon,
};

const BADGES: { Icon: SVGIcon; title: string; subtitle: string; href?: string }[] = [
  {
    Icon: Icon.Shield,
    title: "SSL gesichert",
    subtitle: "256-bit Verschlüsselung",
  },
  {
    Icon: Icon.Card,
    title: "Sicher bezahlen",
    subtitle: "TWINT, PostFinance, Visa, Mastercard",
  },
  {
    Icon: Icon.Swiss,
    title: "Schweizer Unternehmen",
    subtitle: "Royal Road GmbH seit 2021",
  },
  {
    Icon: Icon.Truck,
    title: "Versand 1–3 Tage",
    subtitle: "Schweizer Versand",
  },
  {
    Icon: Icon.Return,
    title: "30 Tage Geld-zurück",
    subtitle: "+ 14 Tage Widerrufsrecht",
  },
  {
    Icon: Icon.Phone,
    title: "+41 44 505 27 22",
    subtitle: "Mo–Fr 9–17 Uhr",
    href: "tel:+41445052722",
  },
];

export function TrustBadges({
  variant = "default",
}: {
  variant?: "default" | "checkout";
}) {
  if (variant === "checkout") {
    return (
      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-gray-600 py-3">
        <span className="inline-flex items-center gap-1.5">
          <Icon.Shield className="w-3.5 h-3.5 text-emerald-600" />
          Sicheres SSL-Checkout
        </span>
        <span className="text-gray-300">·</span>
        <span className="inline-flex items-center gap-1.5">
          <Icon.Swiss className="w-3.5 h-3.5" />
          Schweizer Versand 1–3 Tage
        </span>
        <span className="text-gray-300">·</span>
        <span>30 Tage Geld-zurück</span>
        <span className="text-gray-300">·</span>
        <span>14 Tage Widerruf</span>
        <span className="text-gray-300">·</span>
        <a href="tel:+41445052722" className="hover:text-amber-700 transition-colors">
          +41 44 505 27 22
        </a>
      </div>
    );
  }

  return (
    <div className="border-y border-gray-200 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {BADGES.map(({ Icon: I, title, subtitle, href }) => {
            const inner = (
              <div className="flex items-center gap-2 sm:gap-2.5">
                <span className="flex-shrink-0 w-8 h-8 rounded-md bg-white border border-gray-200 text-amber-700 flex items-center justify-center">
                  <I className="w-4 h-4" />
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-gray-900 leading-tight">
                    {title}
                  </p>
                  <p className="text-[10px] text-gray-500 leading-tight mt-0.5">
                    {subtitle}
                  </p>
                </div>
              </div>
            );
            return href ? (
              <Link
                key={title}
                href={href}
                className="hover:opacity-80 transition-opacity"
              >
                {inner}
              </Link>
            ) : (
              <div key={title}>{inner}</div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
