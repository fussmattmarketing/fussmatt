/**
 * Programmatic SEO Content Engine
 *
 * Generates unique, SEO-friendly content for pSEO landing pages.
 * Each combination (category × brand, model × year) produces distinct text.
 */

export interface PSEOContent {
  h1: string;
  introText: string;
  metaTitle: string;
  metaDescription: string;
  faqItems: { question: string; answer: string }[];
}

// ─── Category × Brand Content ───────────────────────────

const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  "5d-fussmatten":
    "5D Premium Fußmatten bieten maximalen Schutz durch erhöhte Seitenränder, die den gesamten Fußraum abdecken",
  "3d-fussmatten":
    "3D Fußmatten mit geformten Rändern schützen den Fahrzeugboden zuverlässig vor Schmutz und Feuchtigkeit",
  kofferraummatte:
    "Kofferraummatten schützen Ihren Kofferraum effektiv vor Kratzern, Schmutz und Flüssigkeiten",
  "universal-fussmatten":
    "Universal Fußmatten sind vielseitig einsetzbar und passen sich verschiedenen Fahrzeugmodellen an",
  "fussmatten-set":
    "Komplette Fußmatten-Sets bieten Rundumschutz für alle Sitzreihen Ihres Fahrzeugs",
};

export function generateCategoryBrandContent(
  categorySlug: string,
  categoryName: string,
  brandName: string,
  productCount: number
): PSEOContent {
  const catDesc =
    CATEGORY_DESCRIPTIONS[categorySlug] ||
    `${categoryName} aus hochwertigem TPE-Material`;

  return {
    h1: `${categoryName} für ${brandName}`,
    introText: `Entdecken Sie unsere Premium ${categoryName} speziell für ${brandName} Fahrzeuge. ${catDesc}. Unsere ${productCount > 0 ? productCount : ""} ${brandName} Fußmatten werden per 3D-Vermessung millimetergenau gefertigt und bestehen aus hochwertigem TPE-Material — wasserdicht, rutschfest und extrem langlebig.`.trim(),
    metaTitle: `${categoryName} für ${brandName} | FussMatt`,
    metaDescription: `Premium ${categoryName} für ${brandName}. Maßgefertigt per 3D-Vermessung, wasserdicht und rutschfest. Jetzt bei FussMatt bestellen.`,
    faqItems: [
      {
        question: `Welche ${categoryName} passen zu ${brandName}?`,
        answer: `Unsere ${categoryName} sind millimetergenau für verschiedene ${brandName} Modelle gefertigt. Wählen Sie Ihr spezifisches Modell und Baujahr für die perfekte Passform. Alle Matten werden per 3D-Vermessung hergestellt.`,
      },
      {
        question: `Sind die ${categoryName} für ${brandName} wasserdicht?`,
        answer: `Ja, alle unsere Fußmatten bestehen aus hochwertigem TPE-Material (Thermoplastisches Elastomer) und sind zu 100% wasserdicht. Das Material ist zudem geruchlos, umweltfreundlich und flexibel von -40°C bis +80°C.`,
      },
      {
        question: `Wie pflege ich die ${brandName} Fußmatten?`,
        answer: `Die Pflege ist denkbar einfach: Herausnehmen, mit Wasser abspülen und bei Bedarf mit milder Seife reinigen. Die Matten trocknen schnell an der Luft und behalten ihre Form dauerhaft bei.`,
      },
      {
        question: `Wie lange dauert die Lieferung?`,
        answer: `Die Lieferung erfolgt innerhalb von 3-5 Werktagen in der Schweiz. Nach Deutschland und Österreich 5-7 Werktage. Ab einem Bestellwert von CHF 50 ist der Versand in der Schweiz kostenlos.`,
      },
    ],
  };
}

// ─── Model × Year Content ───────────────────────────────

export function generateModelYearContent(
  brandName: string,
  modelName: string,
  yearLabel: string,
  productCount: number
): PSEOContent {
  return {
    h1: `${brandName} ${modelName} Fußmatten (Baujahr ${yearLabel})`,
    introText: `Passgenaue Fußmatten für Ihren ${brandName} ${modelName} (Baujahr ${yearLabel}). Unsere Premium Fußmatten werden per 3D-Vermessung millimetergenau für Ihr Fahrzeug gefertigt.${productCount > 0 ? ` Aktuell ${productCount} Produkte verfügbar.` : ""} Hochwertiges TPE-Material sorgt für maximalen Schutz vor Schmutz, Wasser und Verschleiß — bei jedem Wetter.`,
    metaTitle: `${brandName} ${modelName} Fußmatten Baujahr ${yearLabel} | FussMatt`,
    metaDescription: `Passgenaue Fußmatten für ${brandName} ${modelName} (${yearLabel}). Premium TPE-Material, wasserdicht, maßgefertigt. Jetzt bei FussMatt bestellen.`,
    faqItems: [
      {
        question: `Welche Fußmatten passen zum ${brandName} ${modelName} (${yearLabel})?`,
        answer: `Unsere Fußmatten sind millimetergenau für den ${brandName} ${modelName} (Baujahr ${yearLabel}) gefertigt. Sie werden per 3D-Vermessung passgenau hergestellt und passen exakt in Ihr Fahrzeug — ohne Zuschneiden.`,
      },
      {
        question: `Sind die Fußmatten für ${brandName} ${modelName} wasserdicht?`,
        answer: `Ja, alle unsere Fußmatten bestehen aus hochwertigem TPE-Material und sind zu 100% wasserdicht, rutschfest und extrem langlebig. Erhöhte Ränder schützen den gesamten Fußraum.`,
      },
      {
        question: `Was ist der Unterschied zwischen 3D und 5D Fußmatten für den ${brandName} ${modelName}?`,
        answer: `3D Fußmatten haben geformte Ränder für grundlegenden Schutz. 5D Premium Fußmatten bieten zusätzlich erhöhte Seitenränder, die den gesamten Fußraum abdecken — ideal für maximalen Schutz in Ihrem ${brandName} ${modelName}.`,
      },
      {
        question: `Kann ich die Fußmatten zurückgeben?`,
        answer: `Ja, Sie haben ein 14-tägiges Widerrufsrecht. Die Fußmatten können in unbenutztem Zustand zurückgeschickt werden. Weitere Details finden Sie in unserer Widerrufsbelehrung.`,
      },
    ],
  };
}
