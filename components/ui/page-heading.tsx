import { cn } from "@/lib/utils";
import { typography } from "@/lib/design-system";
import type { WithClassName } from "@/types";
import type { ReactNode } from "react";

export interface PageHeadingProps extends WithClassName {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}

/**
 * Standard page-level heading for app/dashboard-style routes (distinct from
 * the marketing `Section` component used on the landing page).
 */
export function PageHeading({
  eyebrow,
  title,
  description,
  actions,
  className,
}: PageHeadingProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between",
        className,
      )}
    >
      <div className="flex flex-col gap-1.5">
        {eyebrow && (
          <span className={cn(typography.overline.className, "text-gold")}>
            {eyebrow}
          </span>
        )}
        <h1 className={cn(typography.h1.className, "text-foreground")}>{title}</h1>
        {description && (
          <p className={cn(typography.body.className, "max-w-2xl text-muted-foreground")}>
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
