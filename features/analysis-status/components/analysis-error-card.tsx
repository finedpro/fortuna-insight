import type { LucideIcon } from "lucide-react";
import { AlertTriangle, Ban, SearchX, WifiOff } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";

export type AnalysisErrorKind = "failed" | "cancelled" | "not_found" | "network";

const ICONS: Record<AnalysisErrorKind, LucideIcon> = {
  failed: AlertTriangle,
  cancelled: Ban,
  not_found: SearchX,
  network: WifiOff,
};

const TITLES: Record<AnalysisErrorKind, string> = {
  failed: "Analysis failed",
  cancelled: "Analysis cancelled",
  not_found: "Analysis not found",
  network: "Connection problem",
};

export interface AnalysisErrorCardProps {
  kind: AnalysisErrorKind;
  message?: string;
  onRetry?: () => void;
}

/** One shared shape for every terminal-failure and connectivity state — real backend error messages are passed through verbatim, never replaced with something friendlier-but-invented. */
export function AnalysisErrorCard({ kind, message, onRetry }: AnalysisErrorCardProps) {
  return (
    <EmptyState
      icon={ICONS[kind]}
      title={TITLES[kind]}
      description={message}
      action={
        onRetry ? (
          <Button variant="outline" onClick={onRetry}>
            Try another wallet
          </Button>
        ) : undefined
      }
      className="w-full max-w-xl"
    />
  );
}
