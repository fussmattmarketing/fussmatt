import Link from "next/link";
import type { WCProduct } from "@/types/woocommerce";
import { formatPrice, wpMediaUrl } from "@/lib/utils";

interface ProductCardProps {
  product: WCProduct;
}

export default function ProductCard({ product }: ProductCardProps) {
  const image = product.images[0];
  const imageSrc = image ? wpMediaUrl(image.src) : "/logo.png";
  const category = product.categories.find(
    (c) =>
      c.slug !== "unkategorisiert" && c.slug !== "uncategorized"
  );

  const discount =
    product.on_sale && product.regular_price
      ? Math.round(
          ((parseFloat(product.regular_price) - parseFloat(product.price)) /
            parseFloat(product.regular_price)) *
            100
        )
      : 0;

  return (
    <Link
      href={`/produkt/${product.slug}`}
      className="group block bg-white rounded-2xl border border-gray-200 overflow-hidden hover:border-amber-300 hover:shadow-lg transition-all duration-300"
    >
      {/* Image */}
      <div className="relative aspect-square bg-gray-50 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageSrc}
          alt={image?.alt || product.name}
          loading="lazy"
          className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-500"
        />
        {discount > 0 && (
          <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-lg">
            -{discount}%
          </span>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        {category && (
          <span className="text-xs text-gray-400 uppercase tracking-wider">
            {category.name}
          </span>
        )}
        <h3 className="text-sm font-medium text-gray-900 mt-1 line-clamp-2 group-hover:text-amber-700 transition-colors">
          {product.name}
        </h3>

        <div className="mt-2 flex items-center gap-2">
          <span className="text-lg font-bold text-gray-900">
            {formatPrice(product.price)}
          </span>
          {product.on_sale && product.regular_price && (
            <span className="text-sm text-gray-400 line-through">
              {formatPrice(product.regular_price)}
            </span>
          )}
        </div>

        {/* Stock */}
        <div className="mt-2 flex items-center gap-1.5">
          <span
            className={`w-2 h-2 rounded-full ${
              product.stock_status === "instock"
                ? "bg-green-500"
                : "bg-red-500"
            }`}
          />
          <span className="text-xs text-gray-500">
            {product.stock_status === "instock"
              ? "Auf Lager"
              : "Nicht verfügbar"}
          </span>
        </div>
      </div>
    </Link>
  );
}
