import type { Metadata } from "next";
import ContactForm from "./ContactForm";

export const metadata: Metadata = {
  title: "Kontakt",
  description:
    "Kontaktieren Sie FussMatt – Royal Road GmbH, Zürich. Fragen zu Bestellungen, Lieferung oder Produkten? Schreiben Sie uns!",
};

export default function KontaktPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Kontakt</h1>

      <div className="grid lg:grid-cols-2 gap-12">
        {/* Company Info */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Royal Road GmbH
          </h2>
          <div className="space-y-3 text-gray-600">
            <p>Zürich, Schweiz</p>
            <p>
              E-Mail:{" "}
              <a
                href="mailto:info@fussmatt.com"
                className="text-amber-600 hover:underline"
              >
                info@fussmatt.com
              </a>
            </p>
          </div>

          <div className="mt-8">
            <h3 className="font-semibold text-gray-900 mb-2">
              Häufig gestellte Fragen
            </h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <strong>Lieferzeit:</strong> 3-5 Werktage (Schweiz), 5-7
                Werktage (EU)
              </li>
              <li>
                <strong>Rückgabe:</strong> 14 Tage Widerrufsrecht
              </li>
              <li>
                <strong>Versand:</strong> Kostenlos ab CHF 50 (Schweiz)
              </li>
            </ul>
          </div>
        </div>

        {/* Contact Form */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Nachricht senden
          </h2>
          <ContactForm />
        </div>
      </div>
    </div>
  );
}
