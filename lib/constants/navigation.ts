import { ROUTES } from "./routes";

export type NavItem = {
  label: string;
  href: string;
};

/** Dashboard shell sidebar navigation (FC-001). */
export const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: ROUTES.dashboard },
  { label: "Analyses", href: ROUTES.analyses },
  { label: "Watchlist", href: ROUTES.watchlist },
  { label: "Markets", href: ROUTES.markets },
  { label: "Settings", href: ROUTES.settings },
];

/**
 * Public marketing site navigation (landing page header/footer).
 *
 * Soft-launch polish - replaced the previous placeholder links
 * (Features/Docs/Roadmap/Pricing, none of which had real pages behind
 * them - confirmed by inspection, all 404) with the two real product
 * entry points that actually exist and work. Wallet Intelligence
 * listed first, matching its position as the primary/core product.
 */
export const LANDING_NAV_ITEMS: NavItem[] = [
  { label: "Wallet Intelligence", href: ROUTES.dashboard },
  { label: "Markets", href: ROUTES.markets },
];
