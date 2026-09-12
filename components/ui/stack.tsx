import { cn } from "@/lib/utils";
import { spacingGapClassName, type SpacingToken } from "@/lib/design-system";
import type { WithChildren, WithClassName } from "@/types";

const ALIGN_CLASSNAME = {
  start: "items-start",
  center: "items-center",
  end: "items-end",
  stretch: "items-stretch",
} as const;

const JUSTIFY_CLASSNAME = {
  start: "justify-start",
  center: "justify-center",
  end: "justify-end",
  between: "justify-between",
} as const;

export interface StackProps extends WithChildren, WithClassName {
  direction?: "row" | "col";
  gap?: SpacingToken;
  align?: keyof typeof ALIGN_CLASSNAME;
  justify?: keyof typeof JUSTIFY_CLASSNAME;
  wrap?: boolean;
}

/**
 * Flex layout primitive. Gap always comes from the 8px spacing scale
 * (`lib/design-system/spacing.ts`) rather than an arbitrary value.
 */
export function Stack({
  direction = "col",
  gap = "md",
  align,
  justify,
  wrap,
  className,
  children,
}: StackProps) {
  return (
    <div
      className={cn(
        "flex",
        direction === "row" ? "flex-row" : "flex-col",
        spacingGapClassName[gap],
        align && ALIGN_CLASSNAME[align],
        justify && JUSTIFY_CLASSNAME[justify],
        wrap && "flex-wrap",
        className,
      )}
    >
      {children}
    </div>
  );
}
