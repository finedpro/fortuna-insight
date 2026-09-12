import { describe, it, expect, beforeEach } from "vitest";
import { getOwnerKey } from "../owner-key";

const STORAGE_KEY = "fortuna-owner-key";
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

describe("getOwnerKey", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("generates a valid UUID and persists it on first call", () => {
    const key = getOwnerKey();
    expect(key).toMatch(UUID_PATTERN);
    expect(localStorage.getItem(STORAGE_KEY)).toBe(key);
  });

  it("reuses the stored UUID on later calls - no regeneration", () => {
    const first = getOwnerKey();
    const second = getOwnerKey();
    expect(second).toBe(first);
  });

  it("does not regenerate when storage already contains a valid UUID", () => {
    const existing = "550e8400-e29b-41d4-a716-446655440000";
    localStorage.setItem(STORAGE_KEY, existing);

    const key = getOwnerKey();

    expect(key).toBe(existing);
  });

  it("generates a fresh UUID if storage contains a non-UUID value", () => {
    localStorage.setItem(STORAGE_KEY, "not-a-uuid");

    const key = getOwnerKey();

    expect(key).toMatch(UUID_PATTERN);
    expect(key).not.toBe("not-a-uuid");
  });
});
