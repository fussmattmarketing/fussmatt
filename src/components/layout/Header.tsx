"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCartStore, useCartHydration } from "@/lib/cart-store";

const NAV_CATEGORIES = [
  { label: "5D Fußmatten", href: "/kategorie/5d-fussmatten" },
  { label: "3D Fußmatten", href: "/kategorie/3d-fussmatten" },
  { label: "Kofferraummatten", href: "/kategorie/kofferraummatte" },
  { label: "Universal", href: "/kategorie/universal-fussmatten" },
  { label: "Sets", href: "/kategorie/fussmatten-set" },
];

const NAV_LINKS = [
  { label: "Alle Produkte", href: "/produkte" },
  { label: "Marken", href: "/marke/bmw" },
  { label: "Versand", href: "/versand" },
  { label: "Kontakt", href: "/kontakt" },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const mounted = useCartHydration();
  const totalItems = useCartStore((s) => s.totalItems());

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Close dropdown on Escape
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setDropdownOpen(false);
        setMobileOpen(false);
      }
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
      {/* Skip to content */}
      <a href="#main-content" className="skip-to-content">
        Zum Inhalt springen
      </a>

      {/* Top info bar */}
      <div className="bg-gray-950 text-white text-xs py-1.5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <span>Kostenloser Versand in der Schweiz ab CHF 50</span>
          <div className="hidden sm:flex gap-4">
            <Link href="/versand" className="hover:text-amber-400 transition-colors">
              Versand
            </Link>
            <Link href="/kontakt" className="hover:text-amber-400 transition-colors">
              Kontakt
            </Link>
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <Image
              src="/logo.png"
              alt="FussMatt Logo"
              width={140}
              height={40}
              className="h-8 w-auto"
              priority
            />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-6" aria-label="Hauptnavigation">
            <div ref={dropdownRef} className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                aria-expanded={dropdownOpen}
                aria-haspopup="true"
                className="text-sm font-medium text-gray-700 hover:text-amber-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 rounded px-2 py-1 transition-colors"
              >
                Fußmatten
                <svg
                  className={`inline ml-1 w-4 h-4 transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {dropdownOpen && (
                <div
                  role="menu"
                  className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg py-2 w-56 z-50"
                >
                  {NAV_CATEGORIES.map((cat) => (
                    <Link
                      key={cat.href}
                      href={cat.href}
                      role="menuitem"
                      onClick={() => setDropdownOpen(false)}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-amber-50 hover:text-amber-700 transition-colors"
                    >
                      {cat.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-gray-700 hover:text-amber-600 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right: Cart + Mobile toggle */}
          <div className="flex items-center gap-4">
            <Link
              href="/warenkorb"
              className="relative p-2 text-gray-700 hover:text-amber-600 focus-visible:ring-2 focus-visible:ring-amber-500 rounded-lg transition-colors"
              aria-label="Warenkorb"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {mounted && totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>

            {/* Mobile menu button */}
            <button
              className="lg:hidden p-2 text-gray-700 hover:text-amber-600 focus-visible:ring-2 focus-visible:ring-amber-500 rounded-lg"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={mobileOpen ? "Menü schließen" : "Menü öffnen"}
              aria-expanded={mobileOpen}
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <nav className="lg:hidden bg-white border-t border-gray-200 py-4" aria-label="Mobile Navigation">
          <div className="max-w-7xl mx-auto px-4 space-y-1">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 py-1">
              Kategorien
            </p>
            {NAV_CATEGORIES.map((cat) => (
              <Link
                key={cat.href}
                href={cat.href}
                onClick={() => setMobileOpen(false)}
                className="block px-3 py-2 text-sm text-gray-700 hover:bg-amber-50 hover:text-amber-700 rounded-lg"
              >
                {cat.label}
              </Link>
            ))}
            <hr className="my-2 border-gray-200" />
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="block px-3 py-2 text-sm text-gray-700 hover:bg-amber-50 hover:text-amber-700 rounded-lg"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
