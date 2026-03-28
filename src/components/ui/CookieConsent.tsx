"use client";

import { useState, useEffect } from "react";
import { updateConsentMode } from "@/lib/gtm";

interface ConsentState {
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
  timestamp: number;
}

const STORAGE_KEY = "fussmatt-consent";

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      setVisible(true);
    } else {
      try {
        const state: ConsentState = JSON.parse(stored);
        updateConsentMode(state.analytics, state.marketing);
      } catch {
        setVisible(true);
      }
    }

    // Listen for footer "Cookie-Einstellungen" button
    function handleOpen() {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          const state: ConsentState = JSON.parse(stored);
          setAnalytics(state.analytics);
          setMarketing(state.marketing);
        } catch { /* ignore */ }
      }
      setShowSettings(true);
      setVisible(true);
    }

    window.addEventListener("open-cookie-settings", handleOpen);
    return () => window.removeEventListener("open-cookie-settings", handleOpen);
  }, []);

  // Close on Escape
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape" && visible) {
        saveConsent(false, false);
      }
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [visible]);

  function saveConsent(analyticsVal: boolean, marketingVal: boolean) {
    const state: ConsentState = {
      essential: true,
      analytics: analyticsVal,
      marketing: marketingVal,
      timestamp: Date.now(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    updateConsentMode(analyticsVal, marketingVal);
    setVisible(false);
    setShowSettings(false);
  }

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie-Einstellungen"
      className="fixed bottom-0 left-0 right-0 z-[100] bg-gray-950 text-white p-4 sm:p-6 shadow-2xl"
    >
      <div className="max-w-4xl mx-auto">
        {!showSettings ? (
          <>
            <p className="text-sm text-gray-300 mb-4">
              Wir verwenden Cookies, um Ihnen die bestmögliche Erfahrung zu
              bieten. Statistik- und Marketing-Cookies helfen uns, unsere
              Website zu verbessern.
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setShowSettings(true)}
                className="px-4 py-2 text-sm border border-gray-600 rounded-lg hover:bg-gray-800 transition-colors"
              >
                Einstellungen
              </button>
              <button
                onClick={() => saveConsent(false, false)}
                className="px-4 py-2 text-sm border border-gray-600 rounded-lg hover:bg-gray-800 transition-colors"
              >
                Nur notwendige
              </button>
              <button
                onClick={() => saveConsent(true, true)}
                className="px-4 py-2 text-sm bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-lg transition-colors"
              >
                Alle akzeptieren
              </button>
            </div>
          </>
        ) : (
          <>
            <h3 className="text-base font-semibold mb-4">
              Cookie-Einstellungen
            </h3>

            <div className="space-y-3 mb-4">
              {/* Essential — always on */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-medium">Notwendig</span>
                  <p className="text-xs text-gray-400">
                    Erforderlich für die Grundfunktionen der Website.
                  </p>
                </div>
                <button
                  role="switch"
                  aria-checked="true"
                  disabled
                  className="w-10 h-6 bg-amber-500 rounded-full relative opacity-50 cursor-not-allowed"
                >
                  <span className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" />
                </button>
              </div>

              {/* Analytics */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-medium">Statistiken</span>
                  <p className="text-xs text-gray-400">
                    Helfen uns zu verstehen, wie Besucher die Website nutzen.
                  </p>
                </div>
                <button
                  role="switch"
                  aria-checked={analytics}
                  onClick={() => setAnalytics(!analytics)}
                  className={`w-10 h-6 rounded-full relative transition-colors ${
                    analytics ? "bg-amber-500" : "bg-gray-600"
                  }`}
                >
                  <span
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      analytics ? "right-1" : "left-1"
                    }`}
                  />
                </button>
              </div>

              {/* Marketing */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-medium">Marketing</span>
                  <p className="text-xs text-gray-400">
                    Ermöglichen personalisierte Werbung.
                  </p>
                </div>
                <button
                  role="switch"
                  aria-checked={marketing}
                  onClick={() => setMarketing(!marketing)}
                  className={`w-10 h-6 rounded-full relative transition-colors ${
                    marketing ? "bg-amber-500" : "bg-gray-600"
                  }`}
                >
                  <span
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      marketing ? "right-1" : "left-1"
                    }`}
                  />
                </button>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => saveConsent(analytics, marketing)}
                className="px-4 py-2 text-sm bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-lg transition-colors"
              >
                Auswahl speichern
              </button>
              <button
                onClick={() => saveConsent(true, true)}
                className="px-4 py-2 text-sm border border-gray-600 rounded-lg hover:bg-gray-800 transition-colors"
              >
                Alle akzeptieren
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
