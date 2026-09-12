import type {
  ApiEnvelope,
  JobAcceptedData,
  AnalysisStatusData,
  AnalysisCompletedData,
  AnalysisListResponse,
} from "./types";

export class AnalysisApiError extends Error {
  readonly code: string;
  readonly status: number;

  constructor(code: string, message: string, status: number) {
    super(message);
    this.name = "AnalysisApiError";
    this.code = code;
    this.status = status;
  }
}

/**
 * Client-side API layer — calls this app's own same-origin proxy
 * routes (app/api/analyze, app/api/analysis/[id]), never the backend
 * directly (avoids a browser CORS round-trip; see those routes' own
 * doc comments). Every function returns real data straight from the
 * backend's envelope or throws `AnalysisApiError` — never fabricates a
 * result.
 */

export async function postAnalyze(
  walletAddress: string,
  network: string = "solana",
): Promise<JobAcceptedData> {
  let response: Response;
  try {
    response = await fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ network, walletAddress }),
    });
  } catch {
    throw new AnalysisApiError("NETWORK_ERROR", "Could not reach Fortuna. Check your connection and try again.", 0);
  }

  const body = (await response.json()) as ApiEnvelope<JobAcceptedData>;

  if (!response.ok || !body.success || !body.data) {
    throw new AnalysisApiError(
      body.error?.code ?? "UNKNOWN_ERROR",
      body.error?.message ?? `Request failed with status ${response.status}.`,
      response.status,
    );
  }

  return body.data;
}

export type AnalysisPollResult =
  | { kind: "in_progress"; data: AnalysisStatusData }
  | { kind: "completed"; data: AnalysisCompletedData }
  | { kind: "failed"; error: ApiEnvelope<never>["error"] }
  | { kind: "cancelled"; error: ApiEnvelope<never>["error"] }
  | { kind: "not_found" };

/**
 * A single poll of GET /api/v1/analysis/{id}. Deliberately returns a
 * tagged result rather than throwing for FAILED/CANCELLED/NOT_FOUND -
 * those are legitimate, expected terminal outcomes the UI needs to
 * render, not exceptional conditions. A genuine network failure still
 * throws `AnalysisApiError`.
 */
export async function getAnalysis(id: string): Promise<AnalysisPollResult> {
  let response: Response;
  try {
    response = await fetch(`/api/analysis/${encodeURIComponent(id)}`, { cache: "no-store" });
  } catch {
    throw new AnalysisApiError("NETWORK_ERROR", "Could not reach Fortuna. Check your connection and try again.", 0);
  }

  const body = (await response.json()) as ApiEnvelope<AnalysisStatusData | AnalysisCompletedData>;

  if (response.status === 404) {
    return { kind: "not_found" };
  }

  if (response.status === 499) {
    return { kind: "cancelled", error: body.error };
  }

  if (!body.success || body.error) {
    // Any other non-2xx (422/500/502/504) — the analysis reached a FAILED terminal state.
    return { kind: "failed", error: body.error };
  }

  if (!body.data) {
    throw new AnalysisApiError("UNKNOWN_ERROR", "The server returned an unexpected empty response.", response.status);
  }

  if (body.data.status === "completed") {
    return { kind: "completed", data: body.data as AnalysisCompletedData };
  }

  return { kind: "in_progress", data: body.data as AnalysisStatusData };
}

/**
 * Fetches a page of recent analyses (Sprint 5 Task 1) via
 * GET /api/v1/analyses. Throws `AnalysisApiError` on any failure -
 * unlike `getAnalysis`, there's no legitimate "terminal state" to
 * distinguish here, so every non-2xx response is a genuine error.
 */
export async function listAnalyses(limit: number, offset: number): Promise<AnalysisListResponse> {
  let response: Response;
  try {
    response = await fetch(`/api/analyses?limit=${limit}&offset=${offset}`, { cache: "no-store" });
  } catch {
    throw new AnalysisApiError("NETWORK_ERROR", "Could not reach Fortuna. Check your connection and try again.", 0);
  }

  const body = (await response.json()) as ApiEnvelope<AnalysisListResponse>;

  if (!response.ok || !body.success || !body.data) {
    throw new AnalysisApiError(
      body.error?.code ?? "UNKNOWN_ERROR",
      body.error?.message ?? `Request failed with status ${response.status}.`,
      response.status,
    );
  }

  return body.data;
}
