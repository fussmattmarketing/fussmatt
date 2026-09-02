import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Impressum",
  description:
    "Impressum der Royal Road GmbH (FussMatt) – Angaben gemäss UWG Art. 3 Abs. 1 lit. s, Handelsregister Kanton Zürich, Kontaktdaten und Marken-/Herstellerhinweis.",
};

export default function ImpressumPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Impressum</h1>
      <div className="prose prose-gray max-w-none prose-headings:text-gray-900 prose-headings:font-semibold prose-p:my-3 prose-p:leading-relaxed">
        <p>
          <strong>Angaben gemäss schweizerischem Recht (UWG Art. 3 Abs. 1 lit.&nbsp;s)</strong>
        </p>

        <h2>Unternehmen</h2>
        <p>
          Royal Road GmbH
          <br />
          Dübendorfstrasse 4
          <br />
          8051 Zürich
          <br />
          Schweiz
        </p>

        <h2>Vertretungsberechtigter Geschäftsführer</h2>
        <p>Dipl. Ing. Abdurrahman Uyanik</p>

        <h2>Kontakt</h2>
        <p>
          Telefon: <a href="tel:+41445052722">+41 44 505 27 22</a>
          <br />
          E-Mail: <a href="mailto:info@fussmatt.com">info@fussmatt.com</a>
          <br />
          Web: <a href="https://www.fussmatt.com">www.fussmatt.com</a>
        </p>

        <h2>Handelsregister</h2>
        <p>
          Eingetragen im Handelsregister des Kantons Zürich.
          <br />
          Handelsregister-Nr.: CH-020.4.074.049-1
          <br />
          UID: CHE-473.347.068
        </p>

        <h2>Postadresse</h2>
        <p>
          Royal Road GmbH
          <br />
          Geschäftsstelle
          <br />
          Dübendorfstrasse 4
          <br />
          8051 Zürich
          <br />
          Schweiz
        </p>

        <h2>Verantwortlich für den Inhalt dieser Website</h2>
        <p>Royal Road GmbH, Zürich</p>

        <h2>Anwendbares Recht und Gerichtsstand</h2>
        <p>
          Es gilt ausschliesslich schweizerisches Recht. Ausschliesslicher
          Gerichtsstand ist Zürich, Schweiz.
        </p>

        <h2>Marken- und Herstellerhinweis</h2>
        <p>
          FussMatt ist eine unabhängige Marke der Royal Road GmbH. Wir sind
          kein autorisierter Händler, Vertragspartner oder offizieller
          Vertreter eines Fahrzeugherstellers. Alle genannten Fahrzeugmarken,
          -modelle und -logos dienen ausschliesslich der Angabe der
          Kompatibilität unserer Produkte. Sämtliche Markenrechte verbleiben
          bei den jeweiligen Inhabern.
        </p>

        <h2>Haftung für Inhalte</h2>
        <p>
          Die Inhalte dieser Website werden mit grösstmöglicher Sorgfalt
          erstellt. Für die Richtigkeit, Vollständigkeit und Aktualität der
          Inhalte kann jedoch keine Gewähr übernommen werden.
        </p>

        <h2>Haftungsausschluss für externe Links</h2>
        <p>
          Trotz sorgfältiger inhaltlicher Kontrolle übernehmen wir keine
          Haftung für die Inhalte externer Links. Für den Inhalt der
          verlinkten Seiten sind ausschliesslich deren Betreiber
          verantwortlich.
        </p>
      </div>
    </div>
  );
}
