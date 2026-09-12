import type { ApiEnvelope, WatchedWallet, WatchlistResponse, MonitorEventsResponse, WatchRuleKey } from "./types";
import { AnalysisApiError } from "./analysis-client";
import { getOwnerKey } from "../owner-key";

/**
 * Client-side API layer for Fortuna Monitor (Sprint 6 Task 1) - same
 * pattern as `analysis-client.ts`: calls this app's own same-origin
 * proxy routes, never fabricates a result, throws `AnalysisApiError`
 * (reused, not duplicated) on any failure.
 *
 * Launch-readiness hardening: `addWatchedWallet`/`deleteWatchedWallet`
 * now send `X-Fortuna-Owner-Key` (via the same `getOwnerKey()` Markets
 * already uses - no second identity mechanism), since the backend
 * requires it to record/verify entry ownership.
 */

export async function addWatchedWallet(params: {
  walletAddress: string;
  network?: string;
  label?: string;
  watchRules?: Partial<Record<WatchRuleKey, boolean>>;
}): Promise<WatchedWallet> {
  let response: Response;
  try {
    response = await fetch("/api/watchlist", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Fortuna-Owner-Key": getOwnerKey() },
      body: JSON.stringify({ network: params.network ?? "solana", walletAddress: params.walletAddress, label: params.label, watchRules: params.watchRules }),
    });
  } catch {
    throw new AnalysisApiError("NETWORK_ERROR", "Could not reach Fortuna. Check your connection and try again.", 0);
  }

  const body = (await response.json()) as ApiEnvelope<WatchedWallet>;
  if (!response.ok || !body.success || !body.data) {
    throw new AnalysisApiError(body.error?.code ?? "UNKNOWN_ERROR", body.error?.message ?? `Request failed with status ${response.status}.`, response.status);
  }
  return body.data;
}

export async function listWatchlist(limit: number, offset: number): Promise<WatchlistResponse> {
  let response: Response;
  try {
    response = await fetch(`/api/watchlist?limit=${limit}&offset=${offset}`, { cache: "no-store" });
  } catch {
    throw new AnalysisApiError("NETWORK_ERROR", "Could not reach Fortuna. Check your connection and try again.", 0);
  }

  const body = (await response.json()) as ApiEnvelope<WatchlistResponse>;
  if (!response.ok || !body.success || !body.data) {
    throw new AnalysisApiError(body.error?.code ?? "UNKNOWN_ERROR", body.error?.message ?? `Request failed with status ${response.status}.`, response.status);
  }
  return body.data;
}

export async function deleteWatchedWallet(id: string): Promise<void> {
  let response: Response;
  try {
    response = await fetch(`/api/watchlist/${encodeURIComponent(id)}`, { method: "DELETE", headers: { "X-Fortuna-Owner-Key": getOwnerKey() } });
  } catch {
    throw new AnalysisApiError("NETWORK_ERROR", "Could not reach Fortuna. Check your connection and try again.", 0);
  }

  const body = (await response.json()) as ApiEnvelope<{ id: string; deleted: boolean }>;
  if (!response.ok || !body.success) {
    throw new AnalysisApiError(body.error?.code ?? "UNKNOWN_ERROR", body.error?.message ?? `Request failed with status ${response.status}.`, response.status);
  }
}

export async function listMonitorEvents(limit: number, offset: number): Promise<MonitorEventsResponse> {
  let response: Response;
  try {
    response = await fetch(`/api/monitor/events?limit=${limit}&offset=${offset}`, { cache: "no-store" });
  } catch {
    throw new AnalysisApiError("NETWORK_ERROR", "Could not reach Fortuna. Check your connection and try again.", 0);
  }

  const body = (await response.json()) as ApiEnvelope<MonitorEventsResponse>;
  if (!response.ok || !body.success || !body.data) {
    throw new AnalysisApiError(body.error?.code ?? "UNKNOWN_ERROR", body.error?.message ?? `Request failed with status ${response.status}.`, response.status);
  }
  return body.data;
}
