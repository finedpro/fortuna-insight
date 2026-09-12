import { describe, it, expect, vi, afterEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { useWatchlist } from "../use-watchlist";

function mockFetchOnce(status: number, body: unknown) {
  const existing = vi.isMockFunction(global.fetch) ? (global.fetch as ReturnType<typeof vi.fn>) : null;
  const fn = existing ?? vi.fn();
  fn.mockResolvedValueOnce({ ok: status >= 200 && status < 300, status, json: async () => body } as Response);
  if (!existing) vi.stubGlobal("fetch", fn);
}

const WALLET = {
  id: "w1",
  walletAddress: "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM",
  network: "solana",
  label: "Whale #1",
  watchRules: { tokenPurchases: true, tokenSales: false, largeTransactions: false, newTokens: false, balanceChanges: false, allTransactions: false },
  status: "active",
  lastCheckedAt: null,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

describe("useWatchlist", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("loads and transitions to loaded with items", async () => {
    mockFetchOnce(200, { success: true, data: { items: [WALLET], total: 1, limit: 50, offset: 0 }, error: null, meta: {} });
    const { result } = renderHook(() => useWatchlist());

    expect(result.current.state.phase).toBe("loading");
    await waitFor(() => expect(result.current.state.phase).toBe("loaded"));
    expect(result.current.state.items).toEqual([WALLET]);
  });

  it("transitions to empty when there are no watched wallets", async () => {
    mockFetchOnce(200, { success: true, data: { items: [], total: 0, limit: 50, offset: 0 }, error: null, meta: {} });
    const { result } = renderHook(() => useWatchlist());
    await waitFor(() => expect(result.current.state.phase).toBe("empty"));
  });

  it("transitions to error on API failure", async () => {
    mockFetchOnce(500, { success: false, data: null, error: { code: "UNKNOWN_ERROR", message: "Backend down" }, meta: {} });
    const { result } = renderHook(() => useWatchlist());
    await waitFor(() => expect(result.current.state.phase).toBe("error"));
    expect(result.current.state.errorMessage).toBe("Backend down");
  });

  it("remove() calls DELETE then reloads the list", async () => {
    mockFetchOnce(200, { success: true, data: { items: [WALLET], total: 1, limit: 50, offset: 0 }, error: null, meta: {} });
    const { result } = renderHook(() => useWatchlist());
    await waitFor(() => expect(result.current.state.phase).toBe("loaded"));

    mockFetchOnce(200, { success: true, data: { id: "w1", deleted: true }, error: null, meta: {} });
    mockFetchOnce(200, { success: true, data: { items: [], total: 0, limit: 50, offset: 0 }, error: null, meta: {} });

    await act(async () => {
      await result.current.remove("w1");
    });

    await waitFor(() => expect(result.current.state.phase).toBe("empty"));
  });
});
