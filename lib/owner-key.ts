/**
 * Fortuna Markets Sprint 1 - the temporary, unauthenticated identity
 * mechanism the backend's `X-Fortuna-Owner-Key` contract requires. Not
 * auth, not a User, not a session - a plain browser-persisted UUID,
 * generated once and reused. See the Sprint 1 frontend architecture
 * audit's "Owner key strategy" section for the full rationale: no
 * client-side identity mechanism existed anywhere in this app before
 * this file.
 */

const STORAGE_KEY = "fortuna-owner-key";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Returns this browser's persistent owner key, generating and storing
 * one on first call. Browser-only - `localStorage` doesn't exist
 * during SSR, so this must never be called during server rendering
 * (every call site in this codebase is inside a `"use client"`
 * component's event handler or effect, never at module scope or in a
 * server component).
 */
export function getOwnerKey(): string {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored && UUID_PATTERN.test(stored)) {
    return stored;
  }

  const generated = crypto.randomUUID();
  localStorage.setItem(STORAGE_KEY, generated);
  return generated;
}
