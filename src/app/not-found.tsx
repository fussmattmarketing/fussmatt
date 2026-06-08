import { redirect } from "next/navigation";

/**
 * Global 404 handler — server-side redirect to homepage.
 *
 * CEO policy 2026-06-09: every broken link / unknown URL should land on
 * the homepage instead of a dead-end 404 page. Next.js renders this
 * component whenever a route handler calls notFound() OR a path doesn't
 * match any segment; throwing redirect() from an RSC produces a 307 to /.
 *
 * `force-dynamic` is mandatory here. Without it Vercel's edge layer
 * caches the not-found.html as a static 404 asset, and that cached 404
 * is served back on every miss — the redirect never executes at runtime.
 * Forcing dynamic rendering makes each unknown URL run this component
 * fresh, where redirect() throws the 307 to /.
 *
 * SEO note: 307 (temporary) is correct here — Google interprets 307 as
 * "this URL doesn't exist long-term" without transferring rank.
 */
export const dynamic = "force-dynamic";

export default function NotFound() {
  redirect("/");
}
