import { DashboardCard } from "@/components/ui/dashboard-card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { typography } from "@/lib/design-system";
import { shortenMint } from "./token-holdings-card";
import type { WalletSnapshotStaking, WalletSnapshotStakeAccount } from "@/lib/api/types";

const STATUS_LABEL: Record<WalletSnapshotStakeAccount["status"], string> = {
  activating: "activating",
  active: "active",
  deactivating: "deactivating",
  inactive: "not staked",
};

export interface StakingCardProps {
  staking: WalletSnapshotStaking;
}

/** Native stake accounts plus liquid staking tokens. If native staking could not be checked, the card says so instead of implying there is none. */
export function StakingCard({ staking }: StakingCardProps) {
  const { nativeChecked, native, nativeTotal, nativeStakedFormatted, liquid } = staking;
  const hasAnything = native.length > 0 || liquid.length > 0;
  const hidden = nativeTotal - native.length;

  return (
    <DashboardCard
      title="Staking"
      action={
        nativeChecked && nativeStakedFormatted ? (
          <Badge variant="outline">{nativeStakedFormatted} SOL staked</Badge>
        ) : undefined
      }
    >
      {!nativeChecked && (
        <p className={cn(typography.caption.className, "text-muted-foreground")}>
          Native staking could not be checked right now. This does not mean the wallet has no stake.
        </p>
      )}

      {nativeChecked && native.length === 0 && (
        <p className={cn(typography.caption.className, "text-muted-foreground")}>
          No native stake accounts found for this wallet.
        </p>
      )}

      {native.length > 0 && (
        <div className="flex flex-col">
          <span className="text-sm font-medium text-foreground">Native stake accounts</span>
          <ul className="flex flex-col">
            {native.map((account) => (
              <li
                key={account.stakeAccount}
                className="flex items-center justify-between gap-3 border-b border-border py-3 last:border-none last:pb-0"
              >
                <div className="flex min-w-0 flex-col">
                  <span className="text-sm font-mono text-foreground" title={account.stakeAccount}>
                    {shortenMint(account.stakeAccount)}
                  </span>
                  <span className={cn(typography.caption.className, "font-mono text-muted-foreground")} title={account.validator ?? undefined}>
                    {account.validator ? `Validator ${shortenMint(account.validator)}` : "Not delegated"}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-mono text-foreground">{account.formatted} SOL</span>
                  <Badge variant={account.status === "active" ? "gold" : "outline"}>{STATUS_LABEL[account.status]}</Badge>
                </div>
              </li>
            ))}
          </ul>
          {hidden > 0 && (
            <p className={cn(typography.caption.className, "text-muted-foreground")}>
              Showing {native.length} of {nativeTotal} stake accounts.
            </p>
          )}
        </div>
      )}

      {liquid.length > 0 && (
        <div className="flex flex-col border-t border-border pt-3">
          <span className="text-sm font-medium text-foreground">Liquid staking tokens</span>
          <ul className="flex flex-col">
            {liquid.map((token) => (
              <li key={token.mint} className="flex items-center justify-between gap-3 py-2">
                <span className="text-sm text-foreground">
                  {token.symbol}
                  {token.name && <span className="ml-2 text-muted-foreground">{token.name}</span>}
                </span>
                <span className="text-sm font-mono text-foreground">{token.formatted}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {nativeChecked && !hasAnything && liquid.length === 0 && native.length === 0 && (
        <p className={cn(typography.caption.className, "text-muted-foreground")}>
          No liquid staking tokens (mSOL, JitoSOL, bSOL) found either.
        </p>
      )}
    </DashboardCard>
  );
}
