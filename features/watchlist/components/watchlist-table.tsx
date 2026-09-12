"use client";

import { Users, WifiOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import type { WatchlistState } from "../hooks/use-watchlist";

function truncate(address: string): string {
  return address.length > 12 ? `${address.slice(0, 6)}...${address.slice(-4)}` : address;
}

function formatLastActivity(iso: string | null): string {
  if (!iso) return "Never checked yet";
  return new Date(iso).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

export interface WatchlistTableProps {
  state: WatchlistState;
  onRetry: () => void;
  onRemove: (id: string) => void;
}

/** Renders the watchlist's 4 real states (loading/loaded/empty/error) - every field shown comes directly from WatchedWallet, nothing invented. */
export function WatchlistTable({ state, onRetry, onRemove }: WatchlistTableProps) {
  if (state.phase === "loading") {
    return <p className="text-sm text-muted-foreground">Loading watchlist...</p>;
  }

  if (state.phase === "error") {
    return (
      <EmptyState
        icon={WifiOff}
        title="Could not load watchlist"
        description={state.errorMessage ?? undefined}
        action={<Button variant="outline" onClick={onRetry}>Try again</Button>}
      />
    );
  }

  if (state.phase === "empty") {
    return <EmptyState icon={Users} title="No wallets watched yet" description="Add a wallet above to start monitoring it." />;
  }

  return (
    <div className="flex flex-col gap-3">
      {state.items.map((wallet) => (
        <div
          key={wallet.id}
          className="flex flex-col gap-3 rounded-lg border border-border bg-surface-elevated/40 p-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex flex-col gap-1 min-w-0">
            <span className="truncate text-sm font-medium text-foreground">{wallet.label ?? truncate(wallet.walletAddress)}</span>
            <span className="truncate font-mono text-xs text-muted-foreground">{truncate(wallet.walletAddress)}</span>
            <span className="text-xs text-muted-foreground">{formatLastActivity(wallet.lastCheckedAt)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={wallet.status === "active" ? "success" : "default"}>{wallet.status}</Badge>
            <Button variant="outline" onClick={() => onRemove(wallet.id)}>
              Remove
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
