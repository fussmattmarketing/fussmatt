import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(
  price: number | string,
  currency = "CHF"
): string {
  const numericPrice = typeof price === "string" ? parseFloat(price) : price;
  if (isNaN(numericPrice)) return `${currency} 0.00`;
  return new Intl.NumberFormat("de-CH", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(numericPrice);
}

export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "");
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + "...";
}

/**
 * Rewrite WordPress media URLs from fussmatt.com to wp.fussmatt.com.
 */
export function wpMediaUrl(url: string): string {
  if (!url) return url;
  return url
    .replace(
      "https://fussmatt.com/wp-content/",
      "https://wp.fussmatt.com/wp-content/"
    )
    .replace(
      "http://fussmatt.com/wp-content/",
      "https://wp.fussmatt.com/wp-content/"
    );
}

/**
 * Sanitize HTML — proper allowlist-based sanitization using sanitize-html.
 * MUST be used for ALL dangerouslySetInnerHTML content.
 */
import sanitize from "sanitize-html";

export function sanitizeHtml(html: string): string {
  return sanitize(html, {
    allowedTags: [
      "p", "br", "strong", "em", "b", "i", "u",
      "ul", "ol", "li", "a",
      "h1", "h2", "h3", "h4", "h5", "h6",
      "span", "div",
      "table", "thead", "tbody", "tr", "th", "td",
      "img",
    ],
    allowedAttributes: {
      a: ["href", "target", "rel", "class"],
      img: ["src", "alt", "width", "height"],
      span: ["class"],
      div: ["class"],
      td: ["class"],
      tr: ["class"],
      th: ["class"],
      table: ["class"],
    },
    allowedSchemes: ["http", "https", "mailto"],
    disallowedTagsMode: "discard",
  });
}

/**
 * Generate a URL-friendly slug from a string.
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
