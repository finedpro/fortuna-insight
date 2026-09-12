import { PageLayout } from "@/components/layout/page-layout";
import { AnalysisDetailView } from "@/features/analysis-status/components/analysis-detail-view";

/**
 * The canonical URL for a single analysis (Sprint 5 Task 1) —
 * `/analysis/[id]`. Server component wrapper only: it awaits the
 * route's `id` param (Next.js 15 params are async) and hands it to the
 * client-side `AnalysisDetailView`, which owns 100% of the actual
 * polling/rendering logic. Nothing here duplicates that logic — this
 * file's whole job is unwrapping the route param.
 */
export default async function AnalysisDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <PageLayout>
      <AnalysisDetailView analysisId={id} />
    </PageLayout>
  );
}
