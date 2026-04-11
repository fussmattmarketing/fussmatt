"use client";

import { useState, useEffect } from "react";

interface Heading {
  id: string;
  text: string;
}

export default function TableOfContents({ headings }: { headings: Heading[] }) {
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: "0% 0% -75% 0%", threshold: 0 }
    );

    headings.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [headings]);

  if (headings.length < 2) return null;

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-4">
        Inhaltsverzeichnis
      </p>
      <nav aria-label="Inhaltsverzeichnis">
        <ul className="space-y-2">
          {headings.map(({ id, text }) => (
            <li key={id}>
              <a
                href={`#${id}`}
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
                  setActiveId(id);
                }}
                className={`block text-sm leading-snug transition-all duration-150 border-l-2 pl-3 py-0.5 ${
                  activeId === id
                    ? "text-amber-600 font-medium border-amber-500"
                    : "text-gray-500 hover:text-gray-800 border-transparent hover:border-gray-300"
                }`}
              >
                {text}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
