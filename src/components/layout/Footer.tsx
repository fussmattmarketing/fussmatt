"use client";

import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-950 text-gray-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        {/* Logo */}
        <div className="mb-10">
          <Image
            src="/logo.png"
            alt="FussMatt"
            width={160}
            height={48}
            className="h-12 w-auto brightness-0 invert"
            unoptimized
          />
          <p className="mt-3 text-sm leading-relaxed max-w-md">
            Premium 3D &amp; 5D Auto-Fussmatten aus TPE-Material. Passgenau
            für Ihr Fahrzeug.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
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

          {/* Contact — rightmost column */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Kontakt
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Rufen Sie uns an</p>
                <a
                  href="tel:+41445052722"
                  className="text-lg font-semibold text-amber-500 hover:text-amber-400 transition-colors"
                >
                  +41 44 505 27 22
                </a>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">E-Mail</p>
                <a
                  href="mailto:info@fussmatt.com"
                  className="text-sm hover:text-amber-500 transition-colors"
                >
                  info@fussmatt.com
                </a>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Adresse</p>
                <p className="text-sm leading-relaxed">
                  Royal Road GmbH<br />
                  Dübendorfstrasse 4<br />
                  8051 Zürich
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Rechtliche Hinweise + Payment */}
        <div className="mt-12 pt-8 border-t border-gray-800 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h4 className="text-sm font-semibold text-white mb-3">Rechtliche Hinweise</h4>
            <p className="text-xs leading-relaxed text-gray-500">
              Die Markennamen, die auf dieser Website genannt werden, sind urheberrechtlich
              geschützte Namen und dienen lediglich der Produktbeschreibung. Wir sind weder eine
              Werkvertretung noch ähnliches und arbeiten NICHT im Auftrag dieser Automarken.
            </p>
          </div>
          <div className="flex flex-col items-start lg:items-end gap-4">
            {/* Payment methods image — replace src with actual image */}
            <Image
              src="/images/payment-methods.webp"
              alt="Zahlungsmethoden: PostFinance, Visa, Mastercard, PayPal, TWINT, American Express, Rechnung, Apple Pay, Google Pay"
              width={500}
              height={40}
              className="h-10 w-auto"
              unoptimized
            />
            <p className="text-xs text-gray-500">
              &copy; {new Date().getFullYear()}{" "}
              <Link href="/" className="text-amber-500 hover:text-amber-400 transition-colors">
                FussMatt
              </Link>{" "}
              All Rights Reserved.
              <span className="ml-3">
                <button
                  onClick={() =>
                    window.dispatchEvent(new Event("open-cookie-settings"))
                  }
                  className="text-gray-500 hover:text-amber-500 transition-colors underline"
                >
                  Cookie-Einstellungen
                </button>
              </span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
