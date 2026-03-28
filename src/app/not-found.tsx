import Link from "next/link";

export default function NotFound() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
      <h1 className="text-6xl font-bold text-gray-200">404</h1>
      <h2 className="mt-4 text-xl font-semibold text-gray-900">
        Seite nicht gefunden
      </h2>
      <p className="mt-2 text-gray-500">
        Die angeforderte Seite existiert leider nicht.
      </p>
      <div className="mt-6 flex justify-center gap-3">
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
          Alle Produkte
        </Link>
      </div>
    </div>
  );
}
