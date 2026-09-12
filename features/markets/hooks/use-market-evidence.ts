import { useCallback, useEffect, useReducer } from "react";
import { getMarketEvidence } from "@/lib/api/markets-client";
import { AnalysisApiError } from "@/lib/api/analysis-client";
import type { MarketEvidenceItem } from "@/lib/api/types";

export type MarketEvidencePhase = "loading" | "loaded" | "empty" | "error";

export interface MarketEvidenceState {
  phase: MarketEvidencePhase;
  items: MarketEvidenceItem[];
  errorMessage: string | null;
}

type Action = { type: "LOADING" } | { type: "LOADED"; items: MarketEvidenceItem[] } | { type: "ERROR"; message: string };

function reducer(state: MarketEvidenceState, action: Action): MarketEvidenceState {
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

/** Fetches a market's evidence context - `empty` is the expected, common phase right now (Sprint 2's honest result, not an error state to be surprised by). */
export function useMarketEvidence(marketId: string) {
  const [state, dispatch] = useReducer(reducer, { phase: "loading", items: [], errorMessage: null });

  const reload = useCallback(() => {
    dispatch({ type: "LOADING" });
    void (async () => {
      try {
        const result = await getMarketEvidence(marketId);
        dispatch({ type: "LOADED", items: result.items });
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
