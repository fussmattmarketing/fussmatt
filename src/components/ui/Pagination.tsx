import Link from "next/link";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  baseUrl: string;
}

export default function Pagination({
  currentPage,
  totalPages,
  baseUrl,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages: (number | "...")[] = [];
  for (let i = 1; i <= totalPages; i++) {
    if (
      i === 1 ||
      i === totalPages ||
      (i >= currentPage - 1 && i <= currentPage + 1)
    ) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== "...") {
      pages.push("...");
    }
  }

  function pageUrl(page: number) {
    const separator = baseUrl.includes("?") ? "&" : "?";
    return page === 1 ? baseUrl : `${baseUrl}${separator}seite=${page}`;
  }

  return (
    <nav aria-label="Seitennavigation" className="flex justify-center gap-1.5 mt-8">
      {currentPage > 1 && (
        <Link
          href={pageUrl(currentPage - 1)}
          className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-300 text-gray-600 hover:border-amber-400 hover:text-amber-600 transition-colors"
          aria-label="Vorherige Seite"
        >
          &laquo;
        </Link>
      )}

      {pages.map((page, i) =>
        page === "..." ? (
          <span
            key={`dots-${i}`}
            className="w-10 h-10 flex items-center justify-center text-gray-400"
          >
            ...
          </span>
        ) : (
          <Link
            key={page}
            href={pageUrl(page)}
            className={`w-10 h-10 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
              page === currentPage
                ? "bg-amber-500 text-white"
                : "border border-gray-300 text-gray-600 hover:border-amber-400 hover:text-amber-600"
            }`}
            aria-current={page === currentPage ? "page" : undefined}
          >
            {page}
          </Link>
        )
      )}

      {currentPage < totalPages && (
        <Link
          href={pageUrl(currentPage + 1)}
          className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-300 text-gray-600 hover:border-amber-400 hover:text-amber-600 transition-colors"
          aria-label="Nächste Seite"
        >
          &raquo;
        </Link>
      )}
    </nav>
  );
}
