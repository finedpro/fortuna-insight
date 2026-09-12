import { CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export type ValidationTone = "invalid" | "valid" | "error";

interface ValidationMessageProps {
  id?: string;
  tone: ValidationTone;
  message: string;
}

/**
 * Inline validation/error feedback for the wallet input. Never a browser
 * alert — always rendered in-flow with an accessible live region.
 */
export function ValidationMessage({ id, tone, message }: ValidationMessageProps) {
  const isPositive = tone === "valid";
  const Icon = isPositive ? CheckCircle2 : AlertCircle;

  return (
    <p
      id={id}
      role={isPositive ? "status" : "alert"}
      className={cn(
        "flex items-center gap-2 text-sm",
        isPositive ? "text-teal" : "text-danger",
      )}
    >
      <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
      {message}
    </p>
  );
}
