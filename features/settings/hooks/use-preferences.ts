"use client";

import { useCallback, useSyncExternalStore } from "react";
import {
  DEFAULT_PREFERENCES,
  PREFERENCES_CHANGED_EVENT,
  PREFERENCES_STORAGE_KEY,
  parsePreferences,
  readRawPreferences,
  resetPreferences,
  savePreferences,
  type Preferences,
} from "@/lib/preferences";

let cachedRaw: string | null | undefined;
let cachedValue: Preferences = DEFAULT_PREFERENCES;

/** useSyncExternalStore needs a referentially stable snapshot, so parse only when the stored string changes. */
function getSnapshot(): Preferences {
  const raw = readRawPreferences();
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cachedValue = parsePreferences(raw);
  }
  return cachedValue;
}

function getServerSnapshot(): Preferences {
  return DEFAULT_PREFERENCES;
}

function subscribe(onChange: () => void): () => void {
  const onStorage = (event: StorageEvent) => {
    if (event.key === null || event.key === PREFERENCES_STORAGE_KEY) onChange();
  };
  window.addEventListener(PREFERENCES_CHANGED_EVENT, onChange);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(PREFERENCES_CHANGED_EVENT, onChange);
    window.removeEventListener("storage", onStorage);
  };
}

export function usePreferences(): {
  preferences: Preferences;
  update: (patch: Partial<Preferences>) => void;
  reset: () => void;
} {
  const preferences = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const update = useCallback((patch: Partial<Preferences>) => {
    savePreferences({ ...getSnapshot(), ...patch });
  }, []);
  return { preferences, update, reset: resetPreferences };
}
