/**
 * Decorative product preview for the hero. Skeleton placeholders only —
 * no charts, no fabricated numbers. Purely visual, so it's hidden from
 * assistive tech rather than announced as empty content.
 */
export function HeroMockup() {
  return (
    <div
      aria-hidden="true"
      className="mx-auto w-full max-w-md motion-safe:animate-fade-up motion-safe:[animation-delay:500ms]"
    >
      <div className="rounded-2xl border border-border bg-surface p-4 shadow-2xl shadow-black/40 transition-transform duration-300 hover:-translate-y-1 sm:p-6">
        {/* Wallet Score Card */}
        <div className="rounded-xl border border-border bg-surface-elevated p-5">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
              Wallet Score
            </span>
            <span className="diamond" />
          </div>
          <div className="mt-4 flex items-end gap-3">
            <div className="h-10 w-20 rounded-md bg-surface" />
            <div className="h-3 w-12 rounded-full bg-surface" />
          </div>
        </div>

        {/* Portfolio + AI Summary */}
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="rounded-xl border border-border bg-surface-elevated p-5">
            <span className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
              Portfolio
            </span>
            <div className="mt-4 flex flex-col gap-2">
              <div className="h-2.5 w-full rounded-full bg-surface" />
              <div className="h-2.5 w-3/4 rounded-full bg-surface" />
              <div className="h-2.5 w-1/2 rounded-full bg-surface" />
            </div>
          </div>

          <div className="rounded-xl border border-border bg-surface-elevated p-5">
            <span className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
              AI Summary
            </span>
            <div className="mt-4 flex flex-col gap-2">
              <div className="h-2.5 w-full rounded-full bg-surface" />
              <div className="h-2.5 w-5/6 rounded-full bg-surface" />
              <div className="h-2.5 w-2/3 rounded-full bg-surface" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
