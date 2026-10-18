import { DashboardCard } from "@/components/ui/dashboard-card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { typography } from "@/lib/design-system";
import type { WalletSnapshot } from "@/lib/api/types";

export function shortenMint(mint: string): string {
  return mint.length <= 12 ? mint : `${mint.slice(0, 4)}…${mint.slice(-4)}`;
}

export interface TokenHoldingsCardProps {
  snapshot: WalletSnapshot;
}

/** Shows exactly what the backend snapshot contains: native balance and token holdings. Unknown tokens show their shortened mint address, never a guessed name. No prices or values. */
export function TokenHoldingsCard({ snapshot }: TokenHoldingsCardProps) {
  const { native, tokens, tokensTotal } = snapshot;
  const hidden = tokensTotal - tokens.length;
  const empty = snapshot.emptyTokenAccounts ?? 0;
  const hasNames = tokens.some((token) => token.symbol !== null);

  return (
    <DashboardCard title="Token Holdings" action={<Badge variant="outline">{tokensTotal} tokens</Badge>}>
      {native && (
        <div className="flex items-center justify-between border-b border-border pb-3">
          <span className="text-sm font-medium text-foreground">{native.symbol ?? "Native balance"}</span>
          <span className="text-sm font-mono text-foreground">{native.formatted}</span>
        </div>
      )}

      {tokens.length === 0 ? (
        <p className={cn(typography.caption.className, "text-muted-foreground")}>
          No token balances found in this wallet.
        </p>
      ) : (
        <ul className="flex flex-col">
          {tokens.map((token) => (
            <li
              key={token.mint}
              className="flex items-center justify-between gap-3 border-b border-border py-3 last:border-none last:pb-0"
            >
              <div className="flex min-w-0 flex-col">
                <span className="text-sm font-medium text-foreground">
                  {token.symbol ?? "Unknown token"}
                  {token.name && <span className="ml-2 text-muted-foreground">{token.name}</span>}
                </span>
                <span
                  className={cn(typography.caption.className, "font-mono text-muted-foreground")}
                  title={token.mint}
                >
                  {shortenMint(token.mint)}
                </span>
              </div>
              <span className="text-sm font-mono text-foreground">{token.formatted}</span>
            </li>
          ))}
        </ul>
      )}

      {empty > 0 && (
        <p className={cn(typography.caption.className, "text-muted-foreground")}>
          {empty} empty token {empty === 1 ? "account" : "accounts"} (zero balance) not shown.
        </p>
      )}

      {hasNames && (
        <p className={cn(typography.caption.className, "text-muted-foreground")}>
          Token names are set by each token&apos;s creator and can be misleading. The mint address is the only reliable identifier.
        </p>
      )}

      {hidden > 0 && (
        <p className={cn(typography.caption.className, "text-muted-foreground")}>
          Showing {tokens.length} of {tokensTotal} tokens.
        </p>
      )}
    </DashboardCard>
  );
}
