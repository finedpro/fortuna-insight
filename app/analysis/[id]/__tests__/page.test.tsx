import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import AnalysisDetailPage from "../page";

vi.mock("next/navigation", () => ({
  usePathname: () => "/analysis/job-1",
}));

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

describe("AnalysisDetailPage (/analysis/[id] — canonical detail route, Sprint 5 Task 1)", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("renders the completed result for the id in the route", async () => {
    mockFetchSequence([
      {
        status: 200,
        body: {
          success: true,
          data: {
            id: "job-1",
            status: "completed",
            stage: "completed",
            result: {
              success: true,
              walletAddress: "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM",
              network: "solana",
              validation: { isValid: true, network: "solana", walletAddress: "abc", errors: [], warnings: [] },
              healthResult: {
                healthScore: 82,
                contributingFactors: [],
                warnings: [],
                confidence: "high",
                metadata: {},
              },
              evidenceCollection: { walletAddress: "abc", network: "solana", items: [], generatedAt: "now" },
              report: { format: "markdown", content: "## Executive Summary\nLooks healthy." },
              metadata: { startedAt: "t0", completedAt: "t1", durationMs: 4200 },
            },
          },
          error: null,
          meta: {},
        },
      },
    ]);

    const jsx = await AnalysisDetailPage({ params: Promise.resolve({ id: "job-1" }) });
    render(jsx);

    await waitFor(() => expect(screen.getByText("82")).toBeInTheDocument());
    expect(screen.getByText(/Looks healthy\./)).toBeInTheDocument();
  });

  it("renders the failed state with the real backend error message", async () => {
    mockFetchSequence([
      {
        status: 502,
        body: {
          success: false,
          data: null,
          error: { code: "COLLECTION_FAILED", message: "Solana RPC responded with HTTP 503" },
          meta: {},
        },
      },
    ]);

    const jsx = await AnalysisDetailPage({ params: Promise.resolve({ id: "job-2" }) });
    render(jsx);

    await waitFor(() => expect(screen.getByText(/analysis failed/i)).toBeInTheDocument());
    expect(screen.getByText("Solana RPC responded with HTTP 503")).toBeInTheDocument();
  });

  it("renders the not_found state for an unknown id", async () => {
    mockFetchSequence([
      { status: 404, body: { success: false, data: null, error: { code: "NOT_FOUND", message: "No analysis found." }, meta: {} } },
    ]);

    const jsx = await AnalysisDetailPage({ params: Promise.resolve({ id: "missing-id" }) });
    render(jsx);

    await waitFor(() => expect(screen.getByText(/analysis not found/i)).toBeInTheDocument());
  });

  it("renders an in-progress state while the job is running", async () => {
    mockFetchSequence([
      {
        status: 200,
        body: {
          success: true,
          data: { id: "job-3", status: "running", stage: "blockchain_processing", updatedAt: "now" },
          error: null,
          meta: {},
        },
      },
    ]);

    const jsx = await AnalysisDetailPage({ params: Promise.resolve({ id: "job-3" }) });
    render(jsx);

    await waitFor(() => expect(screen.getByText("job-3")).toBeInTheDocument());
    expect(screen.getByText(/Reading on-chain data/i)).toBeInTheDocument();
  });
});
