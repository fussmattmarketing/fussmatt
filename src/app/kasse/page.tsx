"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { useCartStore, useCartHydration } from "@/lib/cart-store";
import { formatPrice } from "@/lib/utils";
import { calculateShipping, COUNTRY_NAMES } from "@/lib/shipping";
import {
  trackBeginCheckout,
  trackAddPaymentInfo,
  savePurchaseSnapshot,
} from "@/lib/analytics";
import {
  SUPPORTED_COUNTRIES,
  addressSchema,
  shippingAddressSchema,
  validatePlz,
} from "@/lib/validations";
import type { SupportedCountry } from "@/lib/validations";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ""
);

const inputBase = "w-full rounded-xl border px-3 py-2.5 text-sm focus:ring-amber-500";
const inputOk = "border-gray-300 focus:border-amber-500";
const inputErr = "border-red-400 focus:border-red-500";

function fieldClass(hasError: boolean) {
  return `${inputBase} ${hasError ? inputErr : inputOk}`;
}

/* ─── Payment Form (inside Elements provider) ─── */
function PaymentForm({
  onSuccess,
  loading,
  setLoading,
  error,
  setError,
}: {
  onSuccess: () => void;
  loading: boolean;
  setLoading: (v: boolean) => void;
  error: string;
  setError: (v: string) => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [paymentReady, setPaymentReady] = useState(false);

  async function handleConfirmPayment() {
    if (!stripe || !elements) return;
    setLoading(true);
    setError("");

    const { error: stripeError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/bestellung-bestaetigung`,
      },
      redirect: "if_required",
    });

    if (stripeError) {
      setError(stripeError.message || "Zahlung fehlgeschlagen.");
      setLoading(false);
    } else {
      // Payment succeeded without redirect
      onSuccess();
    }
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
        <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
        Zahlungsmethode
      </h3>
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <PaymentElement
          onReady={() => setPaymentReady(true)}
          options={{
            layout: "tabs",
          }}
        />
      </div>

      {error && (
        <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg">
          {error}
        </div>
      )}

      <button
        type="button"
        onClick={handleConfirmPayment}
        disabled={loading || !paymentReady || !stripe}
        className="w-full bg-amber-500 hover:bg-amber-600 disabled:bg-gray-300 text-white font-semibold py-3.5 rounded-xl transition-colors text-base"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Zahlung wird verarbeitet...
          </span>
        ) : (
          "Jetzt bezahlen"
        )}
      </button>

      <p className="text-xs text-gray-400 text-center">
        Sichere Zahlung über Stripe. Ihre Daten werden verschlüsselt übertragen.
      </p>
    </div>
  );
}

/* ─── Main Checkout Page ─── */
export default function KassePage() {
  const router = useRouter();
  const mounted = useCartHydration();
  const items = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clearCart);
  const totalPrice = useCartStore((s) => s.totalPrice());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [agbAccepted, setAgbAccepted] = useState(false);
  const [differentShipping, setDifferentShipping] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<number | null>(null);
  const [step, setStep] = useState<"address" | "payment">("address");

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    company: "",
    address_1: "",
    address_2: "",
    city: "",
    state: "",
    postcode: "",
    country: "CH" as SupportedCountry,
    email: "",
    phone: "",
  });

  const [shippingForm, setShippingForm] = useState({
    first_name: "",
    last_name: "",
    company: "",
    address_1: "",
    address_2: "",
    city: "",
    state: "",
    postcode: "",
    country: "CH" as SupportedCountry,
  });

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [shippingErrors, setShippingErrors] = useState<Record<string, string>>({});

  // Shipping based on destination country
  const shippingCountry = differentShipping ? shippingForm.country : form.country;
  const shipping = calculateShipping(shippingCountry, totalPrice);

  function updateField(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setFieldErrors((prev) => ({ ...prev, [field]: "" }));
  }

  function updateShippingField(field: string, value: string) {
    setShippingForm((prev) => ({ ...prev, [field]: value }));
    setShippingErrors((prev) => ({ ...prev, [field]: "" }));
  }

  function validateField(field: string) {
    const result = addressSchema.safeParse(form);
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      const fieldError = (errors as Record<string, string[] | undefined>)[field];
      if (fieldError && fieldError.length > 0) {
        setFieldErrors((prev) => ({ ...prev, [field]: fieldError[0] }));
      }
    }
    if (field === "postcode" && form.postcode && !validatePlz(form.country, form.postcode)) {
      setFieldErrors((prev) => ({
        ...prev,
        postcode: "Postleitzahl passt nicht zum gewählten Land",
      }));
    }
  }

  function validateShippingField(field: string) {
    const result = shippingAddressSchema.safeParse(shippingForm);
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      const fieldError = (errors as Record<string, string[] | undefined>)[field];
      if (fieldError && fieldError.length > 0) {
        setShippingErrors((prev) => ({ ...prev, [field]: fieldError[0] }));
      }
    }
    if (field === "postcode" && shippingForm.postcode && !validatePlz(shippingForm.country, shippingForm.postcode)) {
      setShippingErrors((prev) => ({
        ...prev,
        postcode: "Postleitzahl passt nicht zum gewählten Land",
      }));
    }
  }

  // Step 1: Validate address + create order + get clientSecret
  async function handleAddressSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setFieldErrors({});
    setShippingErrors({});

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
          shipping: differentShipping ? shippingForm : undefined,
          different_shipping: differentShipping,
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
          const flat = data.details.fieldErrors;
          if (flat.billing) {
            const billingErrs: Record<string, string> = {};
            for (const [k, v] of Object.entries(flat.billing)) {
              billingErrs[k] = Array.isArray(v) ? v[0] : String(v);
            }
            setFieldErrors(billingErrs);
          }
          if (flat.shipping) {
            const shipErrs: Record<string, string> = {};
            for (const [k, v] of Object.entries(flat.shipping)) {
              shipErrs[k] = Array.isArray(v) ? v[0] : String(v);
            }
            setShippingErrors(shipErrs);
          }
        }
        setError(data.error || "Ein Fehler ist aufgetreten.");
        return;
      }

      // Save purchase snapshot BEFORE redirect (cart will be cleared on confirmation page)
      savePurchaseSnapshot(
        data.orderId,
        items,
        totalPrice + shipping.cost,
        shipping.cost
      );

      // Got clientSecret — show payment form
      setClientSecret(data.clientSecret);
      setOrderId(data.orderId);
      setStep("payment");

      // Fire add_payment_info — user is now on the payment step
      trackAddPaymentInfo(items);
    } catch {
      setError("Verbindungsfehler. Bitte versuchen Sie es erneut.");
    } finally {
      setLoading(false);
    }
  }

  function handlePaymentSuccess() {
    clearCart();
    router.push(`/bestellung-bestaetigung?order_id=${orderId}`);
  }

  // Scroll to payment when step changes
  useEffect(() => {
    if (step === "payment") {
      document.getElementById("payment-section")?.scrollIntoView({ behavior: "smooth" });
    }
  }, [step]);

  // Fire begin_checkout once on mount when cart has items
  const beginCheckoutFired = useRef(false);
  useEffect(() => {
    if (mounted && !beginCheckoutFired.current && items.length > 0) {
      beginCheckoutFired.current = true;
      trackBeginCheckout(items);
    }
  }, [mounted, items]);

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 sm:mb-8">Kasse</h1>

      <div className="flex flex-col lg:grid lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Mobile: Order Summary (collapsible, shown first) */}
        <div className="lg:hidden">
          <details className="bg-gray-50 rounded-2xl">
            <summary className="flex items-center justify-between p-4 cursor-pointer">
              <span className="font-semibold text-gray-900 flex items-center gap-2">
                <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                Bestellübersicht ({items.length} {items.length === 1 ? "Artikel" : "Artikel"})
              </span>
              <span className="font-semibold text-gray-900">{formatPrice(totalPrice + shipping.cost)}</span>
            </summary>
            <div className="px-4 pb-4 space-y-3 text-sm border-t border-gray-200 pt-3">
              {items.map((item) => (
                <div
                  key={`m-${item.product.id}-${item.variation?.id || 0}`}
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
                <span className="text-gray-600">Versand ({COUNTRY_NAMES[shippingCountry]})</span>
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
          </details>
        </div>

        {/* Left: Forms */}
        <div className="lg:col-span-2 space-y-6">
          {/* Address Form */}
          <form onSubmit={handleAddressSubmit}>
            {/* Honeypot */}
            <input
              type="text"
              name="honeypot"
              tabIndex={-1}
              autoComplete="off"
              className="absolute opacity-0 pointer-events-none h-0 w-0"
            />

            <div className="space-y-4">
              {/* Step indicator */}
              <div className="flex items-center gap-3 mb-6">
                <div className={`flex items-center gap-2 ${step === "address" ? "text-amber-600 font-semibold" : "text-green-600"}`}>
                  <span className={`w-7 h-7 rounded-full flex items-center justify-center text-sm ${step === "address" ? "bg-amber-500 text-white" : "bg-green-500 text-white"}`}>
                    {step === "payment" ? "\u2713" : "1"}
                  </span>
                  <span className="text-sm">Adresse</span>
                </div>
                <div className="w-8 h-px bg-gray-300" />
                <div className={`flex items-center gap-2 ${step === "payment" ? "text-amber-600 font-semibold" : "text-gray-400"}`}>
                  <span className={`w-7 h-7 rounded-full flex items-center justify-center text-sm ${step === "payment" ? "bg-amber-500 text-white" : "bg-gray-200 text-gray-500"}`}>
                    2
                  </span>
                  <span className="text-sm">Zahlung</span>
                </div>
              </div>

              <h2 className="text-lg font-semibold">Rechnungsadresse</h2>

              {/* Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-1">
                    Vorname *
                  </label>
                  <input
                    id="first_name"
                    type="text"
                    required
                    disabled={step === "payment"}
                    value={form.first_name}
                    onChange={(e) => updateField("first_name", e.target.value)}
                    onBlur={() => validateField("first_name")}
                    className={fieldClass(!!fieldErrors.first_name)}
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
                    disabled={step === "payment"}
                    value={form.last_name}
                    onChange={(e) => updateField("last_name", e.target.value)}
                    onBlur={() => validateField("last_name")}
                    className={fieldClass(!!fieldErrors.last_name)}
                  />
                  {fieldErrors.last_name && <p className="text-red-500 text-xs mt-1">{fieldErrors.last_name}</p>}
                </div>
              </div>

              {/* Company */}
              <div>
                <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">
                  Firma (optional)
                </label>
                <input
                  id="company"
                  type="text"
                  disabled={step === "payment"}
                  value={form.company}
                  onChange={(e) => updateField("company", e.target.value)}
                  className={`${inputBase} ${inputOk}`}
                />
              </div>

              {/* Address 1 */}
              <div>
                <label htmlFor="address_1" className="block text-sm font-medium text-gray-700 mb-1">
                  Strasse und Hausnummer *
                </label>
                <input
                  id="address_1"
                  type="text"
                  required
                  disabled={step === "payment"}
                  placeholder="z.B. Bahnhofstrasse 10"
                  value={form.address_1}
                  onChange={(e) => updateField("address_1", e.target.value)}
                  className={fieldClass(!!fieldErrors.address_1)}
                />
                {fieldErrors.address_1 && <p className="text-red-500 text-xs mt-1">{fieldErrors.address_1}</p>}
              </div>

              {/* Address 2 */}
              <div>
                <label htmlFor="address_2" className="block text-sm font-medium text-gray-700 mb-1">
                  Adresszusatz (optional)
                </label>
                <input
                  id="address_2"
                  type="text"
                  disabled={step === "payment"}
                  placeholder="Apartment, Stockwerk, c/o etc."
                  value={form.address_2}
                  onChange={(e) => updateField("address_2", e.target.value)}
                  className={`${inputBase} ${inputOk}`}
                />
              </div>

              {/* PLZ / City / State */}
              <div className="grid grid-cols-1 sm:grid-cols-6 gap-4">
                <div className="sm:col-span-2">
                  <label htmlFor="postcode" className="block text-sm font-medium text-gray-700 mb-1">
                    PLZ *
                  </label>
                  <input
                    id="postcode"
                    type="text"
                    required
                    disabled={step === "payment"}
                    value={form.postcode}
                    onChange={(e) => updateField("postcode", e.target.value)}
                    onBlur={() => validateField("postcode")}
                    className={fieldClass(!!fieldErrors.postcode)}
                  />
                  {fieldErrors.postcode && <p className="text-red-500 text-xs mt-1">{fieldErrors.postcode}</p>}
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                    Stadt *
                  </label>
                  <input
                    id="city"
                    type="text"
                    required
                    disabled={step === "payment"}
                    value={form.city}
                    onChange={(e) => updateField("city", e.target.value)}
                    className={fieldClass(!!fieldErrors.city)}
                  />
                  {fieldErrors.city && <p className="text-red-500 text-xs mt-1">{fieldErrors.city}</p>}
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                    Kanton / Bundesland
                  </label>
                  <input
                    id="state"
                    type="text"
                    disabled={step === "payment"}
                    placeholder={form.country === "CH" ? "z.B. ZH" : ""}
                    value={form.state}
                    onChange={(e) => updateField("state", e.target.value)}
                    className={`${inputBase} ${inputOk}`}
                  />
                </div>
              </div>

              {/* Country */}
              <div>
                <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
                  Land *
                </label>
                <select
                  id="country"
                  disabled={step === "payment"}
                  value={form.country}
                  onChange={(e) => updateField("country", e.target.value)}
                  className={`${inputBase} ${inputOk}`}
                >
                  {SUPPORTED_COUNTRIES.map((c) => (
                    <option key={c} value={c}>{COUNTRY_NAMES[c]}</option>
                  ))}
                </select>
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  E-Mail *
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  disabled={step === "payment"}
                  value={form.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  onBlur={() => validateField("email")}
                  className={fieldClass(!!fieldErrors.email)}
                />
                {fieldErrors.email && <p className="text-red-500 text-xs mt-1">{fieldErrors.email}</p>}
              </div>

              {/* Phone */}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Telefon *
                </label>
                <input
                  id="phone"
                  type="tel"
                  required
                  disabled={step === "payment"}
                  placeholder="+41 79 123 45 67"
                  value={form.phone}
                  onChange={(e) => updateField("phone", e.target.value)}
                  onBlur={() => validateField("phone")}
                  className={fieldClass(!!fieldErrors.phone)}
                />
                {fieldErrors.phone && <p className="text-red-500 text-xs mt-1">{fieldErrors.phone}</p>}
              </div>

              {/* Different Shipping Address Toggle */}
              <div className="border-t border-gray-200 pt-6 mt-6">
                <div className="flex items-center gap-3">
                  <input
                    id="different_shipping"
                    type="checkbox"
                    disabled={step === "payment"}
                    checked={differentShipping}
                    onChange={(e) => setDifferentShipping(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-amber-500 focus:ring-amber-500"
                  />
                  <label htmlFor="different_shipping" className="text-sm font-medium text-gray-700">
                    Abweichende Lieferadresse
                  </label>
                </div>
              </div>

              {/* Shipping Address Form (conditional) */}
              {differentShipping && (
                <div className="border border-gray-200 rounded-2xl p-5 space-y-4 bg-gray-50/50">
                  <h2 className="text-lg font-semibold text-gray-900">Lieferadresse</h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="ship_first_name" className="block text-sm font-medium text-gray-700 mb-1">
                        Vorname *
                      </label>
                      <input
                        id="ship_first_name"
                        type="text"
                        required
                        disabled={step === "payment"}
                        value={shippingForm.first_name}
                        onChange={(e) => updateShippingField("first_name", e.target.value)}
                        onBlur={() => validateShippingField("first_name")}
                        className={fieldClass(!!shippingErrors.first_name)}
                      />
                      {shippingErrors.first_name && <p className="text-red-500 text-xs mt-1">{shippingErrors.first_name}</p>}
                    </div>
                    <div>
                      <label htmlFor="ship_last_name" className="block text-sm font-medium text-gray-700 mb-1">
                        Nachname *
                      </label>
                      <input
                        id="ship_last_name"
                        type="text"
                        required
                        disabled={step === "payment"}
                        value={shippingForm.last_name}
                        onChange={(e) => updateShippingField("last_name", e.target.value)}
                        onBlur={() => validateShippingField("last_name")}
                        className={fieldClass(!!shippingErrors.last_name)}
                      />
                      {shippingErrors.last_name && <p className="text-red-500 text-xs mt-1">{shippingErrors.last_name}</p>}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="ship_company" className="block text-sm font-medium text-gray-700 mb-1">
                      Firma (optional)
                    </label>
                    <input
                      id="ship_company"
                      type="text"
                      disabled={step === "payment"}
                      value={shippingForm.company}
                      onChange={(e) => updateShippingField("company", e.target.value)}
                      className={`${inputBase} ${inputOk}`}
                    />
                  </div>

                  <div>
                    <label htmlFor="ship_address_1" className="block text-sm font-medium text-gray-700 mb-1">
                      Strasse und Hausnummer *
                    </label>
                    <input
                      id="ship_address_1"
                      type="text"
                      required
                      disabled={step === "payment"}
                      value={shippingForm.address_1}
                      onChange={(e) => updateShippingField("address_1", e.target.value)}
                      className={fieldClass(!!shippingErrors.address_1)}
                    />
                    {shippingErrors.address_1 && <p className="text-red-500 text-xs mt-1">{shippingErrors.address_1}</p>}
                  </div>

                  <div>
                    <label htmlFor="ship_address_2" className="block text-sm font-medium text-gray-700 mb-1">
                      Adresszusatz (optional)
                    </label>
                    <input
                      id="ship_address_2"
                      type="text"
                      disabled={step === "payment"}
                      placeholder="Apartment, Stockwerk, c/o etc."
                      value={shippingForm.address_2}
                      onChange={(e) => updateShippingField("address_2", e.target.value)}
                      className={`${inputBase} ${inputOk}`}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-6 gap-4">
                    <div className="sm:col-span-2">
                      <label htmlFor="ship_postcode" className="block text-sm font-medium text-gray-700 mb-1">
                        PLZ *
                      </label>
                      <input
                        id="ship_postcode"
                        type="text"
                        required
                        disabled={step === "payment"}
                        value={shippingForm.postcode}
                        onChange={(e) => updateShippingField("postcode", e.target.value)}
                        onBlur={() => validateShippingField("postcode")}
                        className={fieldClass(!!shippingErrors.postcode)}
                      />
                      {shippingErrors.postcode && <p className="text-red-500 text-xs mt-1">{shippingErrors.postcode}</p>}
                    </div>
                    <div className="sm:col-span-2">
                      <label htmlFor="ship_city" className="block text-sm font-medium text-gray-700 mb-1">
                        Stadt *
                      </label>
                      <input
                        id="ship_city"
                        type="text"
                        required
                        disabled={step === "payment"}
                        value={shippingForm.city}
                        onChange={(e) => updateShippingField("city", e.target.value)}
                        className={fieldClass(!!shippingErrors.city)}
                      />
                      {shippingErrors.city && <p className="text-red-500 text-xs mt-1">{shippingErrors.city}</p>}
                    </div>
                    <div className="sm:col-span-2">
                      <label htmlFor="ship_state" className="block text-sm font-medium text-gray-700 mb-1">
                        Kanton / Bundesland
                      </label>
                      <input
                        id="ship_state"
                        type="text"
                        disabled={step === "payment"}
                        placeholder={shippingForm.country === "CH" ? "z.B. ZH" : ""}
                        value={shippingForm.state}
                        onChange={(e) => updateShippingField("state", e.target.value)}
                        className={`${inputBase} ${inputOk}`}
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="ship_country" className="block text-sm font-medium text-gray-700 mb-1">
                      Land *
                    </label>
                    <select
                      id="ship_country"
                      disabled={step === "payment"}
                      value={shippingForm.country}
                      onChange={(e) => updateShippingField("country", e.target.value)}
                      className={`${inputBase} ${inputOk}`}
                    >
                      {SUPPORTED_COUNTRIES.map((c) => (
                        <option key={c} value={c}>{COUNTRY_NAMES[c]}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* AGB */}
              <div className="flex items-start gap-3 mt-6">
                <input
                  id="agb"
                  type="checkbox"
                  disabled={step === "payment"}
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

              {/* Submit address / show continue button only in step 1 */}
              {step === "address" && (
                <>
                  {error && (
                    <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg">
                      {error}
                    </div>
                  )}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-amber-500 hover:bg-amber-600 disabled:bg-gray-300 text-white font-semibold py-3 rounded-xl transition-colors"
                  >
                    {loading ? "Wird geprüft..." : "Weiter zur Zahlung"}
                  </button>
                </>
              )}
            </div>
          </form>

          {/* Payment Section — appears after address validation */}
          {step === "payment" && clientSecret && (
            <div id="payment-section" className="border-t border-gray-200 pt-6">
              {/* Edit address link */}
              <button
                type="button"
                onClick={() => {
                  setStep("address");
                  setClientSecret(null);
                  setError("");
                }}
                className="text-sm text-amber-600 hover:underline mb-4 inline-block"
              >
                Adresse ändern
              </button>

              <Elements
                stripe={stripePromise}
                options={{
                  clientSecret,
                  appearance: {
                    theme: "stripe",
                    variables: {
                      colorPrimary: "#f59e0b",
                      borderRadius: "12px",
                    },
                  },
                  locale: "de",
                }}
              >
                <PaymentForm
                  onSuccess={handlePaymentSuccess}
                  loading={loading}
                  setLoading={setLoading}
                  error={error}
                  setError={setError}
                />
              </Elements>
            </div>
          )}
        </div>

        {/* Right: Order Summary (desktop only — mobile version is above) */}
        <div className="hidden lg:block bg-gray-50 rounded-2xl p-6 h-fit lg:sticky lg:top-24">
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
              <span className="text-gray-600">Versand ({COUNTRY_NAMES[shippingCountry]})</span>
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

          {/* Payment method info */}
          <div className="mt-4 flex items-center gap-2 text-xs text-gray-500">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span>Kreditkarte &amp; TWINT verfügbar</span>
          </div>
        </div>
      </div>
    </div>
  );
}
