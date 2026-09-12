/**
 * Spacing tokens — 8px grid.
 *
 * `px` is the raw value for non-Tailwind consumers. `gapClassName` is the
 * literal Tailwind utility for each step, used by layout primitives
 * (Stack, Grid) so they never need to hardcode or dynamically construct a
 * class name — Tailwind's compiler only recognizes complete, literal class
 * strings, so this map is intentionally explicit rather than computed.
 */

export const spacing = {
  xs: 8,
  sm: 16,
  md: 24,
  lg: 32,
  xl: 48,
  "2xl": 64,
  "3xl": 96,
  "4xl": 128,
} as const;

export type SpacingToken = keyof typeof spacing;

/** Literal Tailwind `gap-*` class for each spacing step. */
export const spacingGapClassName: Record<SpacingToken, string> = {
  xs: "gap-2",
  sm: "gap-4",
  md: "gap-6",
  lg: "gap-8",
  xl: "gap-12",
  "2xl": "gap-16",
  "3xl": "gap-24",
  "4xl": "gap-32",
};
