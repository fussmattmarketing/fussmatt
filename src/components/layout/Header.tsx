"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCartStore, useCartHydration } from "@/lib/cart-store";

export default function Header() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [fussmattenOpen, setFussmattenOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const mounted = useCartHydration();
  const totalItems = useCartStore((s) => s.totalItems());

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = searchQuery.trim();
    if (q) {
      router.push(`/produkte?suche=${encodeURIComponent(q)}`);
      setSearchQuery("");
      setMobileMenuOpen(false);
    }
  }

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setFussmattenOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Close on Escape
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setFussmattenOpen(false);
        setMobileMenuOpen(false);
      }
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      {/* Skip to content */}
      <a href="#main-content" className="skip-to-content">
        Zum Inhalt springen
      </a>

      {/* Top Bar */}
      <div className="bg-gray-950 text-gray-300 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-9">
          <div className="hidden sm:flex items-center gap-4">
            <Link href="/kontakt" className="hover:text-white transition-colors">
              Kontakt
            </Link>
            <span className="text-gray-600">|</span>
            <Link href="/impressum" className="hover:text-white transition-colors">
              Über uns
            </Link>
          </div>
          <div className="flex-1 text-center">
            <span className="text-amber-400 font-medium">
              Kostenloser Versand &amp; 30 Tage Geld-Zurück-Garantie
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-3">
            <a href="https://instagram.com/fussmatt" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors" aria-label="Instagram">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" /></svg>
            </a>
            <a href="https://facebook.com/fussmatt" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors" aria-label="Facebook">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
            </a>
            <a href="https://tiktok.com/@fussmatt" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors" aria-label="TikTok">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" /></svg>
            </a>
          </div>
        </div>
      </div>

      {/* Main Header: Logo + Search + Cart */}
      <div className="border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16 lg:h-20 gap-4">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <Image
              src="/logo.png"
              alt="FussMatt"
              width={220}
              height={55}
              className="h-12 lg:h-16 w-auto"
              priority
            />
          </Link>

          {/* Search Bar — desktop */}
          <div className="hidden md:flex flex-1 max-w-xl mx-8">
            <form onSubmit={handleSearch} className="w-full relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Produkte suchen..."
                className="w-full pl-4 pr-12 py-2.5 bg-gray-50 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                aria-label="Produkte suchen"
              />
              <button
                type="submit"
                className="absolute right-1 top-1/2 -translate-y-1/2 w-9 h-9 bg-amber-500 hover:bg-amber-600 rounded-full flex items-center justify-center transition-colors"
                aria-label="Suche starten"
              >
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
              </button>
            </form>
          </div>

          {/* Actions: Cart + Mobile Toggle */}
          <div className="flex items-center gap-1">
            <Link
              href="/warenkorb"
              className="relative flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Warenkorb"
            >
              <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
              </svg>
              {mounted && totalItems > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-amber-600 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 transition-colors"
              aria-label={mobileMenuOpen ? "Menü schliessen" : "Menü öffnen"}
              aria-expanded={mobileMenuOpen}
            >
              <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Category Navigation Bar — desktop (separate row, centered, uppercase) */}
      <div className="hidden lg:block bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center justify-center gap-0 h-12 text-sm font-semibold uppercase tracking-wide" aria-label="Kategorien">
            {/* Fussmatten — with dropdown */}
            <div ref={dropdownRef} className="relative">
              <button
                onClick={() => setFussmattenOpen(!fussmattenOpen)}
                aria-expanded={fussmattenOpen}
                aria-haspopup="true"
                className={`flex items-center gap-1 px-4 h-12 uppercase transition-colors focus-visible:ring-2 focus-visible:ring-amber-500 ${
                  fussmattenOpen ? "text-amber-600" : "text-gray-700 hover:text-amber-600"
                }`}
              >
                Fussmatten
                <svg className={`w-3.5 h-3.5 transition-transform ${fussmattenOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </button>

              {fussmattenOpen && (
                <div role="menu" className="absolute top-full left-0 w-64 bg-white border border-gray-200 rounded-xl shadow-xl py-2 z-50">
                  <Link href="/kategorie/5d-fussmatten" role="menuitem" className="block px-5 py-3 text-sm font-medium text-gray-700 hover:bg-amber-50 hover:text-amber-700 transition-colors normal-case" onClick={() => setFussmattenOpen(false)}>
                    5D Premium Fussmatten
                  </Link>
                  <Link href="/kategorie/3d-fussmatten" role="menuitem" className="block px-5 py-3 text-sm font-medium text-gray-700 hover:bg-amber-50 hover:text-amber-700 transition-colors normal-case" onClick={() => setFussmattenOpen(false)}>
                    3D Fussmatten
                  </Link>
                  <div className="my-1 border-t border-gray-100" />
                  <Link href="/kategorie/passend-fuer-lkw-truck-fussmatten" role="menuitem" className="block px-5 py-3 text-sm font-medium text-gray-700 hover:bg-amber-50 hover:text-amber-700 transition-colors normal-case" onClick={() => setFussmattenOpen(false)}>
                    LKW-Truck Fussmatten
                  </Link>
                  <Link href="/kategorie/passend-fuer-kleinbus-pickup-fussmatten" role="menuitem" className="block px-5 py-3 text-sm font-medium text-gray-700 hover:bg-amber-50 hover:text-amber-700 transition-colors normal-case" onClick={() => setFussmattenOpen(false)}>
                    Kleinbus &amp; Pickup Fussmatten
                  </Link>
                  <Link href="/kategorie/universal-fussmatten" role="menuitem" className="block px-5 py-3 text-sm font-medium text-gray-700 hover:bg-amber-50 hover:text-amber-700 transition-colors normal-case" onClick={() => setFussmattenOpen(false)}>
                    Universal Fussmatten
                  </Link>
                  <div className="my-1 border-t border-gray-100" />
                  <Link href="/produkte" role="menuitem" className="block px-5 py-3 text-sm font-semibold text-amber-600 hover:bg-amber-50 transition-colors normal-case" onClick={() => setFussmattenOpen(false)}>
                    Alle Produkte anzeigen &rarr;
                  </Link>
                </div>
              )}
            </div>

            <Link href="/kategorie/kofferraummatte" className="px-4 h-12 flex items-center text-gray-700 hover:text-amber-600 transition-colors">
              Kofferraummatte
            </Link>

            <Link href="/kategorie/fuss-und-kofferraummatten-set" className="px-4 h-12 flex items-center text-gray-700 hover:text-amber-600 transition-colors">
              Fuss- und Kofferraummatten Set
            </Link>

            <Link href="/ratgeber" className="px-4 h-12 flex items-center text-gray-700 hover:text-amber-600 transition-colors">
              Blog
            </Link>
          </nav>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-gray-200" aria-label="Mobile Navigation">
          <div className="px-4 py-4 space-y-1">
            {/* Search — mobile */}
            <form onSubmit={handleSearch} className="mb-4">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Produkte suchen..."
                  className="w-full pl-4 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  aria-label="Produkte suchen"
                />
                <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2" aria-label="Suche starten">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                  </svg>
                </button>
              </div>
            </form>

            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 px-3 pt-2">
              Fussmatten
            </p>
            <Link href="/kategorie/5d-fussmatten" className="block px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg" onClick={() => setMobileMenuOpen(false)}>
              5D Premium Fussmatten
            </Link>
            <Link href="/kategorie/3d-fussmatten" className="block px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg" onClick={() => setMobileMenuOpen(false)}>
              3D Fussmatten
            </Link>
            <Link href="/kategorie/passend-fuer-lkw-truck-fussmatten" className="block px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg" onClick={() => setMobileMenuOpen(false)}>
              LKW-Truck Fussmatten
            </Link>
            <Link href="/kategorie/passend-fuer-kleinbus-pickup-fussmatten" className="block px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg" onClick={() => setMobileMenuOpen(false)}>
              Kleinbus &amp; Pickup Fussmatten
            </Link>
            <Link href="/kategorie/universal-fussmatten" className="block px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg" onClick={() => setMobileMenuOpen(false)}>
              Universal Fussmatten
            </Link>

            <div className="my-2 border-t border-gray-100" />
            <Link href="/kategorie/kofferraummatte" className="block px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg" onClick={() => setMobileMenuOpen(false)}>
              Kofferraummatte
            </Link>
            <Link href="/kategorie/fuss-und-kofferraummatten-set" className="block px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg" onClick={() => setMobileMenuOpen(false)}>
              Fuss- und Kofferraummatten Set
            </Link>

            <div className="my-2 border-t border-gray-100" />
            <Link href="/ratgeber" className="block px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg" onClick={() => setMobileMenuOpen(false)}>
              Blog
            </Link>
            <Link href="/produkte" className="block px-3 py-2.5 text-sm font-semibold text-amber-600 hover:bg-amber-50 rounded-lg" onClick={() => setMobileMenuOpen(false)}>
              Alle Produkte anzeigen &rarr;
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
