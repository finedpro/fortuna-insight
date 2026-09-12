import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

// Without test.globals: true in vitest.config.ts, @testing-library/react's
// own built-in auto-cleanup (which looks for a GLOBAL afterEach) never
// registers, so the DOM from one test's render() call silently persists
// into the next test in the same file. Explicit registration here is the
// standard fix for projects using explicit vitest imports.
afterEach(cleanup);

// jsdom doesn't implement matchMedia - this is the standard, minimal
// polyfill for components (like WalletInput) that check viewport size.
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});
