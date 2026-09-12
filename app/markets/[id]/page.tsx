import { PageLayout } from "@/components/layout/page-layout";
import { MarketDetail } from "@/features/markets/components/market-detail";

/**
 * The canonical URL for a single market (Fortuna Markets Sprint 1) —
 * `/markets/[id]`. Server component wrapper only, same pattern as
 * `app/analysis/[id]/page.tsx`: awaits the route's `id` param (Next.js
 * 15 params are async) and hands it to the client-side `MarketDetail`,
 * which owns all the actual fetching/rendering logic.
 */
export default async function MarketDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <PageLayout>
      <MarketDetail marketId={id} />
    </PageLayout>
  );
}
