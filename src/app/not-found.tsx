import { redirect } from "next/navigation";

/**
 * Global 404 handler — server-side redirect to homepage.
 *
 * CEO policy 2026-06-09: every broken link / unknown URL should land on
 * the homepage instead of a dead-end 404 page. Next.js renders this
 * component whenever a route handler calls notFound() OR a path doesn't
 * match any segment; throwing redirect() from an RSC produces a 307 to /.
 *
 * Side effect: deep-link sharing of dead URLs no longer dead-ends the
 * visitor. SEO note: 307 (temporary) is correct here — Google interprets
 * 307 as "this URL doesn't exist long-term" without transferring rank.
 */
export default function NotFound() {
  redirect("/");
}
