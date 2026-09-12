import { DashboardCard } from "@/components/ui/dashboard-card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { typography } from "@/lib/design-system";
import type { MarketEvidenceItem } from "@/lib/api/types";

/**
 * Fortuna Markets Sprint 2. Mirrors `features/analysis-status/components/evidence-card.tsx`'s
 * structure (same DashboardCard/Badge/typography primitives - no new
 * design-system pieces), extended with the two additional fields this
 * shape carries (`confidence`, `source`) that the wallet-analysis
 * version doesn't need to show.
 *
 * Strictly factual: never phrases anything as "AI says", "Prediction:",
 * "Recommended:", "Likely:", "Probability:", "Odds:", "Bullish:",
 * "Bearish:" (approved Sprint 2 scope §14) - every string here is
 * either a passed-through field or fixed copy that makes no claim
 * about the market's outcome.
 */
/**
 * Fortuna Markets Sprint 2/6. Mirrors `features/analysis-status/components/evidence-card.tsx`'s
 * structure (same DashboardCard/Badge/typography primitives - no new
 * design-system pieces), extended with the additional fields this
 * shape carries (`confidence`, `source`, and Sprint 6's `quality`)
 * that the wallet-analysis version doesn't need to show.
 *
 * Strictly factual: never phrases anything as "AI says", "Prediction:",
 * "Recommended:", "Likely:", "Probability:", "Odds:", "Bullish:",
 * "Bearish:" (approved Sprint 2 scope §14) - every string here is
 * either a passed-through field or fixed copy that makes no claim
 * about the market's outcome. Sprint 6's freshness label is always
 * shown as text (never color-only) - the FRESHNESS_LABEL/BADGE maps
 * below are two representations of the same word, not a
 * color-substitutes-for-meaning shortcut.
 */
const SEVERITY_VARIANT: Record<string, "default" | "outline" | "gold"> = {
  info: "outline",
  notice: "default",
  warning: "gold",
  critical: "gold",
};

const FRESHNESS_LABEL: Record<string, string> = {
  FRESH: "Fresh",
  STALE: "Stale",
  UNKNOWN: "Unknown",
};

const FRESHNESS_VARIANT: Record<string, "default" | "outline" | "gold"> = {
  FRESH: "outline",
  STALE: "gold",
  UNKNOWN: "default",
};

export interface MarketEvidenceCardProps {
  items: MarketEvidenceItem[];
}

/** "42 seconds ago" / "5 minutes ago" / "2 hours ago" - null (unknown/invalid observedAt) falls back to a plain, honest label rather than a fabricated time. */
function formatAge(ageSeconds: number | null): string {
  if (ageSeconds === null) return "unknown time";
  if (ageSeconds < 60) return `${Math.floor(ageSeconds)} second${Math.floor(ageSeconds) === 1 ? "" : "s"} ago`;
  if (ageSeconds < 3600) {
    const minutes = Math.floor(ageSeconds / 60);
    return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  }
  const hours = Math.floor(ageSeconds / 3600);
  return `${hours} hour${hours === 1 ? "" : "s"} ago`;
}

function MarketEvidenceRow({ item }: { item: MarketEvidenceItem }) {
  return (
    <li className="flex flex-col gap-1 border-b border-border py-3 last:border-none last:pb-0">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-foreground">{item.title}</span>
        <Badge variant={SEVERITY_VARIANT[item.severity] ?? "default"}>{item.severity}</Badge>
      </div>
      <p className={cn(typography.caption.className, "text-muted-foreground")}>{item.description}</p>
      <p className={cn(typography.caption.className, "text-muted-foreground")}>Observed {formatAge(item.quality.ageSeconds)}</p>
      <div className="flex items-center gap-2">
        <span className={cn(typography.caption.className, "text-muted-foreground")}>Freshness:</span>
        <Badge variant={FRESHNESS_VARIANT[item.quality.freshness] ?? "default"}>{FRESHNESS_LABEL[item.quality.freshness] ?? item.quality.freshness}</Badge>
      </div>
      <p className={cn(typography.caption.className, "text-muted-foreground")}>
        Confidence: {item.confidence} · Source: {item.source}
      </p>
    </li>
  );
}

export function MarketEvidenceCard({ items }: MarketEvidenceCardProps) {
  if (items.length === 0) {
    return (
      <DashboardCard title="Evidence">
        <p className={cn(typography.caption.className, "text-muted-foreground")}>No relevant evidence available yet.</p>
      </DashboardCard>
    );
  }

  return (
    <DashboardCard title="Evidence" action={<Badge variant="outline">{items.length} items</Badge>}>
      <ul className="flex flex-col">
        {items.map((item) => (
          <MarketEvidenceRow key={item.id} item={item} />
        ))}
      </ul>
    </DashboardCard>
  );
}
