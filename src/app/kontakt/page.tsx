"use client";

import { useState } from "react";

export default function KontaktPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, honeypot: "" }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || "Ein Fehler ist aufgetreten.");
        setStatus("error");
        return;
      }

      setStatus("success");
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch {
      setErrorMsg("Verbindungsfehler. Bitte versuchen Sie es erneut.");
      setStatus("error");
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Kontakt</h1>

      <div className="grid lg:grid-cols-2 gap-12">
        {/* Company Info */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Royal Road GmbH
          </h2>
          <div className="space-y-3 text-gray-600">
            <p>Zürich, Schweiz</p>
            <p>
              E-Mail:{" "}
              <a
                href="mailto:info@fussmatt.com"
                className="text-amber-600 hover:underline"
              >
                info@fussmatt.com
              </a>
            </p>
          </div>

          <div className="mt-8">
            <h3 className="font-semibold text-gray-900 mb-2">
              Häufig gestellte Fragen
            </h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <strong>Lieferzeit:</strong> 3-5 Werktage (Schweiz), 5-7
                Werktage (EU)
              </li>
              <li>
                <strong>Rückgabe:</strong> 14 Tage Widerrufsrecht
              </li>
              <li>
                <strong>Versand:</strong> Kostenlos ab CHF 50 (Schweiz)
              </li>
            </ul>
          </div>
        </div>

        {/* Contact Form */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Nachricht senden
          </h2>

          {status === "success" ? (
            <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
              <svg
                className="w-12 h-12 text-green-500 mx-auto mb-3"
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
              <p className="text-green-800 font-medium">
                Vielen Dank für Ihre Nachricht!
              </p>
              <p className="text-green-600 text-sm mt-1">
                Wir melden uns in Kürze bei Ihnen.
              </p>
              <button
                onClick={() => setStatus("idle")}
                className="mt-4 text-sm text-amber-600 hover:text-amber-700"
              >
                Weitere Nachricht senden
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Honeypot */}
              <input
                type="text"
                name="honeypot"
                tabIndex={-1}
                autoComplete="off"
                className="absolute opacity-0 pointer-events-none h-0 w-0"
              />

              <div>
                <label
                  htmlFor="contact-name"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Name *
                </label>
                <input
                  id="contact-name"
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm focus:border-amber-500 focus:ring-amber-500"
                />
              </div>

              <div>
                <label
                  htmlFor="contact-email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  E-Mail *
                </label>
                <input
                  id="contact-email"
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, email: e.target.value }))
                  }
                  className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm focus:border-amber-500 focus:ring-amber-500"
                />
              </div>

              <div>
                <label
                  htmlFor="contact-subject"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Betreff *
                </label>
                <input
                  id="contact-subject"
                  type="text"
                  required
                  value={form.subject}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, subject: e.target.value }))
                  }
                  className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm focus:border-amber-500 focus:ring-amber-500"
                />
              </div>

              <div>
                <label
                  htmlFor="contact-message"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Nachricht *
                </label>
                <textarea
                  id="contact-message"
                  rows={5}
                  required
                  value={form.message}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, message: e.target.value }))
                  }
                  className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm focus:border-amber-500 focus:ring-amber-500"
                />
              </div>

              {status === "error" && errorMsg && (
                <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg">
                  {errorMsg}
                </div>
              )}

              <button
                type="submit"
                disabled={status === "loading"}
                className="bg-amber-500 hover:bg-amber-600 disabled:bg-gray-300 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
              >
                {status === "loading"
                  ? "Wird gesendet..."
                  : "Nachricht senden"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
