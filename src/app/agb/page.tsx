import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Allgemeine Geschäftsbedingungen",
  description:
    "AGB von FussMatt.com – Allgemeine Geschäftsbedingungen für den Online-Kauf von Auto-Fussmatten. Zahlungsbedingungen, Versand und Rückgabe.",
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
          sich inklusive Mehrwertsteuer. Die Zahlung erfolgt über{" "}
          <strong>Stripe</strong> (Kreditkarte und weitere von Stripe
          angebotene Methoden). Alle Transaktionen sind SSL-verschlüsselt
          nach Schweizer Standard.
        </p>

        <h2>4. Versand</h2>
        <p>
          Wir liefern ausschliesslich innerhalb der Schweiz. Der Versand ist
          kostenlos — ohne Mindestbestellwert. Bestellungen, die nach 17:00 Uhr
          eingehen, werden am nächsten Werktag versandt. Details zur Lieferzeit
          finden Sie auf unserer <a href="/versand">Versand-Seite</a>.
        </p>

        <h2>5. Rückgabe</h2>
        <p>
          FussMatt bietet eine <strong>30-Tage-Geld-zurück-Garantie</strong> auf
          alle Produkte. Sie haben 30 Tage Zeit, Ihre Bestellung ohne Angabe von
          Gründen zurückzugeben. Weitere Informationen finden Sie auf unserer{" "}
          <a href="/widerruf">Rückgabe-Seite</a>.
        </p>

        <h2>6. Anwendbares Recht</h2>
        <p>Es gilt schweizerisches Recht. Gerichtsstand ist Zürich.</p>
      </div>
    </div>
  );
}
