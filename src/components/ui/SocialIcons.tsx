/**
 * SocialIcons — Instagram + Facebook icon links.
 *
 * Centralized so we never end up with mismatched handles or styles
 * between Header / Footer / Kontakt. Handles live here; if FussMatt
 * adds TikTok / YouTube / LinkedIn later, extend SOCIALS and the
 * icons automatically appear everywhere the component is mounted.
 *
 * Sized via `size` prop ("sm" = 18px / "md" = 22px); color inherits
 * via `text-current` so the surrounding context drives the styling
 * (dark footer vs light Kontakt page).
 */

import Link from "next/link";

type SVGIcon = React.FC<React.SVGProps<SVGSVGElement>>;

const InstagramIcon: SVGIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const FacebookIcon: SVGIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
  </svg>
);

export const SOCIALS: { name: string; href: string; Icon: SVGIcon }[] = [
  { name: "Instagram", href: "https://www.instagram.com/fussmattcom", Icon: InstagramIcon },
  // Facebook profile is a numeric profile.php id (FB page-mode), not a vanity URL.
  { name: "Facebook", href: "https://www.facebook.com/profile.php?id=61590836723623", Icon: FacebookIcon },
];

export function SocialIcons({
  size = "md",
  className = "",
}: {
  size?: "sm" | "md";
  className?: string;
}) {
  const px = size === "sm" ? "w-[18px] h-[18px]" : "w-[22px] h-[22px]";
  return (
    <ul className={`flex items-center gap-3 ${className}`}>
      {SOCIALS.map(({ name, href, Icon }) => (
        <li key={name}>
          <Link
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`FussMatt auf ${name}`}
            className="inline-flex items-center justify-center w-9 h-9 rounded-full border border-current/20 hover:bg-current/10 transition-colors"
          >
            <Icon className={px} />
          </Link>
        </li>
      ))}
    </ul>
  );
}
