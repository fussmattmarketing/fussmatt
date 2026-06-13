import Link from "next/link";

/**
 * Sidebar / inline category navigation — listed in display order with
 * the current slug highlighted. Use on category listings and the
 * /produkte all-list so customers can hop between sections without
 * scrolling back up to the main nav.
 *
 * Order matches the menu in Header.tsx and Footer.tsx so the
 * navigation feels consistent across the site.
 */
const CATEGORIES: { label: string; slug: string }[] = [
  { label: "5D Premium Fussmatten", slug: "5d-fussmatten" },
  { label: "3D Fussmatten", slug: "3d-fussmatten" },
  { label: "Kofferraummatte", slug: "kofferraummatte" },
  {
    label: "Fuss- und Kofferraummatten Set",
    slug: "fuss-und-kofferraummatten-set",
  },
  {
    label: "LKW-Truck Fussmatten",
    slug: "passend-fuer-lkw-truck-fussmatten",
  },
  {
    label: "Kleinbus & Pickup Fussmatten",
    slug: "passend-fuer-kleinbus-pickup-fussmatten",
  },
  { label: "Universal Fussmatten", slug: "universal-fussmatten" },
];

interface CategoryNavProps {
  activeSlug?: string;
  className?: string;
  heading?: string;
}

export default function CategoryNav({
  activeSlug,
  className = "",
  heading = "Kategorien",
}: CategoryNavProps) {
  return (
    <nav
      aria-label="Kategorie-Seitennavigation"
      className={`bg-gray-50 border border-gray-100 rounded-2xl p-5 ${className}`}
    >
      <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">
        {heading}
      </h2>
      <ul className="space-y-1">
        {CATEGORIES.map((c) => {
          const isActive = c.slug === activeSlug;
          return (
            <li key={c.slug}>
              <Link
                href={`/kategorie/${c.slug}`}
                aria-current={isActive ? "page" : undefined}
                className={`block px-3 py-2 text-sm rounded-lg transition-colors ${
                  isActive
                    ? "bg-amber-100 text-amber-700 font-semibold"
                    : "text-gray-700 hover:bg-white hover:text-amber-700"
                }`}
              >
                {c.label}
              </Link>
            </li>
          );
        })}
        <li className="pt-2 mt-2 border-t border-gray-200">
          <Link
            href="/produkte"
            aria-current={activeSlug === "__all__" ? "page" : undefined}
            className={`block px-3 py-2 text-sm rounded-lg transition-colors ${
              activeSlug === "__all__"
                ? "bg-amber-100 text-amber-700 font-semibold"
                : "text-gray-700 hover:bg-white hover:text-amber-700"
            }`}
          >
            Alle Produkte
          </Link>
        </li>
      </ul>
    </nav>
  );
}
