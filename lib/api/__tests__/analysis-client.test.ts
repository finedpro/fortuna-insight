import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { postAnalyze, getAnalysis, AnalysisApiError } from "../analysis-client";

function mockFetchOnce(status: number, body: unknown) {
  (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as Response);
}

describe("postAnalyze", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns the accepted job data on a 202 response", async () => {
    mockFetchOnce(202, {
      success: true,
      data: { id: "job-1", status: "queued", stage: "queued" },
      error: null,
      meta: { requestId: "r1", timestamp: "now" },
    });

    const result = await postAnalyze("9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM");

    expect(result).toEqual({ id: "job-1", status: "queued", stage: "queued" });
    expect(fetch).toHaveBeenCalledWith(
      "/api/analyze",
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("throws AnalysisApiError with the backend's real error message on 400", async () => {
    mockFetchOnce(400, {
      success: false,
      data: null,
      error: { code: "BAD_REQUEST", message: '"walletAddress" is required.' },
      meta: { requestId: "r1", timestamp: "now" },
    });

    await expect(postAnalyze("")).rejects.toMatchObject({
      code: "BAD_REQUEST",
      message: '"walletAddress" is required.',
    });
  });

  it("throws a NETWORK_ERROR AnalysisApiError when fetch itself fails", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockRejectedValue(new TypeError("fetch failed"));

    await expect(postAnalyze("abc")).rejects.toBeInstanceOf(AnalysisApiError);
    await expect(postAnalyze("abc")).rejects.toMatchObject({ code: "NETWORK_ERROR" });
  });
});

describe("getAnalysis", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns kind: in_progress for a queued/running job", async () => {
    mockFetchOnce(200, {
      success: true,
      data: { id: "job-1", status: "running", stage: "blockchain_processing", updatedAt: "now" },
      error: null,
      meta: { requestId: "r1", timestamp: "now" },
    });

    const result = await getAnalysis("job-1");

    expect(result.kind).toBe("in_progress");
  });

  it("returns kind: completed with the full result when status is completed", async () => {
    mockFetchOnce(200, {
      success: true,
      data: { id: "job-1", status: "completed", stage: "completed", result: { healthResult: { healthScore: 80 } } },
      error: null,
      meta: { requestId: "r1", timestamp: "now" },
    });

    const result = await getAnalysis("job-1");

    expect(result.kind).toBe("completed");
    if (result.kind === "completed") {
      expect(result.data.result.healthResult?.healthScore).toBe(80);
    }
  });

  it("returns kind: not_found for a 404", async () => {
    mockFetchOnce(404, {
      success: false,
      data: null,
      error: { code: "NOT_FOUND", message: "No analysis found." },
      meta: { requestId: "r1", timestamp: "now" },
    });

    const result = await getAnalysis("missing-id");

    expect(result.kind).toBe("not_found");
  });

  it("returns kind: cancelled for a 499", async () => {
    mockFetchOnce(499, {
      success: false,
      data: null,
      error: { code: "CANCELLED", message: "The analysis was cancelled." },
      meta: { requestId: "r1", timestamp: "now" },
    });

    const result = await getAnalysis("job-1");

    expect(result.kind).toBe("cancelled");
  });

  it("returns kind: failed for a mapped failure status like 502", async () => {
    mockFetchOnce(502, {
      success: false,
      data: null,
      error: { code: "COLLECTION_FAILED", message: "RPC down" },
      meta: { requestId: "r1", timestamp: "now" },
    });

    const result = await getAnalysis("job-1");

    expect(result.kind).toBe("failed");
    if (result.kind === "failed") {
      expect(result.error?.code).toBe("COLLECTION_FAILED");
    }
  });

  it("throws AnalysisApiError on a network failure", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new TypeError("fetch failed"));

    await expect(getAnalysis("job-1")).rejects.toBeInstanceOf(AnalysisApiError);
  });
});
