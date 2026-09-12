/**
 * Animation tokens — durations plus ready-to-use motion className recipes.
 * All entries are `motion-safe:` gated so `prefers-reduced-motion` users
 * never receive motion, without any extra JS/observer logic.
 *
 * Note: `fade-up` (used by the FC-002B Hero) is intentionally not
 * duplicated here — it's an existing keyframe in tailwind.config.ts and
 * stays owned by that section.
 */

export const durations = {
  fast: 150,
  normal: 300,
  slow: 700,
} as const;

export type DurationToken = keyof typeof durations;

export const animations = {
  fadeIn: { className: "motion-safe:animate-fade-in" },
  scaleIn: { className: "motion-safe:animate-scale-in" },
  hover: { className: "transition-all duration-300 ease-out" },
  hoverFast: { className: "transition-all duration-150 ease-out" },
  hoverSlow: { className: "transition-all duration-700 ease-out" },
} as const;

export type AnimationToken = keyof typeof animations;
