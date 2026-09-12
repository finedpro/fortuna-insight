import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { typography } from "@/lib/design-system";
import type { Market } from "@/lib/api/types";

export interface MarketCardProps {
  market: Market;
}

function formatCloses(iso: string): string {
  return new Date(iso).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

/**
 * Links to `/markets/{id}` via a real `<Link>` wrapping the card
 * content - not an `onClick` div made to behave like a button, per the
 * approved architecture's accessibility note. `impliedProbabilityYes`
 * is always shown as "Current pool" - never "probability" alone,
 * never anything AI-adjacent (Sprint 1 has no Evidence Engine
 * integration; see this component's data source, which never
 * includes an AI field).
 */
export function MarketCard({ market }: MarketCardProps) {
  const totalPool = market.totalYesStake + market.totalNoStake;
  const yesPercent = market.impliedProbabilityYes !== null ? Math.round(market.impliedProbabilityYes * 100) : null;

  return (
    <Link href={`/markets/${market.id}`} className="block rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background">
      <Card variant="interactive" className="p-6">
        <div className="flex items-start justify-between gap-4">
          <p className={cn(typography.h3.className, "text-foreground")}>{market.question}</p>
          <Badge variant={market.status === "OPEN" ? "success" : "default"}>{market.status}</Badge>
        </div>

        <p className="mt-2 text-sm text-muted-foreground">Closes {formatCloses(market.closesAt)}</p>

        <div className="mt-4 flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            YES <span className="font-mono text-foreground">{market.totalYesStake}</span> pts
          </span>
          <span className="text-muted-foreground">
            NO <span className="font-mono text-foreground">{market.totalNoStake}</span> pts
          </span>
        </div>

        {yesPercent !== null ? (
          <p className="mt-3 font-mono text-xs uppercase tracking-widest text-muted-foreground">
            Current pool: <span className="text-gold">{yesPercent}% YES</span>
          </p>
        ) : (
          <p className="mt-3 font-mono text-xs uppercase tracking-widest text-muted-foreground">No predictions yet</p>
        )}
      </Card>
    </Link>
  );
}
