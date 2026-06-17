/**
 * FAQ — single source of truth shared between:
 *   - /faq dedicated page (long-form, all questions)
 *   - homepage accordion (last section, all questions, accordion render)
 *   - Schema.org FAQPage JSON-LD on /faq
 *
 * Topics (per CEO 2026-06-07): Versand, Rückgabe, Zahlungsmethoden +
 * product/Passform/Material context.
 */

export interface FAQItem {
  q: string;
  /** Plain text — UI renders as <p>; schema.org consumes verbatim. */
  a: string;
}

export const FAQ_ITEMS: FAQItem[] = [
  {
    q: "Wohin liefert FussMatt?",
    a: "Wir liefern ausschliesslich innerhalb der Schweiz. Lieferungen ins Ausland sind aktuell nicht möglich.",
  },
  {
    q: "Wie lange dauert die Lieferung?",
    a: "Die gesamte Lieferzeit beträgt 1–3 Werktage (inklusive 0–1 Werktag Vorbereitungszeit). Bestellungen nach 17:00 Uhr werden am nächsten Werktag versandt. Der Versand ist kostenlos — ohne Mindestbestellwert.",
  },
  {
    q: "Welche Zahlungsmethoden werden akzeptiert?",
    a: "Wir akzeptieren Stripe — mit den Kreditkarten Visa, Mastercard und American Express. Alle Zahlungen sind SSL-verschlüsselt nach Schweizer Standard.",
  },
  {
    q: "Kann ich die Bestellung zurücksenden?",
    a: "Ja. FussMatt bietet eine 30-Tage-Geld-zurück-Garantie auf alle Produkte. Sie können die Matten innerhalb von 30 Tagen ohne Angabe von Gründen zurücksenden, solange sie sich in einem wiederverkaufsfähigen Zustand befinden.",
  },
  {
    q: "Wie funktioniert eine Rücksendung?",
    a: "Schreiben Sie uns eine kurze E-Mail an info@fussmatt.com mit Ihrer Bestellnummer. Wir senden Ihnen die Rücksendeanweisungen zu und erstatten Ihnen nach Erhalt und Prüfung der Ware den vollen Kaufbetrag umgehend.",
  },
  {
    q: "Passen die Fussmatten genau in mein Fahrzeug?",
    a: "Ja. Unsere Matten werden anhand fahrzeugspezifischer 3D-Vermessungen für über 40 Marken und deren Modelle gefertigt. Wählen Sie auf der Website Marke, Modell und Baujahr — Sie erhalten ausschliesslich passgenaue Matten ohne Zuschneiden.",
  },
  {
    q: "Aus welchem Material sind die Matten?",
    a: "Wir verwenden hochwertiges TPE (Thermoplastisches Elastomer): geruchsarm, rutschfest, langlebig und 100 % recyclebar. Das Material bleibt flexibel von −40 °C bis +80 °C.",
  },
  {
    q: "Sind die Matten wasserdicht?",
    a: "Ja, alle FussMatt-Matten sind zu 100 % wasserdicht. Die erhöhten Ränder schützen den Fussraum zuverlässig vor Wasser, Schnee und Schmutz.",
  },
  {
    q: "Wie pflege ich die Fussmatten?",
    a: "Einfach aus dem Fahrzeug nehmen und mit Wasser abspülen. Bei stärkerer Verschmutzung können Sie eine milde Seife verwenden. Die Matten trocknen schnell an der Luft.",
  },
  {
    q: "Erhalte ich eine Rechnung zur Bestellung?",
    a: "Ja. Direkt nach dem Zahlungseingang erhalten Sie eine Rechnung per E-Mail. Eine zusätzliche Rechnung wird auch der Sendung beigelegt.",
  },
];
