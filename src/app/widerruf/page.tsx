import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Widerrufsbelehrung & Rückgaberecht",
  description:
    "Widerrufsbelehrung für FussMatt.com – 30 Tage Geld-zurück-Garantie auf alle Auto-Fussmatten. Einfach und unkompliziert.",
};

export default function WiderrufPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">
        Widerrufsbelehrung &amp; Rückgaberecht
      </h1>
      <div className="prose prose-gray max-w-none">
        <h2>30 Tage Geld-zurück-Garantie</h2>
        <p>
          Bei FussMatt haben Sie <strong>30 Tage</strong> Zeit, Ihre Bestellung
          ohne Angabe von Gründen zurückzugeben. Die Rückgabefrist beträgt
          dreissig Tage ab dem Tag, an dem Sie oder ein von Ihnen benannter
          Dritter, der nicht der Beförderer ist, die Waren in Besitz genommen
          haben bzw. hat.
        </p>
        <p>
          Damit gehen wir über das gesetzliche Widerrufsrecht von 14 Tagen
          hinaus und geben Ihnen ausreichend Zeit, unsere Produkte in Ihrem
          Fahrzeug zu testen.
        </p>

        <h2>Voraussetzungen für die Rückgabe</h2>
        <ul>
          <li>Die Fussmatten müssen sich in unbenutztem, neuwertigem Zustand befinden.</li>
          <li>Die Originalverpackung muss vorhanden sein.</li>
          <li>
            Normale Prüfung der Passform im Fahrzeug (Einlegen und wieder
            Herausnehmen) gilt nicht als Benutzung.
          </li>
        </ul>

        <h2>So geben Sie Ihre Bestellung zurück</h2>
        <p>
          Um Ihr Rückgaberecht auszuüben, kontaktieren Sie uns per E-Mail oder
          über unser Kontaktformular:
        </p>
        <ul>
          <li><strong>E-Mail:</strong> info@fussmatt.com</li>
          <li><strong>Kontaktformular:</strong> fussmatt.com/kontakt</li>
          <li><strong>Adresse:</strong> Royal Road GmbH, Dübendorfstrasse 4, 8051 Zürich</li>
        </ul>
        <p>
          Teilen Sie uns Ihre Bestellnummer und den Rückgabegrund mit. Wir
          senden Ihnen eine Rücksendebestätigung mit allen weiteren
          Informationen.
        </p>

        <h2>Rücksendung</h2>
        <p>
          Bitte senden Sie die Ware innerhalb von 14 Tagen nach Ihrer
          Rückgabemeldung an uns zurück. Die unmittelbaren Kosten der
          Rücksendung tragen Sie als Käufer.
        </p>

        <h2>Erstattung</h2>
        <p>
          Nach Eingang und Prüfung der zurückgesendeten Ware erstatten wir
          Ihnen den vollen Kaufpreis einschliesslich der ursprünglichen
          Lieferkosten (mit Ausnahme zusätzlicher Kosten, die sich aus einer
          von Ihnen gewählten Expresslieferung ergeben). Die Erstattung erfolgt
          unverzüglich und spätestens binnen vierzehn Tagen über dasselbe
          Zahlungsmittel, das Sie bei der ursprünglichen Bestellung verwendet
          haben.
        </p>

        <h2>Gesetzliches Widerrufsrecht</h2>
        <p>
          Unabhängig von unserer erweiterten 30-Tage-Garantie steht Ihnen das
          gesetzliche Widerrufsrecht von 14 Tagen gemäss schweizerischem Recht
          zu. Die 30-Tage-Garantie von FussMatt geht über dieses gesetzliche
          Minimum hinaus und ersetzt es nicht.
        </p>
      </div>
    </div>
  );
}
