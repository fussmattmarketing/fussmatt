import VehicleFilter from "@/components/product/VehicleFilter";
import type { VehicleHierarchy } from "@/types/woocommerce";

/**
 * Sticky horizontal vehicle-filter bar for product-browsing pages
 * (/produkte, /marke). Sticks just below the site header on scroll so a
 * visitor can re-filter to their car without scrolling back up.
 *
 * Product text search is NOT duplicated here — it already lives in the site
 * header. This bar is the vehicle (Marke/Modell) filter only.
 *
 * Sticky offset matches the Header height: top bar (h-9) + main row
 * (h-16 / lg:h-20) + desktop category nav (lg: h-12) = 100px / lg:164px.
 */
export default function ProductFilterBar({
  hierarchy,
}: {
  hierarchy: VehicleHierarchy;
}) {
  return (
    <div className="sticky top-[100px] lg:top-[164px] z-40 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-center">
        <VehicleFilter hierarchy={hierarchy} variant="horizontal" />
      </div>
    </div>
  );
}
