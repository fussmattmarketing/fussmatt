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
 * Sanitize HTML — allowlist-based, works on server and client.
 * Strips all tags/attributes not in the allowlist.
 */
const ALLOWED_TAGS = new Set([
  "p", "br", "strong", "em", "b", "i", "u",
  "ul", "ol", "li", "a",
  "h1", "h2", "h3", "h4", "h5", "h6",
  "span", "div",
  "table", "thead", "tbody", "tr", "th", "td",
  "img",
]);

const ALLOWED_ATTRS = new Set([
  "href", "target", "rel", "class",
  "src", "alt", "width", "height",
]);

export function sanitizeHtml(html: string): string {
  // Remove script/style tags and their content
  let clean = html.replace(/<(script|style|iframe|object|embed|form)\b[^>]*>[\s\S]*?<\/\1>/gi, "");
  // Remove event handlers and javascript: URLs
  clean = clean.replace(/\s+on\w+\s*=\s*["'][^"']*["']/gi, "");
  clean = clean.replace(/javascript\s*:/gi, "");

  // Strip disallowed tags (keep content)
  clean = clean.replace(/<\/?([a-z][a-z0-9]*)\b[^>]*\/?>/gi, (match, tag) => {
    const lowerTag = tag.toLowerCase();
    if (!ALLOWED_TAGS.has(lowerTag)) return "";

    // For allowed tags, strip disallowed attributes
    if (match.startsWith("</")) return `</${lowerTag}>`;

    const selfClosing = match.endsWith("/>");
    const attrString = match.replace(/^<[a-z][a-z0-9]*/i, "").replace(/\/?>$/, "");
    const allowedAttrs: string[] = [];

    const attrRegex = /([a-z][a-z0-9-]*)\s*=\s*(?:"([^"]*)"|'([^']*)'|(\S+))/gi;
    let attrMatch;
    while ((attrMatch = attrRegex.exec(attrString)) !== null) {
      const attrName = attrMatch[1].toLowerCase();
      const attrValue = attrMatch[2] ?? attrMatch[3] ?? attrMatch[4] ?? "";
      if (ALLOWED_ATTRS.has(attrName) && !attrValue.includes("javascript:")) {
        allowedAttrs.push(`${attrName}="${attrValue}"`);
      }
    }

    const attrs = allowedAttrs.length > 0 ? " " + allowedAttrs.join(" ") : "";
    return selfClosing ? `<${lowerTag}${attrs} />` : `<${lowerTag}${attrs}>`;
  });

  return clean;
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
