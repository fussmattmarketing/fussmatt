import type { Metadata } from "next";
import Script from "next/script";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import CookieConsent from "@/components/ui/CookieConsent";
import { JsonLd, organizationSchema, webSiteSchema } from "@/lib/seo";
import {
  GTM_ID,
  GA_MEASUREMENT_ID,
  getConsentModeDefaultScript,
  getGTMScript,
  getGA4Script,
  getGTMNoscript,
} from "@/lib/gtm";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "FussMatt | Premium 3D & 5D Auto-Fussmatten",
    template: "%s | FussMatt",
  },
  description:
    "Premium 3D & 5D Auto-Fussmatten für über 44 Marken. Massgefertigt, wasserdicht, rutschfest. Kostenloser Versand in der Schweiz ab CHF 50.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://fussmatt.com"
  ),
  alternates: {
    canonical: "./",
  },
  openGraph: {
    type: "website",
    siteName: "FussMatt",
    locale: "de_CH",
  },
  twitter: {
    card: "summary_large_image",
  },
  verification: {
    google: "bHPKZZdbQVW6fcxGn29heI5zJgc2K55lyjvo6Vbi4zA",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de-CH">
      <head>
        <JsonLd data={organizationSchema()} />
        <JsonLd data={webSiteSchema()} />

        {/* Consent Mode v2 defaults — MUST load before GTM */}
        <Script
          id="consent-defaults"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: getConsentModeDefaultScript() }}
        />

        {/* GTM */}
        {GTM_ID && (
          <Script
            id="gtm"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{ __html: getGTMScript(GTM_ID) }}
          />
        )}

        {/* GA4 gtag.js */}
        {GA_MEASUREMENT_ID && (
          <>
            <Script
              id="ga4-gtag"
              strategy="afterInteractive"
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
            />
            <Script
              id="ga4-config"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{ __html: getGA4Script(GA_MEASUREMENT_ID) }}
            />
          </>
        )}
      </head>
      <body className="min-h-screen flex flex-col bg-white text-gray-900 antialiased">
        {/* GTM noscript */}
        {GTM_ID && (
          <noscript
            dangerouslySetInnerHTML={{ __html: getGTMNoscript(GTM_ID) }}
          />
        )}

        <Header />
        <main id="main-content" className="flex-1">
          {children}
        </main>
        <Footer />
        <CookieConsent />
      </body>
    </html>
  );
}
