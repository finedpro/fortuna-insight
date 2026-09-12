/**
 * Z-index scale. Documents the app's layering system so future overlays
 * (dropdowns, modals, toasts) stack predictably against existing chrome.
 *
 * Note: `SiteHeader` already uses `z-50` directly (FC-002A, unchanged) —
 * the `header` value here matches it for reference; it does not modify
 * that component.
 */

export const zIndex = {
  base: 0,
  dropdown: 20,
  sticky: 40,
  header: 50,
  overlay: 60,
  modal: 70,
  toast: 80,
  tooltip: 90,
} as const;

export type ZIndexToken = keyof typeof zIndex;

/** Literal Tailwind `z-*` class for each layer. */
export const zIndexClassName: Record<ZIndexToken, string> = {
  base: "z-0",
  dropdown: "z-20",
  sticky: "z-40",
  header: "z-50",
  overlay: "z-[60]",
  modal: "z-[70]",
  toast: "z-[80]",
  tooltip: "z-[90]",
};
