import { describe, it, expect, beforeEach } from "vitest";
import { getAnalyticsSessionId } from "../analytics-session-id";
import { getOwnerKey } from "../owner-key";

const STORAGE_KEY = "fortuna-analytics-session-id";
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

describe("getAnalyticsSessionId", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("generates a valid UUID and persists it on first call", () => {
    const id = getAnalyticsSessionId();
    expect(id).toMatch(UUID_PATTERN);
    expect(localStorage.getItem(STORAGE_KEY)).toBe(id);
  });

  it("reuses the stored UUID on later calls - no regeneration", () => {
    const first = getAnalyticsSessionId();
    const second = getAnalyticsSessionId();
    expect(second).toBe(first);
  });

  it("generates a fresh UUID if storage contains a non-UUID value", () => {
    localStorage.setItem(STORAGE_KEY, "not-a-uuid");
    const id = getAnalyticsSessionId();
    expect(id).toMatch(UUID_PATTERN);
    expect(id).not.toBe("not-a-uuid");
  });

  it("uses a different storage key from ownerKey - never turns ownerKey into a general identity system", () => {
    const ownerKey = getOwnerKey();
    const analyticsId = getAnalyticsSessionId();
    expect(analyticsId).not.toBe(ownerKey);
    expect(localStorage.getItem("fortuna-owner-key")).toBe(ownerKey);
    expect(localStorage.getItem(STORAGE_KEY)).toBe(analyticsId);
  });

  it("returns null rather than throwing when localStorage is unavailable - telemetry is best-effort", () => {
    const original = window.localStorage;
    // @ts-expect-error - deliberately breaking localStorage for this one test
    delete window.localStorage;
    Object.defineProperty(window, "localStorage", {
      get() {
        throw new Error("localStorage disabled");
      },
      configurable: true,
    });

    expect(() => getAnalyticsSessionId()).not.toThrow();
    expect(getAnalyticsSessionId()).toBeNull();

    Object.defineProperty(window, "localStorage", { value: original, configurable: true, writable: true });
  });
});
