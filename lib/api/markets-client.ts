import type { ApiEnvelope, Market, Position, VirtualBalance, MarketsListResponse, PositionsListResponse, MarketOutcome, MarketEvidenceResponse } from "./types";
import { AnalysisApiError } from "./analysis-client";
import { getOwnerKey } from "../owner-key";

/**
 * Client-side API layer for Fortuna Markets Sprint 1 - same pattern as
 * `analysis-client.ts`/`monitor-client.ts`: calls this app's own
 * same-origin proxy routes, never fabricates a result, throws the
 * shared `AnalysisApiError` (reused, not a new `MarketsApiError`) on
 * any failure. Owner-scoped requests attach `X-Fortuna-Owner-Key` via
 * `getOwnerKey()` - never in the URL or body, per the backend's
 * locked contract.
 */

export async function listMarkets(status?: "OPEN" | "RESOLVED"): Promise<MarketsListResponse> {
  let response: Response;
  const query = status ? `?status=${status}` : "";
  try {
    response = await fetch(`/api/markets${query}`, { cache: "no-store" });
  } catch {
    throw new AnalysisApiError("NETWORK_ERROR", "Could not reach Fortuna. Check your connection and try again.", 0);
  }

  const body = (await response.json()) as ApiEnvelope<MarketsListResponse>;
  if (!response.ok || !body.success || !body.data) {
    throw new AnalysisApiError(body.error?.code ?? "UNKNOWN_ERROR", body.error?.message ?? `Request failed with status ${response.status}.`, response.status);
  }
  return body.data;
}

export async function getMarket(id: string): Promise<Market> {
  let response: Response;
  try {
    response = await fetch(`/api/markets/${encodeURIComponent(id)}`, { cache: "no-store" });
  } catch {
    throw new AnalysisApiError("NETWORK_ERROR", "Could not reach Fortuna. Check your connection and try again.", 0);
  }

  const body = (await response.json()) as ApiEnvelope<Market>;
  if (!response.ok || !body.success || !body.data) {
    throw new AnalysisApiError(body.error?.code ?? "UNKNOWN_ERROR", body.error?.message ?? `Request failed with status ${response.status}.`, response.status);
  }
  return body.data;
}

export async function placePosition(marketId: string, params: { outcome: MarketOutcome; stake: number; idempotencyKey: string }): Promise<Position> {
  let response: Response;
  try {
    response = await fetch(`/api/markets/${encodeURIComponent(marketId)}/positions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Fortuna-Owner-Key": getOwnerKey() },
      body: JSON.stringify(params),
    });
  } catch {
    throw new AnalysisApiError("NETWORK_ERROR", "Could not reach Fortuna. Check your connection and try again.", 0);
  }

  const body = (await response.json()) as ApiEnvelope<Position>;
  if (!response.ok || !body.success || !body.data) {
    throw new AnalysisApiError(body.error?.code ?? "UNKNOWN_ERROR", body.error?.message ?? `Request failed with status ${response.status}.`, response.status);
  }
  return body.data;
}

export async function listPositions(): Promise<PositionsListResponse> {
  let response: Response;
  try {
    response = await fetch("/api/positions", { cache: "no-store", headers: { "X-Fortuna-Owner-Key": getOwnerKey() } });
  } catch {
    throw new AnalysisApiError("NETWORK_ERROR", "Could not reach Fortuna. Check your connection and try again.", 0);
  }

  const body = (await response.json()) as ApiEnvelope<PositionsListResponse>;
  if (!response.ok || !body.success || !body.data) {
    throw new AnalysisApiError(body.error?.code ?? "UNKNOWN_ERROR", body.error?.message ?? `Request failed with status ${response.status}.`, response.status);
  }
  return body.data;
}

export async function getBalance(): Promise<VirtualBalance> {
  let response: Response;
  try {
    response = await fetch("/api/balance", { cache: "no-store", headers: { "X-Fortuna-Owner-Key": getOwnerKey() } });
  } catch {
    throw new AnalysisApiError("NETWORK_ERROR", "Could not reach Fortuna. Check your connection and try again.", 0);
  }

  const body = (await response.json()) as ApiEnvelope<VirtualBalance>;
  if (!response.ok || !body.success || !body.data) {
    throw new AnalysisApiError(body.error?.code ?? "UNKNOWN_ERROR", body.error?.message ?? `Request failed with status ${response.status}.`, response.status);
  }
  return body.data;
}

/** Fortuna Markets Sprint 2. No owner header - evidence is a property of the market itself, matching getMarket(). */
export async function getMarketEvidence(marketId: string): Promise<MarketEvidenceResponse> {
  let response: Response;
  try {
    response = await fetch(`/api/markets/${encodeURIComponent(marketId)}/evidence`, { cache: "no-store" });
  } catch {
    throw new AnalysisApiError("NETWORK_ERROR", "Could not reach Fortuna. Check your connection and try again.", 0);
  }

  const body = (await response.json()) as ApiEnvelope<MarketEvidenceResponse>;
  if (!response.ok || !body.success || !body.data) {
    throw new AnalysisApiError(body.error?.code ?? "UNKNOWN_ERROR", body.error?.message ?? `Request failed with status ${response.status}.`, response.status);
  }
  return body.data;
}
