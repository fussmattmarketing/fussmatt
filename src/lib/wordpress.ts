/**
 * WordPress REST API client for blog posts
 */

const WP_API = "https://wp.fussmatt.com/wp-json/wp/v2";

export interface WPPost {
  id: number;
  slug: string;
  title: { rendered: string };
  excerpt: { rendered: string };
  content: { rendered: string };
  date: string;
  modified: string;
  featured_media: number;
  _embedded?: {
    "wp:featuredmedia"?: Array<{
      source_url: string;
      alt_text: string;
    }>;
    "wp:term"?: Array<Array<{ id: number; name: string; slug: string }>>;
  };
}

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  image: string;
  date: string;
  category: string;
  readTime: string;
  source: "wp";
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").replace(/\n/g, " ").trim();
}

function estimateReadTime(html: string): string {
  const text = stripHtml(html);
  const words = text.split(/\s+/).length;
  const minutes = Math.max(1, Math.ceil(words / 200));
  return `${minutes} Min`;
}

/**
 * Some posts have their `_embedded["wp:featuredmedia"][0]` populated
 * with a REST error object ({ code, message, data }) rather than the
 * real media payload — observed for media items the embed pipeline
 * couldn't resolve (private attachment, missing permission, etc).
 * `wp/v2/media/{id}` direct fetch returns the source_url in those
 * cases. This helper falls back to the direct media endpoint when the
 * embed shape isn't usable.
 */
async function resolveFeaturedImage(post: WPPost): Promise<string> {
  const embedded = post._embedded?.["wp:featuredmedia"]?.[0];
  const embeddedSrc = (
    embedded as unknown as { source_url?: string } | undefined
  )?.source_url;
  if (embeddedSrc) return embeddedSrc;
  if (!post.featured_media || post.featured_media === 0) {
    return "/images/blog-placeholder.jpg";
  }
  try {
    const res = await fetch(`${WP_API}/media/${post.featured_media}`, {
      next: { revalidate: 600 },
    });
    if (res.ok) {
      const media = (await res.json()) as { source_url?: string };
      if (media.source_url) return media.source_url;
    }
  } catch {
    // swallow; fall through to placeholder
  }
  return "/images/blog-placeholder.jpg";
}

async function mapWPPost(post: WPPost): Promise<BlogPost> {
  const featuredImage = await resolveFeaturedImage(post);

  const categories = post._embedded?.["wp:term"]?.[0] || [];
  const category = categories[0]?.name || "Blog";

  return {
    slug: post.slug,
    title: post.title.rendered,
    excerpt: stripHtml(post.excerpt.rendered),
    content: post.content.rendered,
    image: featuredImage,
    date: post.date,
    category,
    readTime: estimateReadTime(post.content.rendered),
    source: "wp",
  };
}

/**
 * Fetch all published blog posts from WordPress
 */
export async function getWPPosts(perPage = 50): Promise<BlogPost[]> {
  try {
    const res = await fetch(
      `${WP_API}/posts?per_page=${perPage}&orderby=date&order=desc&status=publish&_embed=true`,
      { next: { revalidate: 600 } } // 10 min cache
    );

    if (!res.ok) {
      console.error("WP API error:", res.status);
      return [];
    }

    const posts: WPPost[] = await res.json();
    return await Promise.all(posts.map(mapWPPost));
  } catch (error) {
    console.error("Failed to fetch WP posts:", error);
    return [];
  }
}

/**
 * Fetch a single blog post by slug
 */
export async function getWPPostBySlug(
  slug: string
): Promise<BlogPost | null> {
  try {
    const res = await fetch(
      `${WP_API}/posts?slug=${encodeURIComponent(slug)}&_embed=true`,
      { next: { revalidate: 600 } }
    );

    if (!res.ok) return null;

    const posts: WPPost[] = await res.json();
    if (posts.length === 0) return null;

    return await mapWPPost(posts[0]);
  } catch (error) {
    console.error("Failed to fetch WP post:", error);
    return null;
  }
}
