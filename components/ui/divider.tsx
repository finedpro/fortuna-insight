import { cn } from "@/lib/utils";
import type { WithClassName } from "@/types";

export interface DividerProps extends WithClassName {
  orientation?: "horizontal" | "vertical";
}

export function Divider({ orientation = "horizontal", className }: DividerProps) {
  return (
    <div
      role="separator"
      aria-orientation={orientation}
      className={cn(
        "bg-border",
        orientation === "horizontal" ? "h-px w-full" : "h-full w-px",
        className,
      )}
    />
  );
}
