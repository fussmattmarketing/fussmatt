import type { Metadata } from "next";
import { SHIPPING_CONFIG, COUNTRY_NAMES, formatShippingCost } from "@/lib/shipping";
import { SUPPORTED_COUNTRIES } from "@/lib/validations";

export const metadata: Metadata = {
  title: "Allgemeine Geschäftsbedingungen",
  description:
    "AGB von FussMatt.com – Allgemeine Geschäftsbedingungen für den Online-Kauf von Auto-Fussmatten. Zahlungsbedingungen, Lieferung und Gewährleistung.",
};

export default function AGBPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">
        Allgemeine Geschäftsbedingungen
      </h1>
      <div className="prose prose-gray max-w-none">
        <h2>1. Geltungsbereich</h2>
        <p>
          Diese Allgemeinen Geschäftsbedingungen gelten für alle Bestellungen
          über den Online-Shop fussmatt.com der Royal Road GmbH, Zürich.
        </p>

        <h2>2. Vertragsschluss</h2>
        <p>
          Die Darstellung der Produkte im Online-Shop stellt kein
          rechtsverbindliches Angebot dar. Erst die Bestellung des Kunden stellt
          ein verbindliches Angebot dar.
        </p>

        <h2>3. Preise und Zahlung</h2>
        <p>
          Alle Preise sind in Schweizer Franken (CHF) angegeben und verstehen
          sich inklusive Mehrwertsteuer. Die Zahlung erfolgt über Stripe
          (Kreditkarte).
        </p>

        <h2>4. Versand</h2>
        <p>Wir liefern in folgende Länder:</p>
        <ul>
          {SUPPORTED_COUNTRIES.map((country) => (
            <li key={country}>
              <strong>{COUNTRY_NAMES[country]}:</strong>{" "}
              {formatShippingCost(country)}, kostenlos ab{" "}
              {SHIPPING_CONFIG[country].currency}{" "}
              {SHIPPING_CONFIG[country].freeAbove}. Lieferzeit:{" "}
              {SHIPPING_CONFIG[country].deliveryDays} Werktage.
            </li>
          ))}
        </ul>

        <h2>5. Widerrufsrecht und Rückgabe</h2>
        <p>
          FussMatt bietet eine <strong>30-Tage-Geld-zurück-Garantie</strong> auf
          alle Produkte. Sie haben das Recht, binnen 30 Tagen ohne Angabe von
          Gründen diesen Vertrag zu widerrufen. Dies geht über das gesetzliche
          Widerrufsrecht von 14 Tagen hinaus. Weitere Informationen finden Sie
          in unserer{" "}
          <a href="/widerruf">Widerrufsbelehrung</a>.
        </p>

        <h2>6. Gewährleistung</h2>
        <p>
          Es gelten die gesetzlichen Gewährleistungsrechte gemäss schweizerischem
          Recht.
        </p>

        <h2>7. Anwendbares Recht</h2>
        <p>
          Es gilt schweizerisches Recht. Gerichtsstand ist Zürich.
        </p>
      </div>
    </div>
  );
}
