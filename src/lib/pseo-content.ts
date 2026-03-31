/**
 * Programmatic SEO Content Engine
 *
 * Generates unique, SEO-friendly content for pSEO landing pages.
 * Each combination (category × brand, model × year) produces distinct text.
 * Uses hash-based variant selection for content diversity.
 */

export interface PSEOContent {
  h1: string;
  introText: string;
  metaTitle: string;
  metaDescription: string;
  faqItems: { question: string; answer: string }[];
}

// ─── Hash-based variant selector ───────────────────────

function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

function pickVariant<T>(variants: T[], ...keys: string[]): T {
  const hash = simpleHash(keys.join("|"));
  return variants[hash % variants.length];
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

  const countStr = productCount > 0 ? `${productCount} ` : "";

  const introVariants = [
    `Entdecken Sie unsere Premium ${categoryName} speziell für ${brandName} Fahrzeuge. ${catDesc}. Unsere ${countStr}${brandName} Fußmatten werden per 3D-Vermessung millimetergenau gefertigt und bestehen aus hochwertigem TPE-Material — wasserdicht, rutschfest und extrem langlebig.`,
    `${brandName} Fahrer wissen: Nur passgenaue ${categoryName} schützen den Fahrzeugboden wirklich. ${catDesc}. ${countStr ? `Wählen Sie aus ${countStr}Produkten ` : "Wählen Sie "}Ihre perfekte ${brandName} Fussmatte — gefertigt per 3D-Vermessung aus robustem TPE-Material.`,
    `Schützen Sie Ihren ${brandName} mit hochwertigen ${categoryName}. ${catDesc}. Dank 3D-Vermessung passt jede Matte millimetergenau in Ihr Fahrzeug.${countStr ? ` Aktuell ${countStr}Produkte für ${brandName} verfügbar.` : ""} 100% wasserdicht, rutschfest und langlebig.`,
  ];

  return {
    h1: `${categoryName} für ${brandName}`,
    introText: pickVariant(introVariants, categorySlug, brandName).trim(),
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

// ─── Category × Brand × Model Content ──────────────────

export function generateCategoryBrandModelContent(
  categorySlug: string,
  categoryName: string,
  brandName: string,
  modelName: string,
  productCount: number
): PSEOContent {
  const catDesc =
    CATEGORY_DESCRIPTIONS[categorySlug] ||
    `${categoryName} aus hochwertigem TPE-Material`;

  const countText = productCount > 0 ? `Aktuell ${productCount} passende Produkte verfügbar. ` : "";

  const introVariants = [
    `Finden Sie die perfekten ${categoryName} für Ihren ${brandName} ${modelName}. ${catDesc}. ${countText}Jede Matte wird per 3D-Vermessung exakt für den ${brandName} ${modelName} gefertigt — aus hochwertigem TPE-Material, 100% wasserdicht und rutschfest. Schützen Sie den Innenraum Ihres ${modelName} zuverlässig vor Schmutz, Nässe und Verschleiß.`,
    `Ihr ${brandName} ${modelName} verdient den besten Schutz. Unsere ${categoryName} werden per 3D-Vermessung passgenau für den ${modelName} hergestellt. ${catDesc}. ${countText}TPE-Material sorgt für Wasserdichtheit, Rutschfestigkeit und Langlebigkeit bei jedem Wetter.`,
    `${categoryName} speziell für den ${brandName} ${modelName} — millimetergenau, wasserdicht und extrem strapazierfähig. ${catDesc}. ${countText}Unsere Matten bestehen aus Premium-TPE und schützen den Fußraum Ihres ${modelName} zuverlässig vor Schmutz und Feuchtigkeit.`,
  ];

  return {
    h1: `${categoryName} für ${brandName} ${modelName}`,
    introText: pickVariant(introVariants, categorySlug, brandName, modelName),
    metaTitle: `${categoryName} für ${brandName} ${modelName} | Passgenau | FussMatt`,
    metaDescription: `Premium ${categoryName} für ${brandName} ${modelName}. Millimetergenaue Passform per 3D-Vermessung. TPE-Material, wasserdicht. Jetzt bestellen.`,
    faqItems: [
      {
        question: `Welche ${categoryName} passen zum ${brandName} ${modelName}?`,
        answer: `Unsere ${categoryName} werden per 3D-Vermessung exakt für den ${brandName} ${modelName} gefertigt. Sie passen millimetergenau — kein Zuschneiden nötig. Wählen Sie Ihr Baujahr für die perfekte Passform.`,
      },
      {
        question: `Was ist der Unterschied zwischen 3D und 5D Fußmatten für den ${brandName} ${modelName}?`,
        answer: `3D Fußmatten bieten geformte Ränder für zuverlässigen Grundschutz. 5D Premium Fußmatten haben zusätzlich erhöhte Seitenränder, die den gesamten Fußraum Ihres ${brandName} ${modelName} abdecken — ideal für maximalen Schutz bei jedem Wetter.`,
      },
      {
        question: `Sind die ${categoryName} für ${brandName} ${modelName} wasserdicht?`,
        answer: `Ja, alle unsere Fußmatten bestehen aus TPE-Material (Thermoplastisches Elastomer) und sind zu 100% wasserdicht, rutschfest und geruchlos. Das Material bleibt flexibel von -40°C bis +80°C.`,
      },
      {
        question: `Wie viel kosten ${categoryName} für den ${brandName} ${modelName}?`,
        answer: `Unsere ${categoryName} für den ${brandName} ${modelName} beginnen ab CHF 89. Komplette Sets mit Kofferraummatte sind ebenfalls verfügbar. Ab CHF 50 Bestellwert liefern wir schweizweit kostenlos.`,
      },
    ],
  };
}

// ─── Brand Guide (Ratgeber) Content ────────────────────

export interface PSEOGuideContent extends PSEOContent {
  sections: { heading: string; text: string }[];
}

export function generateBrandGuideContent(
  brandName: string,
  models: { name: string; slug: string; productCount: number }[],
  totalProducts: number
): PSEOGuideContent {
  const topModels = models
    .sort((a, b) => b.productCount - a.productCount)
    .slice(0, 5);
  const topModelNames = topModels.map((m) => m.name).join(", ");

  return {
    h1: `Fussmatten für ${brandName}: Ratgeber & Empfehlung`,
    introText: `Alles, was Sie über Fussmatten für ${brandName} Fahrzeuge wissen müssen. Von 3D bis 5D, von Einzelmatten bis zum Komplett-Set — wir erklären, worauf es bei der Wahl der richtigen ${brandName} Fussmatten ankommt.`,
    metaTitle: `Fussmatten für ${brandName} — Ratgeber & Empfehlung | FussMatt`,
    metaDescription: `Welche Fussmatten passen zu ${brandName}? Ratgeber mit Modellübersicht, 3D vs 5D Vergleich und Kaufberatung. Jetzt informieren.`,
    sections: [
      {
        heading: `Warum spezielle Fussmatten für ${brandName}?`,
        text: `Jedes ${brandName} Modell hat einzigartige Fußraum-Maße. Universal-Matten hinterlassen unbedeckte Stellen und rutschen. Unsere ${brandName} Fussmatten werden per 3D-Vermessung exakt an die Konturen jedes Modells angepasst — für lückenlosen Schutz ohne Kompromisse.`,
      },
      {
        heading: "3D vs 5D Fussmatten im Vergleich",
        text: `Beide Varianten bestehen aus hochwertigem TPE-Material. 3D Fussmatten bieten erhöhte Ränder (3-5 cm) für soliden Basisschutz. 5D Premium Matten gehen weiter: Bis zu 8 cm hohe Ränder decken den gesamten Fußraum ab — auch die Seiten. Für ${brandName} Fahrer, die maximalen Schutz wollen, empfehlen wir die 5D Variante.`,
      },
      {
        heading: `Beliebte ${brandName} Modelle`,
        text: `Unsere meistverkauften ${brandName} Fussmatten: ${topModelNames}. Insgesamt bieten wir Fussmatten für ${models.length} verschiedene ${brandName} Modelle an${totalProducts > 0 ? ` — mit ${totalProducts} Produkten im Sortiment` : ""}.`,
      },
      {
        heading: "TPE-Material: Vorteile auf einen Blick",
        text: "Unsere Fussmatten bestehen aus Thermoplastischem Elastomer (TPE): 100% wasserdicht, rutschfest, geruchlos und UV-beständig. Das Material bleibt flexibel von -40°C bis +80°C und ist recycelbar — eine umweltfreundliche Alternative zu PVC oder Gummi.",
      },
      {
        heading: "Bestellung, Versand & Rückgabe",
        text: "Kostenloser Versand in der Schweiz ab CHF 50 Bestellwert. Lieferung in 3-5 Werktagen. 30 Tage Rückgaberecht auf alle Fussmatten. Bezahlung per TWINT, Kreditkarte, PostFinance oder auf Rechnung möglich.",
      },
    ],
    faqItems: [
      {
        question: `Welche Fussmatten passen zu meinem ${brandName}?`,
        answer: `Wählen Sie auf unserer Website Ihr ${brandName} Modell und Baujahr aus. Wir zeigen Ihnen alle passenden Fussmatten — exakt zugeschnitten für Ihr Fahrzeug.`,
      },
      {
        question: `Sind ${brandName} Fussmatten von FussMatt original?`,
        answer: `Unsere Matten sind keine Original-${brandName}-Teile, sondern hochwertige Aftermarket-Produkte. Sie werden per 3D-Vermessung exakt an ${brandName} Modelle angepasst und übertreffen in Material und Passform oft die Originalmatten.`,
      },
      {
        question: `Was kostet ein Fussmatten-Set für ${brandName}?`,
        answer: `Einzelne Fussmatten beginnen ab CHF 89. Komplette Sets (alle Sitzreihen + Kofferraum) sind je nach Modell ab CHF 120 erhältlich. Ab CHF 50 liefern wir schweizweit kostenlos.`,
      },
      {
        question: `Wie reinige ich ${brandName} Fussmatten aus TPE?`,
        answer: `Herausnehmen, mit Wasser abspülen, bei Bedarf milde Seife verwenden. Keine Spezialreiniger nötig. Die Matten trocknen schnell und behalten dauerhaft ihre Form.`,
      },
      {
        question: `Gibt es Fussmatten für ältere ${brandName} Modelle?`,
        answer: `Ja, wir decken sowohl aktuelle als auch ältere ${brandName} Modellgenerationen ab. Prüfen Sie die Verfügbarkeit über unsere Modellauswahl — die meisten Baujahre ab 2005 sind verfügbar.`,
      },
      {
        question: `Kann ich ${brandName} Fussmatten zurückgeben?`,
        answer: `Ja, Sie haben ein 30-tägiges Rückgaberecht. Unbenutzte Fussmatten können in der Originalverpackung kostenlos zurückgesendet werden.`,
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
  const countSuffix = productCount > 0 ? ` Aktuell ${productCount} Produkte verfügbar.` : "";

  const introVariants = [
    `Passgenaue Fußmatten für Ihren ${brandName} ${modelName} (Baujahr ${yearLabel}). Unsere Premium Fußmatten werden per 3D-Vermessung millimetergenau für Ihr Fahrzeug gefertigt.${countSuffix} Hochwertiges TPE-Material sorgt für maximalen Schutz vor Schmutz, Wasser und Verschleiß — bei jedem Wetter.`,
    `Ihr ${brandName} ${modelName} (${yearLabel}) verdient perfekten Bodenschutz. Unsere Fußmatten werden exakt per 3D-Vermessung für dieses Baujahr gefertigt — kein Zuschneiden, keine Lücken.${countSuffix} Wasserdichtes TPE-Material schützt bei Regen, Schnee und Schmutz.`,
    `Maßgefertigte Fußmatten für den ${brandName} ${modelName}, Baujahr ${yearLabel}. Per 3D-Scan an die exakten Konturen Ihres Fahrzeugs angepasst.${countSuffix} Premium TPE-Material: wasserdicht, rutschfest und temperaturbeständig von -40°C bis +80°C.`,
  ];

  return {
    h1: `${brandName} ${modelName} Fußmatten (Baujahr ${yearLabel})`,
    introText: pickVariant(introVariants, brandName, modelName, yearLabel),
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
