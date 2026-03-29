import type { Metadata } from "next";
import Link from "next/link";
import ClearCartOnMount from "./ClearCartOnMount";

export const metadata: Metadata = {
  title: "Bestellung bestätigt",
  robots: { index: false },
};

export default async function BestellungBestaetigungPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
      {/* Clear cart after successful payment */}
      <ClearCartOnMount />

      <div className="inline-flex items-center justify-center w-20 h-20 bg-green-50 rounded-full mb-6">
        <svg
          className="w-10 h-10 text-green-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
      </div>

      <h1 className="text-2xl font-bold text-gray-900">
        Vielen Dank für Ihre Bestellung!
      </h1>
      <p className="text-gray-600 mt-3">
        Ihre Bestellung wurde erfolgreich aufgegeben. Sie erhalten in Kürze eine
        Bestätigungs-E-Mail mit allen Details.
      </p>

      {params.session_id && (
        <p className="text-xs text-gray-400 mt-4">
          Referenz: {params.session_id.slice(0, 20)}...
        </p>
      )}

      <div className="mt-8 flex justify-center gap-3">
        <Link
          href="/"
          className="bg-amber-500 hover:bg-amber-600 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
        >
          Zur Startseite
        </Link>
        <Link
          href="/produkte"
          className="border border-gray-300 text-gray-700 hover:border-amber-400 px-6 py-3 rounded-xl transition-colors"
        >
          Weiter einkaufen
        </Link>
      </div>
    </div>
  );
}
