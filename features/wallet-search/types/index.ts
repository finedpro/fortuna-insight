/**
 * State machine types for the wallet search experience.
 *
 * idle       — no input yet
 * typing     — user is actively typing, too short to classify yet
 * invalid    — non-empty input that doesn't match wallet address format
 * valid      — input matches wallet address format, ready to submit
 * submitting — Analyze clicked, brief confirmation beat before loading
 * loading    — full loading experience (progress steps) is running
 * success    — loading finished, about to navigate to /analysis/[id]
 * error      — something unexpected broke the flow (not blockchain-related)
 */
export type WalletSearchStatus =
  | "idle"
  | "typing"
  | "invalid"
  | "valid"
  | "submitting"
  | "loading"
  | "success"
  | "error";

export interface WalletSearchState {
  value: string;
  status: WalletSearchStatus;
  /** Index into the loading steps list, only meaningful while status is "loading". */
  stepIndex: number;
  errorMessage?: string;
}

export type WalletSearchAction =
  | { type: "CHANGE"; value: string }
  | { type: "SUBMIT" }
  | { type: "START_LOADING" }
  | { type: "STEP"; index: number }
  | { type: "SUCCESS" }
  | { type: "ERROR"; message: string }
  | { type: "RESET" };
