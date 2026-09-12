import { PageHeading } from "@/components/ui/page-heading";
import { Badge } from "@/components/ui/badge";
import { MetricCard } from "@/components/ui/metric-card";
import { Grid } from "@/components/ui/grid";
import { WalletHealthCard } from "./wallet-health-card";
import { EvidenceCard } from "./evidence-card";
import { AiReportCard } from "./ai-report-card";
import type { AnalysisCompletedData } from "@/lib/api/types";

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

export interface AnalysisResultViewProps {
  data: AnalysisCompletedData;
}

/**
 * The completed-analysis screen. Every value shown comes directly from
 * `AnalysisResult` (wallet address, network, duration, health score,
 * evidence, AI report) — nothing here is computed or invented on the
 * frontend. `healthResult`/`evidenceCollection`/`report` are each
 * individually nullable on the backend type, so each card only renders
 * when its data actually exists.
 */
export function AnalysisResultView({ data }: AnalysisResultViewProps) {
  const { result } = data;

  return (
    <div className="flex flex-col gap-8">
      <PageHeading
        eyebrow="Analysis complete"
        title="Wallet Intelligence Report"
        description={`Finished in ${formatDuration(result.metadata.durationMs)}.`}
        actions={<Badge variant="gold">completed</Badge>}
      />

      <Grid cols={2} gap="sm">
        <MetricCard label="Wallet Address" value={result.walletAddress} />
        <MetricCard label="Network" value={result.network} />
      </Grid>

      {result.healthResult && <WalletHealthCard health={result.healthResult} />}
      {result.evidenceCollection && <EvidenceCard evidence={result.evidenceCollection} />}
      {result.report && <AiReportCard report={result.report} />}
    </div>
  );
}
