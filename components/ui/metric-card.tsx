import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { typography } from "@/lib/design-system";
import type { WithClassName } from "@/types";

export interface MetricCardProps extends WithClassName {
  label: string;
  value: string;
  description?: string;
  icon?: LucideIcon;
}

/**
 * Label + value display for a single dashboard metric. Purely
 * presentational — future pages supply the real `value`; no computation
 * or fetching happens here.
 */
export function MetricCard({
  label,
  value,
  description,
  icon: Icon,
  className,
}: MetricCardProps) {
  return (
    <Card variant="dashboard" className={cn("p-6", className)}>
      <div className="flex items-center justify-between">
        <span className={cn(typography.overline.className, "text-muted-foreground")}>
          {label}
        </span>
        {Icon && <Icon className="h-4 w-4 text-gold" aria-hidden="true" />}
      </div>
      <p className={cn(typography.h2.className, "mt-3 text-foreground")}>{value}</p>
      {description && (
        <p className={cn(typography.caption.className, "mt-1 text-muted-foreground")}>
          {description}
        </p>
      )}
    </Card>
  );
}
