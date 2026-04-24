import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Impressum",
  description:
    "Impressum der Royal Road GmbH – Betreiber von FussMatt.com. Handelsregister, Kontaktdaten und rechtliche Angaben.",
};

export default function ImpressumPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Impressum</h1>
      <div className="prose prose-gray max-w-none">
        <h2>Angaben gemäss Art. 3 UWG / Art. 5 E-Commerce-Richtlinie</h2>
        <p>
          <strong>Royal Road GmbH</strong>
          <br />
          Zürich, Schweiz
        </p>
        <h3>Kontakt</h3>
        <p>
          E-Mail: info@fussmatt.com
        </p>
        <h3>Handelsregister</h3>
        <p>
          Eingetragen im Handelsregister des Kantons Zürich
        </p>
        <h3>Umsatzsteuer-Identifikationsnummer</h3>
        <p>
          Gemäss schweizerischem Recht
        </p>
        <h3>Verantwortlich für den Inhalt</h3>
        <p>Royal Road GmbH, Zürich</p>
        <h3>Haftungsausschluss</h3>
        <p>
          Trotz sorgfältiger inhaltlicher Kontrolle übernehmen wir keine Haftung
          für die Inhalte externer Links. Für den Inhalt der verlinkten Seiten
          sind ausschliesslich deren Betreiber verantwortlich.
        </p>
      </div>
    </div>
  );
}
