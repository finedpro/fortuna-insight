import { useCallback, useEffect, useReducer } from "react";
import { listAnalyses, AnalysisApiError } from "@/lib/api/analysis-client";
import type { AnalysisListItem } from "@/lib/api/types";

export type AnalysesListPhase = "loading" | "loaded" | "empty" | "error";

export interface AnalysesListState {
  phase: AnalysesListPhase;
  items: AnalysisListItem[];
  total: number;
  limit: number;
  offset: number;
  errorMessage: string | null;
}

type Action =
  | { type: "LOADING" }
  | { type: "LOADED"; items: AnalysisListItem[]; total: number; limit: number; offset: number }
  | { type: "ERROR"; message: string };

function reducer(state: AnalysesListState, action: Action): AnalysesListState {
  switch (action.type) {
    case "LOADING":
      return { ...state, phase: "loading", errorMessage: null };
    case "LOADED":
      return {
        phase: action.items.length === 0 ? "empty" : "loaded",
        items: action.items,
        total: action.total,
        limit: action.limit,
        offset: action.offset,
        errorMessage: null,
      };
    case "ERROR":
      return { ...state, phase: "error", errorMessage: action.message };
    default:
      return state;
  }
}

function initialState(limit: number): AnalysesListState {
  return { phase: "loading", items: [], total: 0, limit, offset: 0, errorMessage: null };
}

/**
 * Fetches one page of `GET /api/v1/analyses` (Sprint 5 Task 1). Used
 * both by the dashboard's small "Recent Analyses" list (limit 5, no
 * pagination controls shown) and the full `/analyses` history page
 * (paginated) - the only difference between those two call sites is
 * `limit` and whether the caller renders pagination controls at all.
 */
export function useAnalysesList(limit: number) {
  const [state, dispatch] = useReducer(reducer, undefined, () => initialState(limit));

  const load = useCallback(
    (offset: number) => {
      dispatch({ type: "LOADING" });
      void (async () => {
        try {
          const result = await listAnalyses(limit, offset);
          dispatch({ type: "LOADED", items: result.items, total: result.total, limit: result.limit, offset: result.offset });
        } catch (err) {
          const message = err instanceof AnalysisApiError ? err.message : "An unexpected error occurred.";
          dispatch({ type: "ERROR", message });
        }
      })();
    },
    [limit],
  );

  useEffect(() => {
    load(0);
  }, [load]);

  return { state, reload: () => load(state.offset), nextPage: () => load(state.offset + limit), prevPage: () => load(Math.max(0, state.offset - limit)) };
}
