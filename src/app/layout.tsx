import type { Metadata } from "next";
import Script from "next/script";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import CookieConsent from "@/components/ui/CookieConsent";
import { JsonLd, organizationSchema, webSiteSchema } from "@/lib/seo";
import {
  GTM_ID,
  getConsentModeDefaultScript,
  getGTMScript,
  getGTMNoscript,
} from "@/lib/gtm";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "FussMatt | Premium 3D & 5D Auto-Fußmatten",
    template: "%s | FussMatt",
  },
  description:
    "Premium 3D & 5D Auto-Fußmatten für über 44 Marken. Maßgefertigt, wasserdicht, rutschfest. Kostenloser Versand in der Schweiz ab CHF 50.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://fussmatt.com"
  ),
  openGraph: {
    type: "website",
    siteName: "FussMatt",
    locale: "de_CH",
  },
  twitter: {
    card: "summary_large_image",
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION || undefined,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
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
