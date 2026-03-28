"use client";

import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="bg-gray-950 text-gray-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <Image
              src="/logo.png"
              alt="FussMatt"
              width={140}
              height={40}
              className="h-8 w-auto brightness-0 invert mb-4"
              unoptimized
            />
            <p className="text-sm text-gray-400">
              Premium 3D &amp; 5D Auto-Fußmatten. Maßgefertigt für über 44
              Marken.
            </p>
          </div>

          {/* Shop */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-3">Shop</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/produkte" className="hover:text-amber-400 transition-colors">
                  Alle Produkte
                </Link>
              </li>
              <li>
                <Link href="/kategorie/5d-fussmatten" className="hover:text-amber-400 transition-colors">
                  5D Fußmatten
                </Link>
              </li>
              <li>
                <Link href="/kategorie/3d-fussmatten" className="hover:text-amber-400 transition-colors">
                  3D Fußmatten
                </Link>
              </li>
              <li>
                <Link href="/kategorie/kofferraummatte" className="hover:text-amber-400 transition-colors">
                  Kofferraummatten
                </Link>
              </li>
            </ul>
          </div>

          {/* Information */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-3">
              Information
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/versand" className="hover:text-amber-400 transition-colors">
                  Versand &amp; Lieferung
                </Link>
              </li>
              <li>
                <Link href="/kontakt" className="hover:text-amber-400 transition-colors">
                  Kontakt
                </Link>
              </li>
              <li>
                <Link href="/ratgeber/faq" className="hover:text-amber-400 transition-colors">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-3">
              Rechtliches
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/impressum" className="hover:text-amber-400 transition-colors">
                  Impressum
                </Link>
              </li>
              <li>
                <Link href="/datenschutz" className="hover:text-amber-400 transition-colors">
                  Datenschutz
                </Link>
              </li>
              <li>
                <Link href="/agb" className="hover:text-amber-400 transition-colors">
                  AGB
                </Link>
              </li>
              <li>
                <Link href="/widerruf" className="hover:text-amber-400 transition-colors">
                  Widerrufsrecht
                </Link>
              </li>
              <li>
                <button
                  onClick={() => window.dispatchEvent(new Event("open-cookie-settings"))}
                  className="hover:text-amber-400 transition-colors text-left"
                >
                  Cookie-Einstellungen
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-6 text-center text-xs text-gray-500">
          <p>
            &copy; {new Date().getFullYear()} FussMatt (Royal Road GmbH,
            Zürich). Alle Rechte vorbehalten.
          </p>
        </div>
      </div>
    </footer>
  );
}
