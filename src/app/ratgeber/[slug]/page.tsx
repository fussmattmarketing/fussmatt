import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
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

export async function generateStaticParams() {
  // Static articles
  const staticParams = RATGEBER_ARTICLES.map((a) => ({ slug: a.slug }));

  // Brand guide pages
  const hierarchy = getVehicleHierarchy();
  const brandGuideParams = hierarchy.brands.map((b) => ({
    slug: `${BRAND_GUIDE_PREFIX}${b.slug}`,
  }));

  // WP posts
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

  // Brand guide?
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

  // Try static first
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

  // Try WordPress
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

  // ─── Brand Guide Route ───────────────────────────────
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

    // Other brands for internal linking
    const otherBrands = hierarchy.brands
      .filter((b) => b.slug !== brandSlug)
      .slice(0, 10);

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

        <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <Breadcrumbs
            items={[
              { label: "Ratgeber", href: "/ratgeber" },
              { label: `${brand.name} Fussmatten` },
            ]}
          />

          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 leading-tight mb-4">
            {guide.h1}
          </h1>
          <p className="text-lg text-gray-500 mb-10">{guide.introText}</p>

          {/* Guide Sections */}
          {guide.sections.map((section, i) => (
            <section key={i} className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-3">
                {section.heading}
              </h2>
              <p className="text-gray-600 leading-relaxed">{section.text}</p>

              {/* Model links after "Beliebte Modelle" section */}
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

          {/* FAQ Section */}
          <section className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Häufig gestellte Fragen
            </h2>
            <div className="space-y-4">
              {guide.faqItems.map((faq, i) => (
                <details
                  key={i}
                  className="group border border-gray-200 rounded-xl"
                >
                  <summary className="flex items-center justify-between px-4 py-3 cursor-pointer text-sm font-medium text-gray-900">
                    {faq.question}
                    <svg
                      className="w-4 h-4 text-gray-500 group-open:rotate-180 transition-transform"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </summary>
                  <p className="px-4 pb-3 text-sm text-gray-600">
                    {faq.answer}
                  </p>
                </details>
              ))}
            </div>
          </section>

          {/* Category CTAs */}
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              href={`/kategorie/5d-fussmatten/${brandSlug}`}
              className="block p-4 bg-amber-50 hover:bg-amber-100 rounded-xl transition-colors text-center"
            >
              <span className="font-semibold text-amber-800">
                5D Fussmatten für {brand.name}
              </span>
            </Link>
            <Link
              href={`/kategorie/3d-fussmatten/${brandSlug}`}
              className="block p-4 bg-amber-50 hover:bg-amber-100 rounded-xl transition-colors text-center"
            >
              <span className="font-semibold text-amber-800">
                3D Fussmatten für {brand.name}
              </span>
            </Link>
          </div>

          {/* Other brand guides */}
          <section className="mt-12">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
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
      </>
    );
  }

  // ─── Static Article / WordPress Post ─────────────────
  const staticArticle = getArticleBySlug(slug);
  const wpPost = !staticArticle ? await getWPPostBySlug(slug) : null;
  if (!staticArticle && !wpPost) notFound();

  const title = staticArticle?.title || wpPost!.title;
  const excerpt = staticArticle?.excerpt || wpPost!.excerpt;
  const content = staticArticle?.content || wpPost!.content;
  const date = staticArticle?.date || wpPost!.date;
  const category = staticArticle?.category || wpPost!.category;
  const readTime = staticArticle?.readTime || wpPost!.readTime;
  const faq = staticArticle?.faq || [];

  const related = RATGEBER_ARTICLES.filter((a) => a.slug !== slug).slice(0, 2);

  const faqSchemaData =
    faq.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faq.map((f) => ({
            "@type": "Question",
            name: f.question,
            acceptedAnswer: {
              "@type": "Answer",
              text: f.answer,
            },
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

      <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Breadcrumbs
          items={[
            { label: "Ratgeber", href: "/ratgeber" },
            { label: title },
          ]}
        />

        {/* Article Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 text-sm text-gray-400 mb-3">
            <span className="bg-amber-100 text-amber-700 text-xs font-semibold px-2.5 py-0.5 rounded">
              {category}
            </span>
            <time dateTime={date}>
              {new Date(date).toLocaleDateString("de-CH", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </time>
            <span>·</span>
            <span>{readTime} Lesezeit</span>
          </div>

          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
            {title}
          </h1>
          <p className="mt-4 text-lg text-gray-500">{excerpt}</p>
        </div>

        {/* Article Content */}
        <div
          className="prose prose-gray prose-lg prose-headings:font-bold prose-a:text-amber-600 prose-table:text-sm max-w-none"
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(content) }}
        />

        {/* FAQ Section */}
        {faq.length > 0 && (
          <section className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Häufig gestellte Fragen
            </h2>
            <div className="space-y-4">
              {faq.map((f, i) => (
                <div key={i} className="bg-gray-50 rounded-xl p-5">
                  <h3 className="font-semibold text-gray-900">{f.question}</h3>
                  <p className="mt-2 text-sm text-gray-600">{f.answer}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* CTA */}
        <div className="mt-12 bg-gradient-to-br from-amber-50 to-amber-100 rounded-2xl p-8 text-center">
          <h3 className="text-xl font-bold text-gray-900">
            Finden Sie Ihre passende Fussmatte
          </h3>
          <p className="mt-2 text-sm text-gray-600">
            Über 1100 Produkte für 46+ Automarken. Passgenau und wasserdicht.
          </p>
          <Link
            href="/produkte"
            className="inline-block mt-4 bg-amber-500 hover:bg-amber-600 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
          >
            Jetzt Fussmatten entdecken
          </Link>
        </div>

        {/* Related Articles */}
        {related.length > 0 && (
          <section className="mt-12">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Weitere Artikel
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {related.map((r) => (
                <Link
                  key={r.slug}
                  href={`/ratgeber/${r.slug}`}
                  className="group block p-4 bg-gray-50 hover:bg-amber-50 rounded-xl transition-colors"
                >
                  <span className="text-xs text-amber-600 font-medium">
                    {r.category}
                  </span>
                  <h3 className="mt-1 font-semibold text-gray-900 group-hover:text-amber-700 transition-colors line-clamp-2">
                    {r.title}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                    {r.excerpt}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </article>
    </>
  );
}
