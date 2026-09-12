"use client";

import { PageLayout } from "@/components/layout/page-layout";
import { PageHeading } from "@/components/ui/page-heading";
import { WatchlistForm } from "@/features/watchlist/components/watchlist-form";
import { WatchlistTable } from "@/features/watchlist/components/watchlist-table";
import { MonitorEventsList } from "@/features/watchlist/components/monitor-events-list";
import { useWatchlist } from "@/features/watchlist/hooks/use-watchlist";
import { useMonitorEvents } from "@/features/watchlist/hooks/use-monitor-events";

/**
 * Fortuna Monitor V1 (Sprint 6 Task 1) - minimal UI per the approved
 * plan: a watchlist (add form + list with status/last-activity/remove)
 * and a Recent Activity feed below it. Nothing here calculates or
 * infers anything - every value displayed comes directly from
 * GET /api/v1/watchlist and GET /api/v1/monitor/events.
 */
export default function WatchlistPage() {
  const { state: watchlistState, reload: reloadWatchlist, remove } = useWatchlist();
  const { state: eventsState, reload: reloadEvents } = useMonitorEvents();

  return (
    <PageLayout>
      <div className="flex flex-col gap-10">
        <PageHeading
          eyebrow="Fortuna Monitor"
          title="Watchlist"
          description="Watch a public Solana wallet and see when it does something worth knowing about. Read-only - no private keys, no signing, ever."
        />

        <WatchlistForm onAdded={reloadWatchlist} />

        <div className="flex flex-col gap-4">
          <h2 className="font-display text-lg font-semibold text-foreground">Watched Wallets</h2>
          <WatchlistTable state={watchlistState} onRetry={reloadWatchlist} onRemove={remove} />
        </div>

        <div className="flex flex-col gap-4">
          <h2 className="font-display text-lg font-semibold text-foreground">Recent Activity</h2>
          <MonitorEventsList state={eventsState} onRetry={reloadEvents} />
        </div>
      </div>
    </PageLayout>
  );
}
