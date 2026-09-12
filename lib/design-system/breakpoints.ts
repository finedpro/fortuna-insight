/**
 * Breakpoints — matches Tailwind's default screen scale, exposed as typed
 * values for any JS that needs to reason about viewport size (e.g. a future
 * `useMediaQuery` hook), plus the container widths already established by
 * layout primitives.
 */

export const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
} as const;

export type BreakpointToken = keyof typeof breakpoints;

/**
 * Container widths already in use by layout primitives:
 * - `page` matches `Container`'s max width (FC-002A, unchanged).
 * - `content` matches the Hero's centered text column (FC-002B, unchanged).
 */
export const containerWidths = {
  content: 700,
  page: 1280,
} as const;

export type ContainerWidthToken = keyof typeof containerWidths;
