import { useCallback, useEffect, useReducer } from "react";
import { listMonitorEvents } from "@/lib/api/monitor-client";
import { AnalysisApiError } from "@/lib/api/analysis-client";
import type { MonitorEvent } from "@/lib/api/types";

export type MonitorEventsPhase = "loading" | "loaded" | "empty" | "error";

export interface MonitorEventsState {
  phase: MonitorEventsPhase;
  items: MonitorEvent[];
  errorMessage: string | null;
}

type Action = { type: "LOADING" } | { type: "LOADED"; items: MonitorEvent[] } | { type: "ERROR"; message: string };

function reducer(state: MonitorEventsState, action: Action): MonitorEventsState {
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

/** Fetches recent monitor events (Sprint 6 Task 1) - the "Recent Activity" feed. Same phase pattern as useWatchlist/useAnalysesList. */
export function useMonitorEvents() {
  const [state, dispatch] = useReducer(reducer, { phase: "loading", items: [], errorMessage: null });

  const reload = useCallback(() => {
    dispatch({ type: "LOADING" });
    void (async () => {
      try {
        const result = await listMonitorEvents(20, 0);
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
