"use client";

import ErrorMessage from "@/components/ui/ErrorMessage";

export default function MarkeError({ reset }: { reset: () => void }) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <ErrorMessage
        title="Seite konnte nicht geladen werden"
        message="Bitte versuchen Sie es später erneut."
        showRetry
        onRetry={reset}
      />
    </div>
  );
}
