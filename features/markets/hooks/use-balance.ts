import { useCallback, useEffect, useReducer } from "react";
import { getBalance } from "@/lib/api/markets-client";
import { AnalysisApiError } from "@/lib/api/analysis-client";
import type { VirtualBalance } from "@/lib/api/types";

export type BalancePhase = "loading" | "loaded" | "error";

export interface BalanceState {
  phase: BalancePhase;
  balance: VirtualBalance | null;
  errorMessage: string | null;
}

type Action = { type: "LOADING" } | { type: "LOADED"; balance: VirtualBalance } | { type: "ERROR"; message: string };

function reducer(state: BalanceState, action: Action): BalanceState {
  switch (action.type) {
    case "LOADING":
      return { ...state, phase: "loading", errorMessage: null };
    case "LOADED":
      return { phase: "loaded", balance: action.balance, errorMessage: null };
    case "ERROR":
      return { ...state, phase: "error", errorMessage: action.message };
    default:
      return state;
  }
}

/** Fetches the calling owner's virtual balance - `reload()` is called after a successful position placement so the displayed balance reflects the deduction immediately. */
export function useBalance() {
  const [state, dispatch] = useReducer(reducer, { phase: "loading", balance: null, errorMessage: null });

  const reload = useCallback(() => {
    dispatch({ type: "LOADING" });
    void (async () => {
      try {
        const balance = await getBalance();
        dispatch({ type: "LOADED", balance });
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
