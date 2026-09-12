import Link from "next/link";
import { LANDING_NAV_ITEMS } from "@/lib/constants";

/**
 * Desktop nav links for the marketing site header. Hidden below md;
 * MobileMenu covers the small-screen equivalent.
 */
export function SiteNavigation() {
  return (
    <nav aria-label="Main" className="hidden items-center gap-8 md:flex">
      {LANDING_NAV_ITEMS.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="rounded-sm text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
