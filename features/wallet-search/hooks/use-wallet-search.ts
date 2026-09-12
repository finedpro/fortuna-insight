import { useCallback, useEffect, useReducer, useRef } from "react";
import { useRouter } from "next/navigation";
import { classifyWalletInput } from "../utils/validate-wallet";
import { postAnalyze, AnalysisApiError } from "@/lib/api/analysis-client";
import { analysisDetailRoute } from "@/lib/constants";
import { trackEvent } from "@/lib/analytics";
import type { WalletSearchAction, WalletSearchState } from "../types";

/**
 * Sprint 3 Task 4 — this used to be a scripted, fake 4-step setTimeout
 * sequence with no real backend call at all. Replaced with one real
 * step: submitting the request to POST /api/v1/analyze. No fake
 * progress is shown here anymore — real, backend-reported progress
 * (queued/running/stage) only starts existing once the report page has
 * a real analysisId to poll, which is exactly why this hook now
 * navigates there as soon as the job is accepted rather than
 * simulating anything client-side first.
 */
export const LOADING_STEPS = ["Submitting analysis request..."] as const;

const initialState: WalletSearchState = {
  value: "",
  status: "idle",
  stepIndex: 0,
};

function reducer(
  state: WalletSearchState,
  action: WalletSearchAction,
): WalletSearchState {
  switch (action.type) {
    case "CHANGE":
      return {
        ...state,
        value: action.value,
        status: classifyWalletInput(action.value),
        errorMessage: undefined,
      };
    case "SUBMIT":
      return state.status === "valid" ? { ...state, status: "submitting" } : state;
    case "START_LOADING":
      return { ...state, status: "loading", stepIndex: 0 };
    case "STEP":
      return { ...state, stepIndex: action.index };
    case "SUCCESS":
      return { ...state, status: "success" };
    case "ERROR":
      return { ...state, status: "error", errorMessage: action.message };
    case "RESET":
      return {
        ...state,
        status: classifyWalletInput(state.value),
        errorMessage: undefined,
        stepIndex: 0,
      };
    default:
      return state;
  }
}

/**
 * Drives the wallet search state machine: input classification, then a
 * real POST /api/v1/analyze call, then navigation to the report page
 * with the real analysisId the backend returned. No blockchain or AI
 * work happens here — this hook's job ends the moment the job is
 * accepted; the report page takes over from there via
 * useAnalysisStatus.
 */
export function useWalletSearch() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const router = useRouter();
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const onChange = useCallback((value: string) => {
    dispatch({ type: "CHANGE", value });
  }, []);

  const submit = useCallback(() => {
    if (state.status !== "valid") return;
    const address = state.value.trim();
    dispatch({ type: "SUBMIT" });

    void (async () => {
      dispatch({ type: "START_LOADING" });
      dispatch({ type: "STEP", index: 0 });

      try {
        const accepted = await postAnalyze(address, "solana");
        if (!mountedRef.current) return;

        // Fired only here, after the backend has genuinely accepted the
        // analysis job - a rejected/failed submission never fires this.
        // Never includes the wallet address itself - only the network,
        // which carries no identifying information.
        trackEvent("wallet_analysis_started", { network: "solana" });

        dispatch({ type: "SUCCESS" });
        router.push(analysisDetailRoute(accepted.id));
      } catch (err) {
        if (!mountedRef.current) return;
        const message =
          err instanceof AnalysisApiError
            ? err.message
            : "Something went wrong. Please try again.";
        dispatch({ type: "ERROR", message });
      }
    })();
  }, [state.status, state.value, router]);

  const reset = useCallback(() => {
    dispatch({ type: "RESET" });
  }, []);

  return { state, onChange, submit, reset, loadingSteps: LOADING_STEPS };
}
