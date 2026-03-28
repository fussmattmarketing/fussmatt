import Link from "next/link";

interface ErrorMessageProps {
  title?: string;
  message?: string;
  showRetry?: boolean;
  onRetry?: () => void;
}

export default function ErrorMessage({
  title = "Ein Fehler ist aufgetreten",
  message = "Bitte versuchen Sie es später erneut.",
  showRetry = true,
  onRetry,
}: ErrorMessageProps) {
  return (
    <div className="text-center py-12 px-4">
      <div className="inline-flex items-center justify-center w-16 h-16 bg-red-50 rounded-full mb-4">
        <svg
          className="w-8 h-8 text-red-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
          />
        </svg>
      </div>
      <h2 className="text-lg font-semibold text-gray-900 mb-2">{title}</h2>
      <p className="text-sm text-gray-500 mb-6">{message}</p>
      <div className="flex justify-center gap-3">
        {showRetry && onRetry && (
          <button
            onClick={onRetry}
            className="px-4 py-2 text-sm bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl transition-colors"
          >
            Erneut versuchen
          </button>
        )}
        <Link
          href="/"
          className="px-4 py-2 text-sm border border-gray-300 text-gray-700 hover:border-amber-400 rounded-xl transition-colors"
        >
          Zur Startseite
        </Link>
      </div>
    </div>
  );
}
