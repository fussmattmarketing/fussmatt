import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import TableOfContents from "@/components/ui/TableOfContents";
import { JsonLd, breadcrumbSchema, faqSchema as faqJsonLd } from "@/lib/seo";
import { sanitizeHtml } from "@/lib/utils";
import {
  RATGEBER_ARTICLES,
  getArticleBySlug,
} from "@/lib/ratgeber-data";
import { getWPPostBySlug, getWPPosts } from "@/lib/wordpress";
import { getVehicleHierarchy, getBrandBySlug } from "@/lib/vehicle-data";
import { generateBrandGuideContent } from "@/lib/pseo-content";

export const revalidate = 600; // 10 min

const BRAND_GUIDE_PREFIX = "fussmatten-fuer-";

function parseBrandGuideSlug(slug: string): string | null {
  if (slug.startsWith(BRAND_GUIDE_PREFIX)) {
    return slug.slice(BRAND_GUIDE_PREFIX.length);
  }
  return null;
}

/** Strip HTML tags and decode basic entities */
function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .trim();
}

/** Slugify text for use as heading IDs */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
}

/**
 * Finds all <h2> tags in HTML, injects unique IDs, and returns
 * the modified HTML plus a headings array for the TOC.
 */
function extractAndInjectHeadings(html: string): {
  content: string;
  headings: { id: string; text: string }[];
} {
  const headings: { id: string; text: string }[] = [];
  const slugCount = new Map<string, number>();

  const content = html.replace(
    /<h2([^>]*)>([\s\S]*?)<\/h2>/gi,
    (match, attrs: string, inner: string) => {
      // Already has an id — skip injection but still record
      if (/\bid\s*=/.test(attrs)) {
        const existingId = attrs.match(/\bid\s*=\s*["']([^"']+)["']/)?.[1];
        if (existingId) {
          headings.push({ id: existingId, text: stripHtml(inner) });
        }
        return match;
      }

      const text = stripHtml(inner);
      const base = slugify(text) || `heading-${headings.length + 1}`;
      const count = slugCount.get(base) ?? 0;
      slugCount.set(base, count + 1);
      const id = count === 0 ? base : `${base}-${count}`;

      headings.push({ id, text });
      return `<h2${attrs} id="${id}">${inner}</h2>`;
    }
  );

  return { content, headings };
}

export async function generateStaticParams() {
  const staticParams = RATGEBER_ARTICLES.map((a) => ({ slug: a.slug }));

  const hierarchy = getVehicleHierarchy();
  const brandGuideParams = hierarchy.brands.map((b) => ({
    slug: `${BRAND_GUIDE_PREFIX}${b.slug}`,
  }));

  try {
    const wpPosts = await getWPPosts();
    const wpParams = wpPosts.map((p) => ({ slug: p.slug }));
    return [...staticParams, ...brandGuideParams, ...wpParams];
  } catch {
    return [...staticParams, ...brandGuideParams];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  const brandSlug = parseBrandGuideSlug(slug);
  if (brandSlug) {
    const brand = getBrandBySlug(brandSlug);
    if (brand) {
      const guide = generateBrandGuideContent(brand.name, brand.models, brand.productCount);
      return {
        title: guide.metaTitle.replace(" | FussMatt", ""),
        description: guide.metaDescription,
      };
    }
  }

  const article = getArticleBySlug(slug);
  if (article) {
    return {
      title: article.title,
      description: article.excerpt,
      openGraph: {
        title: `${article.title} | FussMatt Ratgeber`,
        description: article.excerpt,
      },
    };
  }

  const wpPost = await getWPPostBySlug(slug);
  if (wpPost) {
    return {
      title: wpPost.title,
      description: wpPost.excerpt,
      openGraph: {
        title: `${wpPost.title} | FussMatt Blog`,
        description: wpPost.excerpt,
      },
    };
  }

  return { title: "Nicht gefunden" };
}

export default async function RatgeberPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // ─── Brand Guide Route ────────────────────────────────────────────────────
  const brandSlug = parseBrandGuideSlug(slug);
  if (brandSlug) {
    const brand = getBrandBySlug(brandSlug);
    if (!brand) notFound();

    const hierarchy = getVehicleHierarchy();
    const guide = generateBrandGuideContent(
      brand.name,
      brand.models,
      brand.productCount
    );

    const otherBrands = hierarchy.brands
      .filter((b) => b.slug !== brandSlug)
      .slice(0, 10);

    // Build TOC from guide sections
    const brandTocHeadings = guide.sections.map((s, i) => ({
      id: slugify(s.heading) || `section-${i}`,
      text: s.heading,
    }));

    return (
      <>
        <JsonLd
          data={breadcrumbSchema([
            { name: "Startseite", url: "/" },
            { name: "Ratgeber", url: "/ratgeber" },
            { name: guide.h1, url: `/ratgeber/${slug}` },
          ])}
        />
        <JsonLd data={faqJsonLd(guide.faqItems)} />
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "Article",
            headline: guide.h1,
            description: guide.metaDescription,
            publisher: {
              "@type": "Organization",
              name: "FussMatt",
              url: "https://fussmatt.com",
            },
          }}
        />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <Breadcrumbs
            items={[
              { label: "Ratgeber", href: "/ratgeber" },
              { label: `${brand.name} Fussmatten` },
            ]}
          />

          <div className="lg:grid lg:grid-cols-[1fr_260px] lg:gap-14 mt-6">
            {/* Main content */}
            <article>
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 leading-tight mb-4">
                {guide.h1}
              </h1>
              <p className="text-lg text-gray-500 leading-relaxed mb-10">
                {guide.introText}
              </p>

              {guide.sections.map((section, i) => (
                <section
                  key={i}
                  id={brandTocHeadings[i]?.id}
                  className="mb-10 scroll-mt-24"
                >
                  <h2 className="text-xl font-bold text-gray-900 mb-3">
                    {section.heading}
                  </h2>
                  <p className="text-gray-600 leading-relaxed text-base">
                    {section.text}
                  </p>

                  {i === 2 && brand.models.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {brand.models.map((model) => (
                        <Link
                          key={model.slug}
                          href={`/marke/${brandSlug}/${model.slug}`}
                          className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-amber-50 hover:text-amber-700 rounded-lg transition-colors"
                        >
                          {brand.name} {model.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </section>
              ))}

              {/* FAQ */}
              <section className="mt-12 scroll-mt-24" id="faq">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Häufig gestellte Fragen
                </h2>
                <div className="space-y-3">
                  {guide.faqItems.map((faq, i) => (
                    <details
                      key={i}
                      className="group border border-gray-200 rounded-xl"
                    >
                      <summary className="flex items-center justify-between px-5 py-4 cursor-pointer text-sm font-semibold text-gray-900 list-none">
                        {faq.question}
                        <svg
                          className="w-4 h-4 text-gray-400 shrink-0 ml-3 group-open:rotate-180 transition-transform"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </summary>
                      <p className="px-5 pb-4 text-sm text-gray-600 leading-relaxed">
                        {faq.answer}
                      </p>
                    </details>
                  ))}
                </div>
              </section>

              {/* Category CTAs */}
              <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Link
                  href={`/kategorie/5d-fussmatten/${brandSlug}`}
                  className="block p-4 bg-amber-50 hover:bg-amber-100 rounded-xl transition-colors text-center border border-amber-100"
                >
                  <span className="font-semibold text-amber-800 text-sm">
                    5D Fussmatten für {brand.name}
                  </span>
                </Link>
                <Link
                  href={`/kategorie/3d-fussmatten/${brandSlug}`}
                  className="block p-4 bg-amber-50 hover:bg-amber-100 rounded-xl transition-colors text-center border border-amber-100"
                >
                  <span className="font-semibold text-amber-800 text-sm">
                    3D Fussmatten für {brand.name}
                  </span>
                </Link>
              </div>

              {/* Dark CTA */}
              <div className="mt-12 bg-gray-900 rounded-2xl p-8 text-center">
                <p className="text-xs font-semibold uppercase tracking-widest text-amber-400 mb-2">
                  Passgenau & wasserdicht
                </p>
                <h3 className="text-2xl font-bold text-white leading-snug">
                  Finden Sie Ihre Fussmatte für {brand.name}
                </h3>
                <p className="mt-3 text-gray-400 text-sm max-w-md mx-auto">
                  Millimetergenaue Passform für über 44 Automarken. Direkt ab Lager geliefert.
                </p>
                <Link
                  href="/produkte"
                  className="inline-block mt-5 bg-amber-500 hover:bg-amber-400 text-white font-semibold px-7 py-3 rounded-xl transition-colors text-sm"
                >
                  Jetzt Fussmatten entdecken →
                </Link>
              </div>

              {/* Other brand guides */}
              <section className="mt-12 pt-8 border-t border-gray-100">
                <h2 className="text-base font-semibold text-gray-900 mb-4">
                  Ratgeber für andere Marken
                </h2>
                <div className="flex flex-wrap gap-2">
                  {otherBrands.map((b) => (
                    <Link
                      key={b.slug}
                      href={`/ratgeber/fussmatten-fuer-${b.slug}`}
                      className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-amber-50 hover:text-amber-700 rounded-lg transition-colors"
                    >
                      {b.name}
                    </Link>
                  ))}
                </div>
              </section>
            </article>

            {/* Sticky Sidebar */}
            <aside className="hidden lg:block">
              <div className="sticky top-24 space-y-8">
                <TableOfContents headings={[...brandTocHeadings, { id: "faq", text: "Häufig gestellte Fragen" }]} />
                <div className="rounded-xl border border-amber-100 bg-amber-50 p-5">
                  <p className="text-xs font-semibold text-amber-700 uppercase tracking-wider mb-2">
                    Passende Produkte
                  </p>
                  <p className="text-sm text-gray-600 mb-3">
                    Fussmatten passgenau für Ihr {brand.name} Fahrzeug.
                  </p>
                  <Link
                    href={`/kategorie/5d-fussmatten/${brandSlug}`}
                    className="block text-center bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold py-2.5 px-4 rounded-lg transition-colors"
                  >
                    Jetzt kaufen
                  </Link>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </>
    );
  }

  // ─── Static Article / WordPress Post ─────────────────────────────────────
  const staticArticle = getArticleBySlug(slug);
  const wpPost = !staticArticle ? await getWPPostBySlug(slug) : null;
  if (!staticArticle && !wpPost) notFound();

  const title = staticArticle?.title || wpPost!.title;
  const excerpt = staticArticle?.excerpt || wpPost!.excerpt;
  const rawContent = staticArticle?.content || wpPost!.content;
  const date = staticArticle?.date || wpPost!.date;
  const category = staticArticle?.category || wpPost!.category;
  const readTime = staticArticle?.readTime || wpPost!.readTime;
  const faq = staticArticle?.faq || [];

  const related = RATGEBER_ARTICLES.filter((a) => a.slug !== slug).slice(0, 2);

  // Extract h2 headings and inject IDs for TOC
  const { content, headings } = extractAndInjectHeadings(sanitizeHtml(rawContent));

  const faqSchemaData =
    faq.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faq.map((f) => ({
            "@type": "Question",
            name: f.question,
            acceptedAnswer: { "@type": "Answer", text: f.answer },
          })),
        }
      : null;

  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: "Startseite", url: "/" },
          { name: "Ratgeber", url: "/ratgeber" },
          { name: title, url: `/ratgeber/${slug}` },
        ])}
      />
      {faqSchemaData && <JsonLd data={faqSchemaData} />}

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Breadcrumbs
          items={[
            { label: "Ratgeber", href: "/ratgeber" },
            { label: title },
          ]}
        />

        <div className="lg:grid lg:grid-cols-[1fr_260px] lg:gap-14 mt-6">
          {/* Main content */}
          <article>
            {/* Article Header */}
            <header className="mb-10">
              <div className="flex flex-wrap items-center gap-3 text-sm text-gray-400 mb-4">
                <span className="bg-amber-100 text-amber-700 text-xs font-semibold px-3 py-1 rounded-full">
                  {category}
                </span>
                <time dateTime={date}>
                  {new Date(date).toLocaleDateString("de-CH", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </time>
                <span aria-hidden="true">·</span>
                <span>{readTime} Lesezeit</span>
              </div>

              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
                {title}
              </h1>
              {excerpt && (
                <p className="mt-4 text-lg text-gray-500 leading-relaxed">
                  {excerpt}
                </p>
              )}

              <div className="mt-6 border-t border-gray-100" />
            </header>

            {/* Article Content */}
            <div
              className={[
                "prose prose-gray max-w-none",
                "prose-headings:font-bold prose-headings:text-gray-900 prose-headings:scroll-mt-24",
                "prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4",
                "prose-h3:text-lg prose-h3:mt-6 prose-h3:mb-2",
                "prose-p:text-gray-700 prose-p:leading-[1.85] prose-p:text-[1.05rem]",
                "prose-li:text-gray-700 prose-li:leading-relaxed",
                "prose-a:text-amber-600 prose-a:no-underline hover:prose-a:underline",
                "prose-strong:text-gray-900 prose-strong:font-semibold",
                "prose-blockquote:border-amber-400 prose-blockquote:bg-amber-50 prose-blockquote:rounded-r-lg prose-blockquote:py-1",
                "prose-table:text-sm prose-th:bg-gray-50",
                "prose-img:rounded-xl",
                "prose-hr:border-gray-200",
              ].join(" ")}
              dangerouslySetInnerHTML={{ __html: content }}
            />

            {/* FAQ */}
            {faq.length > 0 && (
              <section className="mt-14 scroll-mt-24" id="faq">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Häufig gestellte Fragen
                </h2>
                <div className="space-y-3">
                  {faq.map((f, i) => (
                    <details
                      key={i}
                      className="group border border-gray-200 rounded-xl"
                    >
                      <summary className="flex items-center justify-between px-5 py-4 cursor-pointer text-sm font-semibold text-gray-900 list-none">
                        {f.question}
                        <svg
                          className="w-4 h-4 text-gray-400 shrink-0 ml-3 group-open:rotate-180 transition-transform"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </summary>
                      <p className="px-5 pb-4 text-sm text-gray-600 leading-relaxed">
                        {f.answer}
                      </p>
                    </details>
                  ))}
                </div>
              </section>
            )}

            {/* Dark CTA */}
            <div className="mt-14 bg-gray-900 rounded-2xl p-8 text-center">
              <p className="text-xs font-semibold uppercase tracking-widest text-amber-400 mb-2">
                Passgenau & wasserdicht
              </p>
              <h3 className="text-2xl font-bold text-white leading-snug">
                Finden Sie Ihre passende Fussmatte
              </h3>
              <p className="mt-3 text-gray-400 text-sm max-w-md mx-auto">
                Über 1100 Produkte für 46+ Automarken. Millimetergenau passend, direkt ab Lager.
              </p>
              <Link
                href="/produkte"
                className="inline-block mt-5 bg-amber-500 hover:bg-amber-400 text-white font-semibold px-7 py-3 rounded-xl transition-colors text-sm"
              >
                Jetzt Fussmatten entdecken →
              </Link>
            </div>

            {/* Related Articles */}
            {related.length > 0 && (
              <section className="mt-14 pt-8 border-t border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-5">
                  Weitere Artikel
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {related.map((r) => (
                    <Link
                      key={r.slug}
                      href={`/ratgeber/${r.slug}`}
                      className="group block p-5 bg-gray-50 hover:bg-amber-50 rounded-xl border border-gray-100 hover:border-amber-100 transition-colors"
                    >
                      <span className="text-xs text-amber-600 font-semibold uppercase tracking-wide">
                        {r.category}
                      </span>
                      <h3 className="mt-1.5 font-semibold text-gray-900 group-hover:text-amber-700 transition-colors line-clamp-2 text-sm">
                        {r.title}
                      </h3>
                      <p className="mt-1 text-xs text-gray-500 line-clamp-2 leading-relaxed">
                        {r.excerpt}
                      </p>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </article>

          {/* Sticky Sidebar */}
          <aside className="hidden lg:block">
            <div className="sticky top-24 space-y-8">
              {headings.length >= 2 && (
                <TableOfContents
                  headings={
                    faq.length > 0
                      ? [...headings, { id: "faq", text: "Häufig gestellte Fragen" }]
                      : headings
                  }
                />
              )}

              <div className="rounded-xl border border-amber-100 bg-amber-50 p-5">
                <p className="text-xs font-semibold text-amber-700 uppercase tracking-wider mb-2">
                  Passende Produkte
                </p>
                <p className="text-sm text-gray-600 mb-4">
                  Über 1100 Fussmatten passgenau für Ihr Fahrzeug.
                </p>
                <Link
                  href="/produkte"
                  className="block text-center bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold py-2.5 px-4 rounded-lg transition-colors"
                >
                  Produkte ansehen
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
