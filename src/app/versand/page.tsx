import type { Metadata } from "next";
import { SHIPPING_CONFIG, COUNTRY_NAMES, formatShippingCost, getDeliveryEstimate } from "@/lib/shipping";
import { SUPPORTED_COUNTRIES } from "@/lib/validations";

export const metadata: Metadata = {
  title: "Versand & Lieferung",
  description: "Versandinformationen für FussMatt. Kostenloser Versand in der Schweiz ab CHF 50. Lieferung in 6 europäische Länder.",
};

export default function VersandPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">
        Versand &amp; Lieferung
      </h1>

      <div className="prose prose-gray max-w-none">
        <p>
          Wir liefern in 6 europäische Länder. Kostenloser Versand in der
          Schweiz ab CHF 50. Alle Preise verstehen sich in Schweizer Franken (CHF).
        </p>

        <div className="not-prose mt-8">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="text-left py-3 font-semibold">Land</th>
                <th className="text-left py-3 font-semibold">Versandkosten</th>
                <th className="text-left py-3 font-semibold">Kostenlos ab</th>
                <th className="text-left py-3 font-semibold">Lieferzeit</th>
              </tr>
            </thead>
            <tbody>
              {SUPPORTED_COUNTRIES.map((country) => {
                const config = SHIPPING_CONFIG[country];
                return (
                  <tr key={country} className="border-b border-gray-100">
                    <td className="py-3 font-medium">
                      {COUNTRY_NAMES[country]}
                    </td>
                    <td className="py-3">{formatShippingCost(country)}</td>
                    <td className="py-3">
                      {config.currency} {config.freeAbove}
                    </td>
                    <td className="py-3">{getDeliveryEstimate(country)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <h2 className="mt-8">Versandarten</h2>
        <p>
          Alle Bestellungen werden per Standardversand versendet. Sie erhalten
          eine Versandbestätigung per E-Mail mit Tracking-Informationen.
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
