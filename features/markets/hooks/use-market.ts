import { useCallback, useEffect, useReducer } from "react";
import { getMarket } from "@/lib/api/markets-client";
import { AnalysisApiError } from "@/lib/api/analysis-client";
import type { Market } from "@/lib/api/types";

export type MarketPhase = "loading" | "loaded" | "error";

export interface MarketState {
  phase: MarketPhase;
  market: Market | null;
  errorMessage: string | null;
}

type Action = { type: "LOADING" } | { type: "LOADED"; market: Market } | { type: "ERROR"; message: string };

function reducer(state: MarketState, action: Action): MarketState {
  switch (action.type) {
    case "LOADING":
      return { ...state, phase: "loading", errorMessage: null };
    case "LOADED":
      return { phase: "loaded", market: action.market, errorMessage: null };
    case "ERROR":
      return { ...state, phase: "error", errorMessage: action.message };
    default:
      return state;
  }
}

/** Fetches one market by id - `reload()` is called after a successful position placement (via `PredictionPanel`) so the shown pool totals reflect the just-placed stake immediately, without a page refresh. */
export function useMarket(marketId: string) {
  const [state, dispatch] = useReducer(reducer, { phase: "loading", market: null, errorMessage: null });

  const reload = useCallback(() => {
    dispatch({ type: "LOADING" });
    void (async () => {
      try {
        const market = await getMarket(marketId);
        dispatch({ type: "LOADED", market });
      } catch (err) {
        const message = err instanceof AnalysisApiError ? err.message : "An unexpected error occurred.";
        dispatch({ type: "ERROR", message });
      }
    })();
  }, [marketId]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { state, reload };
}
