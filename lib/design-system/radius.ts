/**
 * Border radius tokens — matches the `--radius` CSS variable scale defined
 * in `app/globals.css` (base 10px, with -2px/-4px derived steps in
 * tailwind.config.ts). `className` is the literal Tailwind utility.
 */

export const radius = {
  none: { px: 0, className: "rounded-none" },
  sm: { px: 6, className: "rounded-sm" },
  md: { px: 8, className: "rounded-md" },
  lg: { px: 10, className: "rounded-lg" },
  xl: { px: 16, className: "rounded-2xl" },
  full: { px: 9999, className: "rounded-full" },
} as const;

export type RadiusToken = keyof typeof radius;
