import { useCallback, useEffect, useReducer } from "react";
import { listPositions } from "@/lib/api/markets-client";
import { AnalysisApiError } from "@/lib/api/analysis-client";
import type { Position } from "@/lib/api/types";

export type PositionsPhase = "loading" | "loaded" | "empty" | "error";

export interface PositionsState {
  phase: PositionsPhase;
  items: Position[];
  errorMessage: string | null;
}

type Action = { type: "LOADING" } | { type: "LOADED"; items: Position[] } | { type: "ERROR"; message: string };

function reducer(state: PositionsState, action: Action): PositionsState {
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

/** Fetches the calling owner's positions (identity via `X-Fortuna-Owner-Key`, attached inside `listPositions()` itself). */
export function usePositions() {
  const [state, dispatch] = useReducer(reducer, { phase: "loading", items: [], errorMessage: null });

  const reload = useCallback(() => {
    dispatch({ type: "LOADING" });
    void (async () => {
      try {
        const result = await listPositions();
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
