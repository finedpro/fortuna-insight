import { cn } from "@/lib/utils";
import type { SectionProps } from "@/types";

/**
 * Consistent vertical rhythm + heading treatment for a block of page content.
 * Use this instead of ad-hoc <div><h2/>...</div> groupings.
 */
export function Section({
  id,
  title,
  eyebrow,
  description,
  className,
  children,
}: SectionProps) {
  return (
    <section id={id} className={cn("flex flex-col gap-4", className)}>
      {(eyebrow || title || description) && (
        <div className="flex flex-col gap-1.5">
          {eyebrow && (
            <span className="font-mono text-xs uppercase tracking-widest text-gold">
              {eyebrow}
            </span>
          )}
          {title && (
            <h2 className="font-display text-xl font-semibold tracking-tight text-foreground md:text-2xl">
              {title}
            </h2>
          )}
          {description && (
            <p className="max-w-2xl text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      )}
      {children}
    </section>
  );
}
