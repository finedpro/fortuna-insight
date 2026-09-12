/**
 * Soft-launch instrumentation. A SEPARATE browser-persisted UUID from
 * `owner-key.ts`'s `getOwnerKey()` - deliberately not reused, per
 * approved scope: "Do not turn ownerKey into a general identity
 * system." This identifier means nothing beyond "the same browser
 * sent these events" - it is never sent to Markets endpoints, never
 * tied to a balance or a position, and carries no other product
 * meaning. Same generate-once-and-persist pattern as `getOwnerKey()`,
 * intentionally duplicated rather than shared, since the two are
 * conceptually different identities that happen to look alike today.
 */

const STORAGE_KEY = "fortuna-analytics-session-id";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Browser-only - must never be called during SSR (every call site is
 * inside a "use client" component's effect/handler). Returns `null`
 * if `localStorage` genuinely isn't available (e.g. a locked-down
 * browser setting) rather than throwing - telemetry is best-effort
 * and must never break the page it's measuring.
 */
export function getAnalyticsSessionId(): string | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && UUID_PATTERN.test(stored)) {
      return stored;
    }
    const generated = crypto.randomUUID();
    localStorage.setItem(STORAGE_KEY, generated);
    return generated;
  } catch {
    return null;
  }
}
