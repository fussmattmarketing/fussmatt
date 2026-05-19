"use client";

import { useState } from "react";
import { sanitizeHtml } from "@/lib/utils";

interface AccordionItem {
  title: string;
  content: string;
  isHtml?: boolean;
}

interface ProductAccordionProps {
  items: AccordionItem[];
}

export default function ProductAccordion({ items }: ProductAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="divide-y divide-gray-200 border-t border-b border-gray-200">
      {items.map((item, i) => (
        <div key={i}>
          <button
            onClick={() => setOpenIndex(openIndex === i ? null : i)}
            className="w-full flex items-center justify-between py-4 text-left focus-visible:ring-2 focus-visible:ring-amber-500 rounded"
            aria-expanded={openIndex === i}
          >
            <span className="text-sm font-medium text-gray-900">
              {item.title}
            </span>
            <svg
              className={`w-5 h-5 text-gray-500 transition-transform ${
                openIndex === i ? "rotate-180" : ""
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {openIndex === i && (
            <div className="pb-4 text-sm text-gray-600">
              {item.isHtml ? (
                <div
                  className="prose prose-sm max-w-none prose-headings:text-gray-900 prose-headings:font-semibold prose-headings:mt-6 prose-headings:mb-3 prose-p:my-3 prose-p:leading-relaxed prose-strong:text-gray-900 prose-strong:font-semibold prose-ul:my-3 prose-ul:list-disc prose-ul:pl-6 prose-li:my-1 prose-li:marker:text-gray-400 prose-table:my-4 prose-table:w-full prose-table:text-sm prose-th:bg-gray-50 prose-th:px-3 prose-th:py-2 prose-th:text-left prose-th:font-medium prose-th:text-gray-700 prose-td:px-3 prose-td:py-2 prose-td:align-top prose-td:border-b prose-td:border-gray-100"
                  dangerouslySetInnerHTML={{
                    __html: sanitizeHtml(item.content),
                  }}
                />
              ) : (
                <p className="leading-relaxed">{item.content}</p>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
