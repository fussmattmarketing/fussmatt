import Link from "next/link";

/**
 * Shared body for the route-level not-found boundaries under /produkt,
 * /kategorie, /marke and /ratgeber.
 *
 * These segments deliberately do NOT reuse the root not-found.tsx, which
 * redirect()s to the homepage. Inside a cached (ISR) route that redirect
 * can't be a real HTTP redirect — Next.js falls back to a meta-refresh
 * page served with HTTP 200 — so every retired product and every mistyped
 * slug answered 200 and read as a soft 404 to Google. Rendering a plain
 * component here instead lets Next.js return a true 404 status, while the
 * links below keep the visitor from hitting a dead end.
 */
export default function NotFoundPanel({
  title = "Seite nicht gefunden",
  message = "Diese Seite existiert nicht oder ist nicht mehr verfügbar.",
}: {
  title?: string;
  message?: string;
}) {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{title}</h1>
      <p className="mt-3 text-gray-600">{message}</p>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href="/produkte"
          className="inline-flex items-center px-5 py-2.5 rounded-lg bg-amber-600 text-white text-sm font-semibold hover:bg-amber-700 transition-colors"
        >
          Alle Fussmatten ansehen
        </Link>
        <Link
          href="/"
          className="inline-flex items-center px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 text-sm font-semibold hover:bg-gray-50 transition-colors"
        >
          Zur Startseite
        </Link>
      </div>

      <p className="mt-10 text-sm text-gray-500">
        Sie suchen eine passende Matte für Ihr Fahrzeug?{" "}
        <Link href="/kontakt" className="text-amber-600 hover:underline">
          Schreiben Sie uns
        </Link>{" "}
        — wir finden sie für Sie.
      </p>
    </div>
  );
}
