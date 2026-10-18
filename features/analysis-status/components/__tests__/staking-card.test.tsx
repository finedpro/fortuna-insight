import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { StakingCard } from "../staking-card";
import type { WalletSnapshotStaking } from "@/lib/api/types";

function staking(overrides: Partial<WalletSnapshotStaking> = {}): WalletSnapshotStaking {
  return {
    nativeChecked: true,
    native: [
      { stakeAccount: "StakeAccountAAAAAAAAAAAA", validator: "VoteAccountBBBBBBBBBBBB", formatted: "1.5", raw: "1500000000", status: "active" },
      { stakeAccount: "StakeAccountCCCCCCCCCCCC", validator: null, formatted: "4.99", raw: "4990000000", status: "inactive" },
    ],
    nativeTotal: 2,
    nativeStakedFormatted: "1.5",
    liquid: [{ mint: "J1toso1uCk3RLmjorhTtrVwY9HJ7X8V9yYac6Y7kGCPn", symbol: "JitoSOL", name: "Jito Staked SOL", formatted: "3", raw: "3000000000", decimals: 9 }],
    ...overrides,
  };
}

describe("StakingCard", () => {
  it("shows stake accounts with status, validator, total, and liquid staking tokens", () => {
    render(<StakingCard staking={staking()} />);
    expect(screen.getByText("1.5 SOL staked")).toBeInTheDocument();
    expect(screen.getByText("1.5 SOL")).toBeInTheDocument();
    expect(screen.getByText("active")).toBeInTheDocument();
    expect(screen.getByText("not staked")).toBeInTheDocument();
    expect(screen.getByText("Not delegated")).toBeInTheDocument();
    expect(screen.getByText("JitoSOL")).toBeInTheDocument();
  });

  it("says native staking could not be checked instead of implying none", () => {
    render(<StakingCard staking={staking({ nativeChecked: false, native: [], nativeTotal: 0, nativeStakedFormatted: null, liquid: [] })} />);
    expect(screen.getByText(/could not be checked/)).toBeInTheDocument();
    expect(screen.queryByText(/No native stake accounts found/)).toBeNull();
  });

  it("shows an explicit empty state when checked and nothing is staked", () => {
    render(<StakingCard staking={staking({ native: [], nativeTotal: 0, nativeStakedFormatted: "0", liquid: [] })} />);
    expect(screen.getByText(/No native stake accounts found/)).toBeInTheDocument();
    expect(screen.getByText(/No liquid staking tokens/)).toBeInTheDocument();
  });

  it("notes when the stake account list is truncated", () => {
    render(<StakingCard staking={staking({ nativeTotal: 80 })} />);
    expect(screen.getByText("Showing 2 of 80 stake accounts.")).toBeInTheDocument();
  });
});
