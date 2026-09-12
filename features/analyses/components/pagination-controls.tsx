import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { typography } from "@/lib/design-system";

export interface PaginationControlsProps {
  offset: number;
  /** Actual number of items returned for this page - not `limit`, since the last page is usually partial. */
  itemCount: number;
  total: number;
  onPrev: () => void;
  onNext: () => void;
}

export function PaginationControls({ offset, itemCount, total, onPrev, onNext }: PaginationControlsProps) {
  const start = total === 0 ? 0 : offset + 1;
  const end = offset + itemCount;

  return (
    <div className="flex items-center justify-between gap-4 pt-2">
      <span className={cn(typography.caption.className, "text-muted-foreground")}>
        {start}-{end} of {total}
      </span>
      <div className="flex gap-2">
        <Button variant="outline" onClick={onPrev} disabled={offset === 0}>
          Previous
        </Button>
        <Button variant="outline" onClick={onNext} disabled={end >= total}>
          Next
        </Button>
      </div>
    </div>
  );
}
