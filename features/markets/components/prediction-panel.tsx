"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { placePosition } from "@/lib/api/markets-client";
import { AnalysisApiError } from "@/lib/api/analysis-client";
import { trackEvent } from "@/lib/analytics";
import type { Market, MarketOutcome } from "@/lib/api/types";

export interface PredictionPanelProps {
  market: Market;
  onPlaced: () => void;
}

/**
 * The YES/NO + stake submission form. No expected-payout preview is
 * shown before submission - the backend's pari-mutuel model means a
 * position's eventual payout genuinely depends on the pool at close
 * time, which is unknown here; showing a number would be misleading
 * (approved architecture, §11). Never uses toast - errors render
 * inline, matching every existing form in this app (see
 * WatchlistForm).
 */
export function PredictionPanel({ market, onPlaced }: PredictionPanelProps) {
  const [outcome, setOutcome] = useState<MarketOutcome | null>(null);
  const [stake, setStake] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [placed, setPlaced] = useState<{ outcome: MarketOutcome; stake: number } | null>(null);

  // Soft-launch instrumentation - fires once, on the visitor's first
  // YES/NO pick on this market (an intent signal), not on every click
  // if they change their mind between YES and NO before submitting.
  const startedRef = useRef(false);

  function selectOutcome(next: MarketOutcome) {
    if (!startedRef.current) {
      startedRef.current = true;
      trackEvent("market_position_started", { outcome: next });
    }
    setOutcome(next);
  }

  const parsedStake = Number(stake);
  const stakeIsValid = stake.trim().length > 0 && Number.isInteger(parsedStake) && parsedStake > 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!outcome || !stakeIsValid) return;

    setSubmitting(true);
    setError(null);
    try {
      const position = await placePosition(market.id, { outcome, stake: parsedStake, idempotencyKey: crypto.randomUUID() });
      setPlaced({ outcome: position.outcome, stake: position.stake });
      // Fired only here, after the backend has genuinely accepted the
      // position - never on submit itself, so a rejected/failed
      // request never creates a false "placed" event.
      trackEvent("market_position_placed", { outcome: position.outcome, stake: position.stake });
      setOutcome(null);
      setStake("");
      onPlaced();
    } catch (err) {
      setError(err instanceof AnalysisApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (placed) {
    return (
      <div className="flex flex-col gap-3 rounded-lg border border-success/30 bg-success/5 p-4">
        <p className="font-mono text-xs uppercase tracking-widest text-success">Prediction placed</p>
        <p className="text-sm text-foreground">
          {placed.outcome} · {placed.stake} pts
        </p>
        <Button variant="outline" onClick={() => setPlaced(null)}>
          Predict again
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-lg border border-border bg-surface-elevated/40 p-4">
      <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Your prediction</p>

      <div role="group" aria-label="Choose YES or NO" className="flex gap-2">
        <button
          type="button"
          aria-pressed={outcome === "YES"}
          onClick={() => selectOutcome("YES")}
          className={cn(
            "flex-1 rounded-md border px-4 py-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            outcome === "YES" ? "border-gold bg-gold/10 text-gold" : "border-border bg-surface text-foreground hover:bg-surface-elevated/60",
          )}
        >
          YES {outcome === "YES" && "✓"}
        </button>
        <button
          type="button"
          aria-pressed={outcome === "NO"}
          onClick={() => selectOutcome("NO")}
          className={cn(
            "flex-1 rounded-md border px-4 py-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            outcome === "NO" ? "border-gold bg-gold/10 text-gold" : "border-border bg-surface text-foreground hover:bg-surface-elevated/60",
          )}
        >
          NO {outcome === "NO" && "✓"}
        </button>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="prediction-stake" className="text-sm text-foreground">
          Stake (virtual points)
        </label>
        <input
          id="prediction-stake"
          type="number"
          inputMode="numeric"
          min={1}
          step={1}
          value={stake}
          onChange={(e) => setStake(e.target.value)}
          placeholder="e.g. 250"
          aria-invalid={stake.length > 0 && !stakeIsValid}
          aria-describedby={stake.length > 0 && !stakeIsValid ? "prediction-stake-error" : undefined}
          className="h-11 rounded-lg border border-border bg-surface px-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2"
        />
        {stake.length > 0 && !stakeIsValid && (
          <p id="prediction-stake-error" className="text-sm text-danger">
            Stake must be a positive whole number of points.
          </p>
        )}
      </div>

      {error && (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      )}

      <Button type="submit" variant="gold" isLoading={submitting} disabled={submitting || !outcome || !stakeIsValid}>
        Predict
      </Button>
    </form>
  );
}
