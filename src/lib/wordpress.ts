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

function mapWPPost(post: WPPost): BlogPost {
  const featuredImage =
    post._embedded?.["wp:featuredmedia"]?.[0]?.source_url ||
    "/images/blog-placeholder.jpg";

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
    return posts.map(mapWPPost);
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

    return mapWPPost(posts[0]);
  } catch (error) {
    console.error("Failed to fetch WP post:", error);
    return null;
  }
}
