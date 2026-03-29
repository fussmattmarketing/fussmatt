"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCartStore, useCartHydration } from "@/lib/cart-store";
import { formatPrice } from "@/lib/utils";
import { calculateShipping, COUNTRY_NAMES } from "@/lib/shipping";
import { SUPPORTED_COUNTRIES, addressSchema } from "@/lib/validations";
import type { SupportedCountry } from "@/lib/validations";

export default function KassePage() {
  const router = useRouter();
  const mounted = useCartHydration();
  const items = useCartStore((s) => s.items);
  const totalPrice = useCartStore((s) => s.totalPrice());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [agbAccepted, setAgbAccepted] = useState(false);

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    company: "",
    address_1: "",
    address_2: "",
    city: "",
    postcode: "",
    country: "CH" as SupportedCountry,
    email: "",
    phone: "",
  });

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const shipping = calculateShipping(form.country, totalPrice);

  function updateField(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setFieldErrors((prev) => ({ ...prev, [field]: "" }));
  }

  // Real-time onBlur validation per field
  function validateField(field: string) {
    const result = addressSchema.safeParse(form);
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      const fieldError = (errors as Record<string, string[] | undefined>)[field];
      if (fieldError && fieldError.length > 0) {
        setFieldErrors((prev) => ({ ...prev, [field]: fieldError[0] }));
      }
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setFieldErrors({});

    if (!agbAccepted) {
      setError("Bitte akzeptieren Sie die AGB.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          billing: form,
          line_items: items.map((item) => ({
            product_id: item.product.id,
            variation_id: item.variation?.id || 0,
            quantity: item.quantity,
            price: parseFloat(item.variation?.price || item.product.price),
          })),
          agb_accepted: agbAccepted,
          honeypot: "",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.details?.fieldErrors) {
          setFieldErrors(data.details.fieldErrors);
        }
        setError(data.error || "Ein Fehler ist aufgetreten.");
        return;
      }

      if (data.sessionUrl) {
        // clearCart is called on bestellung-bestaetigung page AFTER successful payment
        // NOT here — user may cancel on Stripe and return with empty cart
        router.push(data.sessionUrl);
      }
    } catch {
      setError("Verbindungsfehler. Bitte versuchen Sie es erneut.");
    } finally {
      setLoading(false);
    }
  }

  if (!mounted) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="animate-pulse h-96 bg-gray-100 rounded-2xl" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h1 className="text-2xl font-bold text-gray-900">
          Ihr Warenkorb ist leer
        </h1>
        <Link
          href="/produkte"
          className="inline-block mt-4 text-amber-600 hover:text-amber-700"
        >
          Zurück zum Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Kasse</h1>

      <form onSubmit={handleSubmit}>
        {/* Honeypot - hidden from users */}
        <input
          type="text"
          name="honeypot"
          tabIndex={-1}
          autoComplete="off"
          className="absolute opacity-0 pointer-events-none h-0 w-0"
        />

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Billing Form */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-lg font-semibold">Rechnungsadresse</h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-1">
                  Vorname *
                </label>
                <input
                  id="first_name"
                  type="text"
                  required
                  value={form.first_name}
                  onChange={(e) => updateField("first_name", e.target.value)}
                  onBlur={() => validateField("first_name")}
                  className={`w-full rounded-xl border px-3 py-2.5 text-sm focus:ring-amber-500 ${fieldErrors.first_name ? "border-red-400 focus:border-red-500" : "border-gray-300 focus:border-amber-500"}`}
                />
                {fieldErrors.first_name && <p className="text-red-500 text-xs mt-1">{fieldErrors.first_name}</p>}
              </div>
              <div>
                <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-1">
                  Nachname *
                </label>
                <input
                  id="last_name"
                  type="text"
                  required
                  value={form.last_name}
                  onChange={(e) => updateField("last_name", e.target.value)}
                  onBlur={() => validateField("last_name")}
                  className={`w-full rounded-xl border px-3 py-2.5 text-sm focus:ring-amber-500 ${fieldErrors.last_name ? "border-red-400 focus:border-red-500" : "border-gray-300 focus:border-amber-500"}`}
                />
                {fieldErrors.last_name && <p className="text-red-500 text-xs mt-1">{fieldErrors.last_name}</p>}
              </div>
            </div>

            <div>
              <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">
                Firma (optional)
              </label>
              <input
                id="company"
                type="text"
                value={form.company}
                onChange={(e) => updateField("company", e.target.value)}
                className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm focus:border-amber-500 focus:ring-amber-500"
              />
            </div>

            <div>
              <label htmlFor="address_1" className="block text-sm font-medium text-gray-700 mb-1">
                Adresse *
              </label>
              <input
                id="address_1"
                type="text"
                required
                value={form.address_1}
                onChange={(e) => updateField("address_1", e.target.value)}
                className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm focus:border-amber-500 focus:ring-amber-500"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label htmlFor="postcode" className="block text-sm font-medium text-gray-700 mb-1">
                  PLZ *
                </label>
                <input
                  id="postcode"
                  type="text"
                  required
                  value={form.postcode}
                  onChange={(e) => updateField("postcode", e.target.value)}
                  onBlur={() => validateField("postcode")}
                  className={`w-full rounded-xl border px-3 py-2.5 text-sm focus:ring-amber-500 ${fieldErrors.postcode ? "border-red-400 focus:border-red-500" : "border-gray-300 focus:border-amber-500"}`}
                />
                {fieldErrors.postcode && <p className="text-red-500 text-xs mt-1">{fieldErrors.postcode}</p>}
              </div>
              <div className="col-span-2">
                <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                  Stadt *
                </label>
                <input
                  id="city"
                  type="text"
                  required
                  value={form.city}
                  onChange={(e) => updateField("city", e.target.value)}
                  className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm focus:border-amber-500 focus:ring-amber-500"
                />
              </div>
            </div>

            <div>
              <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
                Land *
              </label>
              <select
                id="country"
                value={form.country}
                onChange={(e) => updateField("country", e.target.value)}
                className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm focus:border-amber-500 focus:ring-amber-500"
              >
                {SUPPORTED_COUNTRIES.map((c) => (
                  <option key={c} value={c}>{COUNTRY_NAMES[c]}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                E-Mail *
              </label>
              <input
                id="email"
                type="email"
                required
                value={form.email}
                onChange={(e) => updateField("email", e.target.value)}
                onBlur={() => validateField("email")}
                className={`w-full rounded-xl border px-3 py-2.5 text-sm focus:ring-amber-500 ${fieldErrors.email ? "border-red-400 focus:border-red-500" : "border-gray-300 focus:border-amber-500"}`}
              />
              {fieldErrors.email && <p className="text-red-500 text-xs mt-1">{fieldErrors.email}</p>}
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Telefon (optional)
              </label>
              <input
                id="phone"
                type="tel"
                value={form.phone}
                onChange={(e) => updateField("phone", e.target.value)}
                className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm focus:border-amber-500 focus:ring-amber-500"
              />
            </div>

            {/* AGB */}
            <div className="flex items-start gap-3 mt-6">
              <input
                id="agb"
                type="checkbox"
                checked={agbAccepted}
                onChange={(e) => setAgbAccepted(e.target.checked)}
                className="mt-1 w-4 h-4 rounded border-gray-300 text-amber-500 focus:ring-amber-500"
              />
              <label htmlFor="agb" className="text-sm text-gray-600">
                Ich habe die{" "}
                <Link href="/agb" className="text-amber-600 hover:underline" target="_blank">
                  AGB
                </Link>{" "}
                und die{" "}
                <Link href="/widerruf" className="text-amber-600 hover:underline" target="_blank">
                  Widerrufsbelehrung
                </Link>{" "}
                gelesen und akzeptiere diese. *
              </label>
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-gray-50 rounded-2xl p-6 h-fit lg:sticky lg:top-24">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Ihre Bestellung
            </h2>
            <div className="space-y-3 text-sm">
              {items.map((item) => (
                <div
                  key={`${item.product.id}-${item.variation?.id || 0}`}
                  className="flex justify-between"
                >
                  <span className="text-gray-600 truncate mr-2">
                    {item.product.name} x{item.quantity}
                  </span>
                  <span className="flex-shrink-0">
                    {formatPrice(
                      parseFloat(item.variation?.price || item.product.price) *
                        item.quantity
                    )}
                  </span>
                </div>
              ))}
              <hr />
              <div className="flex justify-between">
                <span className="text-gray-600">Versand</span>
                <span>
                  {shipping.isFree ? (
                    <span className="text-green-600">Kostenlos</span>
                  ) : (
                    formatPrice(shipping.cost)
                  )}
                </span>
              </div>
              <hr />
              <div className="flex justify-between text-base font-semibold">
                <span>Gesamt</span>
                <span>{formatPrice(totalPrice + shipping.cost)}</span>
              </div>
            </div>

            {error && (
              <div className="mt-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-6 bg-amber-500 hover:bg-amber-600 disabled:bg-gray-300 text-white font-semibold py-3 rounded-xl transition-colors"
            >
              {loading
                ? "Wird verarbeitet..."
                : "Zahlungspflichtig bestellen"}
            </button>

            <p className="text-xs text-gray-400 mt-3 text-center">
              Sie werden zu Stripe weitergeleitet, um die Zahlung abzuschließen.
            </p>
          </div>
        </div>
      </form>
    </div>
  );
}
