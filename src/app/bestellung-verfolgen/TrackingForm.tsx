"use client";

import { useState } from "react";

interface TrackingResult {
  id: number;
  number: string | number;
  dateCreated: string;
  status: string;
  statusLabel: string;
  statusTone: "info" | "ok" | "warn" | "err";
  total: string;
  currency: string;
  itemCount: number;
  items: Array<{ name: string; quantity: number; total: string }>;
  shipping: {
    firstName: string;
    lastName: string;
    city: string;
    postcode: string;
    country: string;
  };
}

const TONE_CLASSES: Record<TrackingResult["statusTone"], string> = {
  info: "bg-blue-50 text-blue-700 border-blue-200",
  ok:   "bg-emerald-50 text-emerald-700 border-emerald-200",
  warn: "bg-amber-50 text-amber-800 border-amber-200",
  err:  "bg-red-50 text-red-700 border-red-200",
};

export default function TrackingForm() {
  const [orderId, setOrderId] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<TrackingResult | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setResult(null);
    setLoading(true);
    try {
      const res = await fetch("/api/order-tracking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Etwas ist schiefgelaufen.");
      } else {
        setResult(data);
      }
    } catch {
      setError("Verbindungsfehler. Bitte versuchen Sie es erneut.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <form
        onSubmit={handleSubmit}
        className="bg-white border border-gray-200 rounded-2xl p-6 lg:p-8 shadow-sm"
      >
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="orderId"
              className="block text-sm font-medium text-gray-700 mb-1.5"
            >
              Bestellnummer
            </label>
            <input
              id="orderId"
              type="text"
              inputMode="numeric"
              required
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              placeholder="z. B. 12345"
              className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-100 outline-none text-sm"
            />
          </div>
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1.5"
            >
              E-Mail-Adresse
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ihre@e-mail.ch"
              className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-100 outline-none text-sm"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-5 inline-flex items-center justify-center px-6 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 disabled:cursor-not-allowed text-white font-semibold text-sm transition-colors"
        >
          {loading ? "Wird geprüft…" : "Bestellung verfolgen"}
        </button>

        {error && (
          <p className="mt-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {error}
          </p>
        )}
      </form>

      {result && (
        <div className="bg-white border border-gray-200 rounded-2xl p-6 lg:p-8">
          <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
            <div>
              <p className="text-xs uppercase tracking-wider text-gray-500">
                Bestellnummer
              </p>
              <p className="text-xl font-bold text-gray-900 mt-1">
                #{result.number}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Bestelldatum:{" "}
                {new Date(result.dateCreated).toLocaleDateString("de-CH", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
            <span
              className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold border ${TONE_CLASSES[result.statusTone]}`}
            >
              {result.statusLabel}
            </span>
          </div>

          {result.items.length > 0 && (
            <div className="border-t border-gray-100 pt-5 mb-5">
              <p className="text-xs uppercase tracking-wider text-gray-500 mb-3">
                Artikel ({result.itemCount} Stück)
              </p>
              <ul className="space-y-2">
                {result.items.map((it, i) => (
                  <li
                    key={i}
                    className="flex items-start justify-between text-sm text-gray-700 gap-3"
                  >
                    <span className="leading-snug">
                      <span className="text-gray-400 mr-2">
                        {it.quantity}×
                      </span>
                      {it.name}
                    </span>
                    <span className="font-medium text-gray-900 whitespace-nowrap">
                      {result.currency} {it.total}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {(result.shipping.firstName || result.shipping.city) && (
            <div className="border-t border-gray-100 pt-5">
              <p className="text-xs uppercase tracking-wider text-gray-500 mb-2">
                Lieferadresse
              </p>
              <p className="text-sm text-gray-700 leading-relaxed">
                {result.shipping.firstName} {result.shipping.lastName}
                {(result.shipping.postcode || result.shipping.city) && (
                  <>
                    <br />
                    {result.shipping.postcode} {result.shipping.city}
                  </>
                )}
                {result.shipping.country && (
                  <>
                    <br />
                    {result.shipping.country}
                  </>
                )}
              </p>
            </div>
          )}

          <div className="border-t border-gray-100 mt-5 pt-5 flex flex-wrap items-center justify-between gap-3">
            <span className="text-sm text-gray-500">Gesamtbetrag</span>
            <span className="text-lg font-bold text-gray-900">
              {result.currency} {result.total}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
