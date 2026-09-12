import { Button } from "@/components/ui/button";

/**
 * Layout-only placeholder for the landing bottom CTA.
 * FC-002A scope: structure only — real CTA content/design lands later.
 */
export function CtaPlaceholder() {
  return (
    <div className="flex flex-col items-center gap-6 rounded-lg border border-dashed border-border px-6 py-16 text-center">
      <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
        CTA heading placeholder
      </h2>
      <Button type="button" variant="gold" size="lg" disabled>
        Button placeholder
      </Button>
    </div>
  );
}
