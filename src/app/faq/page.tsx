import type { Metadata } from "next";
import Link from "next/link";
import { FAQ_ITEMS } from "@/lib/faq-data";
import { FAQAccordion } from "@/components/ui/FAQAccordion";
import { JsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Häufig gestellte Fragen",
  description:
    "Antworten zu Versand, Rückgabe, Zahlungsmethoden und Produktinformationen rund um FussMatt-Auto-Fussmatten in der Schweiz.",
  alternates: {
    canonical: "/faq",
  },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ_ITEMS.map((it) => ({
    "@type": "Question",
    name: it.q,
    acceptedAnswer: {
      "@type": "Answer",
      text: it.a,
    },
  })),
};

export default function FAQPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
      <JsonLd data={faqSchema} />

      <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
        Häufig gestellte Fragen
      </h1>
      <p className="text-gray-600 leading-relaxed mb-10 max-w-2xl">
        Hier finden Sie Antworten auf die häufigsten Fragen rund um Bestellung,
        Versand, Rückgabe und unsere Produkte. Ihre Frage ist nicht dabei?{" "}
        <Link
          href="/kontakt"
          className="text-amber-600 hover:text-amber-700 underline"
        >
          Schreiben Sie uns
        </Link>
        .
      </p>

      <FAQAccordion />

      <div className="mt-12 rounded-2xl bg-gray-50 border border-gray-100 p-6 lg:p-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">
          Weitere Fragen?
        </h2>
        <p className="text-sm text-gray-600 leading-relaxed mb-4">
          Unser Kundenservice ist Mo–Fr von 09:00–17:00 Uhr für Sie erreichbar.
        </p>
        <div className="flex flex-wrap gap-3">
          <a
            href="tel:+41445052722"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500 text-white text-sm font-semibold hover:bg-amber-600 transition-colors"
          >
            +41 44 505 27 22
          </a>
          <a
            href="mailto:info@fussmatt.com"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 text-sm font-semibold hover:bg-gray-50 transition-colors"
          >
            info@fussmatt.com
          </a>
        </div>
      </div>
    </div>
  );
}
