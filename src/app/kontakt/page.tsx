import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kontakt",
  description: "Kontaktieren Sie FussMatt. Royal Road GmbH, Zürich. Wir helfen Ihnen gerne weiter.",
};

export default function KontaktPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Kontakt</h1>

      <div className="grid lg:grid-cols-2 gap-12">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Royal Road GmbH
          </h2>
          <div className="space-y-3 text-gray-600">
            <p>Zürich, Schweiz</p>
            <p>
              E-Mail:{" "}
              <a href="mailto:info@fussmatt.com" className="text-amber-600 hover:underline">
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

        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Nachricht senden
          </h2>
          <form className="space-y-4">
            <div>
              <label htmlFor="contact-name" className="block text-sm font-medium text-gray-700 mb-1">
                Name *
              </label>
              <input
                id="contact-name"
                type="text"
                required
                className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm focus:border-amber-500 focus:ring-amber-500"
              />
            </div>
            <div>
              <label htmlFor="contact-email" className="block text-sm font-medium text-gray-700 mb-1">
                E-Mail *
              </label>
              <input
                id="contact-email"
                type="email"
                required
                className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm focus:border-amber-500 focus:ring-amber-500"
              />
            </div>
            <div>
              <label htmlFor="contact-subject" className="block text-sm font-medium text-gray-700 mb-1">
                Betreff *
              </label>
              <input
                id="contact-subject"
                type="text"
                required
                className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm focus:border-amber-500 focus:ring-amber-500"
              />
            </div>
            <div>
              <label htmlFor="contact-message" className="block text-sm font-medium text-gray-700 mb-1">
                Nachricht *
              </label>
              <textarea
                id="contact-message"
                rows={5}
                required
                className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm focus:border-amber-500 focus:ring-amber-500"
              />
            </div>
            <button
              type="submit"
              className="bg-amber-500 hover:bg-amber-600 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
            >
              Nachricht senden
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
