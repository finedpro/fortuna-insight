/**
 * Shadow levels — elevation scale. Kept deliberately restrained (this is a
 * dark, minimal theme, so shadows are used sparingly, mainly to lift
 * floating/elevated surfaces off the page rather than to decorate flat
 * cards).
 */

export const shadows = {
  none: { className: "shadow-none" },
  sm: { className: "shadow-sm" },
  md: { className: "shadow-md" },
  lg: { className: "shadow-lg" },
  xl: { className: "shadow-2xl shadow-black/40" },
} as const;

export type ShadowToken = keyof typeof shadows;
