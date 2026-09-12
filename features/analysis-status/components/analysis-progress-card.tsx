import { Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { typography } from "@/lib/design-system";
import type { AnalysisStatusData, JobStage } from "@/lib/api/types";

const STAGE_LABELS: Record<JobStage, string> = {
  validation: "Validating wallet address",
  queued: "Waiting in queue",
  blockchain_processing: "Reading on-chain data",
  scoring_engine: "Calculating wallet health",
  ai_summary_generation: "Generating evidence and AI report",
  completed: "Finalizing",
};

export interface AnalysisProgressCardProps {
  analysisId: string;
  progress: AnalysisStatusData;
}

/** Renders exactly the status/stage the backend reports — no invented percentage, no fabricated sub-steps. */
export function AnalysisProgressCard({ analysisId, progress }: AnalysisProgressCardProps) {
  return (
    <Card
      variant="elevated"
      className="flex w-full max-w-xl flex-col gap-6 p-6 motion-safe:animate-fade-in sm:p-8"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Loader2 className="h-5 w-5 animate-spin text-gold" aria-hidden="true" />
          <span className={cn(typography.overline.className, "text-muted-foreground")}>
            Analysis started
          </span>
        </div>
        <Badge variant={progress.status === "running" ? "gold" : "outline"}>{progress.status}</Badge>
      </div>

      <div className="flex flex-col gap-1">
        <span className={cn(typography.caption.className, "text-muted-foreground")}>Analysis ID</span>
        <p className="break-all font-mono text-sm text-foreground">{analysisId}</p>
      </div>

      <div className="flex flex-col gap-1">
        <span className={cn(typography.caption.className, "text-muted-foreground")}>Current stage</span>
        <p className="text-sm text-foreground">{STAGE_LABELS[progress.stage] ?? progress.stage}</p>
      </div>

      <p className={cn(typography.caption.className, "text-muted-foreground")}>
        Checking for updates every few seconds...
      </p>
    </Card>
  );
}
