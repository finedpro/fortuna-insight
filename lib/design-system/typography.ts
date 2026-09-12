/**
 * Typography scale.
 *
 * Each entry carries both raw metadata (for non-Tailwind consumers) and a
 * `className` recipe — the literal Tailwind utilities that implement it.
 * Components should apply `typography[level].className` rather than
 * hand-rolling font-size/weight/tracking combinations inline.
 */

export interface TypographyStyle {
  fontFamily: "display" | "sans" | "mono";
  fontSizeRem: number;
  lineHeight: number;
  fontWeight: number;
  letterSpacingEm?: number;
  className: string;
}

export const typography = {
  display: {
    fontFamily: "display",
    fontSizeRem: 3,
    lineHeight: 1.1,
    fontWeight: 700,
    letterSpacingEm: -0.02,
    className: "font-display text-5xl font-bold leading-[1.1] tracking-tight md:text-6xl",
  },
  h1: {
    fontFamily: "display",
    fontSizeRem: 2.25,
    lineHeight: 1.15,
    fontWeight: 700,
    letterSpacingEm: -0.02,
    className:
      "font-display text-4xl font-bold leading-[1.15] tracking-tight md:text-5xl",
  },
  h2: {
    fontFamily: "display",
    fontSizeRem: 1.5,
    lineHeight: 1.2,
    fontWeight: 600,
    letterSpacingEm: -0.01,
    className: "font-display text-2xl font-semibold leading-tight tracking-tight",
  },
  h3: {
    fontFamily: "display",
    fontSizeRem: 1.25,
    lineHeight: 1.3,
    fontWeight: 600,
    className: "font-display text-xl font-semibold leading-snug tracking-tight",
  },
  body: {
    fontFamily: "sans",
    fontSizeRem: 1,
    lineHeight: 1.6,
    fontWeight: 400,
    className: "font-sans text-base leading-relaxed",
  },
  caption: {
    fontFamily: "sans",
    fontSizeRem: 0.875,
    lineHeight: 1.5,
    fontWeight: 400,
    className: "font-sans text-sm leading-normal",
  },
  overline: {
    fontFamily: "mono",
    fontSizeRem: 0.75,
    lineHeight: 1.4,
    fontWeight: 500,
    letterSpacingEm: 0.12,
    className: "font-mono text-xs font-medium uppercase tracking-widest",
  },
} as const satisfies Record<string, TypographyStyle>;

export type TypographyToken = keyof typeof typography;
