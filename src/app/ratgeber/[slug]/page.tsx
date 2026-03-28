import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { sanitizeHtml } from "@/lib/utils";

export const revalidate = 3600;

const GUIDES: Record<string, { title: string; content: string }> = {
  faq: {
    title: "Häufig gestellte Fragen",
    content: `
      <h2>Welche Materialien werden verwendet?</h2>
      <p>Unsere Fußmatten bestehen aus hochwertigem TPE (Thermoplastisches Elastomer). Dieses Material ist geruchlos, umweltfreundlich, zu 100% recycelbar und flexibel von -40°C bis +80°C.</p>

      <h2>Wie werden die Fußmatten hergestellt?</h2>
      <p>Jede Fußmatte wird per 3D-Vermessung millimetergenau für das jeweilige Fahrzeugmodell gefertigt. So ist eine perfekte Passform garantiert.</p>

      <h2>Sind die Fußmatten wasserdicht?</h2>
      <p>Ja, alle unsere Fußmatten sind zu 100% wasserdicht. Erhöhte Ränder (3D oder 5D) schützen den Fahrzeugboden zuverlässig vor Schmutz, Wasser und Verschleiß.</p>

      <h2>Was ist der Unterschied zwischen 3D und 5D?</h2>
      <p>3D Fußmatten haben geformte Ränder, die den Boden abdecken. 5D Premium Fußmatten haben zusätzlich erhöhte Seitenränder, die noch mehr Schutz bieten und den gesamten Fußraum abdecken.</p>

      <h2>Wie pflege ich die Fußmatten?</h2>
      <p>Einfach herausnehmen und mit Wasser abspülen. Bei stärkerer Verschmutzung können Sie milde Seife verwenden. Die Matten trocknen schnell an der Luft.</p>
    `,
  },
};

export async function generateStaticParams() {
  return Object.keys(GUIDES).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const guide = GUIDES[slug];
  if (!guide) return { title: "Nicht gefunden" };

  return {
    title: guide.title,
    description: `${guide.title} - FussMatt Ratgeber`,
  };
}

export default async function RatgeberPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const guide = GUIDES[slug];
  if (!guide) notFound();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Breadcrumbs items={[{ label: "Ratgeber", href: "/ratgeber/faq" }, { label: guide.title }]} />

      <h1 className="text-2xl font-bold text-gray-900 mb-8">{guide.title}</h1>
      <div
        className="prose prose-gray max-w-none"
        dangerouslySetInnerHTML={{ __html: sanitizeHtml(guide.content) }}
      />
    </div>
  );
}
