import { DashboardCard } from "@/components/ui/dashboard-card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { typography } from "@/lib/design-system";
import { shortenMint } from "./token-holdings-card";
import type { NetworkId, WalletSnapshot, WalletSnapshotTransaction } from "@/lib/api/types";

const STATUS_LABEL: Record<WalletSnapshotTransaction["status"], string> = {
  success: "success",
  failed: "failed",
  unknown: "unknown",
};

function formatTimestamp(timestamp: string | null): string {
  if (!timestamp) return "Time unknown";
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return "Time unknown";
  return `${date.toISOString().slice(0, 16).replace("T", " ")} UTC`;
}

export interface RecentTransactionsCardProps {
  snapshot: WalletSnapshot;
  network: NetworkId;
}

/** Lists the newest transactions the backend collected. Only Solana signatures link out to an explorer. */
export function RecentTransactionsCard({ snapshot, network }: RecentTransactionsCardProps) {
  const { recentTransactions, transactionCount, transactionCountIsExhaustive } = snapshot;

  return (
    <DashboardCard
      title="Recent Transactions"
      action={
        <Badge variant="outline">
          {transactionCount}
          {transactionCountIsExhaustive ? "" : "+"} total
        </Badge>
      }
    >
      {recentTransactions.length === 0 ? (
        <p className={cn(typography.caption.className, "text-muted-foreground")}>
          No transactions found for this wallet.
        </p>
      ) : (
        <ul className="flex flex-col">
          {recentTransactions.map((tx) => (
            <li
              key={tx.signature}
              className="flex items-center justify-between gap-3 border-b border-border py-3 last:border-none last:pb-0"
            >
              <div className="flex min-w-0 flex-col">
                {network === "solana" ? (
                  <a
                    href={`https://solscan.io/tx/${encodeURIComponent(tx.signature)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-mono text-foreground underline-offset-2 hover:underline"
                    title={tx.signature}
                  >
                    {shortenMint(tx.signature)}
                  </a>
                ) : (
                  <span className="text-sm font-mono text-foreground" title={tx.signature}>
                    {shortenMint(tx.signature)}
                  </span>
                )}
                <span className={cn(typography.caption.className, "text-muted-foreground")}>
                  {formatTimestamp(tx.timestamp)}
                </span>
              </div>
              <Badge variant={tx.status === "failed" ? "gold" : "outline"}>{STATUS_LABEL[tx.status]}</Badge>
            </li>
          ))}
        </ul>
      )}
      {!transactionCountIsExhaustive && (
        <p className={cn(typography.caption.className, "text-muted-foreground")}>
          Showing the {recentTransactions.length} newest. The wallet has more history than was fetched.
        </p>
      )}
    </DashboardCard>
  );
}
