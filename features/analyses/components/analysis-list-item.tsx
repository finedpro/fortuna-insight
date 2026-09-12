import Link from "next/link";
import { Badge, type BadgeProps } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { typography } from "@/lib/design-system";
import type { AnalysisListItem as AnalysisListItemData } from "@/lib/api/types";

const STATUS_BADGE: Record<AnalysisListItemData["status"], BadgeProps["variant"]> = {
  queued: "outline",
  running: "gold",
  completed: "success",
  failed: "danger",
  cancelled: "default",
};

function truncateAddress(address: string): string {
  return address.length > 12 ? `${address.slice(0, 6)}...${address.slice(-4)}` : address;
}

function formatTimestamp(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export interface AnalysisListItemProps {
  item: AnalysisListItemData;
}

/**
 * One row of an analysis list — every field shown comes directly from
 * `AnalysisListItemData` (GET /api/v1/analyses). No field is invented;
 * `healthScore` only renders when the API actually returned a number.
 */
export function AnalysisListItem({ item }: AnalysisListItemProps) {
  return (
    <Link
      href={`/analysis/${item.id}`}
      className="flex flex-col gap-3 rounded-lg border border-border bg-surface-elevated/40 p-4 transition-colors hover:bg-surface-elevated sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex flex-col gap-1 min-w-0">
        <span className="truncate font-mono text-sm text-foreground">{truncateAddress(item.walletAddress)}</span>
        <span className={cn(typography.caption.className, "text-muted-foreground")}>
          {formatTimestamp(item.createdAt)}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="outline">{item.network}</Badge>
        <Badge variant={STATUS_BADGE[item.status]}>{item.status}</Badge>
        {item.healthScore !== null && (
          <Badge variant="teal">{item.healthScore}/100</Badge>
        )}
      </div>
    </Link>
  );
}
