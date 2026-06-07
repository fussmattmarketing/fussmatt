import type { Metadata } from "next";
import Link from "next/link";
import TrackingForm from "./TrackingForm";

export const metadata: Metadata = {
  title: "Bestellung verfolgen",
  description:
    "Verfolgen Sie den Status Ihrer FussMatt-Bestellung. Geben Sie Ihre Bestellnummer und E-Mail-Adresse ein, um Lieferstatus und Details abzurufen.",
  alternates: { canonical: "/bestellung-verfolgen" },
};

export default function BestellungVerfolgenPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
      <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
        Bestellung verfolgen
      </h1>
      <p className="text-gray-600 leading-relaxed mb-8 max-w-2xl">
        Geben Sie Ihre Bestellnummer und die E-Mail-Adresse aus der
        Bestellbestätigung ein, um den aktuellen Status Ihrer Bestellung zu
        sehen.
      </p>

      <TrackingForm />

      <div className="mt-10 rounded-2xl bg-gray-50 border border-gray-100 p-6 lg:p-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">
          Sie finden Ihre Bestellung nicht?
        </h2>
        <p className="text-sm text-gray-600 leading-relaxed mb-4">
          Bestellnummer und E-Mail-Adresse finden Sie in der
          Bestellbestätigungs-E-Mail. Unser Kundenservice hilft Ihnen Mo–Fr,
          09:00–17:00 Uhr gerne weiter.
        </p>
        <div className="flex flex-wrap gap-3">
          <a
            href="tel:+41445052722"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500 text-white text-sm font-semibold hover:bg-amber-600 transition-colors"
          >
            +41 44 505 27 22
          </a>
          <Link
            href="/kontakt"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 text-sm font-semibold hover:bg-gray-50 transition-colors"
          >
            Kontakt aufnehmen
          </Link>
        </div>
      </div>
    </div>
  );
}
