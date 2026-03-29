"use client";

import { useState } from "react";
import type { WCImage } from "@/types/woocommerce";
import { wpMediaUrl } from "@/lib/utils";

interface ProductGalleryProps {
  images: WCImage[];
  productName: string;
  onSale?: boolean;
}

export default function ProductGallery({
  images,
  productName,
  onSale,
}: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  if (images.length === 0) {
    return (
      <div className="aspect-square bg-gray-100 rounded-2xl flex items-center justify-center">
        <span className="text-gray-400">Kein Bild verfügbar</span>
      </div>
    );
  }

  const mainImage = images[selectedIndex];

  return (
    <div className="space-y-4">
      {/* Main image */}
      <div className="relative aspect-square bg-gray-50 rounded-2xl overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={wpMediaUrl(mainImage.src)}
          alt={mainImage.alt || productName}
          className="w-full h-full object-contain p-4"
        />
        {onSale && (
          <span className="absolute top-4 left-4 bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-lg">
            Sale
          </span>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {images.map((img, i) => (
            <button
              key={img.id}
              onClick={() => setSelectedIndex(i)}
              className={`relative w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden border-2 transition-colors ${
                i === selectedIndex
                  ? "border-amber-500"
                  : "border-gray-200 hover:border-gray-300"
              }`}
              aria-label={`Bild ${i + 1} anzeigen`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={wpMediaUrl(img.src)}
                alt={img.alt || `${productName} ${i + 1}`}
                loading="lazy"
                className="w-full h-full object-contain p-1"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
