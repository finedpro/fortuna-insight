"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { addWatchedWallet } from "@/lib/api/monitor-client";
import { AnalysisApiError } from "@/lib/api/analysis-client";
import type { WatchRuleKey } from "@/lib/api/types";

const RULE_LABELS: Record<WatchRuleKey, string> = {
  tokenPurchases: "Token purchases",
  tokenSales: "Token sales",
  largeTransactions: "Large transactions",
  newTokens: "New tokens",
  balanceChanges: "Significant balance changes",
  allTransactions: "All transactions",
};

const RULE_ORDER: WatchRuleKey[] = ["tokenPurchases", "tokenSales", "largeTransactions", "newTokens", "balanceChanges", "allTransactions"];

export interface WatchlistFormProps {
  onAdded: () => void;
}

/** Minimal add-to-watchlist form (Sprint 6 Task 1) - address, optional label, watch-rule checkboxes, matching the approved plan's example checklist exactly. */
export function WatchlistForm({ onAdded }: WatchlistFormProps) {
  const [address, setAddress] = useState("");
  const [label, setLabel] = useState("");
  const [rules, setRules] = useState<Partial<Record<WatchRuleKey, boolean>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await addWatchedWallet({ walletAddress: address.trim(), label: label.trim() || undefined, watchRules: rules });
      setAddress("");
      setLabel("");
      setRules({});
      onAdded();
    } catch (err) {
      setError(err instanceof AnalysisApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-lg border border-border bg-surface-elevated/40 p-4">
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Solana wallet address"
          className="h-11 flex-1 rounded-lg border border-border bg-surface px-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2"
        />
        <input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="Name (optional)"
          className="h-11 rounded-lg border border-border bg-surface px-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 sm:w-48"
        />
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {RULE_ORDER.map((key) => (
          <label key={key} className="flex items-center gap-2 text-sm text-foreground">
            <input
              type="checkbox"
              checked={rules[key] ?? false}
              onChange={(e) => setRules((r) => ({ ...r, [key]: e.target.checked }))}
              className="h-4 w-4"
            />
            {RULE_LABELS[key]}
          </label>
        ))}
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}

      <Button type="submit" variant="gold" disabled={submitting || address.trim().length === 0}>
        {submitting ? "Adding..." : "Add to Watchlist"}
      </Button>
    </form>
  );
}
