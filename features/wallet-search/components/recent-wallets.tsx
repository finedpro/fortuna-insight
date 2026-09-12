import { Clock } from "lucide-react";

/**
 * Placeholder for wallet search history. No storage/persistence exists
 * yet — this is purely the UI slot for a future milestone.
 */
export function RecentWallets() {
  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground">
      <Clock className="h-3.5 w-3.5" aria-hidden="true" />
      <span>No recent wallets yet.</span>
    </div>
  );
}
