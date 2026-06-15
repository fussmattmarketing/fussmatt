import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Rückgabe & 30 Tage Geld-zurück-Garantie",
  description:
    "30 Tage Geld-zurück-Garantie auf alle Auto-Fussmatten bei FussMatt.com. Rückgabe ohne Angabe von Gründen — einfach und unkompliziert.",
};

export default function WiderrufPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">
        Rückgabe &amp; 30 Tage Geld-zurück-Garantie
      </h1>
      <div className="prose prose-gray max-w-none">
        <h2>30 Tage Geld-zurück-Garantie</h2>
        <p>
          Bei FussMatt haben Sie <strong>30 Tage</strong> Zeit, Ihre Bestellung
          ohne Angabe von Gründen zurückzugeben. Die Rückgabefrist beträgt
          dreissig Tage ab dem Tag, an dem Sie oder ein von Ihnen benannter
          Dritter, der nicht der Beförderer ist, die Waren in Besitz genommen
          haben. So haben Sie ausreichend Zeit, unsere Produkte in Ihrem
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
          Bitte senden Sie die Ware zeitnah nach Ihrer Rückgabemeldung an uns
          zurück. Die unmittelbaren Kosten der Rücksendung tragen Sie als
          Käufer.
        </p>

        <h2>Erstattung</h2>
        <p>
          Nach Eingang und Prüfung der zurückgesendeten Ware erstatten wir
          Ihnen den vollen Kaufpreis einschliesslich der ursprünglichen
          Lieferkosten. Die Erstattung erfolgt umgehend über dasselbe
          Zahlungsmittel, das Sie bei der ursprünglichen Bestellung verwendet
          haben.
        </p>
      </div>
    </div>
  );
}
