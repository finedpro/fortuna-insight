"use client";

import { Activity, WifiOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import type { MonitorEventsState } from "../hooks/use-monitor-events";
import type { MonitorEventType } from "@/lib/api/types";

const EVENT_LABELS: Record<MonitorEventType, string> = {
  tokenPurchase: "Token purchase",
  tokenSale: "Token sale",
  largeTransaction: "Large transaction",
  newTokenInteraction: "New token",
  balanceChange: "Balance change",
  solTransfer: "SOL transfer",
};

function truncate(address: string): string {
  return address.length > 12 ? `${address.slice(0, 6)}...${address.slice(-4)}` : address;
}

export interface MonitorEventsListProps {
  state: MonitorEventsState;
  onRetry: () => void;
}

/** Renders recent monitor events - event type, wallet, value, timestamp, exactly per the approved plan's minimal structure. Every value traces to a real MonitorEvent field. */
export function MonitorEventsList({ state, onRetry }: MonitorEventsListProps) {
  if (state.phase === "loading") {
    return <p className="text-sm text-muted-foreground">Loading recent activity...</p>;
  }

  if (state.phase === "error") {
    return (
      <EmptyState
        icon={WifiOff}
        title="Could not load recent activity"
        description={state.errorMessage ?? undefined}
        action={
          <button onClick={onRetry} className="text-sm font-medium text-gold hover:underline">
            Try again
          </button>
        }
      />
    );
  }

  if (state.phase === "empty") {
    return <EmptyState icon={Activity} title="No activity detected yet" description="Detected events for your watched wallets will appear here." />;
  }

  return (
    <div className="flex flex-col gap-3">
      {state.items.map((event) => (
        <div key={event.id} className="flex flex-col gap-2 rounded-lg border border-border bg-surface-elevated/40 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-1 min-w-0">
            <div className="flex items-center gap-2">
              <Badge variant="teal">{EVENT_LABELS[event.eventType]}</Badge>
              <span className="truncate text-xs text-muted-foreground">
                {event.walletLabel ?? (event.walletAddress ? truncate(event.walletAddress) : "Unknown wallet")}
              </span>
            </div>
            {event.payload.amount && (
              <span className="text-sm text-foreground">
                {event.payload.amount} {event.payload.mint ? truncate(event.payload.mint) : "SOL"}
              </span>
            )}
          </div>
          <span className="text-xs text-muted-foreground">
            {new Date(event.detectedAt).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}
          </span>
        </div>
      ))}
    </div>
  );
}
