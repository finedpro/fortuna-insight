"use client";

import { useEffect, useRef } from "react";
import { TrendingUp } from "lucide-react";
import { PageLayout } from "@/components/layout/page-layout";
import { PageHeading } from "@/components/ui/page-heading";
import { DashboardCard } from "@/components/ui/dashboard-card";
import { buttonVariants } from "@/components/ui/button";
import { WalletSearch } from "@/features/wallet-search";
import { AnalysisList } from "@/features/analyses/components/analysis-list";
import { useAnalysesList } from "@/features/analyses/hooks/use-analyses-list";
import { ROUTES } from "@/lib/constants";
import { trackEvent } from "@/lib/analytics";
import Link from "next/link";

const RECENT_ANALYSES_LIMIT = 5;

/**
 * The real product dashboard (Sprint 5 Task 1) — replaces the earlier
 * `PlaceholderPanel` stub. Two real things live here: the wallet-search
 * flow (unchanged, reused as-is from the homepage) and a "Recent
 * Analyses" list backed by the real GET /api/v1/analyses endpoint —
 * no invented metrics, no placeholder cards.
 *
 * Launch polish - a small Markets intro card was added below (Product/UX
 * audit finding: Fortuna Markets was previously undiscoverable outside
 * the sidebar). No data fetching of its own - purely a static
 * introduction + link, same as everything else on this page.
 */
export default function DashboardPage() {
  const { state, reload } = useAnalysesList(RECENT_ANALYSES_LIMIT);
  const viewedRef = useRef(false);

  useEffect(() => {
    if (!viewedRef.current) {
      viewedRef.current = true;
      trackEvent("dashboard_viewed");
    }
  }, []);

  return (
    <PageLayout>
      <div className="flex flex-col gap-10">
        <PageHeading
          eyebrow="Fortuna Insight"
          title="Blockchain Intelligence"
          description="Analyze a Solana wallet to generate wallet health, evidence, and an AI report."
        />

        <div className="flex justify-center">
          <WalletSearch />
        </div>

        <DashboardCard title="Fortuna Markets" icon={TrendingUp}>
          <p className="text-sm text-muted-foreground">
            Test your decisions against real evidence, using virtual points. No real money — just facts and your own judgment.
          </p>
          <Link href={ROUTES.markets} className={buttonVariants({ variant: "outline" })}>
            Explore Markets →
          </Link>
        </DashboardCard>

        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold text-foreground">Recent Analyses</h2>
            {state.phase === "loaded" && (
              <Link href={ROUTES.analyses} className="text-sm font-medium text-gold hover:underline">
                View all
              </Link>
            )}
          </div>
          <AnalysisList state={state} onRetry={reload} />
        </div>
      </div>
    </PageLayout>
  );
}
