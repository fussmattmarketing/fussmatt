import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kasse",
  robots: { index: false, follow: false },
};

export default function KasseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
