"use client";

import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-950 text-gray-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Image
              src="/logo.png"
              alt="FussMatt"
              width={160}
              height={48}
              className="h-12 w-auto brightness-0 invert"
              unoptimized
            />
            <p className="mt-4 text-sm leading-relaxed">
              Premium 3D &amp; 5D Auto-Fussmatten aus TPE-Material. Passgenau
              für Ihr Fahrzeug.
            </p>
          </div>

          {/* Shop */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Shop
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/produkte"
                  className="text-sm hover:text-amber-500 transition-colors"
                >
                  Alle Fussmatten
                </Link>
              </li>
              <li>
                <Link
                  href="/kategorie/3d-fussmatten"
                  className="text-sm hover:text-amber-500 transition-colors"
                >
                  3D Fussmatten
                </Link>
              </li>
              <li>
                <Link
                  href="/kategorie/5d-fussmatten"
                  className="text-sm hover:text-amber-500 transition-colors"
                >
                  5D Fussmatten
                </Link>
              </li>
            </ul>
          </div>

          {/* Info */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Information
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/versand"
                  className="text-sm hover:text-amber-500 transition-colors"
                >
                  Versand &amp; Lieferung
                </Link>
              </li>
              <li>
                <Link
                  href="/widerruf"
                  className="text-sm hover:text-amber-500 transition-colors"
                >
                  Rückgabe &amp; Umtausch
                </Link>
              </li>
              <li>
                <Link
                  href="/kontakt"
                  className="text-sm hover:text-amber-500 transition-colors"
                >
                  Kontakt
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Rechtliches
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/impressum"
                  className="text-sm hover:text-amber-500 transition-colors"
                >
                  Impressum
                </Link>
              </li>
              <li>
                <Link
                  href="/datenschutz"
                  className="text-sm hover:text-amber-500 transition-colors"
                >
                  Datenschutz
                </Link>
              </li>
              <li>
                <Link
                  href="/agb"
                  className="text-sm hover:text-amber-500 transition-colors"
                >
                  AGB
                </Link>
              </li>
              <li>
                <Link
                  href="/widerruf"
                  className="text-sm hover:text-amber-500 transition-colors"
                >
                  Widerrufsbelehrung
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <p className="text-xs">
              &copy; {new Date().getFullYear()} FussMatt. Alle Rechte
              vorbehalten.
            </p>
            <button
              onClick={() =>
                window.dispatchEvent(new Event("open-cookie-settings"))
              }
              className="text-xs text-gray-500 hover:text-amber-500 transition-colors underline"
            >
              Cookie-Einstellungen
            </button>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs">Zahlungsmethoden:</span>
            <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
              <span>Stripe</span>
              <span>&middot;</span>
              <span>PayPal</span>
              <span>&middot;</span>
              <span>Klarna</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
