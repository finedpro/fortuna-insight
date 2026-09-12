import { cn } from "@/lib/utils";
import type { WithChildren, WithClassName } from "@/types";

/**
 * Consistent max-width + horizontal padding wrapper for marketing pages.
 * Max width: 1280px, centered. Use for any full-bleed section that needs
 * its content constrained (header, sections, footer).
 */
export function Container({ children, className }: WithChildren & WithClassName) {
  return (
    <div className={cn("mx-auto w-full max-w-[1280px] px-4 md:px-8", className)}>
      {children}
    </div>
  );
}
