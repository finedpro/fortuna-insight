import { describe, it, expect, vi, afterEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useMonitorEvents } from "../use-monitor-events";

function mockFetchOnce(status: number, body: unknown) {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValueOnce({ ok: status >= 200 && status < 300, status, json: async () => body } as Response),
  );
}

describe("useMonitorEvents", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("loads and transitions to loaded with items", async () => {
    const event = {
      id: "evt-1",
      watchedWalletId: "w1",
      walletAddress: "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM",
      walletLabel: "Whale #1",
      network: "solana",
      eventType: "tokenPurchase",
      signature: "sig-1",
      payload: { amount: "100", mint: "MintAddr", counterparty: null, direction: "in" },
      blockchainTimestamp: "2026-01-01T00:00:00.000Z",
      slot: 123,
      detectedAt: "2026-01-01T00:00:01.000Z",
    };
    mockFetchOnce(200, { success: true, data: { items: [event], total: 1, limit: 20, offset: 0 }, error: null, meta: {} });

    const { result } = renderHook(() => useMonitorEvents());

    expect(result.current.state.phase).toBe("loading");
    await waitFor(() => expect(result.current.state.phase).toBe("loaded"));
    expect(result.current.state.items).toEqual([event]);
  });

  it("transitions to empty when nothing has been detected", async () => {
    mockFetchOnce(200, { success: true, data: { items: [], total: 0, limit: 20, offset: 0 }, error: null, meta: {} });
    const { result } = renderHook(() => useMonitorEvents());
    await waitFor(() => expect(result.current.state.phase).toBe("empty"));
  });

  it("transitions to error on API failure", async () => {
    mockFetchOnce(502, { success: false, data: null, error: { code: "NETWORK_ERROR", message: "Could not reach backend" }, meta: {} });
    const { result } = renderHook(() => useMonitorEvents());
    await waitFor(() => expect(result.current.state.phase).toBe("error"));
  });
});
