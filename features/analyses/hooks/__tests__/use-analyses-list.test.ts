import { describe, it, expect, vi, afterEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { useAnalysesList } from "../use-analyses-list";

function mockFetchOnce(status: number, body: unknown) {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValueOnce({
      ok: status >= 200 && status < 300,
      status,
      json: async () => body,
    } as Response),
  );
}

const ITEM = {
  id: "job-1",
  walletAddress: "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM",
  network: "solana",
  status: "completed",
  stage: "completed",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
  healthScore: 82,
};

describe("useAnalysesList", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("starts in loading and transitions to loaded with items", async () => {
    mockFetchOnce(200, {
      success: true,
      data: { items: [ITEM], total: 1, limit: 5, offset: 0 },
      error: null,
      meta: {},
    });

    const { result } = renderHook(() => useAnalysesList(5));

    expect(result.current.state.phase).toBe("loading");
    await waitFor(() => expect(result.current.state.phase).toBe("loaded"));
    expect(result.current.state.items).toEqual([ITEM]);
    expect(result.current.state.total).toBe(1);
  });

  it("transitions to empty when the API returns zero items", async () => {
    mockFetchOnce(200, {
      success: true,
      data: { items: [], total: 0, limit: 5, offset: 0 },
      error: null,
      meta: {},
    });

    const { result } = renderHook(() => useAnalysesList(5));

    await waitFor(() => expect(result.current.state.phase).toBe("empty"));
  });

  it("transitions to error on a failed request", async () => {
    mockFetchOnce(500, {
      success: false,
      data: null,
      error: { code: "UNKNOWN_ERROR", message: "Something broke" },
      meta: {},
    });

    const { result } = renderHook(() => useAnalysesList(5));

    await waitFor(() => expect(result.current.state.phase).toBe("error"));
    expect(result.current.state.errorMessage).toBe("Something broke");
  });

  it("nextPage/prevPage refetch with the adjusted offset", async () => {
    mockFetchOnce(200, {
      success: true,
      data: { items: [ITEM], total: 12, limit: 5, offset: 0 },
      error: null,
      meta: {},
    });
    const { result } = renderHook(() => useAnalysesList(5));
    await waitFor(() => expect(result.current.state.phase).toBe("loaded"));

    mockFetchOnce(200, {
      success: true,
      data: { items: [ITEM], total: 12, limit: 5, offset: 5 },
      error: null,
      meta: {},
    });
    act(() => result.current.nextPage());

    await waitFor(() => expect(result.current.state.offset).toBe(5));
    expect(fetch).toHaveBeenLastCalledWith("/api/analyses?limit=5&offset=5", { cache: "no-store" });
  });
});
