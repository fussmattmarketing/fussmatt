import type { Metadata } from "next";
import ContactForm from "./ContactForm";
import { SocialIcons } from "@/components/ui/SocialIcons";

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

          <div className="space-y-4 text-gray-700">
            <div>
              <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">
                Adresse
              </p>
              <p className="leading-relaxed">
                Royal Road GmbH
                <br />
                Dübendorfstrasse 4
                <br />
                8051 Zürich
                <br />
                Schweiz
              </p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">
                Telefon
              </p>
              <a
                href="tel:+41445052722"
                className="text-lg font-semibold text-amber-600 hover:text-amber-700 transition-colors"
              >
                +41 44 505 27 22
              </a>
              <p className="text-sm text-gray-500 mt-0.5">
                Mo–Fr, 09:00–17:00 Uhr
              </p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">
                E-Mail
              </p>
              <a
                href="mailto:info@fussmatt.com"
                className="text-amber-600 hover:text-amber-700 transition-colors"
              >
                info@fussmatt.com
              </a>
            </div>

            <div>
              <p className="text-xs uppercase tracking-wider text-gray-500 mb-2">
                Folgen Sie uns
              </p>
              <SocialIcons size="md" className="text-gray-600" />
            </div>
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
