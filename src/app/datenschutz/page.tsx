import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Datenschutzerklärung",
  description:
    "Datenschutzerklärung von FussMatt.com – Informationen zur Erhebung, Verarbeitung und Nutzung Ihrer personenbezogenen Daten.",
};

export default function DatenschutzPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">
        Datenschutzerklärung
      </h1>
      <div className="prose prose-gray max-w-none">
        <h2>1. Datenschutz auf einen Blick</h2>
        <p>
          Die folgenden Hinweise geben einen einfachen Überblick darüber, was
          mit Ihren personenbezogenen Daten passiert, wenn Sie diese Website
          besuchen.
        </p>

        <h2>2. Verantwortliche Stelle</h2>
        <p>
          <strong>Royal Road GmbH</strong>
          <br />
          Zürich, Schweiz
          <br />
          E-Mail: info@fussmatt.com
        </p>

        <h2>3. Datenerfassung auf dieser Website</h2>
        <h3>Cookies</h3>
        <p>
          Diese Website verwendet Cookies. Notwendige Cookies sind für den
          Betrieb der Website erforderlich. Statistik- und Marketing-Cookies
          werden nur mit Ihrer Einwilligung gesetzt.
        </p>

        <h3>Server-Log-Dateien</h3>
        <p>
          Der Provider dieser Website erhebt und speichert automatisch
          Informationen in Server-Log-Dateien, die Ihr Browser automatisch
          übermittelt.
        </p>

        <h2>4. Zahlungsanbieter</h2>
        <h3>Stripe</h3>
        <p>
          Wir nutzen Stripe für die Zahlungsabwicklung. Stripe erfasst
          Zahlungsdaten gemäß deren Datenschutzrichtlinie.
        </p>

        <h2>5. Ihre Rechte</h2>
        <p>
          Sie haben das Recht auf Auskunft, Berichtigung, Löschung und
          Einschränkung der Verarbeitung Ihrer personenbezogenen Daten. Bitte
          kontaktieren Sie uns unter info@fussmatt.com.
        </p>
      </div>
    </div>
  );
}
