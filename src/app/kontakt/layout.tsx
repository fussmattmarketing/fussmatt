import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kontakt",
  description:
    "Kontaktieren Sie FussMatt – Wir helfen Ihnen gerne bei Fragen zu Auto-Fußmatten, Bestellungen und Versand. Schnelle Antwort garantiert.",
};

export default function KontaktLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
