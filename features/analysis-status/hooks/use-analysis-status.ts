import { useEffect, useReducer, useRef } from "react";
import { getAnalysis, AnalysisApiError } from "@/lib/api/analysis-client";
import { trackEvent } from "@/lib/analytics";
import type { AnalysisStatusState, AnalysisStatusPhase } from "../types";

const POLL_INTERVAL_MS = 2500;

type Action =
  | { type: "IN_PROGRESS"; progress: AnalysisStatusState["progress"] }
  | { type: "COMPLETED"; result: AnalysisStatusState["result"] }
  | { type: "FAILED"; error: AnalysisStatusState["error"] }
  | { type: "CANCELLED"; error: AnalysisStatusState["error"] }
  | { type: "NOT_FOUND" }
  | { type: "ERROR"; error: AnalysisStatusState["error"] };

const initialState: AnalysisStatusState = {
  phase: "loading",
  progress: null,
  result: null,
  error: null,
};

function reducer(state: AnalysisStatusState, action: Action): AnalysisStatusState {
  switch (action.type) {
    case "IN_PROGRESS":
      return { phase: "in_progress", progress: action.progress, result: null, error: null };
    case "COMPLETED":
      return { phase: "completed", progress: null, result: action.result, error: null };
    case "FAILED":
      return { phase: "failed", progress: null, result: null, error: action.error };
    case "CANCELLED":
      return { phase: "cancelled", progress: null, result: null, error: action.error };
    case "NOT_FOUND":
      return { phase: "not_found", progress: null, result: null, error: null };
    case "ERROR":
      return { phase: "error", progress: state.progress, result: null, error: action.error };
    default:
      return state;
  }
}

const TERMINAL_PHASES: readonly AnalysisStatusPhase[] = ["completed", "failed", "cancelled", "not_found"];

/**
 * Polls GET /api/v1/analysis/{id} (via the local proxy) until the
 * analysis reaches a terminal state - completed, failed, cancelled, or
 * not_found. A transient network error while polling doesn't stop
 * polling (the backend may just be briefly unreachable); it's surfaced
 * via `phase: "error"` while the timer keeps trying, since retrying is
 * more useful here than giving up. Polling stops immediately (before
 * the next tick fires) once a terminal state is reached, and is always
 * cleaned up on unmount.
 */
export function useAnalysisStatus(analysisId: string | null): AnalysisStatusState {
  const [state, dispatch] = useReducer(reducer, initialState);
  const idRef = useRef(analysisId);
  idRef.current = analysisId;

  useEffect(() => {
    if (!analysisId) return;

    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    async function poll() {
      try {
        const result = await getAnalysis(analysisId!);
        if (cancelled) return;

        switch (result.kind) {
          case "completed":
            dispatch({ type: "COMPLETED", result: result.data });
            trackEvent("wallet_analysis_completed");
            return; // terminal - stop polling
          case "failed":
            dispatch({ type: "FAILED", error: result.error });
            trackEvent("wallet_analysis_failed");
            return; // terminal - stop polling
          case "cancelled":
            dispatch({ type: "CANCELLED", error: result.error });
            return; // terminal - stop polling
          case "not_found":
            dispatch({ type: "NOT_FOUND" });
            return; // terminal - stop polling
          case "in_progress":
            dispatch({ type: "IN_PROGRESS", progress: result.data });
            break;
        }
      } catch (err) {
        if (cancelled) return;
        const message = err instanceof AnalysisApiError ? err.message : "An unexpected error occurred.";
        const code = err instanceof AnalysisApiError ? err.code : "UNKNOWN_ERROR";
        dispatch({ type: "ERROR", error: { code, message } });
      }

      if (!cancelled) {
        timeoutId = setTimeout(poll, POLL_INTERVAL_MS);
      }
    }

    void poll();

    return () => {
      cancelled = true;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [analysisId]);

  return state;
}

export { TERMINAL_PHASES };
