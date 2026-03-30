"use client";

import { useState } from "react";

interface BackInStockNotifyProps {
  sku: string;
  productName: string;
}

export default function BackInStockNotify({
  sku,
  productName,
}: BackInStockNotifyProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;

    setStatus("loading");

    try {
      const res = await fetch("/api/stock-notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), sku, productName }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus("success");
        setMessage(
          data.message ||
            "Sie werden benachrichtigt, sobald das Produkt wieder verfügbar ist."
        );
        setEmail("");
      } else {
        setStatus("error");
        setMessage(data.error || "Ein Fehler ist aufgetreten.");
      }
    } catch {
      setStatus("error");
      setMessage("Netzwerkfehler. Bitte versuchen Sie es erneut.");
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 p-4">
        <div className="flex items-start gap-3">
          <svg
            className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
          <div>
            <p className="text-sm font-medium text-green-800">
              Benachrichtigung aktiviert
            </p>
            <p className="text-sm text-green-700 mt-0.5">{message}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4">
      <div className="flex items-start gap-3 mb-3">
        <svg
          className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        <div>
          <p className="text-sm font-semibold text-gray-900">
            Benachrichtigung bei Verfügbarkeit
          </p>
          <p className="text-xs text-gray-600 mt-0.5">
            Wir informieren Sie per E-Mail, sobald dieser Artikel wieder auf
            Lager ist.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (status === "error") setStatus("idle");
          }}
          placeholder="Ihre E-Mail-Adresse"
          required
          className="flex-1 min-w-0 rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none"
          aria-label="E-Mail-Adresse für Benachrichtigung"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="flex-shrink-0 rounded-lg bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 text-white font-semibold px-4 py-2.5 text-sm transition-colors"
        >
          {status === "loading" ? (
            <svg
              className="w-5 h-5 animate-spin"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
          ) : (
            "Benachrichtigen"
          )}
        </button>
      </form>

      {status === "error" && (
        <p className="text-xs text-red-600 mt-2">{message}</p>
      )}
    </div>
  );
}
