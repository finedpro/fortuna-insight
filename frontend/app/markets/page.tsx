"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { PageLayout } from "@/components/layout/page-layout";
import { PageHeading } from "@/components/ui/page-heading";
import { buttonVariants } from "@/components/ui/button";
import { MetricCard } from "@/components/ui/metric-card";
import { MarketList } from "@/features/markets/components/market-list";
import { useMarkets } from "@/features/markets/hooks/use-markets";
import { useBalance } from "@/features/markets/hooks/use-balance";
import { trackEvent } from "@/lib/analytics";

/**
 * Fortuna Markets Sprint 1 - a virtual-only prediction market list.
 * Predict with evidence. Evidence Engine integration doesn't exist
 * yet in Sprint 1 - nothing here claims otherwise (no AI probability,
 * no evidence score; the only "probability"-adjacent number shown is
 * each market's own pool distribution, computed and labeled as such).
 */
export default function MarketsPage() {
  const { state: marketsState, reload: reloadMarkets } = useMarkets();
  const { state: balanceState } = useBalance();
  const viewedRef = useRef(false);

  useEffect(() => {
    if (!viewedRef.current) {
      viewedRef.current = true;
      trackEvent("markets_viewed");
    }
  }, []);

  return (
    <PageLayout>
      <div className="flex flex-col gap-10">
        <PageHeading
          eyebrow="Fortuna Markets"
          title="Markets"
          description="Predict with evidence."
          actions={
            <Link href="/markets/positions" className={buttonVariants({ variant: "outline" })}>
              My Positions
            </Link>
          }
        />

        {balanceState.phase === "loaded" && balanceState.balance && (
          <MetricCard label="Virtual Balance" value={`${balanceState.balance.balance} pts`} />
        )}

        <p className="text-xs text-muted-foreground">
          Fortuna Markets uses virtual points only. Points have no monetary value, cannot be purchased, withdrawn, or exchanged for money or cryptocurrency, and outcomes are simulated for research and evaluation purposes.
        </p>

        <MarketList state={marketsState} onRetry={reloadMarkets} />
      </div>
    </PageLayout>
  );
}
