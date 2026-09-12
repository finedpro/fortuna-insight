import { useCallback, useEffect, useReducer } from "react";
import { listWatchlist, deleteWatchedWallet } from "@/lib/api/monitor-client";
import { AnalysisApiError } from "@/lib/api/analysis-client";
import type { WatchedWallet } from "@/lib/api/types";

export type WatchlistPhase = "loading" | "loaded" | "empty" | "error";

export interface WatchlistState {
  phase: WatchlistPhase;
  items: WatchedWallet[];
  total: number;
  errorMessage: string | null;
}

type Action =
  | { type: "LOADING" }
  | { type: "LOADED"; items: WatchedWallet[]; total: number }
  | { type: "ERROR"; message: string };

function reducer(state: WatchlistState, action: Action): WatchlistState {
  switch (action.type) {
    case "LOADING":
      return { ...state, phase: "loading", errorMessage: null };
    case "LOADED":
      return { phase: action.items.length === 0 ? "empty" : "loaded", items: action.items, total: action.total, errorMessage: null };
    case "ERROR":
      return { ...state, phase: "error", errorMessage: action.message };
    default:
      return state;
  }
}

/** Fetches the watchlist (Sprint 6 Task 1) and exposes a remove action - same loading/loaded/empty/error phase pattern as useAnalysesList. */
export function useWatchlist() {
  const [state, dispatch] = useReducer(reducer, { phase: "loading", items: [], total: 0, errorMessage: null });

  const reload = useCallback(() => {
    dispatch({ type: "LOADING" });
    void (async () => {
      try {
        const result = await listWatchlist(50, 0);
        dispatch({ type: "LOADED", items: result.items, total: result.total });
      } catch (err) {
        const message = err instanceof AnalysisApiError ? err.message : "An unexpected error occurred.";
        dispatch({ type: "ERROR", message });
      }
    })();
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const remove = useCallback(
    async (id: string) => {
      await deleteWatchedWallet(id);
      reload();
    },
    [reload],
  );

  return { state, reload, remove };
}
