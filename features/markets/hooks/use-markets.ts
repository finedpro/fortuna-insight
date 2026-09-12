import { useCallback, useEffect, useReducer } from "react";
import { listMarkets } from "@/lib/api/markets-client";
import { AnalysisApiError } from "@/lib/api/analysis-client";
import type { Market } from "@/lib/api/types";

export type MarketsPhase = "loading" | "loaded" | "empty" | "error";

export interface MarketsState {
  phase: MarketsPhase;
  items: Market[];
  errorMessage: string | null;
}

type Action = { type: "LOADING" } | { type: "LOADED"; items: Market[] } | { type: "ERROR"; message: string };

function reducer(state: MarketsState, action: Action): MarketsState {
  switch (action.type) {
    case "LOADING":
      return { ...state, phase: "loading", errorMessage: null };
    case "LOADED":
      return { phase: action.items.length === 0 ? "empty" : "loaded", items: action.items, errorMessage: null };
    case "ERROR":
      return { ...state, phase: "error", errorMessage: action.message };
    default:
      return state;
  }
}

/** Fetches the list of markets (Fortuna Markets Sprint 1) - same loading/loaded/empty/error phase pattern as useWatchlist/useAnalysesList. */
export function useMarkets() {
  const [state, dispatch] = useReducer(reducer, { phase: "loading", items: [], errorMessage: null });

  const reload = useCallback(() => {
    dispatch({ type: "LOADING" });
    void (async () => {
      try {
        const result = await listMarkets();
        dispatch({ type: "LOADED", items: result.items });
      } catch (err) {
        const message = err instanceof AnalysisApiError ? err.message : "An unexpected error occurred.";
        dispatch({ type: "ERROR", message });
      }
    })();
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  return { state, reload };
}
