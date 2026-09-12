import { forwardRef, type HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { radius } from "@/lib/design-system";

const badgeVariants = cva(
  cn(
    "inline-flex items-center gap-1.5 border px-2.5 py-1 font-mono text-[11px] font-medium uppercase tracking-widest",
    radius.full.className,
  ),
  {
    variants: {
      variant: {
        default: "border-border bg-surface-elevated text-muted-foreground",
        outline: "border-border bg-transparent text-foreground",
        gold: "border-gold/30 bg-gold/10 text-gold",
        teal: "border-teal/30 bg-teal/10 text-teal",
        success: "border-success/30 bg-success/10 text-success",
        danger: "border-danger/30 bg-danger/10 text-danger",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant, ...props }, ref) => (
    <span ref={ref} className={cn(badgeVariants({ variant, className }))} {...props} />
  ),
);
Badge.displayName = "Badge";

export { Badge, badgeVariants };
