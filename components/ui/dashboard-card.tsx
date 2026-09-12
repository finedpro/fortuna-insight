import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { typography } from "@/lib/design-system";
import type { WithChildren, WithClassName } from "@/types";

export interface DashboardCardProps extends WithChildren, WithClassName {
  title: string;
  icon?: LucideIcon;
  action?: ReactNode;
}

/**
 * Titled panel for dashboard-style grids. Purely presentational — future
 * pages supply real content via `children`; no data fetching happens here.
 */
export function DashboardCard({
  title,
  icon: Icon,
  action,
  className,
  children,
}: DashboardCardProps) {
  return (
    <Card variant="dashboard" className={cn("flex flex-col gap-4 p-6", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {Icon && <Icon className="h-4 w-4 text-gold" aria-hidden="true" />}
          <h3 className={cn(typography.h3.className, "text-sm text-foreground")}>
            {title}
          </h3>
        </div>
        {action}
      </div>
      {children}
    </Card>
  );
}
