"use client";

import { useEffect, useRef } from "react";
import { WifiOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DashboardCard } from "@/components/ui/dashboard-card";
import { MetricCard } from "@/components/ui/metric-card";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { typography } from "@/lib/design-system";
import { useMarket } from "../hooks/use-market";
import { useBalance } from "../hooks/use-balance";
import { usePositions } from "../hooks/use-positions";
import { useMarketEvidence } from "../hooks/use-market-evidence";
import { PredictionPanel } from "./prediction-panel";
import { MarketEvidenceCard } from "./market-evidence-card";
import { trackEvent } from "@/lib/analytics";
import type { MarketSubjectType } from "@/lib/api/types";

export interface MarketDetailProps {
  marketId: string;
}

/** Purely factual labels - "Wallet"/"Asset"/"Network" describe WHAT the market is about, never implying anything about the prediction itself. "Unknown" is shown as-is for pre-Sprint-3 legacy markets, not disguised as a real subject. */
const SUBJECT_TYPE_LABEL: Record<MarketSubjectType, string> = {
  ASSET: "Asset",
  WALLET: "Wallet",
  NETWORK: "Network",
  UNKNOWN: "Unknown",
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

/**
 * Combines market/balance/the caller's own positions for this market.
 * No new hook was added just to scope positions to one market -
 * `usePositions()` already fetches everything the owner has, and
 * filtering client-side avoids introducing a global cache or a
 * second, narrower positions endpoint the backend doesn't offer
 * (approved architecture, §14: "do not introduce a new global cache
 * just to resolve market questions" - the same reasoning applies here
 * to scoping, not just resolving names).
 */
export function MarketDetail({ marketId }: MarketDetailProps) {
  const { state: marketState, reload: reloadMarket } = useMarket(marketId);
  const { state: balanceState, reload: reloadBalance } = useBalance();
  const { state: positionsState, reload: reloadPositions } = usePositions();
  const { state: evidenceState } = useMarketEvidence(marketId);

  // Soft-launch instrumentation - fired at most once per mount, guarded
  // by a ref rather than relying on the dependency array alone, since a
  // reload (reloadMarket/reloadBalance/reloadPositions after placing a
  // position) would otherwise re-trigger these on every subsequent
  // "loaded" transition, which would misrepresent one visit as several.
  const detailViewedRef = useRef(false);
  const evidenceViewedRef = useRef(false);

  useEffect(() => {
    if (marketState.phase === "loaded" && marketState.market && !detailViewedRef.current) {
      detailViewedRef.current = true;
      trackEvent("market_detail_viewed", { subjectType: marketState.market.subject.type });
    }
  }, [marketState]);

  useEffect(() => {
    if ((evidenceState.phase === "loaded" || evidenceState.phase === "empty") && !evidenceViewedRef.current) {
      evidenceViewedRef.current = true;
      trackEvent("evidence_viewed", { itemCount: evidenceState.phase === "loaded" ? evidenceState.items.length : 0 });
    }
  }, [evidenceState]);

  function handlePlaced() {
    reloadMarket();
    reloadBalance();
    reloadPositions();
  }

  if (marketState.phase === "loading") {
    return <p className="text-sm text-muted-foreground">Loading market...</p>;
  }

  if (marketState.phase === "error" || !marketState.market) {
    return (
      <EmptyState
        icon={WifiOff}
        title="Could not load this market"
        description={marketState.errorMessage ?? undefined}
        action={
          <Button variant="outline" onClick={reloadMarket}>
            Try again
          </Button>
        }
      />
    );
  }

  const market = marketState.market;
  const totalPool = market.totalYesStake + market.totalNoStake;
  const yesPercent = market.impliedProbabilityYes !== null ? Math.round(market.impliedProbabilityYes * 100) : null;
  const myPosition = positionsState.phase === "loaded" || positionsState.phase === "empty" ? positionsState.items.find((p) => p.marketId === marketId) : undefined;

  const isPastClose = new Date(market.closesAt) <= new Date();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <p className={cn(typography.h1.className, "text-foreground")}>{market.question}</p>
        <Badge variant={market.status === "OPEN" ? "success" : "default"}>{market.status}</Badge>
      </div>

      <p className="text-sm text-muted-foreground">Closes {formatDate(market.closesAt)}</p>

      <div className="flex flex-col gap-1">
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Subject</p>
        <p className="text-sm text-foreground">
          {SUBJECT_TYPE_LABEL[market.subject.type]} · <span className="font-mono">{market.subject.reference}</span>
        </p>
      </div>

      {/* Launch polish - Evidence promoted directly after the question/subject, ahead of pool/balance context, so the page reads Question -> Evidence -> Decision, matching "Predict with evidence." */}
      {evidenceState.phase === "loading" && <p className="text-sm text-muted-foreground">Loading evidence...</p>}

      {evidenceState.phase === "error" && (
        <DashboardCard title="Evidence">
          <p className="text-sm text-muted-foreground">Evidence is temporarily unavailable. Please try again shortly.</p>
        </DashboardCard>
      )}

      {(evidenceState.phase === "loaded" || evidenceState.phase === "empty") && <MarketEvidenceCard items={evidenceState.items} />}

      {/* Launch polish - virtual-points disclaimer, visible on every individual market page before the YES/NO controls (Product/UX audit finding: the Markets list disclaimer doesn't reach a user who lands directly on one market). */}
      <p className="rounded-md border border-border bg-surface-elevated/30 px-3 py-2 text-xs text-muted-foreground">
        Virtual points only. They have no monetary value and cannot be withdrawn or exchanged for money.
      </p>

      {/* Pool/balance context - kept available but visually secondary to Evidence above, shown as compact context right before the decision itself rather than competing for top billing. */}
      <div className="flex flex-col gap-3">
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Pool</p>
        <div className="grid gap-4 sm:grid-cols-3">
          <MetricCard label="YES Pool" value={`${market.totalYesStake} pts`} />
          <MetricCard label="NO Pool" value={`${market.totalNoStake} pts`} />
          <MetricCard label="Total Pool" value={`${totalPool} pts`} description={yesPercent !== null ? `Current pool: ${yesPercent}% YES` : "No predictions yet"} />
        </div>
        {balanceState.phase === "loaded" && balanceState.balance && <MetricCard label="Virtual Balance" value={`${balanceState.balance.balance} pts`} />}
      </div>

      {market.status === "OPEN" && !isPastClose && <PredictionPanel market={market} onPlaced={handlePlaced} />}

      {market.status === "OPEN" && isPastClose && <p className="text-sm text-muted-foreground">Closed — awaiting resolution</p>}

      {market.status === "RESOLVED" && (
        <div className="flex flex-col gap-3 rounded-lg border border-border bg-surface-elevated/40 p-4">
          <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Resolved</p>
          <p className="text-sm text-foreground">Outcome: {market.resolvedOutcome}</p>
          {myPosition ? (
            <p className="text-sm text-foreground">
              Your prediction: {myPosition.outcome} · {myPosition.stake} pts —{" "}
              {myPosition.status === "settled" ? `Payout: ${myPosition.payout} pts` : "Settlement pending"}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">You didn&apos;t predict on this market.</p>
          )}
        </div>
      )}
    </div>
  );
}
