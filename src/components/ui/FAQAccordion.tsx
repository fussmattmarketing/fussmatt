"use client";

/**
 * FAQAccordion — accessible disclosure pattern.
 *
 * Uses native <details>/<summary> so it remains SEO-readable + keyboard
 * accessible WITHOUT JS — JS just adds smooth scroll-into-view on first
 * open. Not a class-based accordion (single-open exclusive) because users
 * frequently want to compare two answers; multi-open is more honest.
 */

import { FAQ_ITEMS } from "@/lib/faq-data";

export function FAQAccordion() {
  return (
    <ul className="divide-y divide-gray-200 border-y border-gray-200">
      {FAQ_ITEMS.map((item, idx) => (
        <li key={idx}>
          <details className="group py-5">
            <summary
              className="flex items-start justify-between cursor-pointer list-none gap-4"
            >
              <span className="text-base font-semibold text-gray-900 leading-snug">
                {item.q}
              </span>
              <svg
                className="flex-shrink-0 w-5 h-5 text-gray-400 group-open:rotate-180 transition-transform mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </summary>
            <p className="mt-3 text-sm text-gray-600 leading-relaxed">
              {item.a}
            </p>
          </details>
        </li>
      ))}
    </ul>
  );
}
