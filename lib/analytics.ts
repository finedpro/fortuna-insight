import { getAnalyticsSessionId } from "./analytics-session-id";

/**
 * Soft-launch instrumentation. Mirrors the allowlist in the backend's
 * `domain/entities/product-event.entity.ts` - kept as a literal union
 * here (not imported across the frontend/backend boundary, which
 * doesn't share types in this project) so a typo is still caught at
 * compile time on this side too.
 */
export type ProductEventType =
  | "landing_viewed"
  | "dashboard_viewed"
  | "wallet_analysis_started"
  | "wallet_analysis_completed"
  | "wallet_analysis_failed"
  | "evidence_viewed"
  | "markets_viewed"
  | "market_detail_viewed"
  | "market_position_started"
  | "market_position_placed"
  | "positions_viewed";

/**
 * Fire-and-forget - never throws, never awaited by callers, never
 * blocks or delays the real user action it's attached to. If the
 * anonymous session id genuinely can't be read (see
 * `getAnalyticsSessionId`'s own fallback), this silently no-ops
 * rather than sending a malformed request - measuring the product
 * must never risk breaking it.
 *
 * `metadata` must stay small and non-identifying - see this file's
 * own callers for what each event actually sends; never a full
 * wallet address, never anything from a form field that could
 * contain personal data.
 */
export function trackEvent(eventType: ProductEventType, metadata?: Record<string, string | number | boolean>): void {
  const anonymousId = getAnalyticsSessionId();
  if (!anonymousId) return;

  try {
    fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eventType, anonymousId, metadata: metadata ?? null }),
      keepalive: true, // lets the request complete even if the user navigates away immediately after
    })?.catch(() => {
      // Best-effort - a dropped telemetry event is never worth surfacing to the user or retrying.
    });
  } catch {
    // Same best-effort principle for a synchronous throw (e.g. fetch unavailable/mocked oddly in a test environment) - telemetry must never break the page it's measuring.
  }
}
