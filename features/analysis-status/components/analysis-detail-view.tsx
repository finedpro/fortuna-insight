"use client";

import { PageHeading } from "@/components/ui/page-heading";
import { useAnalysisStatus } from "@/features/analysis-status/hooks/use-analysis-status";
import { AnalysisProgressCard } from "./analysis-progress-card";
import { AnalysisErrorCard } from "./analysis-error-card";
import { AnalysisResultView } from "./analysis-result-view";

export interface AnalysisDetailViewProps {
  analysisId: string;
}

/**
 * The single, shared implementation of "given an analysis id, render
 * its current state" — polls via `useAnalysisStatus` and renders
 * whichever of its 6 real phases applies (loading / in_progress /
 * completed / failed / cancelled / not_found / error). This is the
 * only place that logic lives (Sprint 5 Task 1) — `/analysis/[id]` is
 * its only caller; the old `/report?id=` page now just redirects here
 * rather than duplicating any of this.
 */
export function AnalysisDetailView({ analysisId }: AnalysisDetailViewProps) {
  const status = useAnalysisStatus(analysisId);

  return (
    <div className="flex flex-col items-center gap-8">
      {status.phase === "loading" && (
        <div className="flex w-full max-w-xl flex-col gap-4">
          <PageHeading eyebrow="Analysis" title="Wallet Intelligence Report" description="Checking analysis status..." />
        </div>
      )}

      {status.phase === "in_progress" && status.progress && (
        <AnalysisProgressCard analysisId={analysisId} progress={status.progress} />
      )}

      {status.phase === "completed" && status.result && (
        <div className="w-full">
          <AnalysisResultView data={status.result} />
        </div>
      )}

      {status.phase === "failed" && <AnalysisErrorCard kind="failed" message={status.error?.message} />}

      {status.phase === "cancelled" && <AnalysisErrorCard kind="cancelled" message={status.error?.message} />}

      {status.phase === "not_found" && (
        <AnalysisErrorCard kind="not_found" message={`No analysis exists with id "${analysisId}".`} />
      )}

      {status.phase === "error" && <AnalysisErrorCard kind="network" message={status.error?.message} />}
    </div>
  );
}
