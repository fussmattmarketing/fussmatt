import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Versand & Lieferung",
  description:
    "Versandinformationen für FussMatt. Kostenloser Versand in der ganzen Schweiz — ohne Mindestbestellwert. Lieferung in 1–3 Werktagen.",
};

export default function VersandPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">
        Versand &amp; Lieferung
      </h1>

      <div className="prose prose-gray max-w-none prose-headings:text-gray-900 prose-headings:font-semibold prose-p:my-3 prose-p:leading-relaxed prose-li:my-1.5 prose-strong:text-gray-900">
        <p>
          Wir liefern ausschliesslich innerhalb der Schweiz.{" "}
          <strong>Kostenloser Versand</strong> in der ganzen Schweiz — ohne
          Mindestbestellwert. Alle Preise verstehen sich in Schweizer Franken
          (CHF).
        </p>

        <h2>Lieferzeit</h2>
        <ul>
          <li>
            <strong>Vorbereitungszeit der Bestellung:</strong> 0–1 Werktag
          </li>
          <li>
            <strong>Gesamte Lieferzeit:</strong> 1–3 Werktage
          </li>
          <li>
            <strong>Bestellzeitpunkt:</strong> Bestellungen nach 17:00 Uhr
            werden am nächsten Werktag versandt
          </li>
        </ul>

        <h2>Versandkosten</h2>
        <ul>
          <li>
            <strong>Schweiz:</strong> Kostenlos — ohne Mindestbestellwert
          </li>
        </ul>

        <h2>Versandart</h2>
        <p>
          Alle Bestellungen werden per Standardversand verschickt. Sie erhalten
          eine Versandbestätigung per E-Mail mit Tracking-Informationen, sobald
          Ihre Bestellung das Lager verlässt.
        </p>

        <h2>Lieferadresse</h2>
        <p>
          Bitte stellen Sie sicher, dass Ihre Lieferadresse korrekt und
          vollständig ist. Bei fehlerhaften Adressen kann es zu Verzögerungen
          kommen.
        </p>
      </div>
    </div>
  );
}
