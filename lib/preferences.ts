/**
 * Browser-only display preferences. Stored in localStorage of this
 * browser, never sent to any server, never tied to an account. Reading or
 * writing can fail (private windows, blocked storage) - every access is
 * wrapped so the app falls back to defaults instead of breaking.
 */

export const PREFERENCES_STORAGE_KEY = "fortuna-preferences";
export const PREFERENCES_CHANGED_EVENT = "fortuna:preferences-changed";

export type TimeDisplay = "utc" | "local";

export interface Preferences {
  timeDisplay: TimeDisplay;
  hideUnnamedTokens: boolean;
}

export const DEFAULT_PREFERENCES: Preferences = Object.freeze({
  timeDisplay: "utc",
  hideUnnamedTokens: false,
});

/** Accepts only known keys with valid values; anything else falls back to the default. */
export function parsePreferences(raw: string | null): Preferences {
  if (!raw) return DEFAULT_PREFERENCES;
  try {
    const value = JSON.parse(raw) as Partial<Record<keyof Preferences, unknown>>;
    return {
      timeDisplay: value.timeDisplay === "local" ? "local" : "utc",
      hideUnnamedTokens: value.hideUnnamedTokens === true,
    };
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

export function readRawPreferences(): string | null {
  try {
    return localStorage.getItem(PREFERENCES_STORAGE_KEY);
  } catch {
    return null;
  }
}

function notify(): void {
  try {
    window.dispatchEvent(new Event(PREFERENCES_CHANGED_EVENT));
  } catch {
    // no window (should not happen in the browser) - nothing to notify
  }
}

export function savePreferences(preferences: Preferences): void {
  try {
    localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(preferences));
  } catch {
    // storage unavailable: the choice simply won't persist
  }
  notify();
}

export function resetPreferences(): void {
  try {
    localStorage.removeItem(PREFERENCES_STORAGE_KEY);
  } catch {
    // nothing to remove
  }
  notify();
}

/**
 * Read-only peek at the Markets/watchlist browser ID. Unlike getOwnerKey()
 * this never creates one, so merely opening Settings changes nothing.
 */
export function peekOwnerKey(): string | null {
  try {
    const stored = localStorage.getItem("fortuna-owner-key");
    return stored && /^[0-9a-f-]{36}$/i.test(stored) ? stored : null;
  } catch {
    return null;
  }
}
