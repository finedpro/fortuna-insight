import { CheckCircle2, Circle, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { typography } from "@/lib/design-system";

interface LoadingCardProps {
  steps: readonly string[];
  currentStepIndex: number;
  isComplete: boolean;
}

/**
 * Named progress steps only — deliberately no percentage bar, since none
 * of the underlying work is real yet (FC-004 is UX-only).
 */
export function LoadingCard({ steps, currentStepIndex, isComplete }: LoadingCardProps) {
  return (
    <Card
      variant="elevated"
      className="flex w-full max-w-xl flex-col gap-6 p-6 motion-safe:animate-fade-in sm:p-8"
    >
      <div className="flex items-center gap-3">
        {isComplete ? (
          <CheckCircle2 className="h-5 w-5 text-teal" aria-hidden="true" />
        ) : (
          <Loader2 className="h-5 w-5 animate-spin text-gold" aria-hidden="true" />
        )}
        <span className={cn(typography.overline.className, "text-muted-foreground")}>
          {isComplete ? "Report ready" : "Analyzing wallet"}
        </span>
      </div>

      <ul className="flex flex-col gap-3" aria-live="polite">
        {steps.map((step, index) => {
          const isDone = isComplete || index < currentStepIndex;
          const isActive = !isComplete && index === currentStepIndex;

          return (
            <li
              key={step}
              className={cn(
                "flex items-center gap-3 text-sm transition-colors",
                isDone && "text-foreground",
                isActive && "text-foreground",
                !isDone && !isActive && "text-muted-foreground/50",
              )}
            >
              {isDone ? (
                <CheckCircle2 className="h-4 w-4 shrink-0 text-teal" aria-hidden="true" />
              ) : isActive ? (
                <Loader2
                  className="h-4 w-4 shrink-0 animate-spin text-gold"
                  aria-hidden="true"
                />
              ) : (
                <Circle className="h-4 w-4 shrink-0" aria-hidden="true" />
              )}
              {step}
            </li>
          );
        })}
      </ul>

      {isComplete && (
        <p className={cn(typography.caption.className, "text-muted-foreground")}>
          Redirecting to your report...
        </p>
      )}
    </Card>
  );
}
