import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { typography } from "@/lib/design-system";
import type { WithClassName } from "@/types";

export interface EmptyStateProps extends WithClassName {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-3 rounded-lg border border-dashed border-border px-6 py-16 text-center",
        className,
      )}
    >
      {Icon && <Icon className="h-8 w-8 text-muted-foreground" aria-hidden="true" />}
      <h3 className={cn(typography.h3.className, "text-foreground")}>{title}</h3>
      {description && (
        <p className={cn(typography.caption.className, "max-w-sm text-muted-foreground")}>
          {description}
        </p>
      )}
      {action}
    </div>
  );
}
