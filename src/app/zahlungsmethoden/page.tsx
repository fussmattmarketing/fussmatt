import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Zahlungsmethoden",
  description:
    "Übersicht der akzeptierten Zahlungsmethoden bei FussMatt: Stripe (Kreditkarte). Bezahlung in Schweizer Franken (CHF), SSL-verschlüsselt nach Schweizer Standard.",
  alternates: { canonical: "/zahlungsmethoden" },
};

export default function ZahlungsmethodenPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
      <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
        Zahlungsmethoden
      </h1>
      <p className="text-gray-600 leading-relaxed mb-10 max-w-2xl">
        Bei FussMatt akzeptieren wir die in der Schweiz gängigsten und
        sichersten Zahlungsmethoden. Alle Transaktionen werden
        SSL-verschlüsselt nach Schweizer Standard abgewickelt.
      </p>

      <div className="prose prose-gray max-w-none prose-headings:text-gray-900 prose-headings:font-semibold prose-p:my-3 prose-p:leading-relaxed prose-li:my-1.5 prose-strong:text-gray-900">
        <h2>Akzeptierte Zahlungsmethoden</h2>
        <p>
          Wir akzeptieren <strong>Stripe</strong> für die sichere
          Verarbeitung Ihrer Zahlungen — Kreditkarte (Visa, Mastercard,
          American Express) und weitere von Stripe angebotene Methoden.
          Alle Zahlungen sind SSL-verschlüsselt nach Schweizer Standard.
        </p>

        <h2>Währung</h2>
        <p>
          Sämtliche Preise auf fussmatt.com sind in{" "}
          <strong>Schweizer Franken (CHF)</strong> angegeben und verstehen
          sich <strong>inklusive Mehrwertsteuer</strong>. Die Belastung
          Ihrer Zahlung erfolgt ebenfalls in CHF — wir berechnen keine
          zusätzlichen Wechselkursgebühren.
        </p>

        <h2>Sicherheit</h2>
        <p>
          Alle Zahlungen auf unserer Website sind SSL-verschlüsselt und
          entsprechen dem Schweizer Sicherheitsstandard. Ihre Karten- und
          Zahlungsdaten werden niemals auf unseren Servern gespeichert —
          sie werden direkt und sicher von Stripe verarbeitet.
        </p>
        <p>
          Stripe ist PCI-DSS zertifiziert, dem höchsten Sicherheitsstandard
          für die Verarbeitung von Kreditkartendaten.
        </p>

        <h2>Zahlungsablauf</h2>
        <ol>
          <li>
            Im Checkout wählen Sie Ihre bevorzugte Zahlungsmethode über
            Stripe (Kreditkarte oder eine der weiteren angebotenen Methoden).
          </li>
          <li>
            Die Zahlung wird sicher über den Zahlungsdienstleister
            abgewickelt — Sie verlassen unsere Website dabei nicht.
          </li>
          <li>
            Nach erfolgreicher Zahlung erhalten Sie sofort eine
            Bestellbestätigung sowie Ihre Rechnung per E-Mail.
          </li>
        </ol>

        <h2>Rechnung & Mehrwertsteuer</h2>
        <p>
          Sie erhalten Ihre Rechnung direkt nach Zahlungseingang per
          E-Mail. Die Rechnung enthält alle gesetzlich vorgeschriebenen
          Angaben inklusive ausgewiesener Mehrwertsteuer.
        </p>
        <p>
          Eine zusätzliche Rechnung wird der Sendung beigelegt. Bei Fragen
          zu Ihrer Rechnung können Sie uns jederzeit unter{" "}
          <a href="mailto:info@fussmatt.com">info@fussmatt.com</a> oder
          telefonisch unter{" "}
          <a href="tel:+41445052722">+41 44 505 27 22</a> kontaktieren.
        </p>

        <h2>Probleme bei der Zahlung?</h2>
        <p>
          Sollte Ihre Zahlung nicht akzeptiert werden, prüfen Sie bitte
          zunächst, ob Ihre Karte für Online-Käufe freigeschaltet ist und
          das angegebene Limit ausreicht. Bei anhaltenden Problemen helfen
          wir Ihnen gerne weiter — kontaktieren Sie uns über{" "}
          <Link href="/kontakt">unser Kontaktformular</Link>.
        </p>
      </div>

      <div className="mt-12 rounded-2xl bg-gray-50 border border-gray-100 p-6 lg:p-8">
        <p className="text-sm text-gray-600 leading-relaxed">
          Weitere Informationen zu Versand, Rückgabe und unseren AGB finden
          Sie auf folgenden Seiten:
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href="/versand"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 text-sm font-medium hover:bg-white transition-colors"
          >
            Versand &amp; Lieferung
          </Link>
          <Link
            href="/widerruf"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 text-sm font-medium hover:bg-white transition-colors"
          >
            Rückgabe &amp; Umtausch
          </Link>
          <Link
            href="/agb"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 text-sm font-medium hover:bg-white transition-colors"
          >
            AGB
          </Link>
        </div>
      </div>
    </div>
  );
}
