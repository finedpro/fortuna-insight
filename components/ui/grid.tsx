import { cn } from "@/lib/utils";
import { spacingGapClassName, type SpacingToken } from "@/lib/design-system";
import type { WithChildren, WithClassName } from "@/types";

type GridCols = 1 | 2 | 3 | 4;

/** Literal Tailwind class per column count — responsive by default. */
const COLS_CLASSNAME: Record<GridCols, string> = {
  1: "grid-cols-1",
  2: "grid-cols-1 sm:grid-cols-2",
  3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
  4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
};

export interface GridProps extends WithChildren, WithClassName {
  cols?: GridCols;
  gap?: SpacingToken;
}

/**
 * Responsive CSS grid primitive. Gap always comes from the 8px spacing
 * scale (`lib/design-system/spacing.ts`) rather than an arbitrary value.
 */
export function Grid({ cols = 3, gap = "md", className, children }: GridProps) {
  return (
    <div
      className={cn("grid", COLS_CLASSNAME[cols], spacingGapClassName[gap], className)}
    >
      {children}
    </div>
  );
}
