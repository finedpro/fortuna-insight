"use client";

import { useEffect, useRef } from "react";
import { PageLayout } from "@/components/layout/page-layout";
import { PageHeading } from "@/components/ui/page-heading";
import { PositionList } from "@/features/markets/components/position-list";
import { usePositions } from "@/features/markets/hooks/use-positions";
import { trackEvent } from "@/lib/analytics";

/** `/markets/positions` - "My Positions" (Fortuna Markets Sprint 1). Reached via the "My Positions" link on `/markets`, not a separate sidebar entry. */
export default function PositionsPage() {
  const { state, reload } = usePositions();
  const viewedRef = useRef(false);

  useEffect(() => {
    if (!viewedRef.current) {
      viewedRef.current = true;
      trackEvent("positions_viewed");
    }
  }, []);

  return (
    <PageLayout>
      <div className="flex flex-col gap-10">
        <PageHeading eyebrow="Fortuna Markets" title="My Positions" description="Every prediction you've placed, virtual points only." />
        <PositionList state={state} onRetry={reload} />
      </div>
    </PageLayout>
  );
}
