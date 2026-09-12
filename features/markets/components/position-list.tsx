"use client";

import Link from "next/link";
import { Compass, WifiOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import type { PositionsState } from "../hooks/use-positions";

export interface PositionListProps {
  state: PositionsState;
  onRetry: () => void;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

/**
 * Launch polish - shows the market's own question (enriched by the
 * backend at the API boundary, see `list-positions.controller.ts`),
 * never a raw marketId. Falls back to the id only in the genuinely
 * rare case the market could not be resolved - never silently hides
 * the position itself.
 */
export function PositionList({ state, onRetry }: PositionListProps) {
  if (state.phase === "loading") {
    return <p className="text-sm text-muted-foreground">Loading positions...</p>;
  }

  if (state.phase === "error") {
    return (
      <EmptyState
        icon={WifiOff}
        title="Could not load positions"
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
    return <EmptyState icon={Compass} title="No predictions yet" description="Place a prediction on an open market to see it here." />;
  }

  return (
    <div className="flex flex-col gap-3">
      {state.items.map((position) => (
        <Link
          key={position.id}
          href={`/markets/${position.marketId}`}
          className="flex flex-col gap-3 rounded-lg border border-border bg-surface-elevated/40 p-4 transition-colors hover:bg-surface-elevated/70 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex flex-col gap-1 min-w-0">
            <span className="truncate text-sm font-medium text-foreground">{position.marketQuestion ?? `Market ${position.marketId}`}</span>
            <span className="text-sm text-foreground">
              {position.outcome} · {position.stake} pts
            </span>
            <span className="text-xs text-muted-foreground">
              Placed {formatDate(position.createdAt)}
              {position.settledAt && ` · Settled ${formatDate(position.settledAt)}`}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {position.status === "settled" && position.payout !== null && (
              <span className="text-sm text-foreground">Payout: {position.payout} pts</span>
            )}
            <Badge variant={position.status === "settled" ? "default" : "gold"}>{position.status}</Badge>
          </div>
        </Link>
      ))}
    </div>
  );
}
