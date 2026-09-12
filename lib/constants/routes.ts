/**
 * Central route path constants.
 * Single source of truth for hrefs — nav items and links should reference
 * these rather than hard-coding path strings.
 */

export const ROUTES = {
  home: "/",
  features: "/#features",
  docs: "/docs",
  roadmap: "/roadmap",
  pricing: "/pricing",
  dashboard: "/dashboard",
  analyses: "/analyses",
  watchlist: "/watchlist",
  markets: "/markets",
  /** @deprecated Sprint 5 Task 1 — /report now redirects to /analysis/[id]; kept only as a redirect target for old links. */
  report: "/report",
  settings: "/settings",
} as const;

/** Canonical URL for a single analysis (Sprint 5 Task 1). */
export function analysisDetailRoute(id: string): string {
  return `/analysis/${id}`;
}
