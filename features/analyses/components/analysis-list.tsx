import { FileSearch, WifiOff } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { AnalysisListItem } from "./analysis-list-item";
import { PaginationControls } from "./pagination-controls";
import type { AnalysesListState } from "../hooks/use-analyses-list";

export interface AnalysisListProps {
  state: AnalysesListState;
  onRetry?: () => void;
  onPrevPage?: () => void;
  onNextPage?: () => void;
  showPagination?: boolean;
}

/**
 * Renders whichever of the 4 real states `useAnalysesList` reports -
 * loading / loaded / empty / error. Shared between the dashboard's
 * "Recent Analyses" (showPagination: false) and the full `/analyses`
 * history page (showPagination: true) - the exact same component, not
 * two parallel implementations.
 */
export function AnalysisList({ state, onRetry, onPrevPage, onNextPage, showPagination = false }: AnalysisListProps) {
  if (state.phase === "loading") {
    return <p className="text-sm text-muted-foreground">Loading analyses...</p>;
  }

  if (state.phase === "error") {
    return (
      <EmptyState
        icon={WifiOff}
        title="Could not load analyses"
        description={state.errorMessage ?? undefined}
        action={
          onRetry ? (
            <Button variant="outline" onClick={onRetry}>
              Try again
            </Button>
          ) : undefined
        }
      />
    );
  }

  if (state.phase === "empty") {
    return (
      <EmptyState
        icon={FileSearch}
        title="No analyses yet"
        description="Analyze a wallet above to see it appear here."
      />
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {state.items.map((item) => (
        <AnalysisListItem key={item.id} item={item} />
      ))}
      {showPagination && onPrevPage && onNextPage && (
        <PaginationControls
          offset={state.offset}
          itemCount={state.items.length}
          total={state.total}
          onPrev={onPrevPage}
          onNext={onNextPage}
        />
      )}
    </div>
  );
}
