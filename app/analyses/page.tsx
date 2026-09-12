"use client";

import { PageLayout } from "@/components/layout/page-layout";
import { PageHeading } from "@/components/ui/page-heading";
import { AnalysisList } from "@/features/analyses/components/analysis-list";
import { useAnalysesList } from "@/features/analyses/hooks/use-analyses-list";

const PAGE_SIZE = 10;

/**
 * The full Analysis History view (Sprint 5 Task 1) — paginated via the
 * real GET /api/v1/analyses endpoint. Uses the exact same AnalysisList
 * component as the dashboard's "Recent Analyses", with pagination
 * controls enabled.
 */
export default function AnalysesPage() {
  const { state, reload, nextPage, prevPage } = useAnalysesList(PAGE_SIZE);

  return (
    <PageLayout>
      <div className="flex flex-col gap-8">
        <PageHeading eyebrow="History" title="Analyses" description="Every wallet analysis you've run, newest first." />
        <AnalysisList state={state} onRetry={reload} onPrevPage={prevPage} onNextPage={nextPage} showPagination />
      </div>
    </PageLayout>
  );
}
