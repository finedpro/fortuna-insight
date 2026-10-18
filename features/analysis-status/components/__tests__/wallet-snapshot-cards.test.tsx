import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { TokenHoldingsCard } from "../token-holdings-card";
import { RecentTransactionsCard } from "../recent-transactions-card";
import type { WalletSnapshot } from "@/lib/api/types";

const MINT = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";

function snapshot(overrides: Partial<WalletSnapshot> = {}): WalletSnapshot {
  return {
    native: { symbol: "SOL", formatted: "1.5", raw: "1500000000", decimals: 9 },
    tokens: [
      { mint: MINT, symbol: "USDC", name: "USD Coin", formatted: "2.5", raw: "2500000", decimals: 6 },
      { mint: "UnknownMint1234567890", symbol: null, name: null, formatted: "10", raw: "10", decimals: 0 },
    ],
    tokensTotal: 2,
    recentTransactions: [
      { signature: "sigAAAAAAAAAAAAAAAA", timestamp: "2026-01-02T03:04:05.000Z", slot: 1, status: "success" },
      { signature: "sigBBBBBBBBBBBBBBBB", timestamp: null, slot: 2, status: "failed" },
    ],
    transactionCount: 2,
    transactionCountIsExhaustive: true,
    ...overrides,
  };
}

describe("TokenHoldingsCard", () => {
  it("shows native balance, named tokens and shortened unknown mints", () => {
    render(<TokenHoldingsCard snapshot={snapshot()} />);
    expect(screen.getByText("SOL")).toBeInTheDocument();
    expect(screen.getByText("USDC")).toBeInTheDocument();
    expect(screen.getByText("USD Coin")).toBeInTheDocument();
    expect(screen.getByText("Unknown token")).toBeInTheDocument();
    expect(screen.getByText("Unkn…7890")).toBeInTheDocument();
    expect(screen.getByText("2.5")).toBeInTheDocument();
  });

  it("notes hidden empty accounts and warns that names can be misleading", () => {
    render(<TokenHoldingsCard snapshot={snapshot({ emptyTokenAccounts: 18 })} />);
    expect(screen.getByText("18 empty token accounts (zero balance) not shown.")).toBeInTheDocument();
    expect(screen.getByText(/can be misleading/)).toBeInTheDocument();
  });

  it("omits the empty-accounts note for older analyses without the field", () => {
    render(<TokenHoldingsCard snapshot={snapshot()} />);
    expect(screen.queryByText(/empty token/)).toBeNull();
  });

  it("shows an empty state and a truncation note", () => {
    const { rerender } = render(<TokenHoldingsCard snapshot={snapshot({ tokens: [], tokensTotal: 0 })} />);
    expect(screen.getByText(/No token balances found/)).toBeInTheDocument();
    rerender(<TokenHoldingsCard snapshot={snapshot({ tokensTotal: 80 })} />);
    expect(screen.getByText("Showing 2 of 80 tokens.")).toBeInTheDocument();
  });
});

describe("RecentTransactionsCard", () => {
  it("lists transactions with explorer links on Solana and a failed badge", () => {
    render(<RecentTransactionsCard snapshot={snapshot()} network="solana" />);
    const link = screen.getByRole("link", { name: "sigA…AAAA" });
    expect(link).toHaveAttribute("href", "https://solscan.io/tx/sigAAAAAAAAAAAAAAAA");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
    expect(screen.getByText("2026-01-02 03:04 UTC")).toBeInTheDocument();
    expect(screen.getByText("Time unknown")).toBeInTheDocument();
    expect(screen.getByText("failed")).toBeInTheDocument();
  });

  it("does not link out on non-Solana networks", () => {
    render(<RecentTransactionsCard snapshot={snapshot()} network="ethereum" />);
    expect(screen.queryByRole("link")).toBeNull();
  });

  it("marks the total as a lower bound when history is not exhaustive, and handles empty", () => {
    const { rerender } = render(
      <RecentTransactionsCard snapshot={snapshot({ transactionCount: 1000, transactionCountIsExhaustive: false })} network="solana" />,
    );
    expect(screen.getByText("1000+ total")).toBeInTheDocument();
    rerender(<RecentTransactionsCard snapshot={snapshot({ recentTransactions: [], transactionCount: 0 })} network="solana" />);
    expect(screen.getByText(/No transactions found/)).toBeInTheDocument();
  });
});
