import { JsonLd } from "@/lib/seo";

/**
 * Generic FAQ accordion for product pages — the same trust-building
 * questions every customer asks (passgenau? Lieferzeit? Material?
 * Rückgabe?). Optionally personalised with the product / vehicle
 * name so answers feel specific instead of boilerplate.
 *
 * Also emits FAQ JSON-LD so Google can surface these answers in the
 * SERP (and the questions count toward the page's topical depth).
 */
interface ProductFAQProps {
  /** Optional product-specific label injected into a couple of answers
   *  (e.g. "Fussmatten für Mercedes C-Klasse"). Falls back to a generic
   *  phrasing if omitted. */
  productLabel?: string;
}

export default function ProductFAQ({ productLabel }: ProductFAQProps) {
  const label = productLabel || "diese Fussmatten";

  const items = [
    {
      q: "Passen die Fussmatten exakt in mein Fahrzeug?",
      a: `Ja. ${label} werden modellgenau gefertigt — millimetergenau auf die Bodenwanne Ihres Fahrzeugs abgestimmt. Originale Befestigungspunkte werden verwendet, sodass die Matten nicht verrutschen.`,
    },
    {
      q: "Wie lange dauert die Lieferung?",
      a: "Versand erfolgt aus der Schweiz innerhalb von 1–3 Werktagen. Bestellungen nach 17:00 Uhr werden am nächsten Werktag versandt. Wir liefern ausschliesslich in der Schweiz, der Versand ist kostenlos — ohne Mindestbestellwert.",
    },
    {
      q: "Aus welchem Material bestehen die Matten?",
      a: "Hochwertiges TPE (Thermoplastisches Elastomer) — geruchsneutral, schmutz- und feuchtigkeitsabweisend, robust und langlebig. Das Material ist temperaturbeständig (–40 °C bis +80 °C) und PVC-frei.",
    },
    {
      q: "Wie reinige ich die Fussmatten?",
      a: "Einfach mit Wasser ausspülen — kein Hochdruckreiniger oder aggressive Reinigungsmittel nötig. Die Matten trocknen schnell und können sofort wieder eingelegt werden.",
    },
    {
      q: "Kann ich die Matten zurücksenden, wenn sie nicht passen?",
      a: "Ja. Wir bieten 30 Tage Rückgaberecht auf alle Fussmatten. Bei Fragen oder Passproblemen kontaktieren Sie uns einfach unter info@fussmatt.com oder +41 44 505 27 22.",
    },
    {
      q: "Wie bezahle ich?",
      a: "Sicher über Stripe — Kreditkarte und weitere von Stripe angebotene Zahlungsmethoden. Alle Transaktionen sind SSL-verschlüsselt nach Schweizer Standard.",
    },
  ];

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((it) => ({
      "@type": "Question",
      name: it.q,
      acceptedAnswer: { "@type": "Answer", text: it.a },
    })),
  };

  return (
    <section className="mt-14" id="faq" aria-labelledby="product-faq-heading">
      <JsonLd data={faqSchema} />
      <h2
        id="product-faq-heading"
        className="text-2xl font-bold text-gray-900 mb-6"
      >
        Häufig gestellte Fragen
      </h2>
      <div className="space-y-3">
        {items.map((it, i) => (
          <details
            key={i}
            className="group border border-gray-200 rounded-xl bg-white"
          >
            <summary className="flex items-center justify-between px-5 py-4 cursor-pointer text-sm font-semibold text-gray-900 list-none">
              {it.q}
              <svg
                className="w-4 h-4 text-gray-400 shrink-0 ml-3 group-open:rotate-180 transition-transform"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </summary>
            <p className="px-5 pb-4 text-sm text-gray-700 leading-relaxed">
              {it.a}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}
