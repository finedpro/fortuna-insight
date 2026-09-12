"use client";

import { TrendingUp, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { MarketCard } from "./market-card";
import type { MarketsState } from "../hooks/use-markets";

export interface MarketListProps {
  state: MarketsState;
  onRetry: () => void;
}

/** Renders the markets list's 4 real states (loading/loaded/empty/error) - same pattern as WatchlistTable. */
export function MarketList({ state, onRetry }: MarketListProps) {
  if (state.phase === "loading") {
    return <p className="text-sm text-muted-foreground">Loading markets...</p>;
  }

  if (state.phase === "error") {
    return (
      <EmptyState
        icon={WifiOff}
        title="Could not load markets"
        description={state.errorMessage ?? undefined}
        action={
          <Button variant="outline" onClick={onRetry}>
            Try again
          </Button>
        }
      />
    );
  }

  if (state.phase === "empty") {
    return <EmptyState icon={TrendingUp} title="No markets yet" description="Check back soon for open prediction markets." />;
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {state.items.map((market) => (
        <MarketCard key={market.id} market={market} />
      ))}
    </div>
  );
}
