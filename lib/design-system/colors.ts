/**
 * Color tokens.
 *
 * These values MUST stay in sync with the CSS custom properties defined in
 * `app/globals.css` (:root). Tailwind utility classes (bg-gold, text-teal,
 * etc.) remain the primary way components apply color — this file exists
 * for contexts that need a raw value instead of a class: chart libraries,
 * canvas/SVG drawing, inline SVG fills, or other non-Tailwind consumers
 * introduced in future milestones.
 */

/** HSL channel triples, matching the format used in CSS `hsl(var(--x))`. */
export const colorTokens = {
  background: "240 6% 5%",
  foreground: "40 20% 96%",
  surface: "240 6% 8%",
  surfaceElevated: "240 6% 12%",
  border: "240 5% 16%",
  muted: "240 5% 14%",
  mutedForeground: "240 4% 60%",
  gold: "42 62% 47%",
  goldForeground: "240 6% 8%",
  teal: "174 62% 40%",
  tealForeground: "240 6% 8%",
  success: "150 55% 45%",
  danger: "358 70% 58%",
} as const;

export type ColorToken = keyof typeof colorTokens;

/**
 * Resolves a color token to a usable `hsl(...)` string.
 *
 * @example
 * hsl("gold")        // "hsl(42 62% 47%)"
 * hsl("gold", 0.4)   // "hsl(42 62% 47% / 0.4)"
 */
export function hsl(token: ColorToken, alpha?: number): string {
  const channels = colorTokens[token];
  return alpha === undefined ? `hsl(${channels})` : `hsl(${channels} / ${alpha})`;
}
