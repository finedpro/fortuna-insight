import { DashboardCard } from "@/components/ui/dashboard-card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { typography } from "@/lib/design-system";
import type { WalletHealthResult } from "@/lib/api/types";

const DIRECTION_COLOR: Record<string, string> = {
  positive: "text-teal",
  negative: "text-red-400",
  neutral: "text-muted-foreground",
};

export interface WalletHealthCardProps {
  health: WalletHealthResult;
}

/** Every number here comes straight from WalletHealthResult — the score, each factor's score/weight/direction/explanation, and the confidence level. Nothing computed or reworded client-side. */
export function WalletHealthCard({ health }: WalletHealthCardProps) {
  return (
    <DashboardCard
      title="Wallet Health"
      action={<Badge variant="gold">{health.confidence} confidence</Badge>}
    >
      <div className="flex items-baseline gap-2">
        <span className={cn(typography.h1.className, "text-foreground")}>{health.healthScore}</span>
        <span className={cn(typography.caption.className, "text-muted-foreground")}>/ 100</span>
      </div>

      {health.contributingFactors.length > 0 && (
        <ul className="mt-2 flex flex-col gap-3">
          {health.contributingFactors.map((factor) => (
            <li key={factor.factor} className="flex flex-col gap-0.5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">{factor.factor}</span>
                <span className={cn("text-sm font-mono", DIRECTION_COLOR[factor.direction])}>
                  {factor.score}/100
                </span>
              </div>
              <p className={cn(typography.caption.className, "text-muted-foreground")}>
                {factor.explanation}
              </p>
            </li>
          ))}
        </ul>
      )}

      {health.warnings.length > 0 && (
        <div className="mt-2 flex flex-col gap-1 border-t border-border pt-3">
          {health.warnings.map((warning) => (
            <p key={warning.factor} className={cn(typography.caption.className, "text-muted-foreground")}>
              {warning.message}
            </p>
          ))}
        </div>
      )}
    </DashboardCard>
  );
}
