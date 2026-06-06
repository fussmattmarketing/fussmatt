import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Über uns",
  description:
    "FussMatt ist die Marke der Royal Road GmbH mit Sitz in Zürich. Passgenaue 3D- und 5D-Auto-Fussmatten, hochwertiges TPE-Material, Schweizer Service in CHF.",
};

export default function UeberUnsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Über FussMatt</h1>
      <div className="prose prose-gray max-w-none prose-headings:text-gray-900 prose-headings:font-semibold prose-p:my-3 prose-p:leading-relaxed prose-li:my-1.5 prose-strong:text-gray-900">
        <p>
          FussMatt ist die Marke der <strong>Royal Road GmbH</strong> mit Sitz
          in Zürich. Wir haben uns auf passgenaue{" "}
          <strong>3D- und 5D-Auto-Fussmatten</strong> spezialisiert — für
          Fahrerinnen und Fahrer, die ihren Fahrzeuginnenraum schützen möchten
          und dabei keine Kompromisse bei Passform und Qualität eingehen.
        </p>

        <h2>Worauf wir Wert legen</h2>
        <ul>
          <li>
            <strong>Passgenauigkeit:</strong> Unsere Matten werden anhand
            fahrzeugspezifischer Vermessungen für über 40 Marken und deren
            Modelle gefertigt. So sitzt jede Matte dort, wo sie hingehört.
          </li>
          <li>
            <strong>Hochwertiges Material:</strong> Wir setzen auf TPE —
            geruchsarm, langlebig, rutschfest und recyclebar.
          </li>
          <li>
            <strong>Schweizer Service:</strong> Bestellung und Bezahlung in CHF
            (inkl. TWINT und Kauf auf Rechnung), Versand innerhalb der Schweiz
            in 1–3 Werktagen, Kundenservice auf Deutsch.
          </li>
        </ul>

        <h2>Unser Versprechen an Sie</h2>
        <ul>
          <li>30 Tage Geld-zurück-Garantie</li>
          <li>14 Tage gesetzliches Widerrufsrecht</li>
          <li>Kostenloser Versand innerhalb der Schweiz</li>
        </ul>

        <h2>Transparenz</h2>
        <p>
          FussMatt ist kein Vertragspartner und kein autorisierter Händler
          eines Autoherstellers. Wir verwenden Fahrzeugnamen ausschliesslich,
          um die Passform unserer Produkte anzugeben. Was wir versprechen,
          halten wir — und wenn etwas nicht passt, finden wir gemeinsam eine
          Lösung.
        </p>

        <h2>Kontakt</h2>
        <p>
          Royal Road GmbH · Dübendorfstrasse 4 · 8051 Zürich
          <br />
          Telefon{" "}
          <a href="tel:+41445052722" className="text-amber-700 hover:underline">
            +41 44 505 27 22
          </a>{" "}
          ·{" "}
          <a
            href="mailto:info@fussmatt.com"
            className="text-amber-700 hover:underline"
          >
            info@fussmatt.com
          </a>
        </p>

        <p className="mt-8">
          <Link
            href="/kontakt"
            className="inline-block bg-amber-500 text-white font-semibold px-6 py-3 rounded-xl hover:bg-amber-600 transition-colors no-underline"
          >
            Schreiben Sie uns
          </Link>
        </p>
      </div>
    </div>
  );
}
