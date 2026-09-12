import { Card, CardContent } from "@/components/ui/card";
import type { WithClassName } from "@/types";

interface PlaceholderPanelProps extends WithClassName {
  label: string;
}

/**
 * Empty-state placeholder used until real data/features are wired in.
 * Requirement FC-001 §10: no mock crypto data — placeholders only.
 */
export function PlaceholderPanel({ label, className }: PlaceholderPanelProps) {
  return (
    <Card className={className}>
      <CardContent className="flex h-40 items-center justify-center p-6">
        <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
          {label}
        </span>
      </CardContent>
    </Card>
  );
}
