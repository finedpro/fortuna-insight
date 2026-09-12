import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useAnalysisStatus } from "../use-analysis-status";

function mockFetchSequence(responses: Array<{ status: number; body: unknown }>) {
  const fn = vi.fn();
  for (const { status, body } of responses) {
    fn.mockResolvedValueOnce({
      ok: status >= 200 && status < 300,
      status,
      json: async () => body,
    } as Response);
  }
  vi.stubGlobal("fetch", fn);
  return fn;
}

describe("useAnalysisStatus", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("does nothing when analysisId is null", () => {
    const { result } = renderHook(() => useAnalysisStatus(null));
    expect(result.current.phase).toBe("loading");
  });

  it("polls and transitions through in_progress to completed, stopping further polling", async () => {
    mockFetchSequence([
      { status: 200, body: { success: true, data: { id: "job-1", status: "queued", stage: "queued", updatedAt: "t1" }, error: null, meta: {} } },
      { status: 200, body: { success: true, data: { id: "job-1", status: "completed", stage: "completed", result: { healthResult: { healthScore: 90 } } }, error: null, meta: {} } },
    ]);

    const { result } = renderHook(() => useAnalysisStatus("job-1"));

    await vi.waitFor(() => expect(result.current.phase).toBe("in_progress"));
    expect(result.current.progress?.status).toBe("queued");

    await vi.advanceTimersByTimeAsync(2500);
    await vi.waitFor(() => expect(result.current.phase).toBe("completed"));
    expect(result.current.result?.result.healthResult?.healthScore).toBe(90);

    const callCountAfterCompletion = (fetch as ReturnType<typeof vi.fn>).mock.calls.length;
    await vi.advanceTimersByTimeAsync(10000);
    expect((fetch as ReturnType<typeof vi.fn>).mock.calls.length).toBe(callCountAfterCompletion);
  });

  it("reflects a failed analysis", async () => {
    mockFetchSequence([
      { status: 502, body: { success: false, data: null, error: { code: "COLLECTION_FAILED", message: "RPC down" }, meta: {} } },
    ]);

    const { result } = renderHook(() => useAnalysisStatus("job-2"));

    await vi.waitFor(() => expect(result.current.phase).toBe("failed"));
    expect(result.current.error?.message).toBe("RPC down");
  });

  it("reflects a network/API error without giving up (keeps polling)", async () => {
    const fn = vi.fn().mockRejectedValue(new TypeError("fetch failed"));
    vi.stubGlobal("fetch", fn);

    const { result } = renderHook(() => useAnalysisStatus("job-3"));

    await vi.waitFor(() => expect(result.current.phase).toBe("error"));
  });

  it("stops calling fetch after unmount", async () => {
    const fn = mockFetchSequence([
      { status: 200, body: { success: true, data: { id: "job-1", status: "queued", stage: "queued", updatedAt: "t1" }, error: null, meta: {} } },
    ]);

    const { unmount } = renderHook(() => useAnalysisStatus("job-1"));
    await vi.waitFor(() => expect(fn.mock.calls.length).toBeGreaterThanOrEqual(1));

    unmount();
    const callsAtUnmount = fn.mock.calls.length;

    await vi.advanceTimersByTimeAsync(10000);
    expect(fn.mock.calls.length).toBe(callsAtUnmount);
  });
});
