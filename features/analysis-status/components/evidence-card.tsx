import { DashboardCard } from "@/components/ui/dashboard-card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { typography } from "@/lib/design-system";
import type { Evidence, EvidenceCollection, EvidenceSeverity } from "@/lib/api/types";

const SEVERITY_VARIANT: Record<EvidenceSeverity, "default" | "outline" | "gold"> = {
  info: "outline",
  notice: "default",
  warning: "gold",
  critical: "gold",
};

export interface EvidenceCardProps {
  evidence: EvidenceCollection;
}

function EvidenceRow({ item }: { item: Evidence }) {
  return (
    <li className="flex flex-col gap-1 border-b border-border py-3 last:border-none last:pb-0">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-foreground">{item.title}</span>
        <Badge variant={SEVERITY_VARIANT[item.severity]}>{item.severity}</Badge>
      </div>
      <p className={cn(typography.caption.className, "text-muted-foreground")}>{item.description}</p>
    </li>
  );
}

/** Lists exactly the evidence items the Evidence Engine produced — title, description, severity, verbatim. No summarizing, no filtering beyond what's in the collection itself. */
export function EvidenceCard({ evidence }: EvidenceCardProps) {
  if (evidence.items.length === 0) {
    return (
      <DashboardCard title="Evidence">
        <p className={cn(typography.caption.className, "text-muted-foreground")}>
          No evidence items were generated for this wallet.
        </p>
      </DashboardCard>
    );
  }

  return (
    <DashboardCard title="Evidence" action={<Badge variant="outline">{evidence.items.length} items</Badge>}>
      <ul className="flex flex-col">
        {evidence.items.map((item) => (
          <EvidenceRow key={item.id} item={item} />
        ))}
      </ul>
    </DashboardCard>
  );
}
