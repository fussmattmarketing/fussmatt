import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Warenkorb",
  robots: { index: false, follow: false },
};

export default function WarenkorbLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
