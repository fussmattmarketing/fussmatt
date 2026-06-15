/**
 * TrustGrid — 6 trust signal blocks (icon + label + 1-line body)
 *
 * Honest, factual, no fake urgency, no fabricated scarcity, no fake reviews.
 * Sourced from CRT-SUSPENSION-002-remediation-copy DEL-004 (Creative).
 *
 * Designed for product detail + category pages (highest Google policy
 * crawl volume + buyer trust moments). Inline SVG icons — zero dep.
 */

type SVGIcon = React.FC<React.SVGProps<SVGSVGElement>>;

const Icons = {
  Shield: ((props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
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
  Doc: ((props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="8" y1="13" x2="16" y2="13" />
      <line x1="8" y1="17" x2="13" y2="17" />
    </svg>
  )) as SVGIcon,
  Phone: ((props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.37 1.9.72 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.35 1.85.59 2.81.72A2 2 0 0 1 22 16.92z" />
    </svg>
  )) as SVGIcon,
  Target: ((props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  )) as SVGIcon,
};

const TRUST_BLOCKS: { Icon: SVGIcon; label: string; text: string }[] = [
  {
    Icon: Icons.Shield,
    label: "Sicher bezahlen",
    text: "Bezahlung mit Stripe — SSL-verschlüsselt, Schweizer Standard.",
  },
  {
    Icon: Icons.Truck,
    label: "Schweizer Versand",
    text: "Kostenlose Lieferung innerhalb der Schweiz in 1–3 Werktagen.",
  },
  {
    Icon: Icons.Return,
    label: "30 Tage Geld-zurück",
    text: "Nicht zufrieden? Senden Sie die Matten innerhalb von 30 Tagen zurück.",
  },
  {
    Icon: Icons.Doc,
    label: "30 Tage Rückgaberecht",
    text: "Bestellung ohne Risiko — 30 Tage Geld-zurück-Garantie inklusive.",
  },
  {
    Icon: Icons.Phone,
    label: "Echter Kontakt",
    text: "Fragen? +41 44 505 27 22 oder info@fussmatt.com — Schweizer Kundenservice.",
  },
  {
    Icon: Icons.Target,
    label: "Passform-Versprechen",
    text: "Marke, Modell und Baujahr wählen — wir liefern die passende Matte.",
  },
];

export function TrustGrid({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={`grid gap-4 sm:gap-5 ${
        compact
          ? "grid-cols-2 lg:grid-cols-3"
          : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
      }`}
    >
      {TRUST_BLOCKS.map(({ Icon, label, text }) => (
        <div
          key={label}
          className="flex items-start gap-3 p-4 rounded-xl bg-gray-50 border border-gray-100"
        >
          <span className="flex-shrink-0 w-9 h-9 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
            <Icon className="w-4 h-4" />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900">{label}</p>
            <p className="text-xs text-gray-600 leading-relaxed mt-0.5">{text}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
