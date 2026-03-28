import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Widerrufsrecht",
};

export default function WiderrufPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">
        Widerrufsbelehrung
      </h1>
      <div className="prose prose-gray max-w-none">
        <h2>Widerrufsrecht</h2>
        <p>
          Sie haben das Recht, binnen vierzehn Tagen ohne Angabe von Gründen
          diesen Vertrag zu widerrufen. Die Widerrufsfrist beträgt vierzehn Tage
          ab dem Tag, an dem Sie oder ein von Ihnen benannter Dritter, der nicht
          der Beförderer ist, die Waren in Besitz genommen haben bzw. hat.
        </p>

        <h2>Ausübung des Widerrufsrechts</h2>
        <p>
          Um Ihr Widerrufsrecht auszuüben, müssen Sie uns (Royal Road GmbH,
          Zürich, info@fussmatt.com) mittels einer eindeutigen Erklärung über
          Ihren Entschluss, diesen Vertrag zu widerrufen, informieren.
        </p>

        <h2>Folgen des Widerrufs</h2>
        <p>
          Wenn Sie diesen Vertrag widerrufen, haben wir Ihnen alle Zahlungen,
          die wir von Ihnen erhalten haben, einschließlich der Lieferkosten
          (mit Ausnahme der zusätzlichen Kosten, die sich daraus ergeben, dass
          Sie eine andere Art der Lieferung als die von uns angebotene,
          günstigste Standardlieferung gewählt haben), unverzüglich und
          spätestens binnen vierzehn Tagen ab dem Tag zurückzuzahlen, an dem die
          Mitteilung über Ihren Widerruf dieses Vertrags bei uns eingegangen
          ist.
        </p>

        <p>
          Sie tragen die unmittelbaren Kosten der Rücksendung der Waren.
        </p>
      </div>
    </div>
  );
}
