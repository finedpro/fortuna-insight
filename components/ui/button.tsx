import { forwardRef } from "react";
import { Loader2 } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        // Existing variants — used by FC-001/FC-002 (Header, Footer, Hero,
        // Sidebar). Left unchanged.
        default:
          "bg-surface-elevated text-foreground hover:bg-surface-elevated/80 border border-border",
        outline:
          "border border-border bg-transparent text-foreground hover:bg-surface-elevated/60",
        ghost: "bg-transparent text-foreground hover:bg-surface-elevated/60",
        gold: "bg-gold text-gold-foreground hover:bg-gold/90",
        teal: "bg-teal text-teal-foreground hover:bg-teal/90",
        // New in ES-003 — semantic names for future pages.
        primary: "bg-gold text-gold-foreground hover:bg-gold/90",
        secondary:
          "bg-surface-elevated text-foreground hover:bg-surface-elevated/80 border border-border",
        destructive: "bg-danger text-foreground hover:bg-danger/90",
      },
      size: {
        sm: "h-8 px-3",
        md: "h-10 px-4",
        lg: "h-12 px-6 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  },
);

export interface ButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /** Shows a spinner and disables the button while true. */
  isLoading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, isLoading, disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        disabled={disabled || isLoading}
        aria-busy={isLoading || undefined}
        {...props}
      >
        {isLoading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
        {children}
      </button>
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
