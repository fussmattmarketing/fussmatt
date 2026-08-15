import NotFoundPanel from "@/components/ui/NotFoundPanel";

// Route-level 404 boundary. Deliberately does not redirect: the root
// not-found.tsx sends unknown URLs to the homepage, but inside these
// cached routes that redirect degrades to a 200 meta-refresh page and
// Google reads it as a soft 404. Rendering here returns a real 404.
export default function NotFound() {
  return (
    <NotFoundPanel
      title="Fahrzeug nicht gefunden"
      message="Für dieses Fahrzeug haben wir aktuell keine Seite."
    />
  );
}
