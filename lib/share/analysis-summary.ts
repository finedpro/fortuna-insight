import { BACKEND_BASE_URL } from "@/lib/api/config";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
/** Link-preview crawlers give up quickly, and the free backend may be asleep: never wait long. */
const FETCH_TIMEOUT_MS = 3_000;

export interface AnalysisSummary {
  network: string;
  /** Shortened (first 4 … last 4). The full address is never put in a preview. */
  shortAddress: string;
  healthScore: number;
  confidence: string;
  /** Null when the analysis was stored before token holdings existed. */
  tokenCount: number | null;
  transactionCount: number | null;
}

export function shortenAddress(address: string): string {
  return address.length <= 10 ? address : `${address.slice(0, 4)}…${address.slice(-4)}`;
}

/** Pure: picks only what a public preview may show from a backend response body. Returns null for anything that is not a completed analysis with a health score. */
export function summarizeAnalysis(body: unknown): AnalysisSummary | null {
  try {
    const data = (body as { data?: { status?: unknown; result?: Record<string, unknown> } })?.data;
    if (!data || data.status !== "completed" || !data.result) return null;
    const result = data.result as {
      success?: unknown;
      walletAddress?: unknown;
      network?: unknown;
      healthResult?: { healthScore?: unknown; confidence?: unknown } | null;
      walletSnapshot?: { tokensTotal?: unknown; transactionCount?: unknown } | null;
    };
    const score = result.healthResult?.healthScore;
    if (result.success !== true || typeof result.walletAddress !== "string" || typeof score !== "number") return null;

    const tokens = result.walletSnapshot?.tokensTotal;
    const transactions = result.walletSnapshot?.transactionCount;
    return {
      network: typeof result.network === "string" ? result.network : "solana",
      shortAddress: shortenAddress(result.walletAddress),
      healthScore: Math.round(score),
      confidence: typeof result.healthResult?.confidence === "string" ? result.healthResult.confidence : "",
      tokenCount: typeof tokens === "number" ? tokens : null,
      transactionCount: typeof transactions === "number" ? transactions : null,
    };
  } catch {
    return null;
  }
}

/** Server-side. Never throws: any problem (bad id, backend asleep, timeout) yields null and the caller falls back to a generic preview. */
export async function fetchAnalysisSummary(id: string): Promise<AnalysisSummary | null> {
  if (!UUID_PATTERN.test(id)) return null;
  try {
    const response = await fetch(`${BACKEND_BASE_URL}/api/v1/analysis/${encodeURIComponent(id)}`, {
      cache: "no-store",
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
    if (!response.ok) return null;
    return summarizeAnalysis(await response.json());
  } catch {
    return null;
  }
}

export function describeSummary(summary: AnalysisSummary): string {
  const parts = [`Health score ${summary.healthScore}/100`];
  if (summary.tokenCount !== null) parts.push(`${summary.tokenCount} tokens`);
  if (summary.transactionCount !== null) parts.push(`${summary.transactionCount} transactions`);
  return parts.join(" · ");
}
